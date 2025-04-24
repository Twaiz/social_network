import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

import { getMongoConfig } from './mongo.config';
import {
  DB_CONNECTION_FAILED,
  DB_CONNECTION_SUCCESS,
} from './configs.constants';

export const connectToMongoDB = async (
  configService: ConfigService,
): Promise<MongooseModuleOptions> => {
  const mongoConfig = await getMongoConfig(configService);

  if (!mongoConfig) {
    Logger.error(DB_CONNECTION_FAILED, 'MongoDB');
    process.exit(1);
  }

  Logger.log(DB_CONNECTION_SUCCESS, 'MongoDB');
  return mongoConfig;
};
