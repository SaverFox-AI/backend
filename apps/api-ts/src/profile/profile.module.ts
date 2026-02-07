import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileService } from './profile.service';
import { CharacterService } from './character.service';
import { ProfileController } from './profile.controller';
import { Profile } from '../entities/profile.entity';
import { Character } from '../entities/character.entity';
import { Tamagotchi } from '../entities/tamagotchi.entity';
import { UserInventory } from '../entities/user-inventory.entity';
import { Food } from '../entities/food.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * ProfileModule
 * 
 * Module for profile and onboarding functionality.
 * Handles profile creation, starter character selection, and tamagotchi initialization.
 * 
 * Requirements: 2.1, 2.2, 2.3
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, Character, Tamagotchi, UserInventory, Food]),
    AuthModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService, CharacterService],
  exports: [ProfileService, CharacterService],
})
export class ProfileModule {}
