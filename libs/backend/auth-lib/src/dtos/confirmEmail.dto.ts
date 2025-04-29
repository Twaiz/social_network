import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmail {
  @IsString()
  @IsNotEmpty()
  token!: string;
}
