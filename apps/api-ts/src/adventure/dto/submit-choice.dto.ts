import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for submitting a choice for an adventure
 */
export class SubmitChoiceDto {
  @ApiProperty({
    description: 'Adventure ID to submit choice for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  adventureId: string;

  @ApiProperty({
    description: 'Index of the selected choice (0-based)',
    example: 0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  choiceIndex: number;
}
