import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  USER_ALREADY_REGISTERED_WITH_EMAIL_AND_LOGIN,
  USER_ALREADY_REGISTERED_WITH_EMAIL,
  BOTH_EMAIL_AND_LOGIN_ERROR,
  CONFIRM_EMAIL_TOKEN_GENERATE,
  CONFIRM_EMAIL_TOKEN_SUCCESS,
} from './constant';
import { USER_INVALID_PASSWORD } from '../auth.constants';

import {
  ConfirmEmailCredentialsDto,
  RegisterCredentialsDto,
  LoginCredentialsDto,
} from '../dto';

import { AuthService } from '../model/auth.service';

import {
  findUserByEmail,
  findUserByLogin,
  IUser,
  JwtAuthGuard,
  type AuthenticatedRequest,
  RegisterResponse,
  LoginResponse,
  EmailConfirmGuard,
  USER_ALREADY_REGISTERED_WITH_LOGIN,
} from '@shared';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectModel('User') private readonly userModel: Model<IUser>,
  ) {}

  //* Register *//
  @HttpCode(201)
  @Post('register')
  async register(
    @Body() registerCredentialsDto: RegisterCredentialsDto,
  ): Promise<RegisterResponse> {
    const { email, login } = registerCredentialsDto;

    //TODO - вынести код проверок в AuthService
    const userByEmail = await findUserByEmail(this.userModel, email);
    const userByLogin = await findUserByLogin(this.userModel, login);

    const emailExists = !!userByEmail;
    const loginExists = !!userByLogin;

    if (emailExists && loginExists) {
      throw new BadRequestException(
        USER_ALREADY_REGISTERED_WITH_EMAIL_AND_LOGIN,
      );
    }

    if (emailExists || loginExists) {
      throw new BadRequestException(
        emailExists
          ? USER_ALREADY_REGISTERED_WITH_EMAIL
          : USER_ALREADY_REGISTERED_WITH_LOGIN,
      );
    }

    return await this.authService.createUser(registerCredentialsDto);
  }

  //* Login *//
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() loginCredentialsDto: LoginCredentialsDto,
  ): Promise<LoginResponse> {
    const { email, login, password, twoFactorCode } = loginCredentialsDto;
    const emailOrLogin = email ? 'email' : 'login';
    const INVALID_LOGIN_CREDENTIALS = `${USER_INVALID_PASSWORD} или ${emailOrLogin}. Попробуйте ещё раз.`;

    let user: IUser | null = null;

    //TODO - вынести код проверок в AuthService
    if (email && login) {
      throw new BadRequestException(BOTH_EMAIL_AND_LOGIN_ERROR);
    }

    if (email) {
      user = await findUserByEmail(this.userModel, email);
    } else if (login) {
      user = await findUserByLogin(this.userModel, login);
    }

    if (!user) {
      throw new NotFoundException(INVALID_LOGIN_CREDENTIALS);
    }

    const token = await this.authService.login({
      user,
      password,
      twoFactorCode,
      errorMessage: INVALID_LOGIN_CREDENTIALS,
    });

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
