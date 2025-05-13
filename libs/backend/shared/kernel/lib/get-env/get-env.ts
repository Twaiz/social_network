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
} from './constant';

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

  getServerPort(customPort: string | undefined): string {
    if (!customPort) {
      Logger.error(SERVER_PORT_ERROR);
      process.exit(1);
    }
    return customPort;
  },

  getServerHost(): string {
    const host = process.env.SERVER_HOST;
    if (!host) {
      Logger.error(SERVER_HOST_ERROR);
      process.exit(1);
    }
    return host;
  },
  getServerGlobalPrefix(): string {
    const globalPrefix = process.env.SERVER_GLOBAL_PREFIX;
    if (!globalPrefix) {
      Logger.error(SERVER_GLOBAL_PREFIX_ERROR);
      process.exit(1);
    }
    return globalPrefix;
  },

  getMongodbConnectionParametrs(customPort: string): {
    port: string;
    host: string;
    globalPrefix: string;
  } {
    const port = this.getServerPort(customPort);
    const host = this.getServerHost();
    const globalPrefix = this.getServerGlobalPrefix();

    return {
      port,
      host,
      globalPrefix,
    };
  },
};
