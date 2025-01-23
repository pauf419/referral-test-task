import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthDataValidator } from '../utils/tg-auth.validator';

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  private validator: AuthDataValidator;

  constructor() {
    this.validator = new AuthDataValidator({ botToken: process.env.BOT_TOKEN });
  }

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader)
      throw new UnauthorizedException('Authorization header is missing');

    const [scheme, initDataRaw] = authHeader.split(' ');

    if (scheme !== 'Telegram' || !initDataRaw)
      throw new UnauthorizedException('Invalid authorization scheme');

    const initData = new Map<string, string>(
      initDataRaw
        .split('&')
        .map(
          (pair) => pair.split('=').map(decodeURIComponent) as [string, string],
        ),
    );
    const user = this.validator.validate(initData);

    if (!user) throw new UnauthorizedException('Invalid Telegram data');

    request['user'] = user;

    return true;
  }
}
