import { ConflictException, Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Transactional } from 'typeorm-transactional'
import { CreateRoleDto } from './dto/request/create-role.dto'
import { UpdateRoleDto } from './dto/request/update-role.dto'
import { Role } from './entities/role.entity'
import { PermissionsService } from '../permissions/permissions.service'
import { Permission } from '../permissions/entities/permission.entity'
import { RoleResponseDto } from './dto/response/role-response.dto'
import { PaginatedData } from 'src/common/interceptors/global-response.interceptor'
import { BaseQueryParams } from 'src/common/base/base.service'
import { BaseService } from 'src/common/base/base.service'

@Injectable()
export class RolesService extends BaseService<Role> {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @Inject(forwardRef(() => PermissionsService))
    private permissionsService: PermissionsService,
  ) {
    super(rolesRepository, ['name'], ['createdAt', 'updatedAt', 'id', 'name'])
  }

  @Transactional()
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.rolesRepository.findOne({
      where: { name: createRoleDto.name },
    })

    if (existingRole) {
      throw new ConflictException(`Vai trò với tên '${createRoleDto.name}' đã tồn tại`)
    }

    const role = this.rolesRepository.create(createRoleDto)
    return this.rolesRepository.save(role)
  }

  async findAll(queryParams: BaseQueryParams): Promise<PaginatedData<RoleResponseDto>> {
    const queryBuilder = this.rolesRepository.createQueryBuilder('entity')
    return await this.getFilteredQueryBuilder(queryBuilder, queryParams, RoleResponseDto)
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['users', 'permissions'],
    })

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`)
    }

    return role
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { name },
      relations: ['users', 'permissions'],
    })

    if (!role) {
      throw new NotFoundException(`Role with name '${name}' not found`)
    }

    return role
  }

  @Transactional()
  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id)

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.rolesRepository.findOne({
        where: { name: updateRoleDto.name },
      })

      if (existingRole) {
        throw new ConflictException(`Role with name '${updateRoleDto.name}' already exists`)
      }
    }

    Object.assign(role, updateRoleDto)
    return this.rolesRepository.save(role)
  }

  @Transactional()
  async remove(id: number): Promise<void> {
    const result = await this.rolesRepository.delete(id)

    if (result.affected === 0) {
      throw new NotFoundException(`Role with ID ${id} not found`)
    }
  }

  @Transactional()
  async assignPermissions(roleId: number, permissionIds: number[]): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    })

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`)
    }

    const permissions: Permission[] = []
    for (const permissionId of permissionIds) {
      const permission = await this.permissionsService.findOne(permissionId)
      permissions.push(permission)
    }

    role.permissions = permissions
    return this.rolesRepository.save(role)
  }

  @Transactional()
  async removePermissions(roleId: number, permissionIds: number[]): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    })

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`)
    }

    role.permissions = role.permissions.filter((permission) => !permissionIds.includes(permission.id))

    return this.rolesRepository.save(role)
  }

  @Transactional()
  async addPermissions(roleId: number, permissionIds: number[]): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    })

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`)
    }

    const permissions: Permission[] = []
    for (const permissionId of permissionIds) {
      const permission = await this.permissionsService.findOne(permissionId)
      permissions.push(permission)
    }

    role.permissions = permissions
    return this.rolesRepository.save(role)
  }

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const role = await this.rolesRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    })

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`)
    }

    return role.permissions
  }

  async hasPermission(roleId: number, permissionName: string): Promise<boolean> {
    const permissions = await this.getRolePermissions(roleId)
    return permissions.some((permission) => permission.name === permissionName)
  }
}
