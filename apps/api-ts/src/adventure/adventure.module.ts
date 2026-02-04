import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AdventureController } from './adventure.controller';
import { AdventureService } from './adventure.service';
import { AIServiceClient } from './ai-service.client';
import { Adventure } from '../entities/adventure.entity';
import { Profile } from '../entities/profile.entity';
import { Goal } from '../entities/goal.entity';

/**
 * AdventureModule
 * 
 * Module for adventure generation and evaluation functionality.
 * Provides integration with the AI service for scenario generation
 * and choice evaluation.
 * 
 * Requirements: 8.1, 9.1
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Adventure, Profile, Goal]),
    ConfigModule,
  ],
  controllers: [AdventureController],
  providers: [AdventureService, AIServiceClient],
  exports: [AdventureService],
})
export class AdventureModule {}
