import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnvString } from '@types';
import { JWT_EXPIRES_IN_ERROR, JWT_SECRET_ERROR } from '@backend-configs';

export const GetEnv = {
  getJwtSecret(configService: ConfigService): string {
    const secret: EnvString = configService.get('JWT_SECRET');
    if (!secret) {
      Logger.error(JWT_SECRET_ERROR, 'GetEnvService');
      process.exit(1);
    }
    return secret;
  },

  getJwtExpiresIn(configService: ConfigService): string {
    const expiresIn: EnvString = configService.get('JWT_EXPIRES_IN');
    if (!expiresIn) {
      Logger.error(JWT_EXPIRES_IN_ERROR, 'GetEnvService');
      process.exit(1);
    }
    return expiresIn;
  },
};
