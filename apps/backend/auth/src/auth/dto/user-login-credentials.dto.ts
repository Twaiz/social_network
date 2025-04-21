import { IsEmail, IsString } from 'class-validator';

export class UserLoginCredentialsDto {
  @IsString()
  @IsEmail()
  email!: string;

  @IsString()
  login!: string;

  @IsString()
  password!: string;
}
