import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { AuthService } from '../services/auth.service';

import { IUser } from '@shared';
import { GetEnv } from '@get-env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const jwtSecret = GetEnv.getJwtSecret(configService);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: { email: string }): Promise<IUser> {
    const user = await this.authService.findUserByEmail(payload.email);
    if (!user) {
      Logger.error('❌ Пользователь не найден');
      process.exit(1);
    }

    return user;
  }
}
