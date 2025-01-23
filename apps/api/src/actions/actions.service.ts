import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Action } from '../../../../libs/shared/storage/action.entity';
import { User } from '../../../../libs/shared/storage/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ActionsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Action)
    private readonly actionRepository: Repository<Action>,
  ) {}

  async registerAction(telegramId: number, actionName: string) {
    const userExists = await this.userRepository.findOneBy({
      telegramId,
    });
    if (!userExists)
      throw new NotFoundException(
        'User with the same telegram id was not found',
      );
    const action = await this.actionRepository.create({
      user: userExists,
      action: actionName,
      timestamp: Date.now(),
    });

    return await this.actionRepository.save(action);
  }
}
