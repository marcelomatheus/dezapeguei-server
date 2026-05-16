import { ApiProperty } from '@nestjs/swagger';

/**
 * Structured Error Response DTO
 * Provides consistent error format for API responses
 * Following Constitution Principle VII: Backend Modular Architecture
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message describing what went wrong',
    example: 'Validation failed',
  })
  message: string;

  @ApiProperty({
    description: 'Optional error code for client-side handling',
    example: 'VALIDATION_ERROR',
    required: false,
  })
  code?: string;

  @ApiProperty({
    description: 'Optional array of detailed error messages',
    example: ['Email must be valid', 'Password must be at least 8 characters'],
    required: false,
    type: [String],
  })
  errors?: string[];

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2026-03-29T12:34:56.789Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path that caused the error',
    example: '/api/offers',
  })
  path: string;
}

/**
 * Common Error Codes
 * Standardized error codes for client-side handling
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNIQUE_CONSTRAINT_VIOLATION = 'UNIQUE_CONSTRAINT_VIOLATION',
  FOREIGN_KEY_CONSTRAINT = 'FOREIGN_KEY_CONSTRAINT',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
