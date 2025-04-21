import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

class UserLoginCredentialsDto {
  email?: string;
  login?: string;
  password!: string;
}

@ValidatorConstraint({ name: 'EitherEmailOrLogin', async: false })
export class EitherEmailOrLogin implements ValidatorConstraintInterface {
  validate(dto: UserLoginCredentialsDto): boolean {
    const hasEmail = typeof dto.email === 'string' && dto.email.trim() !== '';
    const hasLogin = typeof dto.login === 'string' && dto.login.trim() !== '';

    return (hasEmail && !hasLogin) || (!hasEmail && hasLogin);
  }

  defaultMessage(): string {
    return '⚠️ Укажите либо email, либо login, но не оба одновременно.';
  }
}
