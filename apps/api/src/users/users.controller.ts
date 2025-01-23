import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TelegramAuthGuard } from '../../../../libs/shared/guards/tg-auth.guard';
import { TelegramUserData } from '../../../../libs/shared/types/auth.types';
import { AuthorizedUser } from '../../../../libs/shared/decorators/authorized-user.decorator';
import { ApiKeyGuard } from '../../../../libs/shared/guards/api-key.guard';
import { CreateUserBotAuthDto } from './dtos/create-user-bot-auth.dto';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(TelegramAuthGuard)
  @HttpCode(204)
  async createUserWithTelegramAuth(
    @AuthorizedUser() user: TelegramUserData,
  ): Promise<void> {
    await this.usersService.createUserWithTelegramAuth(user.id);
  }

  @Post('/bot')
  @UseGuards(ApiKeyGuard)
  @HttpCode(204)
  async createUserWithBotAuth(
    @Body() createUserBotAuthDto: CreateUserBotAuthDto,
  ): Promise<void> {
    await this.usersService.createUserWithBotAuth(
      createUserBotAuthDto.telegramId,
      createUserBotAuthDto.referrerId,
    );
  }

  @Get('/me/xp')
  @UseGuards(TelegramAuthGuard)
  @HttpCode(200)
  async getUserXp(@AuthorizedUser() user: TelegramUserData) {
    const xp = await this.usersService.getUserXp(user.id);
    return { xp };
  }
}
