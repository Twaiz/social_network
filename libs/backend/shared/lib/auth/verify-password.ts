import { BadRequestException } from '@nestjs/common';
import { compareSync } from 'bcryptjs';

export const verifyPassword = (
  currentPasswordHash: string,
  newPassword: string,
  errorMessage: string,
): boolean => {
  const isPasswordValid = compareSync(currentPasswordHash, newPassword);
  if (!isPasswordValid) {
    throw new BadRequestException(errorMessage);
  }
  return true;
};
