import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangeEmailCredentialsDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  newEmail!: string;
}
