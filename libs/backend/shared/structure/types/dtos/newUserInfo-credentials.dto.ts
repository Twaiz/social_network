import { IsOptional, IsString } from 'class-validator';

export class NewUserInfoCredentialsDto {
  @IsOptional()
  @IsString()
  login?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  secondName?: string;
}
