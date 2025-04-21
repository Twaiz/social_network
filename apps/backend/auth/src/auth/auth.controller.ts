import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { UserRegisterCredentialsDto } from './dto/user-register-credentials.dto';
import {
  USER_ALREADY_REGISTERED_WITH_EMAIL_AND_LOGIN,
  USER_ALREADY_REGISTERED_WITH_EMAIL,
  USER_ALREADY_REGISTERED_WITH_LOGIN,
  BOTH_EMAIL_AND_LOGIN_ERROR,
} from './auth.constants';
import { IUser } from '@interfaces';
import { UserLoginCredentialsDto } from './dto/user-login-credentials.dto';

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
    const { email, login } = userLoginCredentialsDto;

    if (email && login) {
      throw new BadRequestException(BOTH_EMAIL_AND_LOGIN_ERROR);
    }

    const token = await this.authService.login(userLoginCredentialsDto);

    return { token };
  }

  //* Get Message (For e2e Test) *//
  @Get()
  getMessage(): { message: string } {
    return this.authService.getMessage();
  }
}
