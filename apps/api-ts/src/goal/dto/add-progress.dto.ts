import { IsNumber, IsNotEmpty, Min } from 'class-validator';

/**
 * DTO for adding progress to a goal
 * 
 * Requirements: 7.3, 7.5
 */
export class AddProgressDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  amount: number;
}
