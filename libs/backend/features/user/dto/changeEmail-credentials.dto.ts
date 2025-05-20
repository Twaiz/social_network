import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeEmailCredentialsDto {
  @IsString()
  @IsNotEmpty()
  newEmail!: string;
}
