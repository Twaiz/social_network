import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: <explanation>
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { getMongoConfig } from '@backend-configs';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const mongoConfig: MongooseModuleOptions =
          await getMongoConfig(configService);

        if (!mongoConfig) {
          throw new Error('❌ Произошла ошибка при подключение к БД!');
        }

        console.log('🚀 Проект успешно подключился к БД!');
        return mongoConfig;
      },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
