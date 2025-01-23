import { NestFactory } from '@nestjs/core';
import { BotModule } from './bot.module';
import { BotService } from './bot.service';

async function bootstrap() {
  const app = await NestFactory.create(BotModule);
  const botService = app.get(BotService);
  await botService.start();
  await app.listen(3001);
}

bootstrap();
