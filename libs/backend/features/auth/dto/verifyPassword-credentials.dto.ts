import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import {
  PASSWORD_MAX_LENGTH_ERROR,
  PASSWORD_MIN_LENGTH_ERROR,
} from './constant';

export class VerifyPasswordCredentialsDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: PASSWORD_MIN_LENGTH_ERROR })
  @MaxLength(32, { message: PASSWORD_MAX_LENGTH_ERROR })
  password!: string;
}
