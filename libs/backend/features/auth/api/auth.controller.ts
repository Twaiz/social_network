import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  BOTH_EMAIL_AND_LOGIN_ERROR,
  CONFIRM_EMAIL_TOKEN_GENERATE,
  CONFIRM_EMAIL_TOKEN_SUCCESS,
} from './constant';

import {
  ConfirmEmailCredentialsDto,
  RegisterCredentialsDto,
  LoginCredentialsDto,
} from '../dto';

import { AuthService } from '../model/auth.service';

import {
  JwtAuthGuard,
  type AuthenticatedRequest,
  RegisterResponse,
  LoginResponse,
  EmailConfirmGuard,
} from '@shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //* Register *//
  @HttpCode(201)
  @Post('register')
  async register(
    @Body() registerCredentialsDto: RegisterCredentialsDto,
  ): Promise<RegisterResponse> {
    return await this.authService.createUser(registerCredentialsDto);
  }

  //* Login *//
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() loginCredentialsDto: LoginCredentialsDto,
  ): Promise<LoginResponse> {
    const { email, login } = loginCredentialsDto;

    if (email && login) {
      throw new BadRequestException(BOTH_EMAIL_AND_LOGIN_ERROR);
    }

    const token = await this.authService.login(loginCredentialsDto);

    return { token };
  }

  //* Generate Email Token *//
  @HttpCode(201)
  @Post('generate-email-token')
  @UseGuards(JwtAuthGuard)
  async generateEmailToken(
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    const user = req.user;

    await this.authService.generateEmailToken(user);

    return { message: CONFIRM_EMAIL_TOKEN_GENERATE };
  }

  //* Confirm Email Token *//
  @HttpCode(200)
  @Post('confirm-email')
  async confirmEmail(
    @Body() confirmEmailCredentials: ConfirmEmailCredentialsDto,
  ): Promise<{ message: string }> {
    const { token } = confirmEmailCredentials;

    await this.authService.confirmEmail(token);

    return { message: CONFIRM_EMAIL_TOKEN_SUCCESS };
  }

  //* Test Route for Check isEmailConfirm *//
  @HttpCode(200)
  @Get('check-isEmailConfirm')
  @UseGuards(JwtAuthGuard, EmailConfirmGuard)
  async checkIsEmailConfirm(): Promise<{ message: string }> {
    return {
      message: 'У вас подтверждена почта!)',
    };
  }
}
