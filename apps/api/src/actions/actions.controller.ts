import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { TelegramAuthGuard } from '../../../../libs/shared/guards/tg-auth.guard';
import { AuthorizedUser } from '../../../../libs/shared/decorators/authorized-user.decorator';
import { TelegramUserData } from '../../../../libs/shared/types/auth.types';
import { CreateActionDto } from './dtos/create-action.dto';

@Controller('/action')
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Post()
  @UseGuards(TelegramAuthGuard)
  @HttpCode(204)
  async registerAction(
    @Body() createActionDto: CreateActionDto,
    @AuthorizedUser() user: TelegramUserData,
  ) {
    await this.actionsService.registerAction(user.id, createActionDto.action);
  }
}
