import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator'
import { REQUIRED_ROLES_KEY } from '../decorators/require-roles.decorator'

@Injectable()
export class PermissionLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PermissionLoggingInterceptor.name)

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const user = request.user
    const handler = context.getHandler()
    const className = context.getClass().name
    const methodName = handler.name

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(REQUIRED_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const startTime = Date.now()

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime

        if (user && (requiredRoles || requiredPermissions)) {
          this.logger.log(
            `User ${user.id} accessed ${className}.${methodName} ` +
              `[Roles: ${requiredRoles?.join(', ') || 'none'}] ` +
              `[Permissions: ${requiredPermissions?.join(', ') || 'none'}] ` +
              `in ${duration}ms`,
          )
        }
      }),
    )
  }
}
