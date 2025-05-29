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
  CHANGE_EMAIL_PROCESS,
  CHANGE_EMAIL_SUCCESS,
  CHANGE_PASSWORD_PROCESS,
  CHANGE_PASSWORD_SUCESS,
  EMPTY_DTO,
  IDENTICAL_EMAIL,
} from './constant';

import {
  type AuthenticatedRequest,
  EmailConfirmGuard,
  IUser,
  JwtAuthGuard,
  NewUserInfoCredentialsDto,
  ChangeEmailCredentialsDto,
  ConfirmChangedEmailCredentialsDto,
  ChangePasswordCredentialsDto,
  ConfirmNewPasswordCredentialsDto,
} from '@shared';

import { UserService } from '../model/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('updateUserInfo')
  async updateUserInfo(
    @Req() req: AuthenticatedRequest,
    @Body() newUserInfoCredentials: NewUserInfoCredentialsDto,
  ): Promise<IUser> {
    if (!newUserInfoCredentials) {
      throw new BadRequestException(EMPTY_DTO);
    }

    const user = req.user;
    const fieldsToCheck: (keyof NewUserInfoCredentialsDto)[] = [
      'login',
      'firstName',
      'secondName',
    ];

    for (const field of fieldsToCheck) {
      if (newUserInfoCredentials[field] === user[field]) {
        throw new BadRequestException(
          `⚠️ Новый ${field} не может совпадать с текущим`,
        );
      }
    }

    return this.userService.updateUserInfo(user, newUserInfoCredentials);
  }

  @HttpCode(201)
  @Post('change-email')
  @UseGuards(JwtAuthGuard, EmailConfirmGuard)
  async changeEmail(
    @Req() req: AuthenticatedRequest,
    @Body() changeEmailCredentials: ChangeEmailCredentialsDto,
  ): Promise<{ message: string }> {
    const { newEmail } = changeEmailCredentials;
    const user = req.user;

    if (newEmail === user.email) {
      throw new BadRequestException(IDENTICAL_EMAIL);
    }

    await this.userService.changeEmail(user, newEmail);

    return { message: CHANGE_EMAIL_PROCESS };
  }

  @HttpCode(200)
  @Post('confirm-changed-email')
  async confirmChangedEmail(
    @Body()
    confirmChangedEmailCredentials: ConfirmChangedEmailCredentialsDto,
  ): Promise<{ message: string }> {
    const { changeEmailToken } = confirmChangedEmailCredentials;

    await this.userService.confirmChangedEmail(changeEmailToken);

    return { message: CHANGE_EMAIL_SUCCESS };
  }

  @HttpCode(201)
  @UseGuards(JwtAuthGuard, EmailConfirmGuard)
  @Post('change-password')
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() changePasswordCredentials: ChangePasswordCredentialsDto,
  ): Promise<{ message: string }> {
    const user = req.user;
    const { newPassword } = changePasswordCredentials;

    await this.userService.changePassword(user, newPassword);

    return { message: CHANGE_PASSWORD_PROCESS };
  }

  @HttpCode(200)
  @Post('confirm-new-password')
  async confirmNewPassword(
    @Body() confirmNewPasswordCredentials: ConfirmNewPasswordCredentialsDto,
  ): Promise<{ message: string }> {
    const { changePasswordToken } = confirmNewPasswordCredentials;

    await this.userService.confirmNewPassword(changePasswordToken);

    return { message: CHANGE_PASSWORD_SUCESS };
  }
}
