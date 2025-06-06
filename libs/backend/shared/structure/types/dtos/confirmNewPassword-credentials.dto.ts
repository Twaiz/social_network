import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmNewPasswordCredentialsDto {
  @IsString()
  @IsNotEmpty()
  changePasswordToken!: string;
}
