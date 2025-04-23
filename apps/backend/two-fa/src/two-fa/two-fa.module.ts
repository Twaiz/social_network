import { Module } from '@nestjs/common';

import { TwoFaController } from './two-fa.controller';
import { TwoFaService } from './two-fa.service';

import { AuthModule } from '@modules';

@Module({
  imports: [AuthModule],
  controllers: [TwoFaController],
  providers: [TwoFaService],
})
export class TwoFaModule {}
