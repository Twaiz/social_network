import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

import { EnvString } from '@types';

export const getMongoConfig = async (
  configService: ConfigService,
): Promise<MongooseModuleOptions> => {
  return {
    uri: await getMongoString(configService),
    ...getMongoOptions(),
  };
};

const getMongoString = async (configService: ConfigService) => {
  const mongodbPassword: EnvString = configService.get('MONGODB_PASSWORD');
  const mongodbLogin: EnvString = configService.get('MONGODB_LOGIN');

  return `mongodb+srv://${mongodbLogin}:${mongodbPassword}@socialnetwork.0iot1ze.mongodb.net/?retryWrites=true&w=majority&appName=SocialNetwork`;
};

const getMongoOptions = () => ({});
