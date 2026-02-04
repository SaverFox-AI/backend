import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * WalletController
 * 
 * Handles wallet-related endpoints.
 * All endpoints require JWT authentication.
 * 
 * Requirements: 3.1
 */
@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Get wallet balance
   * 
   * GET /wallet
   * 
   * Returns the current wallet balance for the authenticated user.
   * 
   * @param req - Request object containing authenticated user
   * @returns Object containing balance and currency
   * 
   * Validates: Requirements 3.1
   */
  @Get()
  async getBalance(@Request() req) {
    const userId = req.user.id;
    return this.walletService.getBalance(userId);
  }
}
