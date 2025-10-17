import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'

interface RequestUser {
  id: string
  email: string
  roles: string[]
}

interface Request {
  user: RequestUser
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const user = request.user

    if (!user || !Array.isArray(user.roles)) {
      throw new ForbiddenException('You do not have permission to access this resource')
    }

    const hasRequiredRole = requiredRoles.some((role) => user.roles.includes(role))

    if (!hasRequiredRole) {
      throw new ForbiddenException('You do not have permission to access this resource')
    }

    return true
  }
}
