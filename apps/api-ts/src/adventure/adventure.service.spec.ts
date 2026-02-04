import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdventureService } from './adventure.service';
import { Adventure } from '../entities/adventure.entity';
import { Profile } from '../entities/profile.entity';
import { Goal } from '../entities/goal.entity';
import { AIServiceClient } from './ai-service.client';

describe('AdventureService', () => {
  let service: AdventureService;
  let adventureRepository: Repository<Adventure>;
  let profileRepository: Repository<Profile>;
  let goalRepository: Repository<Goal>;
  let aiServiceClient: AIServiceClient;

  const mockAdventureRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockProfileRepository = {
    findOne: jest.fn(),
  };

  const mockGoalRepository = {
    find: jest.fn(),
  };

  const mockAIServiceClient = {
    generateAdventure: jest.fn(),
    evaluateChoice: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdventureService,
        {
          provide: getRepositoryToken(Adventure),
          useValue: mockAdventureRepository,
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
        {
          provide: getRepositoryToken(Goal),
          useValue: mockGoalRepository,
        },
        {
          provide: AIServiceClient,
          useValue: mockAIServiceClient,
        },
      ],
    }).compile();

    service = module.get<AdventureService>(AdventureService);
    adventureRepository = module.get<Repository<Adventure>>(
      getRepositoryToken(Adventure),
    );
    profileRepository = module.get<Repository<Profile>>(
      getRepositoryToken(Profile),
    );
    goalRepository = module.get<Repository<Goal>>(getRepositoryToken(Goal));
    aiServiceClient = module.get<AIServiceClient>(AIServiceClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAdventure', () => {
    it('should generate an adventure successfully', async () => {
      const userId = 'user-123';
      const mockProfile = {
        id: 'profile-123',
        userId,
        age: 10,
        allowance: 10.0,
      };
      const mockGoals = [
        {
          id: 'goal-123',
          title: 'Save for bicycle',
          currentAmount: 50,
          targetAmount: 100,
        },
      ];
      const mockAIResponse = {
        scenario: 'You found $5!',
        choices: ['Save it', 'Spend it'],
        opik_trace_id: 'trace-123',
      };
      const mockAdventure = {
        id: 'adventure-123',
        userId,
        scenario: mockAIResponse.scenario,
        choices: mockAIResponse.choices,
        generationOpikTraceId: mockAIResponse.opik_trace_id,
      };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockGoalRepository.find.mockResolvedValue(mockGoals);
      mockAIServiceClient.generateAdventure.mockResolvedValue(mockAIResponse);
      mockAdventureRepository.create.mockReturnValue(mockAdventure);
      mockAdventureRepository.save.mockResolvedValue(mockAdventure);

      const result = await service.generateAdventure(userId);

      expect(result).toEqual(mockAdventure);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockAIServiceClient.generateAdventure).toHaveBeenCalled();
      expect(mockAdventureRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if profile not found', async () => {
      const userId = 'user-123';
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.generateAdventure(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('submitChoice', () => {
    it('should submit choice and get evaluation', async () => {
      const userId = 'user-123';
      const adventureId = 'adventure-123';
      const choiceIndex = 0;
      const mockAdventure = {
        id: adventureId,
        userId,
        scenario: 'You found $5!',
        choices: ['Save it', 'Spend it'],
        selectedChoiceIndex: null,
      };
      const mockProfile = {
        id: 'profile-123',
        userId,
        age: 10,
      };
      const mockEvaluation = {
        feedback: 'Great choice!',
        scores: {
          financial_wisdom: 0.9,
          long_term_thinking: 0.85,
          responsibility: 0.8,
        },
        opik_trace_id: 'trace-456',
      };

      mockAdventureRepository.findOne.mockResolvedValue(mockAdventure);
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockAIServiceClient.evaluateChoice.mockResolvedValue(mockEvaluation);
      mockAdventureRepository.save.mockResolvedValue({
        ...mockAdventure,
        selectedChoiceIndex: choiceIndex,
        feedback: mockEvaluation.feedback,
        scores: mockEvaluation.scores,
        evaluationOpikTraceId: mockEvaluation.opik_trace_id,
      });

      const result = await service.submitChoice(userId, adventureId, choiceIndex);

      expect(result.selectedChoiceIndex).toBe(choiceIndex);
      expect(result.feedback).toBe(mockEvaluation.feedback);
      expect(mockAIServiceClient.evaluateChoice).toHaveBeenCalled();
    });

    it('should throw NotFoundException if adventure not found', async () => {
      const userId = 'user-123';
      const adventureId = 'adventure-123';
      mockAdventureRepository.findOne.mockResolvedValue(null);

      await expect(
        service.submitChoice(userId, adventureId, 0),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if choice already submitted', async () => {
      const userId = 'user-123';
      const adventureId = 'adventure-123';
      const mockAdventure = {
        id: adventureId,
        userId,
        selectedChoiceIndex: 0,
      };

      mockAdventureRepository.findOne.mockResolvedValue(mockAdventure);

      await expect(
        service.submitChoice(userId, adventureId, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid choice index', async () => {
      const userId = 'user-123';
      const adventureId = 'adventure-123';
      const mockAdventure = {
        id: adventureId,
        userId,
        choices: ['Save it', 'Spend it'],
        selectedChoiceIndex: null,
      };

      mockAdventureRepository.findOne.mockResolvedValue(mockAdventure);

      await expect(
        service.submitChoice(userId, adventureId, 5),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
