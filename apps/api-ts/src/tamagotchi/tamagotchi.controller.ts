import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TamagotchiService } from './tamagotchi.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeedTamagotchiDto } from './dto/feed-tamagotchi.dto';

/**
 * TamagotchiController
 * 
 * Handles tamagotchi-related HTTP endpoints for feeding and state queries.
 * All endpoints require authentication.
 * 
 * Requirements: 6.1, 6.2
 */
@Controller('tamagotchi')
@UseGuards(JwtAuthGuard)
export class TamagotchiController {
  constructor(private readonly tamagotchiService: TamagotchiService) {}

  /**
   * GET /tamagotchi
   * 
   * Get user's tamagotchi state
   * 
   * @param req - Request object containing authenticated user
   * @returns Tamagotchi state with character details
   */
  @Get()
  async getTamagotchi(@Request() req) {
    const userId = req.user.userId;
    return this.tamagotchiService.getTamagotchiState(userId);
  }

  /**
   * POST /tamagotchi/feed
   * 
   * Feed the tamagotchi with a food item
   * 
   * Validates food ownership and updates tamagotchi stats.
   * 
   * @param req - Request object containing authenticated user
   * @param feedDto - Feed details (foodId)
   * @returns Updated tamagotchi stats
   * 
   * Validates: Requirements 6.1, 6.2
   */
  @Post('feed')
  async feedTamagotchi(@Request() req, @Body() feedDto: FeedTamagotchiDto) {
    const userId = req.user.userId;
    const result = await this.tamagotchiService.feedTamagotchi(
      userId,
      feedDto.foodId,
    );

    return {
      hunger: result.hunger,
      happiness: result.happiness,
      health: result.health,
    };
  }
}
