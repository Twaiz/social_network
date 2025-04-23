import { IsNotEmpty, IsString } from 'class-validator';

import { IUser } from '@interfaces';

export class LoginDto {
  user!: IUser;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  twoFactorCode?: string;
}
