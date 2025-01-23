import { Test, TestingModule } from '@nestjs/testing';
import { ActionsService } from './actions.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../../libs/shared/storage/user.entity';
import { Action } from '../../../../libs/shared/storage/action.entity';
import { NotFoundException } from '@nestjs/common';

describe('ActionsService', () => {
  let actionsService: ActionsService;
  let userRepository: Repository<User>;
  let actionRepository: Repository<Action>;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  const mockActionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    countBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionsService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Action),
          useValue: mockActionRepository,
        },
      ],
    }).compile();

    actionsService = module.get<ActionsService>(ActionsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    actionRepository = module.get<Repository<Action>>(
      getRepositoryToken(Action),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(actionsService).toBeDefined();
  });

  it('should throw NotFoundException if user is not found', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);

    await expect(
      actionsService.registerAction(123456, 'TestAction'),
    ).rejects.toThrow(NotFoundException);

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
      telegramId: 123456,
    });
  });

  it('should create and save an action for an existing user', async () => {
    const user = {
      id: 1,
      telegramId: 123456,
      referrerId: null,
      xpAccrued: false,
    };
    const action = { id: 1, user, action: 'TestAction', timestamp: Date.now() };

    mockUserRepository.findOneBy.mockResolvedValue(user);
    mockActionRepository.create.mockReturnValue(action);
    mockActionRepository.save.mockResolvedValue(action);

    await actionsService.registerAction(123456, 'TestAction');

    expect(mockActionRepository.create).toHaveBeenCalledWith({
      user,
      action: 'TestAction',
      timestamp: expect.any(Number),
    });

    expect(mockActionRepository.save).toHaveBeenCalledWith(action);
  });

  it('should not process XP logic if user has already accrued XP or has no referrerId', async () => {
    const user = {
      id: 1,
      telegramId: 123456,
      xpAccrued: true,
      referrerId: null,
    };

    mockUserRepository.findOneBy.mockResolvedValue(user);

    await actionsService.registerAction(123456, 'TestAction');

    expect(mockActionRepository.countBy).not.toHaveBeenCalled();
  });

  it('should process XP logic for valid users and referrers', async () => {
    const user = { id: 1, telegramId: 123456, xpAccrued: false, referrerId: 2 };
    const referrer = { id: 2, telegramId: 654321, xp: 0, referrerId: null };

    mockUserRepository.findOneBy
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(referrer);

    mockActionRepository.create.mockReturnValue({
      user,
      action: 'TestAction',
      timestamp: Date.now(),
    });
    mockActionRepository.save.mockResolvedValue({});
    mockActionRepository.countBy.mockResolvedValue(3);

    await actionsService.registerAction(123456, 'TestAction');

    expect(mockActionRepository.countBy).toHaveBeenCalledWith({
      user: { id: user.id },
    });

    expect(mockUserRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ xp: 1000 }),
    );
  });
});
