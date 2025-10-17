import { SetMetadata } from '@nestjs/common'

export const REQUIRED_ROLES_KEY = 'requiredRoles'

/**
 * Decorator to specify which roles are required to access a route
 * @param roles - Array of role names required to access the route
 */
export const RequireRoles = (...roles: string[]) => SetMetadata(REQUIRED_ROLES_KEY, roles)
