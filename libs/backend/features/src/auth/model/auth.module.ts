import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from '../api/auth.controller';
import { AuthService } from './auth.service';

//TODO хз что с этим делать, т.к. по правилам FSD слой auth не может ничего брать из слоя two-fa
import { TwoFaModule } from '@two-fa-lib';
import { UserSchema } from '@entities/user';
import { JwtStrategy, getJwtConfig, connectToMongoDB } from '@shared';

@Module({
  imports: [
    forwardRef(() => TwoFaModule),
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: connectToMongoDB,
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
