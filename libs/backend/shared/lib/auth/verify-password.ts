import { BadRequestException, Logger } from '@nestjs/common';
import { compareSync } from 'bcryptjs';

import { USER_PASSWORD_INVALID } from '../../config';

export const verifyPassword = (
  currentPasswordHash: string,
  newPassword: string,
  errorMessage: string,
): boolean => {
  const isPasswordValid = compareSync(newPassword, currentPasswordHash);
  if (!isPasswordValid) {
    Logger.error(USER_PASSWORD_INVALID, 'VerifyPassword');
    throw new BadRequestException(errorMessage);
  }
  return true;
};
