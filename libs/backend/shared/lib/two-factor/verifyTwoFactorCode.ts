import { BadRequestException, Logger } from '@nestjs/common';
import { authenticator } from 'otplib';

import { IUser } from '../../structure';
import { INVALID_2FA_CODE, TWO_FACTOR_SECRET_NOT_FOUND } from './constant';

export const verifyTwoFactorCode = (user: IUser, code: string): void => {
  if (!user.twoFactorSecret) {
    Logger.error(TWO_FACTOR_SECRET_NOT_FOUND, 'verifyTwoFactorCode');
    throw new BadRequestException(TWO_FACTOR_SECRET_NOT_FOUND);
  }

  const isTwoFactorCodeValid = authenticator.verify({
    token: code,
    secret: user.twoFactorSecret,
  });

  if (!isTwoFactorCodeValid) {
    throw new BadRequestException(INVALID_2FA_CODE);
  }
};
