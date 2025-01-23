import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../../libs/shared/storage/user.entity';
import { Action } from '../../../../libs/shared/storage/action.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let actionRepository: Repository<Action>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Action),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('createUser', () => {
    it('should throw BadRequestException if user with telegramId already exists', async () => {
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce({ telegramId: 12345 } as User);

      await expect(service.createUser(12345)).rejects.toThrow(
        new BadRequestException(
          'User with the same telegram id already exists',
        ),
      );

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        telegramId: 12345,
      });
    });

    it('should throw NotFoundException if referrerId is provided but does not exist', async () => {
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(service.createUser(12345, 67890)).rejects.toThrow(
        new NotFoundException(
          'Referrer with the provided telegram id does not exist',
        ),
      );

      expect(userRepository.findOneBy).toHaveBeenNthCalledWith(1, {
        telegramId: 12345,
      });
      expect(userRepository.findOneBy).toHaveBeenNthCalledWith(2, {
        telegramId: 67890,
      });
    });

    it('should save user if telegramId and referrerId are valid', async () => {
      const referrer = { telegramId: 67890 } as User;

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(referrer);
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce({
        telegramId: 12345,
        referrerId: 67890,
      } as User);

      await service.createUser(12345, 67890);

      expect(userRepository.save).toHaveBeenCalledWith({
        telegramId: 12345,
        referrerId: 67890,
      });
    });

    it('should save user without referrerId if referrerId is not provided', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce({
        telegramId: 12345,
      } as User);

      await service.createUser(12345);

      expect(userRepository.save).toHaveBeenCalledWith({
        telegramId: 12345,
        referrerId: undefined,
      });
    });
  });

  describe('getUserXp', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.getUserXp(12345)).rejects.toThrow(
        new NotFoundException('User with the same telegram id was not found'),
      );

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        telegramId: 12345,
      });
    });

    it('should return the correct xp for an existing user', async () => {
      const user = { telegramId: 12345, xp: 1000 } as User;

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(user);

      const xp = await service.getUserXp(12345);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        telegramId: 12345,
      });
      expect(xp).toBe(1000);
    });
  });
});
