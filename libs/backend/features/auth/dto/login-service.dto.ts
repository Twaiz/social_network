import { IsNotEmpty, IsString } from 'class-validator';

import { IUser } from '@shared';

export class LoginServiceDto {
  user!: IUser;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  twoFactorCode?: string;
}
