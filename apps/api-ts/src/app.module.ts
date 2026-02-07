import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { WalletModule } from './wallet/wallet.module';
import { ShopModule } from './shop/shop.module';
import { MissionModule } from './mission/mission.module';
import { TamagotchiModule } from './tamagotchi/tamagotchi.module';
import { GoalModule } from './goal/goal.module';
import { AdventureModule } from './adventure/adventure.module';
import { HealthController } from './health.controller';
import { SeedController } from './seed.controller';
import { Character } from './entities/character.entity';
import { Food } from './entities/food.entity';
import { Mission } from './entities/mission.entity';
import { Profile } from './entities/profile.entity';
import { UserInventory } from './entities/user-inventory.entity';
import databaseConfig from './config/database.config';

/**
 * Root Application Module
 * 
 * Configures the main application with:
 * - Global configuration management
 * - Database connection
 * - Authentication module
 * - Profile and onboarding module
 * - Wallet module
 * - Feature modules (to be added)
 */
@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
    }),
    
    // TypeORM for seed controller
    TypeOrmModule.forFeature([Character, Food, Mission, Profile, UserInventory]),
    
    // Database connection
    DatabaseModule,
    
    // Authentication
    AuthModule,
    
    // Profile and Onboarding
    ProfileModule,
    
    // Wallet
    WalletModule,
    
    // Shop
    ShopModule,
    
    // Mission
    MissionModule,
    
    // Tamagotchi
    TamagotchiModule,
    
    // Goal
    GoalModule,
    
    // Adventure
    AdventureModule,
    
    // Feature modules will be added here
  ],
  controllers: [HealthController, SeedController],
  providers: [],
})
export class AppModule {}
