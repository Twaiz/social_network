// biome-ignore lint/style/useImportType: <explanation>
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: <explanation>
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getMongoConfig = async (
  configService: ConfigService,
): Promise<MongooseModuleOptions> => {
  return {
    uri: await getMongoString(configService),
    ...getMongoOptions(),
  };
};

const getMongoString = async (configService: ConfigService) => {
  const mongodbPassword: string | undefined =
    configService.get('MONGODB_PASSWORD');
  const mongodbLogin: string | undefined = configService.get('MONGODB_LOGIN');

  return `mongodb+srv://${mongodbLogin}:${mongodbPassword}@socialnetwork.0iot1ze.mongodb.net/?retryWrites=true&w=majority&appName=SocialNetwork`;
};

const getMongoOptions = () => ({});
