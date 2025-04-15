import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

import { JWT_EXPIRES_IN_ERROR, JWT_SECRET_ERROR } from './config.constants';
import { EnvString } from '@types';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  const secret: EnvString = configService.get('JWT_SECRET');
  const jwtExpires: EnvString = configService.get('JWT_EXPIRES_IN');

  if (!secret) {
    Logger.error(JWT_SECRET_ERROR, 'JwtService');
  }
  if (!jwtExpires) {
    Logger.error(JWT_EXPIRES_IN_ERROR, 'JwtService');
  }

  return {
    secret,
    signOptions: {
      expiresIn: jwtExpires,
    },
  };
};
