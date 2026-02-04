import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MissionService } from './mission.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LogExpenseDto } from './dto/log-expense.dto';
import { LogSavingDto } from './dto/log-saving.dto';

/**
 * MissionController
 * 
 * Handles mission-related HTTP endpoints for retrieving missions
 * and logging expenses/savings.
 * All endpoints require authentication.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */
@Controller('missions')
@UseGuards(JwtAuthGuard)
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  /**
   * GET /missions/today
   * 
   * Retrieve today's active mission with user's progress
   * 
   * @param req - Request object containing authenticated user
   * @returns Mission details with progress
   * 
   * Validates: Requirements 5.1
   */
  @Get('today')
  async getTodaysMission(@Request() req) {
    const userId = req.user.userId;
    const result = await this.missionService.getTodaysMission(userId);

    return {
      mission: {
        id: result.mission.id,
        title: result.mission.title,
        description: result.mission.description,
        missionType: result.mission.missionType,
        requirements: result.mission.requirements,
        rewardCoins: Number(result.mission.rewardCoins),
        progress: result.progressPercentage,
        completed: result.userMission.completed,
      },
    };
  }

  /**
   * POST /missions/log-expense
   * 
   * Log an expense and update mission progress
   * 
   * @param req - Request object containing authenticated user
   * @param logExpenseDto - Expense details (amount, category, description)
   * @returns Logged status and updated mission progress
   * 
   * Validates: Requirements 5.2, 5.5
   */
  @Post('log-expense')
  async logExpense(@Request() req, @Body() logExpenseDto: LogExpenseDto) {
    const userId = req.user.userId;
    const result = await this.missionService.logExpense(
      userId,
      logExpenseDto.amount,
      logExpenseDto.category,
      logExpenseDto.description,
    );

    return {
      logged: result.logged,
      missionProgress: result.missionProgress,
      missionCompleted: result.missionCompleted,
      expense: {
        id: result.expense.id,
        amount: Number(result.expense.amount),
        category: result.expense.category,
        description: result.expense.description,
        loggedAt: result.expense.loggedAt,
      },
    };
  }

  /**
   * POST /missions/log-saving
   * 
   * Log a saving and update mission progress
   * 
   * @param req - Request object containing authenticated user
   * @param logSavingDto - Saving details (amount, source)
   * @returns Logged status and updated mission progress
   * 
   * Validates: Requirements 5.3, 5.5
   */
  @Post('log-saving')
  async logSaving(@Request() req, @Body() logSavingDto: LogSavingDto) {
    const userId = req.user.userId;
    const result = await this.missionService.logSaving(
      userId,
      logSavingDto.amount,
      logSavingDto.source,
    );

    return {
      logged: result.logged,
      missionProgress: result.missionProgress,
      missionCompleted: result.missionCompleted,
      saving: {
        id: result.saving.id,
        amount: Number(result.saving.amount),
        source: result.saving.source,
        loggedAt: result.saving.loggedAt,
      },
    };
  }

  /**
   * GET /missions/expenses
   * 
   * Get user's expense history
   * 
   * @param req - Request object containing authenticated user
   * @returns Array of expenses
   */
  @Get('expenses')
  async getExpenses(@Request() req) {
    const userId = req.user.userId;
    const expenses = await this.missionService.getExpenseHistory(userId);

    return {
      expenses: expenses.map((expense) => ({
        id: expense.id,
        amount: Number(expense.amount),
        category: expense.category,
        description: expense.description,
        loggedAt: expense.loggedAt,
      })),
    };
  }

  /**
   * GET /missions/savings
   * 
   * Get user's saving history
   * 
   * @param req - Request object containing authenticated user
   * @returns Array of savings
   */
  @Get('savings')
  async getSavings(@Request() req) {
    const userId = req.user.userId;
    const savings = await this.missionService.getSavingHistory(userId);

    return {
      savings: savings.map((saving) => ({
        id: saving.id,
        amount: Number(saving.amount),
        source: saving.source,
        loggedAt: saving.loggedAt,
      })),
    };
  }
}
