import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

import { GetEnv } from '@get-env';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  const secret = GetEnv.getJwtSecret(configService);
  const jwtExpires = GetEnv.getJwtExpiresIn(configService);

  return {
    secret,
    signOptions: {
      expiresIn: jwtExpires,
    },
  };
};
