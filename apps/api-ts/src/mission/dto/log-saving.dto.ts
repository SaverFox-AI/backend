import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

/**
 * DTO for logging a saving
 * 
 * Requirements: 5.3, 5.5
 */
export class LogSavingDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  source?: string;
}
