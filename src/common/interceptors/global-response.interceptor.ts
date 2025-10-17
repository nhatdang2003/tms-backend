import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { Request, Response as ExpressResponse } from 'express'
import { throwError } from 'rxjs'

export interface Response<T> {
  success: boolean
  data: T
  meta?: Record<string, any>
  message: string
  path?: string
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  page?: number
  limit?: number
}

@Injectable()
export class GlobalResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  private readonly logger = new Logger(GlobalResponseInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const httpContext = context.switchToHttp()
    const request = httpContext.getRequest<Request>()
    const response = httpContext.getResponse<ExpressResponse>()
    const statusCode = response.statusCode
    const method = request.method
    const url = request.url

    this.logger.debug(`Processing ${method} ${url}`)

    return next.handle().pipe(
      map((data: unknown): Response<T> => {
        if (this.isResponseType(data)) {
          return data as Response<T>
        }

        const responseBody: Response<T> = {
          success: true,
          message: this.getDefaultSuccessMessage(statusCode),
          path: url,
          data: {} as T,
        }

        if (this.isPaginatedData(data)) {
          responseBody.data = data.items as T
          responseBody.meta = {
            total: data.total,
            page: data.page || 1,
            limit: data.limit || data.items.length,
            totalPages: Math.ceil(data.total / (data.limit || data.items.length)),
          }
        } else {
          responseBody.data = data as T
        }

        this.logger.debug(`Response for ${method} ${url} prepared successfully`)
        return responseBody
      }),
      catchError((err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        const errorStack = err instanceof Error ? err.stack : undefined
        this.logger.error(`Error processing ${method} ${url}: ${errorMessage}`, errorStack)
        return throwError(() => err)
      }),
    )
  }

  private isResponseType(data: unknown): boolean {
    return typeof data === 'object' && data !== null && 'success' in data
  }

  private isPaginatedData(data: unknown): data is PaginatedData<any> {
    return (
      typeof data === 'object' &&
      data !== null &&
      'items' in data &&
      'total' in data &&
      Array.isArray((data as PaginatedData<any>).items) &&
      typeof (data as PaginatedData<any>).total === 'number'
    )
  }

  private getDefaultSuccessMessage(statusCode: number): string {
    switch (statusCode) {
      case 200:
        return 'Operation successful'
      case 201:
        return 'Resource created successfully'
      case 204:
        return 'Resource deleted successfully'
      default:
        return 'Success'
    }
  }
}
