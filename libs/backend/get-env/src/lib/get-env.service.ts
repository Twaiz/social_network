import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JWT_SECRET_ERROR, JWT_EXPIRES_IN_ERROR } from '@backend-configs';
import { EnvString } from '@types';

@Injectable()
export class GetEnvService {
  constructor(private readonly configService: ConfigService) {}

  getJwtSecret(): string {
    const secret: EnvString = this.configService.get('JWT_SECRET');
    if (!secret) {
      Logger.error(JWT_SECRET_ERROR, 'GetEnvService');
      process.exit(1);
    }
    return secret;
  }

  getJwtExpiresIn(): string {
    const expiresIn: EnvString = this.configService.get('JWT_EXPIRES_IN');
    if (!expiresIn) {
      Logger.error(JWT_EXPIRES_IN_ERROR, 'GetEnvService');
      process.exit(1);
    }
    return expiresIn;
  }
}
