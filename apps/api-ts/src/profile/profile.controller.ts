import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CharacterService } from './character.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProfileDto, ChooseCharacterDto } from './dto';

/**
 * ProfileController
 * 
 * Handles profile and onboarding endpoints.
 * All endpoints require JWT authentication.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
@Controller()
@ApiTags('profile')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly characterService: CharacterService,
  ) {}

  /**
   * Create user profile
   * 
   * POST /profile
   * 
   * Creates a new profile for the authenticated user.
   * 
   * @param req - Request object containing authenticated user
   * @param createProfileDto - Profile data (age, allowance, currency)
   * @returns Created profile
   * @throws ConflictException if profile already exists
   * @throws BadRequestException if validation fails
   * 
   * Validates: Requirements 2.1, 2.4
   */
  @Post('profile')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user profile' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  @ApiResponse({ status: 409, description: 'Profile already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createProfile(
    @Request() req,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    const userId = req.user.id;
    const { age, allowance, currency } = createProfileDto;
    return this.profileService.createProfile(userId, age, allowance, currency);
  }

  /**
   * Get user profile
   * 
   * GET /profile
   * 
   * Returns the authenticated user's profile data.
   * 
   * @param req - Request object containing authenticated user
   * @returns User profile with age, allowance, currency, onboarding status
   * @throws NotFoundException if profile doesn't exist
   * 
   * Validates: Requirements 2.1
   */
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(@Request() req) {
    const userId = req.user.id;
    return this.profileService.getProfile(userId);
  }

  /**
   * Get starter characters
   * 
   * GET /characters/starter
   * 
   * Returns a list of available starter characters.
   * 
   * @returns Array of starter characters
   * 
   * Validates: Requirements 2.2
   */
  @Get('characters/starter')
  @ApiOperation({ summary: 'Get available starter characters' })
  @ApiResponse({ status: 200, description: 'Starter characters retrieved successfully' })
  async getStarterCharacters() {
    const characters = await this.characterService.getStarterCharacters();
    return { characters };
  }

  /**
   * Choose starter character
   * 
   * POST /characters/choose
   * 
   * Allows user to choose a starter character and creates their tamagotchi.
   * 
   * @param req - Request object containing authenticated user
   * @param chooseCharacterDto - Character selection data
   * @returns Created tamagotchi with character details
   * @throws NotFoundException if character doesn't exist or isn't a starter
   * @throws ConflictException if user already has a tamagotchi
   * @throws BadRequestException if validation fails
   * 
   * Validates: Requirements 2.3, 2.4
   */
  @Post('characters/choose')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Choose starter character and create tamagotchi' })
  @ApiResponse({ status: 201, description: 'Character chosen and tamagotchi created' })
  @ApiResponse({ status: 404, description: 'Character not found or not a starter' })
  @ApiResponse({ status: 409, description: 'User already has a tamagotchi' })
  async chooseCharacter(
    @Request() req,
    @Body() chooseCharacterDto: ChooseCharacterDto,
  ) {
    const userId = req.user.id;
    const { characterId } = chooseCharacterDto;
    
    const tamagotchi = await this.characterService.chooseStarterCharacter(
      userId,
      characterId,
    );

    // Mark onboarding as completed after choosing character
    await this.profileService.updateOnboardingStatus(userId, true);

    return {
      tamagotchiId: tamagotchi.id,
      character: await this.characterService.getCharacterById(tamagotchi.characterId),
    };
  }
}
