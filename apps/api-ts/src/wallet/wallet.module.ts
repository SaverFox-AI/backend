import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Wallet } from '../entities/wallet.entity';
import { WalletTransaction } from '../entities/wallet-transaction.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * WalletModule
 * 
 * Module for wallet and transaction management.
 * Handles coin balance tracking and transaction history.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletTransaction]),
    AuthModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
