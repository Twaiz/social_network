import { IsNotEmpty, IsString } from 'class-validator';

export class Enable2FADto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}
