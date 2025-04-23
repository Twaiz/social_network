import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { DB_CONNECTION_FAILED, DB_CONNECTION_SUCCESS } from './auth.constants';
import { AuthController } from './auth.controller';
import { UserSchema } from './user.model';

import { AuthService } from '@services';
import { JwtStrategy } from '@jwt-utils';
import { getJwtConfig, getMongoConfig } from '@configs';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const mongoConfig = await getMongoConfig(configService);

        if (!mongoConfig) {
          Logger.error(DB_CONNECTION_FAILED, 'MongoDB');
          process.exit(1);
        }

        Logger.log(DB_CONNECTION_SUCCESS, 'MongoDB');
        return mongoConfig;
      },
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
