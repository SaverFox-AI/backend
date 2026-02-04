import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AdventureService } from './adventure.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerateAdventureDto } from './dto/generate-adventure.dto';
import { SubmitChoiceDto } from './dto/submit-choice.dto';

/**
 * AdventureController
 * 
 * Handles adventure-related HTTP endpoints for generating scenarios
 * and submitting choices. All endpoints require authentication.
 * 
 * Requirements: 8.1, 9.1
 */
@ApiTags('adventure')
@ApiBearerAuth('JWT-auth')
@Controller('adventure')
@UseGuards(JwtAuthGuard)
export class AdventureController {
  constructor(private readonly adventureService: AdventureService) {}

  /**
   * POST /adventure/generate
   * 
   * Generate a new money adventure scenario
   * 
   * @param req - Request object containing authenticated user
   * @param generateDto - Optional context for generation
   * @returns Generated adventure with scenario and choices
   * 
   * Validates: Requirements 8.1
   */
  @Post('generate')
  @ApiOperation({
    summary: 'Generate a new money adventure',
    description: 'Creates an AI-generated financial scenario with choices based on user context',
  })
  @ApiBody({ type: GenerateAdventureDto })
  @ApiResponse({
    status: 201,
    description: 'Adventure generated successfully',
    schema: {
      example: {
        adventureId: '123e4567-e89b-12d3-a456-426614174000',
        scenario: 'You found $5 on the ground! What do you do?',
        choices: [
          'Save it for your bicycle goal',
          'Spend it on candy right away',
          'Give half to charity and save half',
        ],
        opikTraceId: 'trace_abc123xyz',
        createdAt: '2024-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  @ApiResponse({ status: 503, description: 'AI service unavailable' })
  async generateAdventure(
    @Request() req,
    @Body() generateDto: GenerateAdventureDto,
  ) {
    const userId = req.user.userId;
    const adventure = await this.adventureService.generateAdventure(
      userId,
      generateDto.context,
    );

    return {
      adventureId: adventure.id,
      scenario: adventure.scenario,
      choices: adventure.choices,
      opikTraceId: adventure.generationOpikTraceId,
      createdAt: adventure.createdAt,
    };
  }

  /**
   * POST /adventure/submit-choice
   * 
   * Submit a choice for an adventure and receive evaluation
   * 
   * @param req - Request object containing authenticated user
   * @param submitDto - Adventure ID and choice index
   * @returns Evaluation feedback and scores
   * 
   * Validates: Requirements 9.1
   */
  @Post('submit-choice')
  @ApiOperation({
    summary: 'Submit a choice for evaluation',
    description: 'Evaluates the player\'s choice and provides feedback with scores',
  })
  @ApiBody({ type: SubmitChoiceDto })
  @ApiResponse({
    status: 200,
    description: 'Choice evaluated successfully',
    schema: {
      example: {
        adventureId: '123e4567-e89b-12d3-a456-426614174000',
        selectedChoice: 'Save it for your bicycle goal',
        feedback: 'Great choice! Saving money for your goal shows excellent planning.',
        scores: {
          financial_wisdom: 0.9,
          long_term_thinking: 0.85,
          responsibility: 0.8,
        },
        opikTraceId: 'trace_def456uvw',
        evaluatedAt: '2024-01-15T10:35:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid choice or already submitted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Adventure not found' })
  @ApiResponse({ status: 503, description: 'AI service unavailable' })
  async submitChoice(@Request() req, @Body() submitDto: SubmitChoiceDto) {
    const userId = req.user.userId;
    const adventure = await this.adventureService.submitChoice(
      userId,
      submitDto.adventureId,
      submitDto.choiceIndex,
    );

    return {
      adventureId: adventure.id,
      selectedChoice: adventure.choices[adventure.selectedChoiceIndex!],
      feedback: adventure.feedback,
      scores: adventure.scores,
      opikTraceId: adventure.evaluationOpikTraceId,
      evaluatedAt: adventure.evaluatedAt,
    };
  }

  /**
   * GET /adventure/:id
   * 
   * Get a specific adventure by ID
   * 
   * @param req - Request object containing authenticated user
   * @param id - Adventure ID
   * @returns Adventure details
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get adventure by ID',
    description: 'Retrieves a specific adventure with all details',
  })
  @ApiResponse({
    status: 200,
    description: 'Adventure retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Adventure not found' })
  async getAdventure(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    const adventure = await this.adventureService.getAdventure(userId, id);

    return {
      adventureId: adventure.id,
      scenario: adventure.scenario,
      choices: adventure.choices,
      selectedChoiceIndex: adventure.selectedChoiceIndex,
      feedback: adventure.feedback,
      scores: adventure.scores,
      generationOpikTraceId: adventure.generationOpikTraceId,
      evaluationOpikTraceId: adventure.evaluationOpikTraceId,
      createdAt: adventure.createdAt,
      evaluatedAt: adventure.evaluatedAt,
    };
  }

  /**
   * GET /adventure
   * 
   * Get adventure history for the authenticated user
   * 
   * @param req - Request object containing authenticated user
   * @returns Array of adventures
   */
  @Get()
  @ApiOperation({
    summary: 'Get adventure history',
    description: 'Retrieves the user\'s adventure history',
  })
  @ApiResponse({
    status: 200,
    description: 'Adventure history retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAdventureHistory(@Request() req) {
    const userId = req.user.userId;
    const adventures = await this.adventureService.getAdventureHistory(userId);

    return {
      adventures: adventures.map((adventure) => ({
        adventureId: adventure.id,
        scenario: adventure.scenario,
        choices: adventure.choices,
        selectedChoiceIndex: adventure.selectedChoiceIndex,
        feedback: adventure.feedback,
        scores: adventure.scores,
        createdAt: adventure.createdAt,
        evaluatedAt: adventure.evaluatedAt,
      })),
    };
  }
}
