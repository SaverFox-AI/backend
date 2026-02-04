import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TamagotchiController } from './tamagotchi.controller';
import { TamagotchiService } from './tamagotchi.service';
import { Tamagotchi } from '../entities/tamagotchi.entity';
import { Food } from '../entities/food.entity';
import { ShopModule } from '../shop/shop.module';

/**
 * TamagotchiModule
 * 
 * Provides tamagotchi functionality including feeding and state management.
 * Integrates with ShopModule for inventory validation.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Tamagotchi, Food]),
    ShopModule,
  ],
  controllers: [TamagotchiController],
  providers: [TamagotchiService],
  exports: [TamagotchiService],
})
export class TamagotchiModule {}
