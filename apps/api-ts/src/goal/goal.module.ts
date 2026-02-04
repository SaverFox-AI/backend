import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';
import { Goal } from '../entities/goal.entity';
import { WalletModule } from '../wallet/wallet.module';

/**
 * GoalModule
 * 
 * Provides goal functionality including creation, progress tracking,
 * and completion rewards.
 * Integrates with WalletModule for bonus distribution.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
@Module({
  imports: [TypeOrmModule.forFeature([Goal]), WalletModule],
  controllers: [GoalController],
  providers: [GoalService],
  exports: [GoalService],
})
export class GoalModule {}
