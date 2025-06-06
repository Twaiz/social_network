import { BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { IUser, VerifyPasswordCredentialsDto } from '../../../structure';
import {
  PASSWORDHASH_IS_NOT_FOUND,
  USER_PASSWORD_INVALID,
} from '../../../config';
import { verifyPassword } from '../../../lib';

export const generateVerifyPasswordToken = async (
  jwtService: JwtService,
  user: IUser,
  verifyPasswordCredentials: VerifyPasswordCredentialsDto,
): Promise<string> => {
  const { password } = verifyPasswordCredentials;

  if (!user.passwordHash) {
    Logger.error(PASSWORDHASH_IS_NOT_FOUND, 'GenerateVerifyPasswordToken');
    throw new BadRequestException(PASSWORDHASH_IS_NOT_FOUND);
  }

  verifyPassword(user.passwordHash, password, USER_PASSWORD_INVALID);

  const verificationPasswordToken = jwtService.sign(
    { sub: user._id, type: 'verificationPassword' },
    { expiresIn: '10m' },
  );

  return verificationPasswordToken;
};
