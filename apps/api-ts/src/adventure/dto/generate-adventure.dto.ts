import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for generating a new adventure
 */
export class GenerateAdventureDto {
  @ApiProperty({
    description: 'Optional context for adventure generation (e.g., current goal)',
    example: 'Saving for a new bicycle',
    required: false,
  })
  @IsString()
  @IsOptional()
  context?: string;
}
