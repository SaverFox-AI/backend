import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Validation Exception Filter
 * 
 * Catches validation exceptions and formats them with field-level
 * error details for better client-side error handling.
 * 
 * Requirements: 12.1, 12.3, 12.4
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    // Extract validation errors
    const validationErrors = this.extractValidationErrors(exceptionResponse);

    // Build consistent error response
    const errorBody = {
      statusCode: status,
      message: validationErrors.length > 0
        ? 'Validation failed'
        : exceptionResponse.message || 'Bad Request',
      error: 'Bad Request',
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(validationErrors.length > 0 && { validationErrors }),
    };

    // Log validation error
    this.logger.warn(
      `Validation Error: ${request.method} ${request.url}`,
      JSON.stringify(errorBody),
    );

    response.status(status).json(errorBody);
  }

  /**
   * Extract validation errors from exception response
   * 
   * @param exceptionResponse - Exception response object
   * @returns Array of field-level validation errors
   */
  private extractValidationErrors(exceptionResponse: any): Array<{
    field: string;
    message: string;
  }> {
    const errors: Array<{ field: string; message: string }> = [];

    if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
      // Handle class-validator errors
      for (const error of exceptionResponse.message) {
        if (typeof error === 'string') {
          errors.push({
            field: 'unknown',
            message: error,
          });
        } else if (error.property && error.constraints) {
          const messages = Object.values(error.constraints);
          for (const message of messages) {
            errors.push({
              field: error.property,
              message: message as string,
            });
          }
        }
      }
    }

    return errors;
  }
}
