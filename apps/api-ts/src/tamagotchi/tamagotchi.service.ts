import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tamagotchi } from '../entities/tamagotchi.entity';
import { Food } from '../entities/food.entity';
import { ShopService } from '../shop/shop.service';

/**
 * TamagotchiService
 * 
 * Handles tamagotchi operations including feeding and state management.
 * Validates food ownership and updates tamagotchi stats based on nutrition.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
@Injectable()
export class TamagotchiService {
  constructor(
    @InjectRepository(Tamagotchi)
    private readonly tamagotchiRepository: Repository<Tamagotchi>,
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
    private readonly shopService: ShopService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get user's tamagotchi
   * 
   * @param userId - User ID to get tamagotchi for
   * @returns Tamagotchi entity
   * @throws NotFoundException if tamagotchi doesn't exist
   */
  async getTamagotchi(userId: string): Promise<Tamagotchi> {
    const tamagotchi = await this.tamagotchiRepository.findOne({
      where: { userId },
      relations: ['character'],
    });

    if (!tamagotchi) {
      throw new NotFoundException('Tamagotchi not found for this user');
    }

    return tamagotchi;
  }

  /**
   * Feed tamagotchi with a food item
   * 
   * Validates food ownership, updates tamagotchi stats based on nutrition,
   * and consumes the food from inventory.
   * 
   * @param userId - User ID feeding the tamagotchi
   * @param foodId - Food item ID to feed
   * @returns Updated tamagotchi state
   * @throws NotFoundException if tamagotchi or food doesn't exist
   * @throws ForbiddenException if user doesn't own the food
   * 
   * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
   */
  async feedTamagotchi(
    userId: string,
    foodId: string,
  ): Promise<{
    hunger: number;
    happiness: number;
    health: number;
  }> {
    // Get tamagotchi
    const tamagotchi = await this.getTamagotchi(userId);

    // Get food item
    const food = await this.foodRepository.findOne({
      where: { id: foodId },
    });

    if (!food) {
      throw new NotFoundException('Food item not found');
    }

    // Check if user owns the food
    const ownsFood = await this.shopService.userOwnsItem(
      userId,
      foodId,
      'food',
    );

    if (!ownsFood) {
      throw new ForbiddenException(
        'You do not own this food item. Purchase it from the shop first.',
      );
    }

    // Execute feeding transaction
    return this.dataSource.transaction(async (manager) => {
      // Update tamagotchi stats based on nutrition value
      const nutritionValue = food.nutritionValue;

      // Decrease hunger (more nutrition = less hunger)
      tamagotchi.hunger = Math.max(0, tamagotchi.hunger - nutritionValue);

      // Increase happiness (feeding makes tamagotchi happy)
      const happinessIncrease = Math.floor(nutritionValue / 2);
      tamagotchi.happiness = Math.min(100, tamagotchi.happiness + happinessIncrease);

      // Health improves slightly when well-fed
      if (tamagotchi.hunger < 30) {
        tamagotchi.health = Math.min(100, tamagotchi.health + 5);
      }

      // Update last fed timestamp
      tamagotchi.lastFedAt = new Date();

      // Save tamagotchi state
      await manager.save(tamagotchi);

      // Consume food from inventory
      await this.shopService.consumeItem(userId, foodId, 'food', 1);

      return {
        hunger: tamagotchi.hunger,
        happiness: tamagotchi.happiness,
        health: tamagotchi.health,
      };
    });
  }

  /**
   * Get tamagotchi state
   * 
   * @param userId - User ID
   * @returns Tamagotchi state with character details
   */
  async getTamagotchiState(userId: string): Promise<{
    id: string;
    name: string;
    hunger: number;
    happiness: number;
    health: number;
    lastFedAt: Date | null;
    character: {
      id: string;
      name: string;
      imageUrl: string;
    };
  }> {
    const tamagotchi = await this.getTamagotchi(userId);

    return {
      id: tamagotchi.id,
      name: tamagotchi.name,
      hunger: tamagotchi.hunger,
      happiness: tamagotchi.happiness,
      health: tamagotchi.health,
      lastFedAt: tamagotchi.lastFedAt,
      character: {
        id: tamagotchi.character.id,
        name: tamagotchi.character.name,
        imageUrl: tamagotchi.character.imageUrl,
      },
    };
  }

  /**
   * Update tamagotchi name
   * 
   * @param userId - User ID
   * @param name - New name for tamagotchi
   * @returns Updated tamagotchi
   */
  async updateTamagotchiName(
    userId: string,
    name: string,
  ): Promise<Tamagotchi> {
    const tamagotchi = await this.getTamagotchi(userId);
    tamagotchi.name = name;
    return this.tamagotchiRepository.save(tamagotchi);
  }
}
