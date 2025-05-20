import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { compareSync } from 'bcryptjs';

import { findUserByLogin } from '../../api';
import { GetEnv } from '../../kernel';
import { getJwtToken } from '../../lib';
import { IUser } from '../../structure';

import { USER_NOT_FOUND } from '../constants';
import { USER_PASSWORD_INVALID } from './constant';

export const getActiveToken = async (
  jwtService: JwtService,
  configService: ConfigService,
  userModel: Model<IUser>,
): Promise<{
  token: string;
  user: IUser;
}> => {
  const jwtSecret = GetEnv.getJwtSecret(configService);
  const jwtExpiresIn = GetEnv.getJwtExpiresIn(configService);

  const user = await findUserByLogin(userModel, 'admin');
  if (!user) {
    Logger.error(USER_NOT_FOUND);
    process.exit(1);
  }

  const isPasswordValid = compareSync('admin123', user.passwordHash);
  if (!isPasswordValid) {
    Logger.error(USER_PASSWORD_INVALID);
    process.exit(1);
  }

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
