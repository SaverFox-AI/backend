import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../entities/character.entity';
import { Tamagotchi } from '../entities/tamagotchi.entity';

/**
 * CharacterService
 * 
 * Handles character-related operations including retrieving starter characters
 * and creating tamagotchis when users choose their starter.
 * 
 * Requirements: 2.2, 2.3, 2.5
 */
@Injectable()
export class CharacterService {
  constructor(
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
    @InjectRepository(Tamagotchi)
    private readonly tamagotchiRepository: Repository<Tamagotchi>,
  ) {}

  /**
   * Get all starter characters
   * 
   * Returns a list of characters marked as starter characters (free).
   * 
   * @returns Array of starter characters
   * 
   * Validates: Requirements 2.2
   */
  async getStarterCharacters(): Promise<Character[]> {
    return this.characterRepository.find({
      where: { isStarter: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Choose a starter character and create tamagotchi
   * 
   * Validates that:
   * - The character exists and is a starter character
   * - The user doesn't already have a tamagotchi
   * 
   * Creates a new tamagotchi with initial stats:
   * - hunger: 50
   * - happiness: 50
   * - health: 100
   * 
   * @param userId - User ID choosing the character
   * @param characterId - Character ID to choose
   * @returns Created tamagotchi with character details
   * @throws NotFoundException if character doesn't exist or isn't a starter
   * @throws ConflictException if user already has a tamagotchi
   * 
   * Validates: Requirements 2.3, 2.5
   */
  async chooseStarterCharacter(
    userId: string,
    characterId: string,
  ): Promise<Tamagotchi> {
    // Check if character exists and is a starter
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    if (!character.isStarter) {
      throw new BadRequestException('Character is not a starter character');
    }

    // Check if user already has a tamagotchi
    const existingTamagotchi = await this.tamagotchiRepository.findOne({
      where: { userId },
    });

    if (existingTamagotchi) {
      throw new ConflictException('User already has a tamagotchi');
    }

    // Create tamagotchi with initial stats
    const tamagotchi = this.tamagotchiRepository.create({
      userId,
      characterId,
      name: character.name, // Default name is character name
      hunger: 50,
      happiness: 50,
      health: 100,
      lastFedAt: null,
    });

    return this.tamagotchiRepository.save(tamagotchi);
  }

  /**
   * Get character by ID
   * 
   * @param characterId - Character ID to retrieve
   * @returns Character if found
   * @throws NotFoundException if character doesn't exist
   */
  async getCharacterById(characterId: string): Promise<Character> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    return character;
  }
}
