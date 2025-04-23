import { Body, Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';

import { TwoFaService } from './two-fa.service';

import { JwtAuthGuard } from '@guards';
import type { IExpressRequest } from '@interfaces';
import { Enable2FADto } from './dto/enable2FA.dto';

@Controller('two-fa')
export class TwoFaController {
  constructor(private readonly twoFaService: TwoFaService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate2FASecret(@Req() req: IExpressRequest): Promise<{
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

  @Post('enable')
  @UseGuards(JwtAuthGuard)
  async enable2FA(
    @Req() req: IExpressRequest,
    @Body() token: Enable2FADto,
  ): Promise<{
    status: string;
    code: number;
    message: string;
  }> {
    const { code } = token;
    const user = req.user;

    if (!user) {
      Logger.error('Не найден User в Request');
      process.exit(1);
    }

    console.log(code);

    return this.twoFaService.enableTwoFactor(user, code);
  }
}
