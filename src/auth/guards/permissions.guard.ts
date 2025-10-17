import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator'
import { RolesService } from '../../roles/roles.service'
import { UsersService } from '../../users/users.service'

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name)

  constructor(
    private reflector: Reflector,
    private rolesService: RolesService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      this.logger.warn('User not found in request')
      throw new ForbiddenException('User not authenticated')
    }

    try {
      const fullUser = await this.usersService.findOne(user.id)

      if (!fullUser.role) {
        this.logger.warn(`User ${user.id} has no role assigned`)
        throw new ForbiddenException('User has no role assigned')
      }

      const userPermissions = await this.rolesService.getRolePermissions(fullUser.role.id)
      const userPermissionNames = userPermissions.map((permission) => permission.name)

      this.logger.debug(`User ${user.id} has permissions: ${userPermissionNames.join(', ')}`)
      this.logger.debug(`Required permissions: ${requiredPermissions.join(', ')}`)

      const hasAllPermissions = requiredPermissions.every((permission) => userPermissionNames.includes(permission))

      if (!hasAllPermissions) {
        const missingPermissions = requiredPermissions.filter((permission) => !userPermissionNames.includes(permission))
        this.logger.warn(`User ${user.id} missing permissions: ${missingPermissions.join(', ')}`)
        throw new ForbiddenException(`Bạn không có quyền truy cập tài nguyên này`)
      }

      this.logger.debug(`User ${user.id} has all required permissions`)
      return true
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error
      }
      this.logger.error(`Error checking permissions for user ${user.id}:`, error)
      throw new ForbiddenException('Error checking user permissions')
    }
  }
}
