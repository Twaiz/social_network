import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginCredentialsDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  login?: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  twoFactorCode?: string;
}
