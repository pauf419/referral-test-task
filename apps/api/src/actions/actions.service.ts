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
    const userExists = await this.userRepository.findOneBy({ telegramId });
    if (!userExists)
      throw new NotFoundException(
        'User with the same telegram id was not found',
      );

    const action = this.actionRepository.create({
      user: userExists,
      action: actionName,
      timestamp: Date.now(),
    });
    await this.actionRepository.save(action);

    if (userExists.xpAccrued || !userExists.referrerId) return;

    const totalActions = await this.actionRepository.countBy({
      user: { id: userExists.id },
    });

    if (totalActions < 3) return;

    const levels = [1000, 500, 250];
    const visited = new Set<number>();

    const recursionStep = async (step: number, referrerId: number) => {
      if (visited.has(referrerId)) return;
      visited.add(referrerId);
      const referrer = await this.userRepository.findOneBy({
        telegramId: referrerId,
      });
      if (!referrer) return;
      referrer.xp += levels[step];
      await this.userRepository.save(referrer);
      if (referrer.referrerId && step < levels.length - 1) {
        return await recursionStep(step + 1, referrer.referrerId);
      }
    };

    userExists.xpAccrued = true;
    await this.userRepository.save(userExists);

    await recursionStep(0, userExists.referrerId);
  }
}
