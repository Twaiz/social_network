import { INestApplication, Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { App } from 'supertest/types';
import request from 'supertest';

import {
  AuthModule,
  UserLoginCredentialsDto,
  UserRegisterCredentialsDto,
} from '@auth-lib';
import {
  IUser,
  LoginResponse,
  RegisterResponse,
  USER_NOT_FOUND,
} from '@shared';
import { GetEnv } from '@get-env';
import { bootstrap } from '@bootstrap';

const RegisterCredentials: UserRegisterCredentialsDto = {
  email: 'twaiz@gmail.com',
  login: 'twaiz',
  password: '1205Qaz!',
  firstName: 'Bohdan',
  secondName: 'Twaiz',
};

const LoginCredentials: UserLoginCredentialsDto = {
  login: 'twaiz',
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
    const customPort = process.env.AUTH_SERVER_PORT;
    const port = GetEnv.getServerPort(customPort);

    const serverApp = await bootstrap<App>(AuthModule, port);
    if (!serverApp) {
      process.exit(1);
    }

    app = serverApp;
    userModel = app.get(getModelToken('User'));
  });

  it('auth/register -- success', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(RegisterCredentials)
      .expect(201);

    const data: RegisterResponse = res.body;
    // userId = data.user._id;

    expect(res.status).toBe(201);
    expect(data).toHaveProperty('user');
    expect(data).toHaveProperty('token');
    expect(data.user).toMatchObject({
      email: RegisterCredentials.email,
      login: RegisterCredentials.login,
      firstName: RegisterCredentials.firstName,
      secondName: RegisterCredentials.secondName,
    });

    //TODO прочитать то, что я заскринил "лучшие практики для e2e-тестов"
  });

  it('auth/login -- success', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(LoginCredentials)
      .expect(200);

    const data: LoginResponse = res.body;
    token = data.token;

    expect(data).toHaveProperty('token');
  });

  it('auth/generate-email-token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const user = await userModel
      .findOne({ email: LoginCredentials.email })
      .lean();

    if (!user) {
      Logger.error(USER_NOT_FOUND, 'Auth-e2e');
      process.exit(1);
    }

    expect(res.body).toHaveProperty('message');
    expect(user).toHaveProperty('emailConfirmToken');
    expect(user).toHaveProperty('emailExpiresToken');
  });

  afterAll(async () => {
    await app.close();
  });
});
