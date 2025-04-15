import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import {
  LOGIN_MAX_LENGTH_ERROR,
  LOGIN_MIN_LENGTH_ERROR,
} from '../auth.constants';

export class UserCredentialsDto {
  @IsString()
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(4, { message: LOGIN_MIN_LENGTH_ERROR })
  @MaxLength(16, { message: LOGIN_MAX_LENGTH_ERROR })
  login!: string;

  @IsString()
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  secondName!: string;
}
