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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  USER_ALREADY_REGISTERED_WITH_EMAIL_AND_LOGIN,
  USER_ALREADY_REGISTERED_WITH_EMAIL,
  USER_ALREADY_REGISTERED_WITH_LOGIN,
  BOTH_EMAIL_AND_LOGIN_ERROR,
  CONFIRM_EMAIL_TOKEN_GENERATE,
  CONFIRM_EMAIL_TOKEN_SUCCESS,
  USER_INVALID_PASSWORD,
} from '../auth.constants';

import { AuthService } from '../services';
import {
  UserLoginCredentialsDto,
  ConfirmEmail,
  UserRegisterCredentialsDto,
} from '../dtos';

import {
  IUser,
  Roles,
  EUserRole,
  JwtAuthGuard,
  RolesGuard,
  type AuthenticatedRequest,
  findUserByEmail,
  findUserByLogin,
  RegisterResponse,
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
  @UsePipes(new ValidationPipe())
  async register(
    @Body() userRegisterCredentialsDto: UserRegisterCredentialsDto,
  ): Promise<RegisterResponse> {
    const { email, login } = userRegisterCredentialsDto;

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

    return await this.authService.createUser(userRegisterCredentialsDto);
  }

  //* Login *//
  @Post('login')
  async login(
    @Body() userLoginCredentialsDto: UserLoginCredentialsDto,
  ): Promise<{ token: string }> {
    const { email, login, password, twoFactorCode } = userLoginCredentialsDto;
    const emailOrLogin = email ? 'email' : 'login';
    const INVALID_LOGIN_CREDENTIALS = `${USER_INVALID_PASSWORD} или ${emailOrLogin}. Попробуйте ещё раз.`;

    let user: IUser | null = null;

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
    });

    return { token };
  }

  //* Generate Email Token *//
  @HttpCode(200)
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
    @Body() emailConfirmToken: ConfirmEmail,
  ): Promise<{ message: string }> {
    const { token } = emailConfirmToken;

    await this.authService.confirmEmail(token);

    return { message: CONFIRM_EMAIL_TOKEN_SUCCESS };
  }

  //* Test Route For Testing Roles Guard (Admin) *//
  @Get('for-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(EUserRole.Admin)
  getAdminMessage(): { message: string } {
    return {
      message: 'Тест роута для Админа',
    };
  }

  //* Test Route For Testing Roles Guard (Moderator) *//
  @Get('for-moderator')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(EUserRole.Moderator)
  getModeratorMessage(): { message: string } {
    return {
      message: 'Тест роута для Модератора',
    };
  }

  //* Get Message (For e2e Test) *//
  @Get()
  getMessage(): { message: string } {
    return this.authService.getMessage();
  }
}
