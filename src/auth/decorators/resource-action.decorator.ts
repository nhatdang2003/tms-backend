import { SetMetadata } from '@nestjs/common'
import { RequirePermissions } from './require-permissions.decorator'

/**
 * Helper decorator để tạo permission theo format resource:action
 * @param resource - Tên resource (vd: 'users', 'roles', 'organizations')
 * @param actions - Danh sách actions (vd: 'create', 'read', 'update', 'delete')
 * @example
 * @ResourceAction('users', 'create', 'read')
 * @Get('users')
 * getUsers() { ... }
 */
export const ResourceAction = (resource: string, ...actions: string[]) => {
  const permissions = actions.map((action) => `${resource}:${action}`)
  return RequirePermissions(...permissions)
}

/**
 * Các helper decorators cho CRUD operations phổ biến
 */
export const CanCreate = (resource: string) => ResourceAction(resource, 'create')
export const CanRead = (resource: string) => ResourceAction(resource, 'read')
export const CanUpdate = (resource: string) => ResourceAction(resource, 'update')
export const CanDelete = (resource: string) => ResourceAction(resource, 'delete')
export const CanManage = (resource: string) => ResourceAction(resource, 'create', 'read', 'update', 'delete')

/**
 * Decorator cho admin-only endpoints
 */
export const AdminOnly = () => RequirePermissions('admin:*')

/**
 * Decorator cho owner hoặc admin
 */
export const OwnerOrAdmin = (resource: string) => RequirePermissions(`${resource}:own`, 'admin:*')
