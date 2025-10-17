import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseIntPipe,
  Query,
  Logger,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateRoleDto } from './dto/request/create-role.dto'
import { UpdateRoleDto } from './dto/request/update-role.dto'
import { RolesService } from './roles.service'
import { PermissionsGuard } from 'src/auth/guards/permissions.guard'
import { RequirePermissions } from 'src/auth/decorators/require-permissions.decorator'
import { BaseQueryParams } from 'src/common/base/base.service'

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class RolesController {
  private readonly logger = new Logger(RolesController.name)
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermissions('roles:create')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto)
  }

  @Get()
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of all roles' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  findAll(@Query() queryParams: BaseQueryParams) {
    this.logger.log(`Fetching all roles with query: ${JSON.stringify(queryParams)}`)
    return this.rolesService.findAll(queryParams)
  }

  @Get(':id')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Returns the role' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id)
  }

  @Patch(':id')
  @RequirePermissions('roles:update')
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role successfully updated' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto)
  }

  @Delete(':id')
  @RequirePermissions('roles:delete')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role successfully deleted' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id)
  }

  @Get(':id/permissions')
  @RequirePermissions('permissions:read')
  @ApiOperation({ summary: 'Lấy tất cả permissions của role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Danh sách permissions của role' })
  async getRolePermissions(@Param('id', ParseIntPipe) id: number) {
    const permissions = await this.rolesService.getRolePermissions(id)
    return {
      roleId: id,
      permissions: permissions.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        resource: p.resource,
        action: p.action,
      })),
    }
  }

  @Post(':id/permissions/add')
  @RequirePermissions('permissions:add')
  @ApiOperation({
    summary: 'Thêm permissions vào role',
    description: 'Thêm permissions mới mà không xóa permissions cũ',
  })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissionIds: {
          type: 'array',
          items: { type: 'number' },
          example: [5, 6, 7],
        },
      },
    },
  })
  async addPermissions(@Param('id', ParseIntPipe) id: number, @Body() body: { permissionIds: number[] }) {
    const role = await this.rolesService.addPermissions(id, body.permissionIds)
    return {
      message: `Đã thêm ${body.permissionIds.length} permissions vào role ${role.name}`,
      role: {
        id: role.id,
        name: role.name,
        permissionCount: role.permissions?.length || 0,
      },
    }
  }

  @Post(':id/permissions/remove')
  @RequirePermissions('permissions:remove')
  @ApiOperation({
    summary: 'Xóa permissions khỏi role',
    description: 'Xóa các permissions cụ thể khỏi role',
  })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissionIds: {
          type: 'array',
          items: { type: 'number' },
          example: [3, 4],
        },
      },
    },
  })
  async removePermissions(@Param('id', ParseIntPipe) id: number, @Body() body: { permissionIds: number[] }) {
    const role = await this.rolesService.removePermissions(id, body.permissionIds)
    return {
      message: `Đã xóa ${body.permissionIds.length} permissions khỏi role ${role.name}`,
      role: {
        id: role.id,
        name: role.name,
        permissionCount: role.permissions?.length || 0,
      },
    }
  }

  @Get(':id/permissions/check/:permissionName')
  @RequirePermissions('permissions:read')
  @ApiOperation({ summary: 'Kiểm tra role có permission cụ thể không' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiParam({ name: 'permissionName', description: 'Permission name (e.g., users:create)' })
  async checkPermission(@Param('id', ParseIntPipe) id: number, @Param('permissionName') permissionName: string) {
    const hasPermission = await this.rolesService.hasPermission(id, permissionName)
    return {
      roleId: id,
      permissionName,
      hasPermission,
    }
  }
}
