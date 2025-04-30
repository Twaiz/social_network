import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  JWT_EXPIRES_IN_ERROR,
  JWT_SECRET_ERROR,
  MONGODB_LOGIN_ERROR,
  MONGODB_PASSWORD_ERROR,
  SERVER_GLOBAL_PREFIX_ERROR,
  SERVER_HOST_ERROR,
  SERVER_PORT_ERROR,
} from './get-env.constants';

type EnvString = string | undefined;

export const GetEnv = {
  getJwtSecret(configService: ConfigService): string {
    const jwtSecret: EnvString = configService.get('JWT_SECRET');
    if (!jwtSecret) {
      Logger.error(JWT_SECRET_ERROR, 'GetEnv');
      process.exit(1);
    }
    return jwtSecret;
  },

  getJwtExpiresIn(configService: ConfigService): string {
    const expiresIn: EnvString = configService.get('JWT_EXPIRES_IN');
    if (!expiresIn) {
      Logger.error(JWT_EXPIRES_IN_ERROR, 'GetEnv');
      process.exit(1);
    }
    return expiresIn;
  },

  getMongodbPassword(configService: ConfigService): string {
    const mongodbPassword: EnvString = configService.get('MONGODB_PASSWORD');
    if (!mongodbPassword) {
      Logger.error(MONGODB_PASSWORD_ERROR, 'GetEnv');
      process.exit(1);
    }
    return mongodbPassword;
  },

  getMongodbLogin(configService: ConfigService): string {
    const mongodbLogin: EnvString = configService.get('MONGODB_LOGIN');
    if (!mongodbLogin) {
      Logger.error(MONGODB_LOGIN_ERROR, 'GetEnv');
      process.exit(1);
    }
    return mongodbLogin;
  },

  getMongodbConnectionParametrs(customPortName: string): {
    port: string;
    host: string;
    globalPrefix: string;
  } {
    const portEnvKey = `SERVER_${customPortName}`;
    const port = process.env[portEnvKey];
    const host = process.env.SERVER_HOST;
    const globalPrefix = process.env.SERVER_GLOBAL_PREFIX;

    const errors: string[] = [];

    if (!port) errors.push(SERVER_PORT_ERROR);
    if (!host) errors.push(SERVER_HOST_ERROR);
    if (!globalPrefix) errors.push(SERVER_GLOBAL_PREFIX_ERROR);

    if (!port || !host || !globalPrefix) {
      Logger.error(errors.join('\n'));
      process.exit(1);
    }

    return {
      port,
      host,
      globalPrefix,
    };
  },
};
