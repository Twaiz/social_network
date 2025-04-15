import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { IUser } from '@interfaces';
import { EnvString } from '@types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secretKey: EnvString = configService.get('JWT_SECRET');
    if (!secretKey) {
      throw new Error('Не найдено секретного кода JWT');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretKey,
      ignoreExpiration: false,
    });
  }

  async validate(payload: IUser): Promise<IUser> {
    return payload;
  }
}
