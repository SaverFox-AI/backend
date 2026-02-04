import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { WalletTransaction } from '../entities/wallet-transaction.entity';

/**
 * WalletService
 * 
 * Handles wallet operations including balance queries and transactions.
 * All transactions are atomic and include audit trail logging.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly transactionRepository: Repository<WalletTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get or create wallet for user
   * 
   * @param userId - User ID to get wallet for
   * @returns Wallet entity
   */
  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      wallet = this.walletRepository.create({
        userId,
        balance: 0,
      });
      wallet = await this.walletRepository.save(wallet);
    }

    return wallet;
  }

  /**
   * Get wallet balance
   * 
   * @param userId - User ID to get balance for
   * @returns Object containing balance and currency
   * 
   * Validates: Requirements 3.1
   */
  async getBalance(userId: string): Promise<{ balance: number; currency: string }> {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      balance: Number(wallet.balance),
      currency: 'USD', // Default currency
    };
  }

  /**
   * Credit coins to wallet
   * 
   * Adds coins to the wallet balance atomically with transaction logging.
   * 
   * @param userId - User ID to credit
   * @param amount - Amount to credit (must be positive)
   * @param transactionType - Type of transaction (e.g., 'mission_reward', 'goal_bonus')
   * @param description - Optional description
   * @returns Updated wallet
   * @throws BadRequestException if amount is not positive
   * 
   * Validates: Requirements 3.2, 3.5
   */
  async credit(
    userId: string,
    amount: number,
    transactionType: string,
    description?: string,
  ): Promise<Wallet> {
    if (amount <= 0) {
      throw new BadRequestException('Credit amount must be positive');
    }

    return this.dataSource.transaction(async (manager) => {
      // Get or create wallet
      let wallet = await manager.findOne(Wallet, {
        where: { userId },
      });

      if (!wallet) {
        wallet = manager.create(Wallet, {
          userId,
          balance: 0,
        });
        wallet = await manager.save(wallet);
      }

      // Update balance
      wallet.balance = Number(wallet.balance) + amount;
      wallet = await manager.save(wallet);

      // Log transaction
      const transaction = manager.create(WalletTransaction, {
        walletId: wallet.id,
        amount,
        transactionType,
        description: description || `Credited ${amount} coins`,
      });
      await manager.save(transaction);

      return wallet;
    });
  }

  /**
   * Debit coins from wallet
   * 
   * Deducts coins from the wallet balance atomically with transaction logging.
   * Validates that the wallet has sufficient balance.
   * 
   * @param userId - User ID to debit
   * @param amount - Amount to debit (must be positive)
   * @param transactionType - Type of transaction (e.g., 'shop_purchase', 'item_buy')
   * @param description - Optional description
   * @returns Updated wallet
   * @throws BadRequestException if amount is not positive or insufficient balance
   * 
   * Validates: Requirements 3.3, 3.4, 3.5
   */
  async debit(
    userId: string,
    amount: number,
    transactionType: string,
    description?: string,
  ): Promise<Wallet> {
    if (amount <= 0) {
      throw new BadRequestException('Debit amount must be positive');
    }

    return this.dataSource.transaction(async (manager) => {
      // Get wallet
      const wallet = await manager.findOne(Wallet, {
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // Check sufficient balance
      const currentBalance = Number(wallet.balance);
      if (currentBalance < amount) {
        throw new BadRequestException(
          `Insufficient balance. Current: ${currentBalance}, Required: ${amount}`,
        );
      }

      // Update balance
      wallet.balance = currentBalance - amount;
      const updatedWallet = await manager.save(wallet);

      // Log transaction
      const transaction = manager.create(WalletTransaction, {
        walletId: wallet.id,
        amount: -amount, // Negative for debit
        transactionType,
        description: description || `Debited ${amount} coins`,
      });
      await manager.save(transaction);

      return updatedWallet;
    });
  }

  /**
   * Get transaction history
   * 
   * @param userId - User ID to get transactions for
   * @param limit - Maximum number of transactions to return
   * @returns Array of transactions
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
  ): Promise<WalletTransaction[]> {
    const wallet = await this.getOrCreateWallet(userId);
    
    return this.transactionRepository.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
