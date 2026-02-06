import { Controller, Get } from '@nestjs/common';
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
 */
@Controller('seed')
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
  async seedCharacters() {
    const characters = [
      { name: 'Foxy the Fox', imageUrl: '/images/characters/foxy.png', isStarter: true, price: 0 },
      { name: 'Penny the Penguin', imageUrl: '/images/characters/penny.png', isStarter: true, price: 0 },
      { name: 'Buddy the Bear', imageUrl: '/images/characters/buddy.png', isStarter: true, price: 0 },
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
  async seedFoods() {
    const foods = [
      { name: 'Apple', nutritionValue: 10, price: 5, imageUrl: '/images/foods/apple.png' },
      { name: 'Sandwich', nutritionValue: 25, price: 10, imageUrl: '/images/foods/sandwich.png' },
      { name: 'Pizza Slice', nutritionValue: 30, price: 15, imageUrl: '/images/foods/pizza.png' },
      { name: 'Salad', nutritionValue: 20, price: 12, imageUrl: '/images/foods/salad.png' },
      { name: 'Ice Cream', nutritionValue: 15, price: 8, imageUrl: '/images/foods/icecream.png' },
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
  async seedMissions() {
    const today = new Date();
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
    for (const mission of missions) {
      const existing = await this.missionRepository.findOne({
        where: { title: mission.title },
      });

      if (!existing) {
        const item = this.missionRepository.create(mission);
        const saved = await this.missionRepository.save(item);
        created.push(saved);
      }
    }
    
    return { 
      message: 'Missions seeded', 
      created: created.length,
      total: missions.length 
    };
  }

  @Get('all')
  async seedAll() {
    const chars = await this.seedCharacters();
    const foods = await this.seedFoods();
    const missions = await this.seedMissions();
    
    return {
      message: 'All data seeded',
      characters: chars,
      foods: foods,
      missions: missions,
    };
  }
}
