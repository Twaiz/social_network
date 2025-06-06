import { ConfigService } from '@nestjs/config';
import { BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';

import { GetEnv } from '../../kernel';
import { getJwtToken, verifyPassword } from '../../lib';
import { IUser } from '../../structure';
import {
  PASSWORDHASH_IS_NOT_FOUND,
  USER_NOT_FOUND,
  USER_PASSWORD_INVALID,
} from '../constants';

const LoginCredentials = {
  login: 'admin',
  password: 'admin321',
};

export const getActiveToken = async (
  jwtService: JwtService,
  configService: ConfigService,
  userModel: Model<IUser>,
): Promise<{
  token: string;
  user: IUser;
}> => {
  const context = 'GetActiveToken';

  const jwtSecret = GetEnv.getJwtSecret(configService);
  const jwtExpiresIn = GetEnv.getJwtExpiresIn(configService);

  const user = await userModel
    .findOne({ login: LoginCredentials.login })
    .select('+passwordHash');

  if (!user) {
    Logger.error(USER_NOT_FOUND, `${context} - findByLogin`);
    process.exit(1);
  }
  if (!user.passwordHash) {
    Logger.error(PASSWORDHASH_IS_NOT_FOUND, `${context} - PasswordHash`);
    throw new BadRequestException(PASSWORDHASH_IS_NOT_FOUND);
  }

  verifyPassword(
    user.passwordHash,
    LoginCredentials.password,
    USER_PASSWORD_INVALID,
  );

  const token = await getJwtToken(jwtService, {
    user,
    jwtSecret,
    jwtExpiresIn,
  });

  return {
    token,
    user,
  };
};
