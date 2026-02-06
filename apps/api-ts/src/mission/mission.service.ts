import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Mission } from '../entities/mission.entity';
import { UserMission } from '../entities/user-mission.entity';
import { Expense } from '../entities/expense.entity';
import { Saving } from '../entities/saving.entity';
import { WalletService } from '../wallet/wallet.service';

/**
 * MissionService
 * 
 * Handles mission operations including retrieving active missions,
 * logging expenses/savings, and tracking mission progress.
 * Awards coins when missions are completed.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
@Injectable()
export class MissionService {
  constructor(
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
    @InjectRepository(UserMission)
    private readonly userMissionRepository: Repository<UserMission>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Saving)
    private readonly savingRepository: Repository<Saving>,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get today's active mission for a user
   * 
   * Creates a UserMission record if user hasn't started the mission yet.
   * 
   * @param userId - User ID to get mission for
   * @returns Mission with user's progress
   * @throws NotFoundException if no mission is active for today
   * 
   * Validates: Requirements 5.1
   */
  async getTodaysMission(userId: string): Promise<{
    mission: Mission;
    userMission: UserMission;
    progressPercentage: number;
  }> {
    // Get today's date in UTC (start of day)
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    // Find active mission for today
    const mission = await this.missionRepository.findOne({
      where: { activeDate: todayUTC },
    });

    if (!mission) {
      throw new NotFoundException('No active mission for today');
    }

    // Get or create user mission
    let userMission = await this.userMissionRepository
      .createQueryBuilder('um')
      .where('um.userId = :userId', { userId })
      .andWhere('um.missionId = :missionId', { missionId: mission.id })
      .getOne();

    if (!userMission) {
      // Use query builder to insert with explicit values
      await this.userMissionRepository
        .createQueryBuilder()
        .insert()
        .into(UserMission)
        .values({
          userId: userId,
          missionId: mission.id,
          progress: {},
          completed: false,
        })
        .execute();
      
      // Fetch the created record
      userMission = await this.userMissionRepository
        .createQueryBuilder('um')
        .where('um.userId = :userId', { userId })
        .andWhere('um.missionId = :missionId', { missionId: mission.id })
        .getOne();
    }

    // Calculate progress percentage
    const progressPercentage = this.calculateProgress(
      mission,
      userMission.progress,
    );

    return {
      mission,
      userMission,
      progressPercentage,
    };
  }

  /**
   * Log an expense and update mission progress
   * 
   * @param userId - User ID logging the expense
   * @param amount - Expense amount
   * @param category - Expense category
   * @param description - Optional description
   * @returns Logged expense and updated mission progress
   * 
   * Validates: Requirements 5.2
   */
  async logExpense(
    userId: string,
    amount: number,
    category: string,
    description?: string,
  ): Promise<{
    logged: boolean;
    expense: Expense;
    missionProgress: number;
    missionCompleted: boolean;
  }> {
    if (amount <= 0) {
      throw new BadRequestException('Expense amount must be positive');
    }

    return this.dataSource.transaction(async (manager) => {
      // Create expense record
      const expense = manager.create(Expense, {
        userId,
        amount,
        category,
        description,
      });
      await manager.save(expense);

      // Update mission progress
      const { progressPercentage, completed } = await this.updateMissionProgress(
        userId,
        'expense',
        manager,
      );

      return {
        logged: true,
        expense,
        missionProgress: progressPercentage,
        missionCompleted: completed,
      };
    });
  }

  /**
   * Log a saving and update mission progress
   * 
   * @param userId - User ID logging the saving
   * @param amount - Saving amount
   * @param source - Optional source of saving
   * @returns Logged saving and updated mission progress
   * 
   * Validates: Requirements 5.3
   */
  async logSaving(
    userId: string,
    amount: number,
    source?: string,
  ): Promise<{
    logged: boolean;
    saving: Saving;
    missionProgress: number;
    missionCompleted: boolean;
  }> {
    if (amount <= 0) {
      throw new BadRequestException('Saving amount must be positive');
    }

    return this.dataSource.transaction(async (manager) => {
      // Create saving record
      const saving = manager.create(Saving, {
        userId,
        amount,
        source,
      });
      await manager.save(saving);

      // Update mission progress
      const { progressPercentage, completed } = await this.updateMissionProgress(
        userId,
        'saving',
        manager,
      );

      return {
        logged: true,
        saving,
        missionProgress: progressPercentage,
        missionCompleted: completed,
      };
    });
  }

  /**
   * Update mission progress based on logged activity
   * 
   * @param userId - User ID
   * @param activityType - Type of activity ('expense' or 'saving')
   * @param manager - Transaction manager
   * @returns Updated progress percentage and completion status
   * 
   * Validates: Requirements 5.4
   */
  private async updateMissionProgress(
    userId: string,
    activityType: 'expense' | 'saving',
    manager: any,
  ): Promise<{ progressPercentage: number; completed: boolean }> {
    // Get today's mission
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mission = await manager.findOne(Mission, {
      where: { activeDate: today },
    });

    if (!mission) {
      return { progressPercentage: 0, completed: false };
    }

    // Get user mission
    let userMission = await manager.findOne(UserMission, {
      where: {
        userId,
        missionId: mission.id,
      },
    });

    if (!userMission) {
      userMission = manager.create(UserMission, {
        userId,
        missionId: mission.id,
        progress: {},
        completed: false,
      });
    }

    // Update progress based on activity type
    const progress = userMission.progress || {};
    
    if (activityType === 'expense') {
      progress.expenseCount = (progress.expenseCount || 0) + 1;
    } else if (activityType === 'saving') {
      progress.savingCount = (progress.savingCount || 0) + 1;
    }

    userMission.progress = progress;

    // Calculate progress percentage
    const progressPercentage = this.calculateProgress(mission, progress);

    // Check if mission is completed
    if (progressPercentage >= 100 && !userMission.completed) {
      userMission.completed = true;
      userMission.completedAt = new Date();

      // Award coins
      await this.walletService.credit(
        userId,
        Number(mission.rewardCoins),
        'mission_reward',
        `Completed mission: ${mission.title}`,
      );
    }

    await manager.save(userMission);

    return {
      progressPercentage,
      completed: userMission.completed,
    };
  }

  /**
   * Calculate mission progress percentage
   * 
   * @param mission - Mission entity
   * @param progress - User's progress object
   * @returns Progress percentage (0-100)
   */
  private calculateProgress(
    mission: Mission,
    progress: Record<string, any>,
  ): number {
    const requirements = mission.requirements;

    // Handle different mission types
    if (mission.missionType === 'log_expenses') {
      const required = requirements.expenseCount || 1;
      const current = progress.expenseCount || 0;
      return Math.min(100, (current / required) * 100);
    } else if (mission.missionType === 'log_savings') {
      const required = requirements.savingCount || 1;
      const current = progress.savingCount || 0;
      return Math.min(100, (current / required) * 100);
    } else if (mission.missionType === 'combined') {
      // For combined missions, check both requirements
      const expenseRequired = requirements.expenseCount || 0;
      const savingRequired = requirements.savingCount || 0;
      const expenseCurrent = progress.expenseCount || 0;
      const savingCurrent = progress.savingCount || 0;

      const expenseProgress = expenseRequired > 0 
        ? Math.min(1, expenseCurrent / expenseRequired) 
        : 1;
      const savingProgress = savingRequired > 0 
        ? Math.min(1, savingCurrent / savingRequired) 
        : 1;

      return Math.min(100, ((expenseProgress + savingProgress) / 2) * 100);
    }

    return 0;
  }

  /**
   * Get user's expense history
   * 
   * @param userId - User ID
   * @param limit - Maximum number of expenses to return
   * @returns Array of expenses
   */
  async getExpenseHistory(
    userId: string,
    limit: number = 50,
  ): Promise<Expense[]> {
    return this.expenseRepository.find({
      where: { userId },
      order: { loggedAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get user's saving history
   * 
   * @param userId - User ID
   * @param limit - Maximum number of savings to return
   * @returns Array of savings
   */
  async getSavingHistory(
    userId: string,
    limit: number = 50,
  ): Promise<Saving[]> {
    return this.savingRepository.find({
      where: { userId },
      order: { loggedAt: 'DESC' },
      take: limit,
    });
  }
}
