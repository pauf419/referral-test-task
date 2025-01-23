import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Action } from '../../../../libs/shared/storage/action.entity';
import { User } from '../../../../libs/shared/storage/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Action)
    private readonly actionRepository: Repository<Action>,
  ) {}

  async createUserWithBotAuth(
    telegramId: number,
    referrerId: number | undefined,
  ) {
    const userExists = await this.userRepository.findOneBy({
      telegramId,
    });
    if (userExists)
      throw new BadRequestException(
        'User with the same telegram id already exists',
      );
    if (referrerId) {
      const referrerExists = await this.userRepository.findOneBy({
        telegramId: referrerId,
      });
      if (!referrerExists)
        throw new NotFoundException(
          'Referrer with the provided telegram id does not exist',
        );
    }
    await this.userRepository.save({
      telegramId,
      referrerId,
    });
  }

  async createUserWithTelegramAuth(telegramId: number) {
    const userExists = await this.userRepository.findOne({
      where: {
        telegramId,
      },
      relations: ['actions'],
    });

    if (userExists)
      throw new BadRequestException(
        'User with the same telegram id already exists',
      );

    const user = this.userRepository.create({
      telegramId,
    });

    return await this.userRepository.save(user);
  }

  async getUserXp(telegramId: number) {
    const userExists = await this.userRepository.findOneBy({
      telegramId,
    });
    if (!userExists)
      throw new NotFoundException(
        'User with the same telegram id was not found',
      );

    const referrals = await this.userRepository.find({
      where: { referrerId: telegramId },
    });

    const validReferrals = [];
    for (const referral of referrals) {
      const actionCount = await this.actionRepository.count({
        where: { user: { id: referral.id } },
      });
      if (actionCount >= 3) {
        validReferrals.push(referral);
      }
    }

    const levels = [1000, 500, 250];
    let xp = 0;

    for (let i = 0; i < validReferrals.length && i < levels.length; i++) {
      xp += levels[i];
    }

    return xp;
  }
}
