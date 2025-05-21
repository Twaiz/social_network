import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordCredentialsDto {
  @IsString()
  @IsNotEmpty()
  newPassword!: string;
}
