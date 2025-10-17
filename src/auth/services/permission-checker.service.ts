import { Injectable, Logger } from '@nestjs/common'
import { RolesService } from '../../roles/roles.service'
import { UsersService } from '../../users/users.service'

@Injectable()
export class PermissionCheckerService {
  private readonly logger = new Logger(PermissionCheckerService.name)

  constructor(
    private rolesService: RolesService,
    private usersService: UsersService,
  ) {}

  async hasPermission(userId: number, permissionName: string): Promise<boolean> {
    try {
      const user = await this.usersService.findOne(userId)

      if (!user.role) {
        return false
      }

      return await this.rolesService.hasPermission(user.role.id, permissionName)
    } catch (error) {
      this.logger.error(`Error checking permission ${permissionName} for user ${userId}:`, error)
      return false
    }
  }

  async hasAllPermissions(userId: number, permissions: string[]): Promise<boolean> {
    try {
      const user = await this.usersService.findOne(userId)

      if (!user.role) {
        return false
      }

      const userPermissions = await this.rolesService.getRolePermissions(user.role.id)
      const userPermissionNames = userPermissions.map((p) => p.name)

      return permissions.every((permission) => userPermissionNames.includes(permission))
    } catch (error) {
      this.logger.error(`Error checking permissions for user ${userId}:`, error)
      return false
    }
  }

  async hasAnyPermission(userId: number, permissions: string[]): Promise<boolean> {
    try {
      const user = await this.usersService.findOne(userId)

      if (!user.role) {
        return false
      }

      const userPermissions = await this.rolesService.getRolePermissions(user.role.id)
      const userPermissionNames = userPermissions.map((p) => p.name)

      return permissions.some((permission) => userPermissionNames.includes(permission))
    } catch (error) {
      this.logger.error(`Error checking permissions for user ${userId}:`, error)
      return false
    }
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    try {
      const user = await this.usersService.findOne(userId)

      if (!user.role) {
        return []
      }

      const permissions = await this.rolesService.getRolePermissions(user.role.id)
      return permissions.map((p) => p.name)
    } catch (error) {
      this.logger.error(`Error getting permissions for user ${userId}:`, error)
      return []
    }
  }

  async canAccessResource(userId: number, resource: string, action: string): Promise<boolean> {
    const permissionName = `${resource}:${action}`
    return await this.hasPermission(userId, permissionName)
  }

  async isAdmin(userId: number): Promise<boolean> {
    return await this.hasPermission(userId, 'admin:*')
  }

  async canManageResource(userId: number, resource: string): Promise<boolean> {
    const requiredPermissions = [`${resource}:create`, `${resource}:read`, `${resource}:update`, `${resource}:delete`]

    return await this.hasAllPermissions(userId, requiredPermissions)
  }

  async filterByPermissions<T>(
    userId: number,
    items: T[],
    getResourceName: (item: T) => string,
    action: string = 'read',
  ): Promise<T[]> {
    const userPermissions = await this.getUserPermissions(userId)
    const isAdmin = userPermissions.includes('admin:*')

    if (isAdmin) {
      return items
    }

    return items.filter((item) => {
      const resourceName = getResourceName(item)
      const requiredPermission = `${resourceName}:${action}`
      return userPermissions.includes(requiredPermission)
    })
  }
}
