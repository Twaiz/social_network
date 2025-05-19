import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class NewUserInfoCredentialsDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  login?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  secondName?: string;
}
