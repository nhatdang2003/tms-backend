import { ApiProperty } from '@nestjs/swagger'

/**
 * Base response structure for all successful API responses
 */
export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Indicates whether the request was successful',
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: 'Response data',
    example: {},
  })
  data: T

  @ApiProperty({
    description: 'Success message',
    example: 'Operation successful',
  })
  message: string

  @ApiProperty({
    description: 'Request path',
    example: '/api/users',
    required: false,
  })
  path?: string

  @ApiProperty({
    description: 'Metadata for pagination or additional information',
    required: false,
    example: {
      total: 100,
      page: 1,
      limit: 10,
      totalPages: 10,
    },
  })
  meta?: Record<string, any>
}

/**
 * Error details structure
 */
export class ErrorDetailsDto {
  @ApiProperty({
    description: 'Error code',
    example: 'VALIDATION_ERROR',
  })
  code: string

  @ApiProperty({
    description: 'Error message',
    example: 'Validation failed',
  })
  message: string

  @ApiProperty({
    description: 'Detailed error information',
    required: false,
    example: [{ field: 'email', message: 'Email is invalid' }],
  })
  details?: any[]
}

/**
 * Base response structure for all error API responses
 */
export class ApiErrorResponseDto {
  @ApiProperty({
    description: 'Indicates whether the request was successful',
    example: false,
  })
  success: boolean

  @ApiProperty({
    description: 'Error information',
    type: ErrorDetailsDto,
  })
  error: ErrorDetailsDto

  @ApiProperty({
    description: 'Request path',
    example: '/api/users',
  })
  path: string
}

/**
 * Pagination metadata structure
 */
export class PaginationMetaDto {
  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number
}

/**
 * Paginated response structure
 */
export class PaginatedResponseDto<T> extends ApiResponseDto<T[]> {
  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  override meta: PaginationMetaDto = new PaginationMetaDto()
}
