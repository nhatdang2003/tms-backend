import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Response, Request } from 'express'
import { TypeORMError, QueryFailedError } from 'typeorm'
import { ConfigService } from '@nestjs/config'

interface HttpExceptionResponse {
  message: string | string[]
  errors?: any[]
  statusCode?: number
  error?: string
  key?: string
}

interface ErrorResponse {
  success: boolean
  error: {
    statusCode: number
    message: string
    details?: any[]
    key?: string
  }
  stack?: string
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)
  private readonly isDevelopment: boolean

  constructor(private readonly configService: ConfigService) {
    this.isDevelopment = configService.get<string>('NODE_ENV') !== 'production'
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status: HttpStatus
    let message: string
    let errors: any[] = []
    let stack: string | undefined
    let key: string | undefined

    if (exception instanceof HttpException) {
      status = exception.getStatus() as HttpStatus
      const errorResponse = exception.getResponse()

      if (typeof errorResponse === 'object') {
        const typedResponse = errorResponse as HttpExceptionResponse
        message =
          typeof typedResponse.message === 'string'
            ? typedResponse.message
            : Array.isArray(typedResponse.message)
              ? typedResponse.message.join(', ')
              : exception.message
        errors = typedResponse.errors || []
        key = typedResponse.key
        if (
          status === HttpStatus.BAD_REQUEST &&
          typedResponse.error &&
          typedResponse.error.toString() === 'Bad Request'
        ) {
          message = errorResponse['message'] || 'Bad request'

          if (Array.isArray(typedResponse.message)) {
            errors = typedResponse.message.map((msg) => {
              if (typeof msg === 'object' && msg !== null) {
                return msg
              }

              return { message: msg }
            })
          }
        }
      } else {
        message = 'Bad request'
      }

      if (this.isDevelopment && exception.stack) {
        stack = exception.stack
      }
    } else if (exception instanceof QueryFailedError) {
      if (exception.message.includes('Duplicate entry')) {
        status = HttpStatus.CONFLICT
        message = 'A record with this value already exists'
      } else if (exception.message.includes('foreign key constraint fails')) {
        status = HttpStatus.CONFLICT
        message = 'Cannot perform this operation due to related data constraints'
      } else {
        status = HttpStatus.BAD_REQUEST
        message = 'Database query failed'
      }

      if (this.isDevelopment) {
        errors.push({ detail: exception.message })
        stack = exception.stack
      }
    } else if (exception instanceof TypeORMError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      message = 'Database operation failed'

      if (this.isDevelopment) {
        errors.push({ detail: exception.message })
        stack = exception.stack
      }
    } else if (exception instanceof Error && exception.name === 'TimeoutError') {
      status = HttpStatus.REQUEST_TIMEOUT
      message = 'Request timed out'

      if (this.isDevelopment) {
        stack = exception.stack
      }
    } else if (
      exception instanceof Error &&
      (exception.message.includes('ECONNREFUSED') ||
        exception.message.includes('ENOTFOUND') ||
        exception.message.includes('network'))
    ) {
      status = HttpStatus.SERVICE_UNAVAILABLE
      message = 'Service temporarily unavailable'

      if (this.isDevelopment) {
        errors.push({ detail: exception.message })
        stack = exception.stack
      }
    } else if (
      exception instanceof Error &&
      (exception.name === 'ValidationError' || exception.message.includes('validation'))
    ) {
      status = HttpStatus.BAD_REQUEST
      message = 'Validation failed'

      if (this.isDevelopment) {
        errors.push({ detail: exception.message })
        stack = exception.stack
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      message = 'Internal server error'

      this.logger.error(`Unhandled exception: ${exception instanceof Error ? exception.message : String(exception)}`)
      if (exception instanceof Error) {
        this.logger.error(exception.stack)
        if (this.isDevelopment) {
          stack = exception.stack
        }
      }
    }

    this.logger.error(`[${status}] ${message} - ${request.method} ${request.url}`)

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        statusCode: status,
        message,
        details: errors.length ? errors : undefined,
        key,
      },
    }

    if (this.isDevelopment && stack) {
      errorResponse.stack = stack
    }

    response.status(status).json(errorResponse)
  }
}
