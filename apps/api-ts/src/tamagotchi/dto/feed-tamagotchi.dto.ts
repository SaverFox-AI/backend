import { IsUUID, IsNotEmpty } from 'class-validator';

/**
 * DTO for feeding a tamagotchi
 * 
 * Requirements: 6.1, 6.2
 */
export class FeedTamagotchiDto {
  @IsUUID()
  @IsNotEmpty()
  foodId: string;
}
