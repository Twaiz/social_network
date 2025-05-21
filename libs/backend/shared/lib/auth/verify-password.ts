import { BadRequestException } from '@nestjs/common';
import { compareSync } from 'bcryptjs';

export const verifyPassword = async (
  currentPasswordHash: string,
  newPassword: string,
  errorMessage: string,
): Promise<boolean> => {
  const isPasswordValid = compareSync(currentPasswordHash, newPassword);
  if (!isPasswordValid) {
    throw new BadRequestException(errorMessage);
  }
  return true;
};
