import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { getMongoConfig } from '@backend-configs';
import { DB_CONNECTION_FAILED, DB_CONNECTION_SUCCESS } from './auth.constants';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const mongoConfig = await getMongoConfig(configService);

        if (!mongoConfig) {
          throw new Error(DB_CONNECTION_FAILED);
        }

        Logger.log(DB_CONNECTION_SUCCESS, 'MongoDB');
        return mongoConfig;
      },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
