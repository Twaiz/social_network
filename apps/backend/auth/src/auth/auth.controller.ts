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
import { UserCredentialsDto } from './dto/user-credentials.dto';
import {
  USER_ALREADY_REGISTERED_WITH_EMAIL_AND_LOGIN,
  USER_ALREADY_REGISTERED_WITH_EMAIL,
  USER_ALREADY_REGISTERED_WITH_LOGIN,
} from './auth.constants';
import { IUser } from '@interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //* Register *//
  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(
    @Body() userCredentialsDto: UserCredentialsDto,
  ): Promise<{ user: IUser; token: string }> {
    const { email, login } = userCredentialsDto;

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

    return await this.authService.createUser(userCredentialsDto);
  }

  //* Login *//

  //* Get Message (For e2e Test) *//
  @Get()
  getMessage(): { message: string } {
    return this.authService.getMessage();
  }
}
