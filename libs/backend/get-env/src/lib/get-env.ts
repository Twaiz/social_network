import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type EnvString = string | undefined;

const CONSTANTS = {
  JWT_SECRET_ERROR: '❌ Не найден JWT_SECRET!',
  JWT_EXPIRES_IN_ERROR: '❌ Не найден JWT_EXPIRES_IN!',
  MONGODB_PASSWORD_ERROR: '❌ Не найден MONGODB_PASSWORD!',
  MONGODB_LOGIN_ERROR: '❌ Не найден MONGODB_LOGIN!',
};

export const GetEnv = {
  getJwtSecret(configService: ConfigService): string {
    const secret: EnvString = configService.get('JWT_SECRET');
    if (!secret) {
      Logger.error(CONSTANTS.JWT_SECRET_ERROR, 'GetEnv');
      process.exit(1);
    }
    return secret;
  },

  getJwtExpiresIn(configService: ConfigService): string {
    const expiresIn: EnvString = configService.get('JWT_EXPIRES_IN');
    if (!expiresIn) {
      Logger.error(CONSTANTS.JWT_EXPIRES_IN_ERROR, 'GetEnv');
      process.exit(1);
    }
    return expiresIn;
  },

  getMongodbPassword(configService: ConfigService): string {
    const mongodbPassword: EnvString = configService.get('MONGODB_PASSWORD');
    if (!mongodbPassword) {
      Logger.error(CONSTANTS.MONGODB_PASSWORD_ERROR, 'GetEnv');
      process.exit(1);
    }
    return mongodbPassword;
  },

  getMongodbLogin(configService: ConfigService): string {
    const mongodbLogin: EnvString = configService.get('MONGODB_LOGIN');
    if (!mongodbLogin) {
      Logger.error(CONSTANTS.MONGODB_LOGIN_ERROR, 'GetEnv');
      process.exit(1);
    }
    return mongodbLogin;
  },
};
