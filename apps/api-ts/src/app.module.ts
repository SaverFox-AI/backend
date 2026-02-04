import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { WalletModule } from './wallet/wallet.module';
import { ShopModule } from './shop/shop.module';
import { MissionModule } from './mission/mission.module';
import { TamagotchiModule } from './tamagotchi/tamagotchi.module';
import { GoalModule } from './goal/goal.module';
import { AdventureModule } from './adventure/adventure.module';
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
  controllers: [],
  providers: [],
})
export class AppModule {}
