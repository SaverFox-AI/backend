import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GoalService } from './goal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGoalDto } from './dto/create-goal.dto';
import { AddProgressDto } from './dto/add-progress.dto';

/**
 * GoalController
 * 
 * Handles goal-related HTTP endpoints for creating goals,
 * tracking progress, and managing completion.
 * All endpoints require authentication.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.5
 */
@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  /**
   * POST /goals
   * 
   * Create a new savings goal
   * 
   * @param req - Request object containing authenticated user
   * @param createGoalDto - Goal details (title, targetAmount, description)
   * @returns Created goal
   * 
   * Validates: Requirements 7.1, 7.5
   */
  @Post()
  async createGoal(@Request() req, @Body() createGoalDto: CreateGoalDto) {
    const userId = req.user.id;
    const goal = await this.goalService.createGoal(
      userId,
      createGoalDto.title,
      createGoalDto.targetAmount,
      createGoalDto.description,
    );

    return {
      goalId: goal.id,
      title: goal.title,
      description: goal.description,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      progress: 0,
      completed: goal.completed,
      createdAt: goal.createdAt,
    };
  }

  /**
   * GET /goals
   * 
   * Get all goals for the authenticated user
   * 
   * @param req - Request object containing authenticated user
   * @returns Array of goals with progress
   * 
   * Validates: Requirements 7.2
   */
  @Get()
  async getGoals(@Request() req) {
    const userId = req.user.id;
    const goals = await this.goalService.getUserGoals(userId);

    return { goals };
  }

  /**
   * GET /goals/active
   * 
   * Get active (incomplete) goals for the authenticated user
   * 
   * @param req - Request object containing authenticated user
   * @returns Array of active goals
   */
  @Get('active')
  async getActiveGoals(@Request() req) {
    const userId = req.user.id;
    const goals = await this.goalService.getActiveGoals(userId);

    return {
      goals: goals.map((goal) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        targetAmount: Number(goal.targetAmount),
        currentAmount: Number(goal.currentAmount),
        progress:
          (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100,
        createdAt: goal.createdAt,
      })),
    };
  }

  /**
   * GET /goals/completed
   * 
   * Get completed goals for the authenticated user
   * 
   * @param req - Request object containing authenticated user
   * @returns Array of completed goals
   */
  @Get('completed')
  async getCompletedGoals(@Request() req) {
    const userId = req.user.id;
    const goals = await this.goalService.getCompletedGoals(userId);

    return {
      goals: goals.map((goal) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        targetAmount: Number(goal.targetAmount),
        currentAmount: Number(goal.currentAmount),
        completedAt: goal.completedAt,
        createdAt: goal.createdAt,
      })),
    };
  }

  /**
   * POST /goals/:id/progress
   * 
   * Add progress to a goal
   * 
   * @param req - Request object containing authenticated user
   * @param id - Goal ID
   * @param addProgressDto - Progress details (amount)
   * @returns Updated goal progress
   * 
   * Validates: Requirements 7.3, 7.5
   */
  @Post(':id/progress')
  async addProgress(
    @Request() req,
    @Param('id') id: string,
    @Body() addProgressDto: AddProgressDto,
  ) {
    const userId = req.user.id;
    const result = await this.goalService.addProgress(
      id,
      userId,
      addProgressDto.amount,
    );

    return {
      goalId: result.goalId,
      currentAmount: result.currentAmount,
      progress: result.progress,
      completed: result.completed,
      ...(result.bonusAwarded && { bonusAwarded: result.bonusAwarded }),
    };
  }

  /**
   * DELETE /goals/:id
   * 
   * Delete a goal
   * 
   * @param req - Request object containing authenticated user
   * @param id - Goal ID to delete
   * @returns Success message
   */
  @Delete(':id')
  async deleteGoal(@Request() req, @Param('id') id: string) {
    const userId = req.user.id;
    await this.goalService.deleteGoal(id, userId);

    return {
      success: true,
      message: 'Goal deleted successfully',
    };
  }
}
