import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PurchaseItemDto } from './dto/purchase-item.dto';

/**
 * ShopController
 * 
 * Handles shop-related HTTP endpoints for browsing and purchasing items.
 * All endpoints require authentication.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
@Controller('shop')
@UseGuards(JwtAuthGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  /**
   * GET /shop/characters
   * 
   * Retrieve all available characters for purchase
   * 
   * @returns Array of characters with pricing
   * 
   * Validates: Requirements 4.1
   */
  @Get('characters')
  async getCharacters() {
    const characters = await this.shopService.getCharacters();
    return {
      items: characters.map((char) => ({
        id: char.id,
        name: char.name,
        price: Number(char.price),
        image: char.imageUrl,
        isStarter: char.isStarter,
      })),
    };
  }

  /**
   * GET /shop/foods
   * 
   * Retrieve all available foods for purchase
   * 
   * @returns Array of foods with pricing and nutrition
   * 
   * Validates: Requirements 4.1
   */
  @Get('foods')
  async getFoods() {
    const foods = await this.shopService.getFoods();
    return {
      items: foods.map((food) => ({
        id: food.id,
        name: food.name,
        price: Number(food.price),
        nutrition: food.nutritionValue,
        image: food.imageUrl,
      })),
    };
  }

  /**
   * POST /shop/buy
   * 
   * Purchase an item from the shop
   * 
   * Validates item availability and user funds, then executes purchase transaction.
   * 
   * @param req - Request object containing authenticated user
   * @param purchaseDto - Purchase details (itemId, itemType)
   * @returns Purchase result with success status, new balance, and item details
   * 
   * Validates: Requirements 4.2, 4.3, 4.4
   */
  @Post('buy')
  async purchaseItem(@Request() req, @Body() purchaseDto: PurchaseItemDto) {
    const userId = req.user.userId;
    const result = await this.shopService.purchaseItem(
      userId,
      purchaseDto.itemId,
      purchaseDto.itemType,
    );

    return {
      success: result.success,
      newBalance: result.newBalance,
      item: {
        id: result.item.id,
        name: result.item.name,
        price: Number(result.item.price),
        ...(purchaseDto.itemType === 'food' && {
          nutrition: (result.item as any).nutritionValue,
        }),
        ...(purchaseDto.itemType === 'character' && {
          isStarter: (result.item as any).isStarter,
        }),
      },
    };
  }

  /**
   * GET /shop/inventory
   * 
   * Get user's inventory
   * 
   * @param req - Request object containing authenticated user
   * @returns Array of inventory items
   */
  @Get('inventory')
  async getInventory(@Request() req) {
    const userId = req.user.userId;
    const inventory = await this.shopService.getUserInventory(userId);

    return {
      items: inventory.map((item) => ({
        id: item.id,
        itemType: item.itemType,
        itemId: item.itemId,
        quantity: item.quantity,
        acquiredAt: item.acquiredAt,
      })),
    };
  }
}
