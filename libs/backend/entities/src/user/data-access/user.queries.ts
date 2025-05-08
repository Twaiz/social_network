import { Model } from 'mongoose';

const findUserByEmail = async <T>(
  model: Model<T>,
  email: string,
  select?: string,
): Promise<T | null> => {
  return model.findOne({ email }).select(select || '');
};

//* Find User By Login *//
const findUserByLogin = async <T>(
  model: Model<T>,
  login: string,
  select?: string,
): Promise<T | null> => {
  return model.findOne({ login }).select(select || '');
};

export { findUserByEmail, findUserByLogin };
