import { SetMetadata } from '@nestjs/common'

export const ROLES_KEY = 'roles'

/**
 * Role-based authorization decorator
 *
 * @param roles - Role names to require for this route
 * @returns Decorator that sets role metadata
 */

export const Roles = (...roles: string[]): any => SetMetadata(ROLES_KEY, roles)
