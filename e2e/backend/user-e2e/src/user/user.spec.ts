import { ConfigService } from '@nestjs/config';
import { INestApplication, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types';

import {
  APP_INIT_FAILED,
  bootstrap,
  ChangeEmailCredentialsDto,
  ConfirmChangedEmailCredentialsDto,
  getActiveToken,
  GetEnv,
  IUser,
  NewUserInfoCredentialsDto,
  USER_NOT_FOUND,
} from '@shared';
import { UserModule } from '@features/user';

import { CHANGEEMAILTOKEN_OR_CHANGEEMAILNEW_NOT_FOUND } from './constant';

const NewUserInfoCredentials: NewUserInfoCredentialsDto = {
  firstName: 'Oleg',
  secondName: 'Olegovich',
};

const ChangeEmailCredentials: ChangeEmailCredentialsDto = {
  newEmail: 'newAdmin@gmail.com',
};

describe('App - User (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  let jwtService: JwtService;
  let configService: ConfigService;
  let userModel: Model<IUser>;

  beforeAll(async () => {
    const userPort = process.env.USER_SERVER_PORT;
    const port = GetEnv.getServerPort(userPort);

    const serverApp = await bootstrap<App>(UserModule, port);
    if (!serverApp) {
      Logger.error(APP_INIT_FAILED);
      process.exit(1);
    }

    app = serverApp;

    jwtService = app.get(JwtService);
    configService = app.get(ConfigService);
    userModel = app.get(getModelToken('User'));

    token = await getActiveToken(jwtService, configService, userModel);
  });

  it('user/updateUserInfo -- success', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user/updateUserInfo')
      .set('Authorization', `Bearer ${token}`)
      .send(NewUserInfoCredentials)
      .expect(200);

    const data: IUser = res.body;

    if (NewUserInfoCredentials.login) {
      expect(data.login).toEqual(NewUserInfoCredentials.login ?? data.login);
    }
    if (NewUserInfoCredentials.firstName) {
      expect(data.firstName).toEqual(
        NewUserInfoCredentials.firstName ?? data.firstName,
      );
    }
    if (NewUserInfoCredentials.secondName) {
      expect(data.secondName).toEqual(
        NewUserInfoCredentials.secondName ?? data.secondName,
      );
    }
  });

  it('user/change-email', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user/change-email')
      .set('Authorization', `Bearer ${token}`)
      .send(ChangeEmailCredentials)
      .expect(201);

    expect(res.body).toHaveProperty('message');
  });

  it('user/confirm-changed-email -- success', async () => {
    const decoded = jwtService.verify(token);
    const userId = decoded.id;

    const userBefore = await userModel
      .findOne({ _id: userId })
      .select('+changeEmailToken +changeEmailNew')
      .lean();
    if (!userBefore) {
      Logger.error(USER_NOT_FOUND);
      process.exit(1);
    }

    if (!userBefore.changeEmailToken || !userBefore.changeEmailNew) {
      Logger.error(CHANGEEMAILTOKEN_OR_CHANGEEMAILNEW_NOT_FOUND);
      process.exit(1);
    }

    const res = await request(app.getHttpServer())
      .post('/api/user/confirm-changed-email')
      .send({
        changeEmailToken: userBefore.changeEmailToken,
      } as ConfirmChangedEmailCredentialsDto)
      .expect(200);

    expect(res.body).toHaveProperty('message');

    const userAfter = await userModel.findById(userId).lean();
    if (!userAfter) {
      Logger.error(USER_NOT_FOUND);
      process.exit(1);
    }

    expect(userAfter.email).toBe(userBefore.changeEmailNew);
    expect(userAfter.changeEmailToken).toBeNull();
    expect(userAfter.changeEmailNew).toBeNull();
    expect(userAfter.changeEmailExpires).toBeNull();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
