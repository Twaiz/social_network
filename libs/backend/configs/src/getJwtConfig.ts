import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

import { GetEnv } from '@get-env';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  const jwtSecret = GetEnv.getJwtSecret(configService);
  const jwtExpiresIn = GetEnv.getJwtExpiresIn(configService);

  return {
    secret: jwtSecret,
    signOptions: {
      expiresIn: jwtExpiresIn,
    },
  };
};
