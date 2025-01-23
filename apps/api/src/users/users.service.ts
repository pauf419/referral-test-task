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

  async createUser(telegramId: number, referrerId?: number) {
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

  async getUserXp(telegramId: number) {
    const userExists = await this.userRepository.findOneBy({
      telegramId,
    });
    if (!userExists)
      throw new NotFoundException(
        'User with the same telegram id was not found',
      );
    return userExists.xp;
  }
}
