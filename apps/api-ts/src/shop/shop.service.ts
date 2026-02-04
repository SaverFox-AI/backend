import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Character } from '../entities/character.entity';
import { Food } from '../entities/food.entity';
import { UserInventory } from '../entities/user-inventory.entity';
import { WalletService } from '../wallet/wallet.service';

/**
 * ShopService
 * 
 * Handles shop operations including browsing items and purchasing.
 * All purchases are transactional (wallet debit + inventory addition).
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
    @InjectRepository(UserInventory)
    private readonly inventoryRepository: Repository<UserInventory>,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get all available characters for purchase
   * 
   * @returns Array of characters with pricing
   * 
   * Validates: Requirements 4.1
   */
  async getCharacters(): Promise<Character[]> {
    return this.characterRepository.find({
      order: { price: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Get all available foods for purchase
   * 
   * @returns Array of foods with pricing and nutrition
   * 
   * Validates: Requirements 4.1
   */
  async getFoods(): Promise<Food[]> {
    return this.foodRepository.find({
      order: { price: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Purchase an item from the shop
   * 
   * Validates item exists, user has sufficient funds, then atomically:
   * 1. Deducts coins from wallet
   * 2. Adds item to user inventory
   * 
   * @param userId - User making the purchase
   * @param itemId - ID of the item to purchase
   * @param itemType - Type of item ('character' or 'food')
   * @returns Purchase result with new balance and item details
   * @throws NotFoundException if item doesn't exist
   * @throws BadRequestException if insufficient funds or invalid item type
   * 
   * Validates: Requirements 4.2, 4.3, 4.4, 4.5
   */
  async purchaseItem(
    userId: string,
    itemId: string,
    itemType: 'character' | 'food',
  ): Promise<{
    success: boolean;
    newBalance: number;
    item: Character | Food;
  }> {
    // Validate item type
    if (itemType !== 'character' && itemType !== 'food') {
      throw new BadRequestException(
        'Invalid item type. Must be "character" or "food"',
      );
    }

    // Get item and validate it exists
    let item: Character | Food;
    let price: number;

    if (itemType === 'character') {
      item = await this.characterRepository.findOne({
        where: { id: itemId },
      });
      if (!item) {
        throw new NotFoundException('Character not found');
      }
      price = Number(item.price);
    } else {
      item = await this.foodRepository.findOne({
        where: { id: itemId },
      });
      if (!item) {
        throw new NotFoundException('Food not found');
      }
      price = Number(item.price);
    }

    // Execute purchase transaction
    return this.dataSource.transaction(async (manager) => {
      // Debit wallet (this will throw if insufficient funds)
      await this.walletService.debit(
        userId,
        price,
        'shop_purchase',
        `Purchased ${itemType}: ${item.name}`,
      );

      // Check if item already in inventory
      const existingInventory = await manager.findOne(UserInventory, {
        where: {
          userId,
          itemType,
          itemId,
        },
      });

      if (existingInventory) {
        // Increment quantity for food items
        if (itemType === 'food') {
          existingInventory.quantity += 1;
          await manager.save(existingInventory);
        }
        // For characters, we don't increment (user already owns it)
        // But we still allow the purchase to complete
      } else {
        // Add new item to inventory
        const inventoryItem = manager.create(UserInventory, {
          userId,
          itemType,
          itemId,
          quantity: 1,
        });
        await manager.save(inventoryItem);
      }

      // Get updated balance
      const { balance } = await this.walletService.getBalance(userId);

      return {
        success: true,
        newBalance: balance,
        item,
      };
    });
  }

  /**
   * Get user's inventory
   * 
   * @param userId - User ID to get inventory for
   * @returns Array of inventory items
   */
  async getUserInventory(userId: string): Promise<UserInventory[]> {
    return this.inventoryRepository.find({
      where: { userId },
      order: { acquiredAt: 'DESC' },
    });
  }

  /**
   * Check if user owns a specific item
   * 
   * @param userId - User ID to check
   * @param itemId - Item ID to check
   * @param itemType - Type of item
   * @returns True if user owns the item with quantity > 0
   */
  async userOwnsItem(
    userId: string,
    itemId: string,
    itemType: 'character' | 'food',
  ): Promise<boolean> {
    const inventory = await this.inventoryRepository.findOne({
      where: {
        userId,
        itemId,
        itemType,
      },
    });

    return inventory !== null && inventory.quantity > 0;
  }

  /**
   * Consume an item from inventory (e.g., when feeding food to tamagotchi)
   * 
   * @param userId - User ID
   * @param itemId - Item ID to consume
   * @param itemType - Type of item
   * @param quantity - Quantity to consume (default 1)
   * @throws NotFoundException if item not in inventory
   * @throws BadRequestException if insufficient quantity
   */
  async consumeItem(
    userId: string,
    itemId: string,
    itemType: 'character' | 'food',
    quantity: number = 1,
  ): Promise<void> {
    const inventory = await this.inventoryRepository.findOne({
      where: {
        userId,
        itemId,
        itemType,
      },
    });

    if (!inventory) {
      throw new NotFoundException('Item not found in inventory');
    }

    if (inventory.quantity < quantity) {
      throw new BadRequestException(
        `Insufficient quantity. Available: ${inventory.quantity}, Required: ${quantity}`,
      );
    }

    inventory.quantity -= quantity;

    if (inventory.quantity === 0) {
      // Remove from inventory if quantity reaches 0
      await this.inventoryRepository.remove(inventory);
    } else {
      await this.inventoryRepository.save(inventory);
    }
  }
}
