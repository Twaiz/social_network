import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { disconnect } from 'node:process';
import { App } from 'supertest/types';
import axios from 'axios';

import { AuthModule, UserRegisterCredentialsDto } from '@auth-lib';
import { IUser } from '@shared';

const RegisterCredentials: UserRegisterCredentialsDto = {
  email: 'twaiz@gmail.com',
  login: 'twaiz',
  password: '1205Qaz!',
  firstName: 'Bohdan',
  secondName: 'Twaiz',
};

const AUTH_ROUTE = '/auth';

describe('App - Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('auth/register -- success', async () => {
    const res: axios.AxiosResponse<Promise<{ user: IUser; token: string }>> =
      await axios.post(`${AUTH_ROUTE}/register`, RegisterCredentials);

    expect(res.status).toBe(200);
    expect(res.data).toEqual(Promise<{ user: IUser; token: string }>);
  });

  afterAll(async () => {
    await disconnect();
  });
});
