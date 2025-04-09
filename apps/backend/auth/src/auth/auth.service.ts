import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  getMessage(): { message: string } {
    return {
      message: 'Hello API',
    };
  }
}
