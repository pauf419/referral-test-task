import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserBotAuthDto {
  @IsNumber()
  @IsNotEmpty()
  telegramId;

  @IsNumber()
  @IsNotEmpty()
  referrerId;
}
