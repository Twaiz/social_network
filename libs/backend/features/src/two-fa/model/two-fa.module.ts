import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

//TODO короче, хз что тут делать, т.к. у нас есть правила импортов в слоях. Нельзя, чтобы слой model что-то брал из слоя api та и вообще во всех других слоях. Хз, что делать
import { TwoFaController } from '../controllers';
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
