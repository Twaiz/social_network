import { Module } from '@nestjs/common';

import { TwoFaController } from './two-fa.controller';
import { TwoFaService } from './two-fa.service';

import { AuthService } from '@services';

@Module({
  controllers: [TwoFaController],
  providers: [TwoFaService],
  imports: [AuthService],
})
export class TwoFaModule {}
