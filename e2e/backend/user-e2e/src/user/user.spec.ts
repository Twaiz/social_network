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
  ChangePasswordCredentialsDto,
  ConfirmChangedEmailCredentialsDto,
  ConfirmNewPasswordCredentialsDto,
  findUserByEmail,
  getActiveToken,
  GetEnv,
  IUser,
  NewUserInfoCredentialsDto,
  USER_NOT_FOUND,
} from '@shared';
import { UserModule } from '@features/user';

import { CHANGE_EMAIL_TOKEN_NOT_FOUND } from './constant';

const NewUserInfoCredentials: NewUserInfoCredentialsDto = {
  firstName: 'Oleg',
  secondName: 'Olegovich',
};

const ChangeEmailCredentials: ChangeEmailCredentialsDto = {
  newEmail: 'newAdmin@gmail.com',
};

const ChangePasswordCredentials: ChangePasswordCredentialsDto = {
  newPassword: 'admin321',
};

describe('App - User (e2e)', () => {
  //TODO - реализовать првоерки как в confirmChangedEmail. Ибо какой хуй с тех проверок, если они нихера почти и не проверяют

  let app: INestApplication<App>;
  let token: string;
  let user: IUser;

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

    const fullLogin = await getActiveToken(
      jwtService,
      configService,
      userModel,
    );
    token = fullLogin.token;
    user = fullLogin.user;
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

  //!РЕШИТЬ!\\
  //TODO - когда у нас происходить смена email то после смена пароля не модет выполниться. Есть предположение, что это из-за проверок токена типа на валидность. Надо это как-то обойти для e2e тестов. Вот, из-за этого у нас в Postman тесты на смену пароля проходили, а в e2e нет. Проблема найдена, теперь надо её решить!
  it('user/change-email', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user/change-email')
      .set('Authorization', `Bearer ${token}`)
      .send(ChangeEmailCredentials)
      .expect(201);

    expect(res.body).toHaveProperty('message');
  });

  it('user/confirm-changed-email -- success', async () => {
    const userBefore = await userModel
      .findOne({ _id: user._id })
      .select('+changeEmailToken')
      .lean();
    if (!userBefore) {
      Logger.error(USER_NOT_FOUND);
      process.exit(1);
    }

    if (!userBefore.changeEmailToken) {
      Logger.error(CHANGE_EMAIL_TOKEN_NOT_FOUND);
      process.exit(1);
    }

    const res = await request(app.getHttpServer())
      .post('/api/user/confirm-changed-email')
      .send({
        changeEmailToken: userBefore.changeEmailToken,
      } as ConfirmChangedEmailCredentialsDto)
      .expect(200);

    expect(res.body).toHaveProperty('message');

    const userAfter = await userModel
      .findOne({ _id: user._id })
      .select('+changeEmailToken')
      .lean();

    if (!userAfter) {
      Logger.error(USER_NOT_FOUND);
      process.exit(1);
    }

    expect(userAfter.email).toBe(userBefore.changeEmailNew);

    expect(userAfter.changeEmailToken).toBeUndefined();
    expect(userAfter.changeEmailNew).toBeUndefined();
    expect(userAfter.changeEmailExpires).toBeUndefined();

    //TODO - сделать так, чтобы email возращался до прежнего
  });

  it('user/change-password -- success', async () => {
    const userBefore = await userModel
      .findById(user._id)
      .select('+changePasswordToken +changePasswordNew')
      .lean();
    if (!userBefore) {
      Logger.error(USER_NOT_FOUND);
      process.exit(1);
    }

    const res = await request(app.getHttpServer())
      .post('/api/user/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send(ChangePasswordCredentials)
      .expect(201);

    expect(res.body).toHaveProperty('message');

    const userAfter = await userModel
      .findById(user._id)
      .select('+changePasswordToken +changePasswordNew')
      .lean();
    if (
      !userAfter ||
      !userAfter.changePasswordToken ||
      !userAfter.changePasswordNew ||
      !userAfter.changePasswordExpires
    ) {
      Logger.error('Ошибка при изменении пароля');
      process.exit(1);
    }

    const lengthChangePasswordToken = userAfter.changePasswordToken.length;

    expect(userAfter.changePasswordToken).toBeDefined();
    expect(typeof userAfter.changePasswordToken).toBe('string');
    expect(lengthChangePasswordToken).toBeGreaterThan(0);

    const now = new Date();
    const expiresDate = new Date(userAfter.changePasswordExpires);

    expect(expiresDate.getTime()).toBeGreaterThan(now.getTime());
  });

  it('user/confirm-new-password -- success', async () => {
    const userBefore = await userModel
      .findById(user._id)
      .select('+changePasswordToken +changePasswordNew')
      .lean();
    if (!userBefore) {
      Logger.error(USER_NOT_FOUND);
      process.exit(1);
    }

    const res = await request(app.getHttpServer())
      .post('/api/user/confirm-new-password')
      .send({
        changePasswordToken: userBefore.changePasswordToken,
      } as ConfirmNewPasswordCredentialsDto)
      .expect(200);

    expect(res.body).toHaveProperty('message');

    const userAfter = await findUserByEmail(
      userModel,
      user.email,
      '+passwordHash +changePasswordToken +changePasswordNew',
    );
    if (!userAfter) {
      Logger.error(USER_NOT_FOUND);
      process.exit(1);
    }

    expect(userAfter.passwordHash).toBe(userBefore.changePasswordNew);

    //TODO - заменить проверку из на null на undefined. у нас изменились типы
    expect(userAfter.changePasswordExpires).toBeNull();
    expect(userAfter.changePasswordToken).toBeNull();
    expect(userAfter.changePasswordNew).toBeNull();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
