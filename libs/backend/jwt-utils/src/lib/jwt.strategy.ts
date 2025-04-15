import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { IUser } from '@interfaces';
import { EnvString } from '@types';
import { JWT_SECRET_ERROR } from '@backend-configs';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret: EnvString = configService.get('JWT_SECRET');
    if (!secret) {
      Logger.error(JWT_SECRET_ERROR, 'JwtService');
      process.exit(1);
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: IUser): Promise<IUser> {
    return payload;
  }
}
