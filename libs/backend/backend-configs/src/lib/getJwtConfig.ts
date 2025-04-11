import { Logger } from '@nestjs/common';
// biome-ignore lint/style/useImportType: <explanation>
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: <explanation>
import { JwtModuleOptions } from '@nestjs/jwt';
import { JWT_EXPIRES_IN_ERROR, JWT_SECRET_ERROR } from './config.constants';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  const secret: string | undefined = configService.get('JWT_SECRET');
  const jwtExpires: string | undefined = configService.get('JWT_EXPIRES_IN');

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
