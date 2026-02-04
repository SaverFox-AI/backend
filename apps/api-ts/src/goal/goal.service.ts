import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Goal } from '../entities/goal.entity';
import { WalletService } from '../wallet/wallet.service';

/**
 * GoalService
 * 
 * Handles goal operations including creation, progress tracking,
 * and completion rewards.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new goal
   * 
   * @param userId - User ID creating the goal
   * @param title - Goal title
   * @param targetAmount - Target amount to save
   * @param description - Optional description
   * @returns Created goal
   * @throws BadRequestException if target amount is invalid
   * 
   * Validates: Requirements 7.1
   */
  async createGoal(
    userId: string,
    title: string,
    targetAmount: number,
    description?: string,
  ): Promise<Goal> {
    if (targetAmount <= 0) {
      throw new BadRequestException('Target amount must be positive');
    }

    const goal = this.goalRepository.create({
      userId,
      title,
      targetAmount,
      description,
      currentAmount: 0,
      completed: false,
    });

    return this.goalRepository.save(goal);
  }

  /**
   * Get all goals for a user
   * 
   * @param userId - User ID to get goals for
   * @returns Array of goals with progress percentages
   * 
   * Validates: Requirements 7.2
   */
  async getUserGoals(userId: string): Promise<
    Array<{
      id: string;
      title: string;
      description: string;
      targetAmount: number;
      currentAmount: number;
      progress: number;
      completed: boolean;
      completedAt: Date | null;
      createdAt: Date;
    }>
  > {
    const goals = await this.goalRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      progress: this.calculateProgress(
        Number(goal.currentAmount),
        Number(goal.targetAmount),
      ),
      completed: goal.completed,
      completedAt: goal.completedAt,
      createdAt: goal.createdAt,
    }));
  }

  /**
   * Get a specific goal
   * 
   * @param goalId - Goal ID
   * @param userId - User ID (for authorization)
   * @returns Goal entity
   * @throws NotFoundException if goal doesn't exist or doesn't belong to user
   */
  async getGoal(goalId: string, userId: string): Promise<Goal> {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return goal;
  }

  /**
   * Add progress to a goal
   * 
   * Updates the current amount and checks for completion.
   * Awards bonus coins when goal is completed.
   * 
   * @param goalId - Goal ID to update
   * @param userId - User ID (for authorization)
   * @param amount - Amount to add to progress
   * @returns Updated goal with progress percentage
   * @throws NotFoundException if goal doesn't exist
   * @throws BadRequestException if amount is invalid or goal already completed
   * 
   * Validates: Requirements 7.3, 7.4
   */
  async addProgress(
    goalId: string,
    userId: string,
    amount: number,
  ): Promise<{
    goalId: string;
    currentAmount: number;
    progress: number;
    completed: boolean;
    bonusAwarded?: number;
  }> {
    if (amount <= 0) {
      throw new BadRequestException('Progress amount must be positive');
    }

    return this.dataSource.transaction(async (manager) => {
      // Get goal
      const goal = await manager.findOne(Goal, {
        where: { id: goalId, userId },
      });

      if (!goal) {
        throw new NotFoundException('Goal not found');
      }

      if (goal.completed) {
        throw new BadRequestException('Goal is already completed');
      }

      // Update current amount
      const currentAmount = Number(goal.currentAmount) + amount;
      goal.currentAmount = currentAmount;

      const targetAmount = Number(goal.targetAmount);
      const progress = this.calculateProgress(currentAmount, targetAmount);

      // Check if goal is completed
      let bonusAwarded: number | undefined;
      if (currentAmount >= targetAmount && !goal.completed) {
        goal.completed = true;
        goal.completedAt = new Date();

        // Award bonus coins (10% of target amount)
        const bonus = Math.floor(targetAmount * 0.1);
        bonusAwarded = bonus;

        await this.walletService.credit(
          userId,
          bonus,
          'goal_bonus',
          `Completed goal: ${goal.title}`,
        );
      }

      await manager.save(goal);

      return {
        goalId: goal.id,
        currentAmount,
        progress,
        completed: goal.completed,
        bonusAwarded,
      };
    });
  }

  /**
   * Calculate progress percentage
   * 
   * @param currentAmount - Current saved amount
   * @param targetAmount - Target amount
   * @returns Progress percentage (0-100)
   */
  private calculateProgress(
    currentAmount: number,
    targetAmount: number,
  ): number {
    if (targetAmount <= 0) return 0;
    return Math.min(100, (currentAmount / targetAmount) * 100);
  }

  /**
   * Delete a goal
   * 
   * @param goalId - Goal ID to delete
   * @param userId - User ID (for authorization)
   * @throws NotFoundException if goal doesn't exist
   */
  async deleteGoal(goalId: string, userId: string): Promise<void> {
    const goal = await this.getGoal(goalId, userId);
    await this.goalRepository.remove(goal);
  }

  /**
   * Get active (incomplete) goals for a user
   * 
   * @param userId - User ID
   * @returns Array of active goals
   */
  async getActiveGoals(userId: string): Promise<Goal[]> {
    return this.goalRepository.find({
      where: { userId, completed: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get completed goals for a user
   * 
   * @param userId - User ID
   * @returns Array of completed goals
   */
  async getCompletedGoals(userId: string): Promise<Goal[]> {
    return this.goalRepository.find({
      where: { userId, completed: true },
      order: { completedAt: 'DESC' },
    });
  }
}
