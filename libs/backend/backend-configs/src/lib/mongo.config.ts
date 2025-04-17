import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

import { GetEnv } from '@get-env';

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
