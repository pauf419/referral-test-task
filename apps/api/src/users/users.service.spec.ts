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
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Action),
          useValue: {
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    actionRepository = module.get<Repository<Action>>(
      getRepositoryToken(Action),
    );
  });

  describe('createUserWithBotAuth', () => {
    it('should throw BadRequestException if user with telegramId already exists', async () => {
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce({ telegramId: 12345 } as User);

      await expect(
        service.createUserWithBotAuth(12345, undefined),
      ).rejects.toThrow(
        new BadRequestException(
          'User with the same telegram id already exists',
        ),
      );
    });

    it('should throw NotFoundException if referrer does not exist', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.createUserWithBotAuth(12345, 67890)).rejects.toThrow(
        new NotFoundException(
          'Referrer with the provided telegram id does not exist',
        ),
      );
    });

    it('should save user if telegramId and referrerId are valid', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce({ telegramId: 67890 } as User);
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce({
        telegramId: 12345,
        referrerId: 67890,
      } as User);

      await service.createUserWithBotAuth(12345, 67890);

      expect(userRepository.save).toHaveBeenCalledWith({
        telegramId: 12345,
        referrerId: 67890,
      });
    });
  });

  describe('createUserWithTelegramAuth', () => {
    it('should throw BadRequestException if user with telegramId already exists', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce({ telegramId: 12345 } as User);

      await expect(service.createUserWithTelegramAuth(12345)).rejects.toThrow(
        new BadRequestException(
          'User with the same telegram id already exists',
        ),
      );
    });

    it('should create and save user if telegramId is valid', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      jest
        .spyOn(userRepository, 'create')
        .mockReturnValueOnce({ telegramId: 12345 } as User);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValueOnce({ telegramId: 12345 } as User);

      const result = await service.createUserWithTelegramAuth(12345);

      expect(userRepository.create).toHaveBeenCalledWith({ telegramId: 12345 });
      expect(userRepository.save).toHaveBeenCalledWith({ telegramId: 12345 });
      expect(result).toEqual({ telegramId: 12345 });
    });
  });

  describe('getUserXp', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.getUserXp(12345)).rejects.toThrow(
        new NotFoundException('User with the same telegram id was not found'),
      );
    });

    it('should return 0 xp if user has no valid referrals', async () => {
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce({ id: 1 } as User);
      jest.spyOn(userRepository, 'find').mockResolvedValueOnce([]);

      const xp = await service.getUserXp(12345);

      expect(xp).toBe(0);
    });

    it('should calculate xp correctly for valid referrals', async () => {
      const mockUser = { id: 1 } as User;
      const mockReferrals = [
        { id: 2 } as User,
        { id: 3 } as User,
        { id: 4 } as User,
      ];

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(mockUser);
      jest.spyOn(userRepository, 'find').mockResolvedValueOnce(mockReferrals);
      jest
        .spyOn(actionRepository, 'count')
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(2);

      const xp = await service.getUserXp(12345);

      expect(actionRepository.count).toHaveBeenCalledTimes(3);
      expect(xp).toBe(1500);
    });
  });
});
