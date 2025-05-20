import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { UserService } from '../model/user.service';
import {
  CHANGE_EMAIL_GENERATE,
  EMPTY_DTO,
} from './constant/user-controller.constants';
import {
  type AuthenticatedRequest,
  EmailConfirmGuard,
  IUser,
  JwtAuthGuard,
  NewUserInfoCredentialsDto,
} from '@shared';
import { ChangeEmailCredentialsDto } from '../dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('updateUserInfo')
  async updateUserInfo(
    @Req() req: AuthenticatedRequest,
    @Body() newUserInfoCredentialsDto: NewUserInfoCredentialsDto,
  ): Promise<IUser> {
    if (!newUserInfoCredentialsDto) {
      throw new BadRequestException(EMPTY_DTO);
    }

    const user = req.user;

    return this.userService.updateUserInfo(user, newUserInfoCredentialsDto);
  }

  @HttpCode(201)
  @Post('change-email')
  @UseGuards(JwtAuthGuard, EmailConfirmGuard)
  async changeEmail(
    @Req() req: AuthenticatedRequest,
    @Body() changeEmailCredentialsDto: ChangeEmailCredentialsDto,
  ): Promise<{ message: string }> {
    const user = req.user;

    await this.userService.changeEmail(user, changeEmailCredentialsDto);

    return { message: CHANGE_EMAIL_GENERATE };
  }
}
