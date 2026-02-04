import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { Character } from '../entities/character.entity';
import { Food } from '../entities/food.entity';
import { UserInventory } from '../entities/user-inventory.entity';
import { WalletModule } from '../wallet/wallet.module';

/**
 * ShopModule
 * 
 * Provides shop functionality including browsing and purchasing items.
 * Integrates with WalletModule for payment processing.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Character, Food, UserInventory]),
    WalletModule,
  ],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}
