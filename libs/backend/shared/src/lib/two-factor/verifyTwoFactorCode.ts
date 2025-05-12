import { BadRequestException } from '@nestjs/common';
import { authenticator } from 'otplib';

import { IUser } from '../../structure/types/interfaces/user.interface';
import { INVALID_2FA_CODE } from './constant/two-factor.constants';

export const verifyTwoFactorCode = (user: IUser, code: string): void => {
  const isTwoFactorCodeValid = authenticator.verify({
    token: code,
    secret: user.twoFactorSecret,
  });

  if (!isTwoFactorCodeValid) {
    throw new BadRequestException(INVALID_2FA_CODE);
  }
};
