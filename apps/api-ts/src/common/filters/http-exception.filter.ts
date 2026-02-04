import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * HTTP Exception Filter
 * 
 * Catches all HTTP exceptions and formats them into a consistent
 * error response structure.
 * 
 * Requirements: 12.1, 12.4, 12.5
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract error details
    const errorResponse = typeof exceptionResponse === 'string'
      ? { message: exceptionResponse }
      : (exceptionResponse as any);

    // Build consistent error response
    const errorBody = {
      statusCode: status,
      message: errorResponse.message || exception.message,
      error: this.getErrorName(status),
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(errorResponse.validationErrors && {
        validationErrors: errorResponse.validationErrors,
      }),
    };

    // Log error
    this.logger.error(
      `HTTP ${status} Error: ${request.method} ${request.url}`,
      JSON.stringify(errorBody),
    );

    response.status(status).json(errorBody);
  }

  /**
   * Get error name from HTTP status code
   * 
   * @param status - HTTP status code
   * @returns Error name
   */
  private getErrorName(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable Entity';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service Unavailable';
      default:
        return 'Error';
    }
  }
}
