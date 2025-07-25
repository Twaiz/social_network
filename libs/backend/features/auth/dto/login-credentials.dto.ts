import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginCredentialsDto {
  //TODO - убрать везде где есть isOptional параметр 'IsNotEmpty'. Он ломает потом всю dto
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
