import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { TwoFaController } from '../api';
import { TwoFaService } from './two-fa.service';

import { connectToMongoDB, JwtStrategy } from '@shared';
import { UserSchema } from '@entities/user';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: connectToMongoDB,
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [TwoFaController],
  providers: [TwoFaService, JwtStrategy],
  exports: [TwoFaService],
})
export class TwoFaModule {}
