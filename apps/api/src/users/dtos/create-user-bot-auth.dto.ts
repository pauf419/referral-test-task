import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserBotAuthDto {
  @IsNumber()
  @IsNotEmpty()
  telegramId;

  referrerId;
}
