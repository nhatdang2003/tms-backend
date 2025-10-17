import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { REQUIRED_ROLES_KEY } from '../decorators/require-roles.decorator'
import { ROLE } from 'src/common/enum/user-type.enum'

interface RequestUser {
  id: number
  email: string
  role: string
}

interface Request {
  user: RequestUser
  method: string
  route: {
    path: string
  }
}

@Injectable()
export class RoleBasedAuthGuard implements CanActivate {
  private readonly logger = new Logger(RoleBasedAuthGuard.name)

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(REQUIRED_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const { user, method, route } = request
    const path = route.path

    this.logger.debug(`Checking access for ${method} ${path} with required roles: ${requiredRoles.join(', ')}`)

    if (!user || !user.role) {
      this.logger.warn(`Access denied for ${method} ${path}: Missing user or roles`)
      throw new ForbiddenException('You do not have permission to access this resource')
    }

    if (user.role === ROLE.ADMIN.toString()) {
      this.logger.debug(`Access granted for ${method} ${path}: User has admin role`)
      return true
    }

    const hasRequiredRole = requiredRoles.some((role) => user.role === role)

    if (hasRequiredRole) {
      this.logger.debug(`Access granted for ${method} ${path}: User has required role`)
      return true
    }

    this.logger.warn(`Access denied for ${method} ${path}: User lacks required roles`)
    throw new ForbiddenException('You do not have permission to access this resource')
  }
}
