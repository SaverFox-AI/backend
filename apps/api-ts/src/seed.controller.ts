import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from './entities/character.entity';
import { Food } from './entities/food.entity';
import { Mission } from './entities/mission.entity';

/**
 * SeedController
 * 
 * Public endpoints for seeding initial data.
 * No authentication required.
 * Updated: 2026-02-07
 */
@Controller('seed')
@ApiTags('seed')
export class SeedController {
  constructor(
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
  ) {}

  @Get('characters')
  @ApiOperation({ summary: 'Seed starter characters' })
  @ApiResponse({ status: 200, description: 'Characters seeded successfully' })
  async seedCharacters() {
    const characters = [
      { name: 'Foxy the Fox', imageUrl: '/assets/characters/foxy.png', isStarter: true, price: 0 },
      { name: 'Penny the Penguin', imageUrl: '/assets/characters/penny.png', isStarter: true, price: 0 },
      { name: 'Buddy the Bear', imageUrl: '/assets/characters/buddy.png', isStarter: true, price: 0 },
    ];
    
    const created = [];
    for (const char of characters) {
      const existing = await this.characterRepository.findOne({
        where: { name: char.name },
      });

      if (!existing) {
        const character = this.characterRepository.create(char);
        const saved = await this.characterRepository.save(character);
        created.push(saved);
      }
    }
    
    return { 
      message: 'Characters seeded', 
      created: created.length,
      total: characters.length 
    };
  }

  @Get('foods')
  @ApiOperation({ summary: 'Seed food items' })
  @ApiResponse({ status: 200, description: 'Foods seeded successfully' })
  async seedFoods() {
    const foods = [
      { name: 'Apple', nutritionValue: 10, price: 5, imageUrl: '/assets/asset-foods/apple.png' },
      { name: 'Sandwich', nutritionValue: 25, price: 10, imageUrl: '/assets/asset-foods/sandwich.png' },
      { name: 'Pizza Slice', nutritionValue: 30, price: 15, imageUrl: '/assets/asset-foods/pizza.png' },
      { name: 'Salad', nutritionValue: 20, price: 12, imageUrl: '/assets/asset-foods/salad.png' },
      { name: 'Ice Cream', nutritionValue: 15, price: 8, imageUrl: '/assets/asset-foods/ice-cream.png' },
    ];
    
    const created = [];
    for (const food of foods) {
      const existing = await this.foodRepository.findOne({
        where: { name: food.name },
      });

      if (!existing) {
        const item = this.foodRepository.create(food);
        const saved = await this.foodRepository.save(item);
        created.push(saved);
      }
    }
    
    return { 
      message: 'Foods seeded', 
      created: created.length,
      total: foods.length 
    };
  }

  @Get('missions')
  @ApiOperation({ summary: 'Seed today\'s missions' })
  @ApiResponse({ status: 200, description: 'Missions seeded successfully' })
  async seedMissions() {
    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    
    const missions = [
      {
        title: 'Track Your Spending',
        description: 'Log 3 expenses to understand where your money goes',
        missionType: 'expense_tracking',
        requirements: { expense_count: 3 },
        rewardCoins: 10,
        activeDate: today,
      },
      {
        title: 'Start Saving',
        description: 'Log 1 saving entry to begin building your savings habit',
        missionType: 'saving_tracking',
        requirements: { saving_count: 1 },
        rewardCoins: 15,
        activeDate: today,
      },
      {
        title: 'Feed Your Pet',
        description: 'Feed your tamagotchi once to keep it happy and healthy',
        missionType: 'tamagotchi_care',
        requirements: { feed_count: 1 },
        rewardCoins: 5,
        activeDate: today,
      },
    ];
    
    const created = [];
    const updated = [];
    
    for (const mission of missions) {
      const existing = await this.missionRepository.findOne({
        where: { title: mission.title },
      });

      if (existing) {
        // Update existing mission with today's date
        existing.activeDate = mission.activeDate;
        existing.description = mission.description;
        existing.missionType = mission.missionType;
        existing.requirements = mission.requirements;
        existing.rewardCoins = mission.rewardCoins;
        await this.missionRepository.save(existing);
        updated.push(existing);
      } else {
        // Create new mission
        const item = this.missionRepository.create(mission);
        const saved = await this.missionRepository.save(item);
        created.push(saved);
      }
    }
    
    return { 
      message: 'Missions seeded', 
      created: created.length,
      updated: updated.length,
      total: missions.length,
      todayDate: today.toISOString(),
    };
  }

  @Get('missions/debug')
  @ApiOperation({ summary: 'Debug missions date matching' })
  @ApiResponse({ status: 200, description: 'Mission debug info' })
  async debugMissions() {
    const allMissions = await this.missionRepository.find({
      order: { activeDate: 'DESC' },
    });
    
    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    
    return {
      todayUTC: today.toISOString(),
      totalMissions: allMissions.length,
      missions: allMissions.map(m => ({
        id: m.id,
        title: m.title,
        activeDate: m.activeDate,
        activeDateISO: new Date(m.activeDate).toISOString(),
      })),
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Seed all data (characters, foods, missions)' })
  @ApiResponse({ status: 200, description: 'All data seeded successfully' })
  async seedAll() {
    const chars = await this.seedCharacters();
    const foods = await this.seedFoods();
    
    return {
      message: 'Characters and foods seeded',
      characters: chars,
      foods: foods,
    };
  }
}
