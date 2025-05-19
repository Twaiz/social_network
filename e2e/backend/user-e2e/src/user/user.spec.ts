import { ConfigService } from '@nestjs/config';
import { INestApplication, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { App } from 'supertest/types';

import {
  APP_INIT_FAILED,
  bootstrap,
  getActiveToken,
  GetEnv,
  IUser,
} from '@shared';
import { UserModule } from '@features/user';

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
});
