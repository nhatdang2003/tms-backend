import { SetMetadata } from '@nestjs/common'

export const PERMISSIONS_KEY = 'permissions'

/**
 * Decorator để yêu cầu permissions cụ thể cho endpoint
 * @param permissions - Danh sách permissions cần thiết
 * @example
 * @RequirePermissions('users:create', 'users:read')
 * @Get('users')
 * getUsers() { ... }
 */
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions)
