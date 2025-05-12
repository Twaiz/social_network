import { BadRequestException } from '@nestjs/common';
import { authenticator } from 'otplib';

import { IUser } from '../../structure';
import { INVALID_2FA_CODE } from './constant';

export const verifyTwoFactorCode = (user: IUser, code: string): void => {
  const isTwoFactorCodeValid = authenticator.verify({
    token: code,
    secret: user.twoFactorSecret,
  });

  if (!isTwoFactorCodeValid) {
    throw new BadRequestException(INVALID_2FA_CODE);
  }
};
