import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { TwoFaController } from '../controllers/two-fa.controller';
import { TwoFaService } from '../services/two-fa.service';

import { connectToMongoDB } from '@configs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { UserSchema } from '@models'; //TODO Убрать нахер это
// eslint-disable-next-line @nx/enforce-module-boundaries
import { JwtStrategy } from '@shared'; //TODO Убрать нахер это

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
