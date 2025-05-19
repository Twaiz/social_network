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
import { EMPTY_DTO } from './constant/user-controller.constants';
import {
  type AuthenticatedRequest,
  IUser,
  JwtAuthGuard,
  NewUserInfoCredentialsDto,
} from '@shared';

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
}
