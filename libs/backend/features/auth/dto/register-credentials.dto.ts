import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import {
  LOGIN_MAX_LENGTH_ERROR,
  LOGIN_MIN_LENGTH_ERROR,
  PASSWORD_MIN_LENGTH_ERROR,
  PASSWORD_MAX_LENGTH_ERROR,
} from './constant';

export class RegisterCredentialsDto {
  @IsString()
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(4, { message: LOGIN_MIN_LENGTH_ERROR })
  @MaxLength(16, { message: LOGIN_MAX_LENGTH_ERROR })
  login!: string;

  @IsString()
  @MinLength(6, { message: PASSWORD_MIN_LENGTH_ERROR })
  @MaxLength(32, { message: PASSWORD_MAX_LENGTH_ERROR })
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  secondName!: string;
}
