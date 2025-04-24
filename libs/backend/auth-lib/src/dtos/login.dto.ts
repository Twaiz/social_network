import { IsNotEmpty, IsString } from 'class-validator';

import { IUser } from '@shared';

export class LoginDto {
  user!: IUser;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  twoFactorCode?: string;
}
