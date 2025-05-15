import { INestApplication, Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { App } from 'supertest/types';
import request from 'supertest';

import {
  APP_INIT_FAILED,
  IUser,
  LoginResponse,
  RegisterResponse,
  USER_NOT_FOUND,
  GetEnv,
  bootstrap,
} from '@shared';

import {
  AuthModule,
  LoginCredentialsDto,
  RegisterCredentialsDto,
} from '@features/auth';

const RegisterCredentials: RegisterCredentialsDto = {
  email: 'twaiz@gmail.com',
  login: 'twAiz',
  password: '1205Qaz!',
  firstName: 'Bohdan',
  secondName: 'Twaiz',
};

const LoginCredentials: LoginCredentialsDto = {
  login: 'TwaiZ',
  password: '1205Qaz!',
};

describe('App - Auth (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  let userModel: Model<IUser>;
  // let userId: string;
  /* 
   TODO добавить удаление созданого пользователя после всех тестов. Это мы сможем добавить когда добавим app - user
  */

  beforeAll(async () => {
    const authPort = process.env.AUTH_SERVER_PORT;
    const port = GetEnv.getServerPort(authPort);

    const serverApp = await bootstrap<App>(AuthModule, port);
    if (!serverApp) {
      Logger.error(APP_INIT_FAILED);
      process.exit(1);
    }

    app = serverApp;
    userModel = app.get(getModelToken('User'));
  });

  //* Register *//
  it('auth/register -- success', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(RegisterCredentials)
      .expect(201);

    const data: RegisterResponse = res.body;
    // userId = data.user._id;

    expect(data).toHaveProperty('user');
    expect(data).toHaveProperty('token');
    expect(data.user).toMatchObject({
      email: RegisterCredentials.email.toLowerCase(),
      login: RegisterCredentials.login.toLowerCase(),
      firstName: RegisterCredentials.firstName,
      secondName: RegisterCredentials.secondName,
    });

    //TODO прочитать то, что я заскринил "лучшие практики для e2e-тестов"
  });

  //* Login *//
  it('auth/login -- success', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(LoginCredentials)
      .expect(200);

    const data: LoginResponse = res.body;
    token = data.token;

    expect(data).toHaveProperty('token');
  });

  //* Generate Email Token *//
  it('auth/generate-email-token -- success', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/generate-email-token')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const user = await userModel
      .findOne({ login: LoginCredentials.login })
      .select('+emailConfirmToken')
      .lean();

    if (!user) {
      Logger.error(USER_NOT_FOUND, 'Auth-e2e');
      process.exit(1);
    }

    expect(res.body).toHaveProperty('message');
    expect(user).toHaveProperty('emailConfirmToken');
    expect(user).toHaveProperty('emailExpiresToken');
  });

  //* Confirm Email *//
  it('auth/confirm-email -- success', async () => {
    const userBeforeConfirmEmail = await userModel
      .findOne({ login: LoginCredentials.login })
      .select('+emailConfirmToken')
      .lean();

    if (!userBeforeConfirmEmail) {
      Logger.error(USER_NOT_FOUND, 'Auth-e2e');
      process.exit(1);
    }

    const res = await request(app.getHttpServer())
      .post('/api/auth/confirm-email')
      .send({ token: userBeforeConfirmEmail.emailConfirmToken })
      .expect(200);

    expect(res.body).toHaveProperty('message');

    const userAfterConfirmEmail = await userModel
      .findOne({ login: LoginCredentials.login })
      .select('+emailConfirmToken')
      .lean();

    if (!userAfterConfirmEmail) {
      Logger.error(USER_NOT_FOUND, 'Auth-e2e');
      process.exit(1);
    }

    expect(userAfterConfirmEmail.emailConfirmToken).toBeFalsy();
    expect(userAfterConfirmEmail.emailExpiresToken).toBeFalsy();
  });

  it('auth/check-isEmailConfirm -- success', async () => {
    const res = await request(app.getHttpServer())
      .get('auth/check-isEmailConfirm')
      .expect(200);

    expect(res.body).toHaveProperty('message');
  });

  afterAll(async () => {
    await app.close();
  });
});
