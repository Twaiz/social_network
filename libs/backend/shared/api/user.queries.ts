import { Logger, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';

import { EFieldByFindUser, IUser } from '../structure';

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
    throw new NotFoundException(errorMessage);
  }
  return user;
};
