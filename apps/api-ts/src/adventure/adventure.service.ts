import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Adventure } from '../entities/adventure.entity';
import { Profile } from '../entities/profile.entity';
import { Goal } from '../entities/goal.entity';
import { AIServiceClient } from './ai-service.client';

/**
 * AdventureService
 * 
 * Orchestrates adventure generation and evaluation by coordinating
 * with the AI service and managing adventure state in the database.
 * 
 * Requirements: 8.1, 8.4, 9.1, 9.4
 */
@Injectable()
export class AdventureService {
  private readonly logger = new Logger(AdventureService.name);

  constructor(
    @InjectRepository(Adventure)
    private readonly adventureRepository: Repository<Adventure>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    private readonly aiServiceClient: AIServiceClient,
  ) {}

  /**
   * Generate a new money adventure scenario
   * 
   * Retrieves user context (age, allowance, goals) and calls the AI service
   * to generate a contextual money adventure. Stores the adventure with
   * the generation trace ID.
   * 
   * @param userId - User ID to generate adventure for
   * @param context - Optional additional context
   * @returns Generated adventure with scenario and choices
   * @throws NotFoundException if user profile not found
   * 
   * Validates: Requirements 8.1, 8.4
   */
  async generateAdventure(
    userId: string,
    context?: string,
  ): Promise<Adventure> {
    this.logger.log(`Generating adventure for user ${userId}`);

    // Get user profile for context
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    // Get active goals for context
    const goals = await this.goalRepository.find({
      where: { userId, completed: false },
      order: { createdAt: 'DESC' },
      take: 3,
    });

    // Build goal context
    let goalContext = context;
    if (goals.length > 0) {
      const goalDescriptions = goals
        .map((g) => `${g.title} ($${g.currentAmount}/$${g.targetAmount})`)
        .join(', ');
      goalContext = goalContext
        ? `${goalContext}. Goals: ${goalDescriptions}`
        : `Current goals: ${goalDescriptions}`;
    }

    // Call AI service to generate adventure
    const response = await this.aiServiceClient.generateAdventure({
      user_age: profile.age,
      allowance: Number(profile.allowance),
      goal_context: goalContext,
    });

    // Store adventure in database
    const adventure = this.adventureRepository.create({
      userId,
      scenario: response.scenario,
      choices: response.choices,
      generationOpikTraceId: response.opik_trace_id,
      selectedChoiceIndex: null,
      feedback: null,
      scores: null,
      evaluationOpikTraceId: null,
      evaluatedAt: null,
    });

    const savedAdventure = await this.adventureRepository.save(adventure);

    this.logger.log(
      `Adventure ${savedAdventure.id} generated with trace ID ${response.opik_trace_id}`,
    );

    return savedAdventure;
  }

  /**
   * Submit a choice for an adventure and get evaluation
   * 
   * Validates the choice, calls the AI service for evaluation,
   * and updates the adventure with results and evaluation trace ID.
   * 
   * @param userId - User ID submitting the choice
   * @param adventureId - Adventure ID to submit choice for
   * @param choiceIndex - Index of the selected choice (0-based)
   * @returns Updated adventure with feedback and scores
   * @throws NotFoundException if adventure not found
   * @throws BadRequestException if choice is invalid or already submitted
   * 
   * Validates: Requirements 9.1, 9.4
   */
  async submitChoice(
    userId: string,
    adventureId: string,
    choiceIndex: number,
  ): Promise<Adventure> {
    this.logger.log(
      `User ${userId} submitting choice ${choiceIndex} for adventure ${adventureId}`,
    );

    // Get adventure
    const adventure = await this.adventureRepository.findOne({
      where: { id: adventureId, userId },
    });

    if (!adventure) {
      throw new NotFoundException('Adventure not found');
    }

    // Validate choice hasn't been submitted yet
    if (adventure.selectedChoiceIndex !== null) {
      throw new BadRequestException('Choice has already been submitted for this adventure');
    }

    // Validate choice index
    if (choiceIndex < 0 || choiceIndex >= adventure.choices.length) {
      throw new BadRequestException(
        `Invalid choice index. Must be between 0 and ${adventure.choices.length - 1}`,
      );
    }

    const choiceText = adventure.choices[choiceIndex];

    // Get user profile for age context
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    // Call AI service to evaluate choice
    const response = await this.aiServiceClient.evaluateChoice({
      scenario: adventure.scenario,
      choice_index: choiceIndex,
      choice_text: choiceText,
      user_age: profile.age,
    });

    // Update adventure with evaluation results
    adventure.selectedChoiceIndex = choiceIndex;
    adventure.feedback = response.feedback;
    adventure.scores = {
      financial_wisdom: response.scores.financial_wisdom,
      long_term_thinking: response.scores.long_term_thinking,
      responsibility: response.scores.responsibility,
    };
    adventure.evaluationOpikTraceId = response.opik_trace_id;
    adventure.evaluatedAt = new Date();

    const updatedAdventure = await this.adventureRepository.save(adventure);

    this.logger.log(
      `Adventure ${adventureId} evaluated with trace ID ${response.opik_trace_id}`,
    );

    return updatedAdventure;
  }

  /**
   * Get adventure by ID
   * 
   * @param userId - User ID to verify ownership
   * @param adventureId - Adventure ID to retrieve
   * @returns Adventure if found
   * @throws NotFoundException if adventure not found
   */
  async getAdventure(userId: string, adventureId: string): Promise<Adventure> {
    const adventure = await this.adventureRepository.findOne({
      where: { id: adventureId, userId },
    });

    if (!adventure) {
      throw new NotFoundException('Adventure not found');
    }

    return adventure;
  }

  /**
   * Get user's adventure history
   * 
   * @param userId - User ID to get adventures for
   * @param limit - Maximum number of adventures to return
   * @returns Array of adventures ordered by creation date (newest first)
   */
  async getAdventureHistory(
    userId: string,
    limit: number = 20,
  ): Promise<Adventure[]> {
    return this.adventureRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
