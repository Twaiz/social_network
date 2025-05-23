import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmChangedEmailCredentialsDto {
  @IsString()
  @IsNotEmpty()
  changeEmailToken!: string;
}
