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
    @Body() newUserInfoCredentialsDto: NewUserInfoCredentialsDto,
  ): Promise<IUser> {
    if (!newUserInfoCredentialsDto) {
      throw new BadRequestException(EMPTY_DTO);
    }

    const user = req.user;
    const fieldsToCheck: (keyof NewUserInfoCredentialsDto)[] = [
      'login',
      'firstName',
      'secondName',
    ];

    for (const field of fieldsToCheck) {
      if (newUserInfoCredentialsDto[field] === user[field]) {
        throw new BadRequestException(
          `⚠️ Новый ${field} не может совпадать с текущим`,
        );
      }
    }

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
    confirmChangedEmailCredentialsDto: ConfirmChangedEmailCredentialsDto,
  ): Promise<{ message: string }> {
    const { changeEmailToken } = confirmChangedEmailCredentialsDto;

    await this.userService.confirmChangedEmail(changeEmailToken);

    return { message: CHANGE_EMAIL_SUCCESS };
  }

  @HttpCode(201)
  @UseGuards(JwtAuthGuard, EmailConfirmGuard)
  @Post('change-password')
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() changePasswordCredentialsDto: ChangePasswordCredentialsDto,
  ): Promise<{ message: string }> {
    const user = req.user;
    const { newPassword } = changePasswordCredentialsDto;

    await this.userService.changePassword(user, newPassword);

    return { message: CHANGE_PASSWORD_PROCESS };
  }

  @HttpCode(200)
  @Post('confirm-new-password')
  async confirmNewPassword(
    @Body() confirmNewPasswordCredentialsDto: ConfirmNewPasswordCredentialsDto,
  ): Promise<{ message: string }> {
    const { changePasswordToken } = confirmNewPasswordCredentialsDto;

    await this.userService.confirmNewPassword(changePasswordToken);

    return { message: CHANGE_PASSWORD_SUCESS };
  }
}
