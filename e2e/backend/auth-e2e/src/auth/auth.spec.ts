import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';

import { AuthModule, UserRegisterCredentialsDto } from '@auth-lib';
import { RegisterResponse } from '@shared';
import { GetEnv } from '@get-env';
import { bootstrap } from '@bootstrap';

const RegisterCredentials: UserRegisterCredentialsDto = {
  email: 'twaiz@gmail.com',
  login: 'twaiz',
  password: '1205Qaz!',
  firstName: 'Bohdan',
  secondName: 'Twaiz',
};

describe('App - Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const customPort = process.env.AUTH_SERVER_PORT;
    const port = GetEnv.getServerPort(customPort);

    const serverApp = await bootstrap<App>(AuthModule, port);
    if (!serverApp) {
      process.exit(1);
    }

    app = serverApp;
  });

  it('auth/register -- success', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(RegisterCredentials)
      .expect(201);

    const data: RegisterResponse = res.body;

    expect(res.status).toBe(201);
    expect(data).toHaveProperty('user');
    expect(data).toHaveProperty('token');
    expect(data.user).toMatchObject({
      email: RegisterCredentials.email,
      login: RegisterCredentials.login,
      firstName: RegisterCredentials.firstName,
      secondName: RegisterCredentials.secondName,
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
