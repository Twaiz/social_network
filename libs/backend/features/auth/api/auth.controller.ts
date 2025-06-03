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
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  BOTH_EMAIL_AND_LOGIN_ERROR,
  CONFIRM_EMAIL_TOKEN_GENERATE,
  CONFIRM_EMAIL_TOKEN_SUCCESS,
} from './constant';

import {
  ConfirmEmailCredentialsDto,
  RegisterCredentialsDto,
  LoginCredentialsDto,
  VerifyPasswordCredentialsDto,
} from '../dto';

import { AuthService } from '../model/auth.service';

import {
  findUser,
  IUser,
  JwtAuthGuard,
  type AuthenticatedRequest,
  RegisterResponse,
  LoginResponse,
  EmailConfirmGuard,
  USER_PASSWORD_INVALID,
  verifyPassword,
  PASSWORDHASH_IS_NOT_FOUND,
  USER_NOT_FOUND,
  EFieldByFindUser,
} from '@shared';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectModel('User') private readonly userModel: Model<IUser>,
    private readonly jwtService: JwtService,
  ) {}

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
    const { email, login, password, twoFactorCode } = loginCredentialsDto;
    const emailOrLogin = email ? 'email' : 'login';
    const INVALID_LOGIN_CREDENTIALS = `${USER_PASSWORD_INVALID} или ${emailOrLogin}. Попробуйте ещё раз.`;

    let user: IUser | null = null;

    //TODO - вынести код проверок в AuthService
    if (email && login) {
      throw new BadRequestException(BOTH_EMAIL_AND_LOGIN_ERROR);
    }

    if (email) {
      user = await findUser(
        this.userModel,
        EFieldByFindUser.EMAIL,
        email,
        USER_NOT_FOUND,
        'Login - findByEmail',
      );
    } else if (login) {
      user = await findUser(
        this.userModel,
        EFieldByFindUser.LOGIN,
        login,
        USER_NOT_FOUND,
        'Login - findByLogin',
      );
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

  //* Verify Password *\\
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('verify-password')
  async verifyPassword(
    @Req() req: AuthenticatedRequest,
    @Body() verifyPasswordCredentials: VerifyPasswordCredentialsDto,
  ): Promise<{ verificationPasswordToken: string }> {
    const user = req.user;
    const { password } = verifyPasswordCredentials;

    if (!user.passwordHash) {
      throw new BadRequestException(PASSWORDHASH_IS_NOT_FOUND);
    }

    verifyPassword(user.passwordHash, password, USER_PASSWORD_INVALID);

    const verificationPasswordToken = this.jwtService.sign(
      { sub: user._id.toString(), type: 'verificationPassword' },
      { expiresIn: '10m' },
    );

    return {
      verificationPasswordToken,
    };
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
