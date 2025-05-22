import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Model } from 'mongoose';

import { USER_NOT_FOUND } from '../../config';
import { IUser } from '../types';
import { GetEnv } from '../../kernel';
import { findUserByEmail, findUserByLogin } from '../../api';

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

  async validate(payload: { email: string }): Promise<IUser> {
    const [userByEmail, userByLogin] = await Promise.all([
      findUserByEmail(this.userModel, payload.email),
      findUserByLogin(this.userModel, payload.email),
    ]);

    const user = userByEmail || userByLogin;

    if (!user) {
      Logger.log(USER_NOT_FOUND);
      throw new NotFoundException(USER_NOT_FOUND);
    }

    return user;
  }
}
