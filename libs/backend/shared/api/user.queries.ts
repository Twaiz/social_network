import { BadRequestException, Logger } from '@nestjs/common';
import { Model } from 'mongoose';

import { IUser } from '../structure';

enum EFieldByFindUser {
  EMAIL = 'email',
  LOGIN = 'login',
  ID = 'id',
}

export const findUser = async (
  model: Model<IUser>,
  field: EFieldByFindUser,
  searchValue: string,
  errorMessage: string,
  context: string,
  select?: string,
): Promise<IUser> => {
  const user = await model
    .findOne({ [field]: searchValue })
    .select(select || '');
  if (!user) {
    Logger.error(errorMessage, `FindUser - ${context}`);
    throw new BadRequestException(errorMessage);
  }
  return user;
};
