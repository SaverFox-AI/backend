import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionController } from './mission.controller';
import { MissionService } from './mission.service';
import { Mission } from '../entities/mission.entity';
import { UserMission } from '../entities/user-mission.entity';
import { Expense } from '../entities/expense.entity';
import { Saving } from '../entities/saving.entity';
import { WalletModule } from '../wallet/wallet.module';

/**
 * MissionModule
 * 
 * Provides mission functionality including daily missions,
 * expense/saving logging, and progress tracking.
 * Integrates with WalletModule for reward distribution.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Mission, UserMission, Expense, Saving]),
    WalletModule,
  ],
  controllers: [MissionController],
  providers: [MissionService],
  exports: [MissionService],
})
export class MissionModule {}
