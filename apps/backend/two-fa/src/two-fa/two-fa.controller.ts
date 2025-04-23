import { Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';

import { TwoFaService } from './two-fa.service';

import { JwtAuthGuard } from '@guards';
import type { IExpressRequest } from '@interfaces';

@Controller('two-fa')
export class TwoFaController {
  constructor(private readonly twoFaService: TwoFaService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate(@Req() req: IExpressRequest): Promise<{
    secret: string;
    otpauthUrl: string;
    qrCodeDataUrl: string;
  }> {
    const user = req.user;
    if (!user) {
      Logger.error('Не найден User в Request');
      process.exit(1);
    }

    return this.twoFaService.generateTwoFactorSecret(user);
  }
}
