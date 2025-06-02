import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Model } from 'mongoose';

import { USER_NOT_FOUND } from '../../config';
import { IUser } from '../types';
import { GetEnv } from '../../kernel';
import { findUser } from '../../api';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  //TODO - добавить нормальную проверку на валидность токена. У нас на данный момент токен работает даже тогда, когда обновился пароль. Блять, надо это сделать, это безопасноть нашего пользователя.
  constructor(
    configService: ConfigService,
    @InjectModel('User') private readonly userModel: Model<IUser>,
  ) {
    const jwtSecret = GetEnv.getJwtSecret(configService);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: { email: string }): Promise<IUser> {
    const [userByEmail, userByLogin] = await Promise.all([
      findUser.byEmail(this.userModel, payload.email, USER_NOT_FOUND),
      findUser.byLogin(this.userModel, payload.email, USER_NOT_FOUND),
    ]);

    const user = userByEmail || userByLogin;

    if (!user) {
      Logger.log(USER_NOT_FOUND);
      throw new NotFoundException(USER_NOT_FOUND);
    }

    return user;
  }
}
