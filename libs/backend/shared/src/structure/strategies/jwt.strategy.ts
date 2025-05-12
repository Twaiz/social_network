import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Model } from 'mongoose';

import { USER_NOT_FOUND } from '../../config';
import { IUser } from '../types';
import { GetEnv } from '../../kernel';
import { findUserByEmail } from '../../api';

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
    const user = await findUserByEmail(this.userModel, payload.email);
    if (!user) {
      Logger.error(USER_NOT_FOUND);
      process.exit(1);
    }

    return user;
  }
}
