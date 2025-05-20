import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  CHANGE_EMAIL_GENERATE,
  CHANGE_EMAIL_SUCCESS,
  EMPTY_DTO,
} from './constant/user-controller.constants';

import {
  type AuthenticatedRequest,
  EmailConfirmGuard,
  IUser,
  JwtAuthGuard,
  NewUserInfoCredentialsDto,
} from '@shared';

import { UserService } from '../model/user.service';
import {
  ChangeEmailCredentialsDto,
  ConfirmChangedEmailCredentialsDto,
} from '../dto';

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
    const { newEmail } = changeEmailCredentialsDto;
    const user = req.user;

    await this.userService.changeEmail(user, newEmail);

    return { message: CHANGE_EMAIL_GENERATE };
  }

  @HttpCode(200)
  @Post('confirm-changed-email')
  async confirmChangedEmail(
    @Body()
    confirmChangedEmailCredentialsDto: ConfirmChangedEmailCredentialsDto,
  ): Promise<{ message: string }> {
    const { changeEmailToken } = confirmChangedEmailCredentialsDto;

    await this.userService.confirmChangedEmail(changeEmailToken);

    return { message: CHANGE_EMAIL_SUCCESS };
  }
}
