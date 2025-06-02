import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Model } from 'mongoose';

import { USER_NOT_FOUND } from '../../config';
import { EFieldByFindUser, IUser } from '../types';
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

  async validate(payload: { email: string; login: string }): Promise<IUser> {
    const [userByEmail, userByLogin] = await Promise.all([
      findUser(
        this.userModel,
        EFieldByFindUser.EMAIL,
        payload.email,
        USER_NOT_FOUND,
        'JwtStrategy - findByEmail',
      ),
      findUser(
        this.userModel,
        EFieldByFindUser.LOGIN,
        payload.login,
        USER_NOT_FOUND,
        'JwtStrategy - findByLogin',
      ),
    ]);

    const user = userByEmail || userByLogin;

    return user;
  }
}
