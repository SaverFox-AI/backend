import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO for creating a goal
 * 
 * Requirements: 7.1, 7.5
 */
export class CreateGoalDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  targetAmount: number;

  @IsString()
  @IsOptional()
  description?: string;
}
