import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPasswordCredentialsDto {
  @IsString()
  @IsNotEmpty()
  password!: string;
}
