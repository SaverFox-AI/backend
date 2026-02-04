import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

/**
 * DTO for logging an expense
 * 
 * Requirements: 5.2, 5.5
 */
export class LogExpenseDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  description?: string;
}
