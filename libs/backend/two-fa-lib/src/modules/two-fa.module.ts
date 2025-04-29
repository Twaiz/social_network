import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { TwoFaController } from '../controllers';
import { TwoFaService } from '../services';

import { connectToMongoDB } from '@configs';
import { UserSchema } from '@models';
import { JwtStrategy } from '@shared';

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
