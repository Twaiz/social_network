import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { UserLoginCredentialsDto } from './dto/user-login-credentials.dto';
import {
  USER_ALREADY_REGISTERED_WITH_EMAIL_AND_LOGIN,
  USER_ALREADY_REGISTERED_WITH_EMAIL,
  USER_ALREADY_REGISTERED_WITH_LOGIN,
  BOTH_EMAIL_AND_LOGIN_ERROR,
  USER_NOT_FOUND,
} from './auth.constants';

import { IUser } from '@interfaces';
import { Roles } from '@decorators';
import { EUserRole } from '@enums';
import { JwtAuthGuard, RolesGuard } from '@guards';
import { AuthService } from '@services';
import { UserRegisterCredentialsDto } from '@dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //* Register *//
  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(
    @Body() userRegisterCredentialsDto: UserRegisterCredentialsDto,
  ): Promise<{ user: IUser; token: string }> {
    const { email, login } = userRegisterCredentialsDto;

    const userByEmail = await this.authService.findUserByEmail(email);
    const userByLogin = await this.authService.findUserByLogin(login);

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
    const { email, login, password } = userLoginCredentialsDto;

    let user: IUser | null = null;

    if (email && login) {
      throw new BadRequestException(BOTH_EMAIL_AND_LOGIN_ERROR);
    }

    if (email) {
      user = await this.authService.findUserByEmail(email);
    } else if (login) {
      user = await this.authService.findUserByLogin(login);
    }

    if (!user) {
      throw new BadRequestException(USER_NOT_FOUND);
    }

    const token = await this.authService.login({
      user,
      password,
    });

    return { token };
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
