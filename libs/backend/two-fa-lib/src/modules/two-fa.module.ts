import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { TwoFaController } from '../controllers/two-fa.controller';
import { TwoFaService } from '../services/two-fa.service';

import { connectToMongoDB } from '@configs';
import { UserSchema } from '@models';

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
  providers: [TwoFaService],
  exports: [TwoFaService],
})
export class TwoFaModule {}
