import { IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  email!: string;

  @IsString()
  login!: string;

  @IsString()
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  secondName!: string;
}
