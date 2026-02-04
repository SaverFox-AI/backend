import { IsInt, IsNumber, IsString, Min, Max, Length, IsPositive } from 'class-validator';

/**
 * CreateProfileDto
 * 
 * Data transfer object for creating a user profile.
 * 
 * Requirements: 2.1, 2.4
 */
export class CreateProfileDto {
  @IsInt()
  @Min(5, { message: 'Age must be at least 5' })
  @Max(18, { message: 'Age must not exceed 18' })
  age: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'Allowance must be a positive number' })
  allowance: number;

  @IsString()
  @Length(3, 3, { message: 'Currency must be a 3-letter code' })
  currency: string;
}
