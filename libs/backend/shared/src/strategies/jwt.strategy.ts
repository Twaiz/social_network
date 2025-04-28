import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { AuthService } from '@auth-lib'; //TODO Ниже описал задачу. Никогда так не тупите...

import { IUser } from '../interfaces/user.interface';
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
    const user = await this.authService.findUserByEmail(payload.email); //TODO Вынести методы поиска и прочего в отдельную либу/проект, чтобы не было циклических ошибок импортов.
    if (!user) {
      Logger.error('❌ Пользователь не найден');
      process.exit(1);
    }

    return user;
  }
}
