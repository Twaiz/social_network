import { IsEmpty, IsString } from 'class-validator';

export class NewUserInfoCredentialsDto {
  @IsString()
  @IsEmpty()
  login!: string;

  @IsString()
  @IsEmpty()
  firstName!: string;

  @IsString()
  @IsEmpty()
  secondName!: string;
}
