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
import { AuthDto } from './dto/auth.dto';
import {
  USER_ALREADY_REGISTERED_WITH_EMAIL_AND_LOGIN,
  USER_ALREADY_REGISTERED_WITH_EMAIL,
  USER_ALREADY_REGISTERED_WITH_LOGIN,
} from './auth.constants';
import { IUser } from '@interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(@Body() userCredentials: AuthDto): Promise<IUser> {
    const { email, login } = userCredentials;

    const userByEmail = await this.authService.findUserByEmail(email);
    const userByLogin = await this.authService.findUserByLogin(login);

    const emailExists = !!userByEmail;
    const loginExists = !!userByLogin;

    if (emailExists && loginExists) {
      throw new BadRequestException(
        USER_ALREADY_REGISTERED_WITH_EMAIL_AND_LOGIN,
      );
    }

    if (emailExists) {
      throw new BadRequestException(USER_ALREADY_REGISTERED_WITH_EMAIL);
    }

    if (loginExists) {
      throw new BadRequestException(USER_ALREADY_REGISTERED_WITH_LOGIN);
    }

    return await this.authService.createUser(userCredentials);
  }

  @Get()
  getMessage(): { message: string } {
    return this.authService.getMessage();
  }
}
