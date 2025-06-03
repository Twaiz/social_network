import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Model } from 'mongoose';

import { USER_NOT_FOUND } from '../../config';
import { EFieldByFindUser, IUser } from '../types';
import { GetEnv } from '../../kernel';
import { findUser } from '../../api';
import { PASSWORD_IS_UPDATED } from './constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
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

  async validate(payload: {
    email: string;
    login: string;
    iat: number;
  }): Promise<IUser> {
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

    if (user.passwordChangedAt) {
      const passwordChangedTimestamp = new Date(
        user.passwordChangedAt,
      ).getTime();
      const tokenIssuedAt = payload.iat * 1000;

      if (tokenIssuedAt < passwordChangedTimestamp) {
        throw new UnauthorizedException(PASSWORD_IS_UPDATED);
      }
    }

    return user;
  }
}
