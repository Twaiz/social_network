import { Logger, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';

import { EFieldByFindUser, IUser } from '../structure';

//TODO - удалить findUser и использовать во всех дургих методах поиск вручную, а не через кастомные функции как эта
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
