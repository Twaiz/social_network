import { BadRequestException, Logger } from '@nestjs/common';
import { Model } from 'mongoose';

const findUser = {
  async byEmail<T>(
    model: Model<T>,
    email: string,
    errorMessage: string,
    select?: string,
  ): Promise<null | T> {
    const user = await model.findOne({ email }).select(select || '');
    if (!user) {
      Logger.error(errorMessage, 'UserQueries - findUserByEmail');
      throw new BadRequestException(errorMessage);
    }
    return user;
  },
  async byLogin<T>(
    model: Model<T>,
    login: string,
    errorMessage: string,
    select?: string,
  ): Promise<null | T> {
    const user = await model.findOne({ login }).select(select || '');
    if (!user) {
      Logger.error(errorMessage, 'UserQueries - findUserByLogin');
      throw new BadRequestException(errorMessage);
    }
    return user;
  },
};

export { findUser };
