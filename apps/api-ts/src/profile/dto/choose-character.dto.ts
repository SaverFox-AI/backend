import { IsUUID } from 'class-validator';

/**
 * ChooseCharacterDto
 * 
 * Data transfer object for choosing a starter character.
 * 
 * Requirements: 2.3, 2.4
 */
export class ChooseCharacterDto {
  @IsUUID('4', { message: 'Character ID must be a valid UUID' })
  characterId: string;
}
