import { Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';

import { UserService } from '../model';
import { NewUserInfoCredentialsDto } from '../dto';
import { type AuthenticatedRequest, IUser, JwtAuthGuard } from '@shared';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('update')
  async updateUserInfo(
    @Req() req: AuthenticatedRequest,
    newUserInfoCredentialsDto: NewUserInfoCredentialsDto,
  ): Promise<IUser> {
    const user = req.user;

    return this.userService.updateUserInfo(user, newUserInfoCredentialsDto);
  }
}
