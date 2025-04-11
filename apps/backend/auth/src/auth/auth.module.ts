import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { getJwtConfig, getMongoConfig } from '@backend-configs';
import { DB_CONNECTION_FAILED, DB_CONNECTION_SUCCESS } from './auth.constants';
import { UserSchema } from './user.model';

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
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
