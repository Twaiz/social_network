import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { SUCCESS_2FA_ENABLED } from './constant';
import { Enable2FADto } from '../dto';
import { TwoFaService } from '../model/two-fa.service';

import { JwtAuthGuard, type AuthenticatedRequest } from '@shared';

@Controller('two-fa')
export class TwoFaController {
  constructor(private readonly twoFaService: TwoFaService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate2FASecret(@Req() req: AuthenticatedRequest): Promise<{
    secret: string;
    otpauthUrl: string;
    qrCodeDataUrl: string;
  }> {
    return this.twoFaService.generateTwoFactorSecret(req.user);
  }

  @HttpCode(200)
  @Post('enable')
  @UseGuards(JwtAuthGuard)
  async enable2FA(
    @Req() req: AuthenticatedRequest,
    @Body() { code }: Enable2FADto,
  ): Promise<{
    message: string;
  }> {
    await this.twoFaService.enableTwoFactor(req.user, code);

    return { message: SUCCESS_2FA_ENABLED };
  }

  @HttpCode(200)
  @Get('get-message')
  async getMessage(): Promise<{ message: string }> {
    return { message: 'Hello TwoFa Module' };
  }
}
