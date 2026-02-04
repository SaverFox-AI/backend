import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../entities/profile.entity';

/**
 * ProfileService
 * 
 * Handles user profile operations including creation, retrieval,
 * and onboarding status management.
 * 
 * Requirements: 2.1
 */
@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  /**
   * Create a new profile for a user
   * 
   * @param userId - User ID to create profile for
   * @param age - User's age (5-18)
   * @param allowance - User's allowance amount
   * @param currency - Currency code (default: USD)
   * @returns Created profile
   * @throws ConflictException if profile already exists for user
   * 
   * Validates: Requirements 2.1
   */
  async createProfile(
    userId: string,
    age: number,
    allowance: number,
    currency: string = 'USD',
  ): Promise<Profile> {
    // Check if profile already exists
    const existingProfile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException('Profile already exists for this user');
    }

    // Create new profile
    const profile = this.profileRepository.create({
      userId,
      age,
      allowance,
      currency,
      onboardingCompleted: false,
    });

    return this.profileRepository.save(profile);
  }

  /**
   * Get profile by user ID
   * 
   * @param userId - User ID to retrieve profile for
   * @returns Profile if found
   * @throws NotFoundException if profile doesn't exist
   * 
   * Validates: Requirements 2.1
   */
  async getProfileByUserId(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  /**
   * Update onboarding completion status
   * 
   * @param userId - User ID to update
   * @param completed - Onboarding completion status
   * @returns Updated profile
   * @throws NotFoundException if profile doesn't exist
   * 
   * Validates: Requirements 2.1
   */
  async updateOnboardingStatus(
    userId: string,
    completed: boolean,
  ): Promise<Profile> {
    const profile = await this.getProfileByUserId(userId);
    profile.onboardingCompleted = completed;
    return this.profileRepository.save(profile);
  }
}
