import { Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { Telegraf } from 'telegraf';

@Injectable()
export class BotService {
  private bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(process.env.BOT_TOKEN);
    this.bot.command('start', this.handleStartCommand.bind(this));
  }

  private async handleStartCommand(ctx) {
    try {
      const referrerId = ctx.message.text.split(' ')[1];

      const response = await axios.post(
        `${process.env.API_URL}/users/bot`,
        {
          telegramId: ctx.from.id,
          referrerId: referrerId ? referrerId : undefined,
        },
        {
          headers: {
            'x-api-key': process.env.API_SECRET_KEY,
          },
          validateStatus: () => true,
        },
      );

      if (response.status === 204) {
        return await ctx.reply(
          referrerId
            ? `Successfully registered with referrer: ${referrerId}`
            : `Successfully registered without referrer`,
        );
      } else {
        return await ctx.reply(
          response.data.message || 'An unknown error occurred',
        );
      }
    } catch (e) {
      if (!(e instanceof AxiosError)) console.error(e);
      console.error(e.message);
      return await ctx.reply('An unexpected error occurred.');
    }
  }

  async start() {
    await this.bot.launch();
  }
}
