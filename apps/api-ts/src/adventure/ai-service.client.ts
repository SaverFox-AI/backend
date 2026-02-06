import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * AI Service Client
 * 
 * HTTP client for communicating with the AI service.
 * Implements retry logic with exponential backoff and timeout configuration.
 * 
 * Requirements: 8.1, 9.1, 14.3
 */

export interface GenerateAdventureRequest {
  user_age: number;
  allowance: number;
  goal_context?: string;
  recent_activities?: string[];
}

export interface GenerateAdventureResponse {
  scenario: string;
  choices: string[];
  opik_trace_id: string;
}

export interface EvaluateChoiceRequest {
  scenario: string;
  choice_index: number;
  choice_text: string;
  user_age: number;
  amounts?: Record<string, number>;
}

export interface Scores {
  financial_wisdom: number;
  long_term_thinking: number;
  responsibility: number;
}

export interface EvaluateChoiceResponse {
  feedback: string;
  scores: Scores;
  opik_trace_id: string;
}

@Injectable()
export class AIServiceClient {
  private readonly logger = new Logger(AIServiceClient.name);
  private readonly client: AxiosInstance;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private readonly timeout: number;

  constructor(private readonly configService: ConfigService) {
    const aiServiceUrl = this.configService.get<string>(
      'AI_SERVICE_URL',
      'http://localhost:8000',
    );
    
    this.maxRetries = this.configService.get<number>('AI_SERVICE_MAX_RETRIES', 3);
    this.retryDelay = this.configService.get<number>('AI_SERVICE_RETRY_DELAY', 1000);
    this.timeout = this.configService.get<number>('AI_SERVICE_TIMEOUT', 30000);

    this.client = axios.create({
      baseURL: aiServiceUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.logger.log(`AI Service Client initialized with URL: ${aiServiceUrl}`);
  }

  /**
   * Generate a money adventure scenario
   * 
   * @param request - Generation request with user context
   * @returns Generated scenario with choices and trace ID
   * @throws ServiceUnavailableException if AI service is unavailable after retries
   */
  async generateAdventure(
    request: GenerateAdventureRequest,
  ): Promise<GenerateAdventureResponse> {
    return this.retryWithBackoff(async () => {
      try {
        this.logger.debug(
          `Generating adventure for age ${request.user_age}, allowance $${request.allowance}`,
        );

        const response = await this.client.post<GenerateAdventureResponse>(
          '/api/adventure/generate',
          request,
        );

        this.logger.debug(
          `Successfully generated adventure with trace ID: ${response.data.opik_trace_id}`,
        );

        return response.data;
      } catch (error) {
        this.handleError('generate adventure', error);
      }
    });
  }

  /**
   * Evaluate a player's choice
   * 
   * @param request - Evaluation request with scenario and choice
   * @returns Feedback, scores, and trace ID
   * @throws ServiceUnavailableException if AI service is unavailable after retries
   */
  async evaluateChoice(
    request: EvaluateChoiceRequest,
  ): Promise<EvaluateChoiceResponse> {
    return this.retryWithBackoff(async () => {
      try {
        this.logger.debug(
          `Evaluating choice ${request.choice_index} for age ${request.user_age}`,
        );

        const response = await this.client.post<EvaluateChoiceResponse>(
          '/api/adventure/evaluate',
          request,
        );

        this.logger.debug(
          `Successfully evaluated choice with trace ID: ${response.data.opik_trace_id}`,
        );

        return response.data;
      } catch (error) {
        this.handleError('evaluate choice', error);
      }
    });
  }

  /**
   * Retry a function with exponential backoff
   * 
   * @param fn - Function to retry
   * @returns Result of the function
   * @throws ServiceUnavailableException if all retries fail
   */
  private async retryWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.maxRetries && this.isRetryableError(error)) {
          const delay = this.retryDelay * Math.pow(2, attempt);
          this.logger.warn(
            `AI service request failed (attempt ${attempt + 1}/${this.maxRetries + 1}). ` +
            `Retrying in ${delay}ms...`,
          );
          await this.sleep(delay);
        } else {
          break;
        }
      }
    }

    this.logger.error(
      `AI service request failed after ${this.maxRetries + 1} attempts`,
      lastError.stack,
    );

    throw new ServiceUnavailableException(
      'AI service is currently unavailable. Please try again later.',
    );
  }

  /**
   * Check if an error is retryable
   * 
   * @param error - Error to check
   * @returns True if the error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Retry on network errors
      if (!axiosError.response) {
        return true;
      }

      // Retry on 5xx server errors and 429 rate limit
      const status = axiosError.response.status;
      return status >= 500 || status === 429;
    }

    return false;
  }

  /**
   * Handle errors from AI service
   * 
   * @param operation - Operation that failed
   * @param error - Error that occurred
   * @throws Error with appropriate message
   */
  private handleError(operation: string, error: any): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data as any;
        
        this.logger.error(
          `AI service ${operation} failed with status ${status}: ${JSON.stringify(data)}`,
        );

        throw new Error(
          `AI service error: ${data?.message || axiosError.message}`,
        );
      } else if (axiosError.request) {
        this.logger.error(
          `AI service ${operation} failed: No response received`,
        );
        throw new Error('AI service did not respond');
      }
    }

    this.logger.error(`AI service ${operation} failed:`, error);
    throw error;
  }

  /**
   * Sleep for a specified duration
   * 
   * @param ms - Duration in milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
