import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmailCredentialsDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}
