import { Logger } from '@nestjs/common';
// biome-ignore lint/style/useImportType: <explanation>
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: <explanation>
import { JwtModuleOptions } from '@nestjs/jwt';
import { JWT_SECRET_ERROR } from './config.constants';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  const secret: string | undefined = configService.get('JWT_SECRET');
  if (!secret) {
    Logger.error(JWT_SECRET_ERROR, 'JwtService');
  }
  return { secret };
};
