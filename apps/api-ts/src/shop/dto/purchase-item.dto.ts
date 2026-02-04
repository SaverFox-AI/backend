import { IsString, IsNotEmpty, IsIn, IsUUID } from 'class-validator';

/**
 * DTO for purchasing an item from the shop
 * 
 * Requirements: 4.2, 4.4
 */
export class PurchaseItemDto {
  @IsUUID()
  @IsNotEmpty()
  itemId: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['character', 'food'])
  itemType: 'character' | 'food';
}
