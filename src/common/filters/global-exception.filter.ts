import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

/**
 * Global Exception Filter
 * Provides consistent error response format across the API
 * Handles Prisma errors, HTTP exceptions, and unexpected errors
 * Following Constitution Principle VII: Backend Modular Architecture
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] | undefined;
    let code: string | undefined;

    // Handle HTTP Exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).errors;
        code = (exceptionResponse as any).code;
      } else {
        message = exceptionResponse;
      }
    }
    // Handle Prisma Errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = this.handlePrismaError(exception);
      status = prismaError.status;
      message = prismaError.message;
      code = prismaError.code;
    }
    // Handle Prisma Validation Errors
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
      code = 'VALIDATION_ERROR';
    }
    // Handle Unknown Errors
    else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    }

    // Log error for monitoring
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
    );

    // Send structured error response
    response.status(status).json({
      statusCode: status,
      message,
      ...(code && { code }),
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
    code: string;
  } {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const target = (error.meta?.target as string[]) || [];
        return {
          status: HttpStatus.CONFLICT,
          message: `A record with this ${target.join(', ')} already exists`,
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
        };
      case 'P2025':
        // Record not found
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          code: 'NOT_FOUND',
        };
      case 'P2003':
        // Foreign key constraint failed
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Referenced record does not exist',
          code: 'FOREIGN_KEY_CONSTRAINT',
        };
      case 'P2014':
        // Required relation violation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Required relation missing',
          code: 'REQUIRED_RELATION_VIOLATION',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error occurred',
          code: 'DATABASE_ERROR',
        };
    }
  }
}
