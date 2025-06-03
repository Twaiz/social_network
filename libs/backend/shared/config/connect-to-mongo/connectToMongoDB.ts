import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

import { DB_CONNECTION_FAILED, DB_CONNECTION_SUCCESS } from './constant';
import { GetEnv } from '../../kernel';

export const connectToMongoDB = async (
  configService: ConfigService,
): Promise<MongooseModuleOptions> => {
  const mongoConfig = await getMongoConfig(configService);

  if (!mongoConfig) {
    Logger.error(DB_CONNECTION_FAILED, 'MongoDB - connectToMongoDB');
    process.exit(1);
  }

  Logger.log(DB_CONNECTION_SUCCESS, 'MongoDB - - connectToMongoDB');
  return mongoConfig;
};

export const getMongoConfig = async (
  configService: ConfigService,
): Promise<MongooseModuleOptions> => {
  return {
    uri: await getMongoString(configService),
    ...getMongoOptions(),
  };
};

const getMongoString = async (configService: ConfigService) => {
  const mongodbPassword = GetEnv.getMongodbPassword(configService);
  const mongodbLogin = GetEnv.getMongodbLogin(configService);

  return `mongodb+srv://${mongodbLogin}:${mongodbPassword}@socialnetwork.0iot1ze.mongodb.net/?retryWrites=true&w=majority&appName=SocialNetwork`;
};

const getMongoOptions = () => ({});
