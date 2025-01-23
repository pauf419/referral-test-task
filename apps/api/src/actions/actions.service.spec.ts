import { Test, TestingModule } from '@nestjs/testing';
import { ActionsService } from './actions.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../../libs/shared/storage/user.entity';
import { Action } from '../../../../libs/shared/storage/action.entity';
import { NotFoundException } from '@nestjs/common';

describe('ActionsService', () => {
  let service: ActionsService;
  let userRepository: Repository<User>;
  let actionRepository: Repository<Action>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionsService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Action),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ActionsService>(ActionsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    actionRepository = module.get<Repository<Action>>(
      getRepositoryToken(Action),
    );
  });

  it('should create and save an action if user exists', async () => {
    const mockUser = { id: 1, telegramId: 12345 } as User;
    const mockAction = { id: 1, action: 'testAction' } as Action;

    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
    jest.spyOn(actionRepository, 'create').mockReturnValue(mockAction);
    jest.spyOn(actionRepository, 'save').mockResolvedValue(mockAction);

    const result = await service.registerAction(12345, 'testAction');

    expect(userRepository.findOneBy).toHaveBeenCalledWith({
      telegramId: 12345,
    });
    expect(actionRepository.create).toHaveBeenCalledWith({
      user: mockUser,
      action: 'testAction',
      timestamp: expect.any(Number),
    });
    expect(actionRepository.save).toHaveBeenCalledWith(mockAction);
    expect(result).toBe(mockAction);
  });

  it('should throw NotFoundException if user does not exist', async () => {
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

    await expect(service.registerAction(12345, 'testAction')).rejects.toThrow(
      new NotFoundException('User with the same telegram id was not found'),
    );
    expect(userRepository.findOneBy).toHaveBeenCalledWith({
      telegramId: 12345,
    });
    expect(actionRepository.create).not.toHaveBeenCalled();
    expect(actionRepository.save).not.toHaveBeenCalled();
  });
});
