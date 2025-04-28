import { Model } from 'mongoose';

const findUserByEmail = async <T>(
  model: Model<T>,
  email: string,
): Promise<T | null> => {
  return model.findOne({ email });
};

//* Find User By Login *//
const findUserByLogin = async <T>(
  model: Model<T>,
  login: string,
): Promise<T | null> => {
  return model.findOne({ login });
};

export { findUserByEmail, findUserByLogin };
