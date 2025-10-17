import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseService } from 'src/common/base/base.service'
import { MessageConstant } from 'src/common/constant/message-constant'
import { PaginatedData } from 'src/common/interceptors/global-response.interceptor'
import { Permission } from './entities/permission.entity'
import { CreatePermissionDto } from './dto/request/create-permission.dto'
import { UpdatePermissionDto } from './dto/request/update-permission.dto'
import { PermissionResponseDto } from './dto/response/permission-response.dto'
import { BaseQueryParams } from 'src/common/base/base.service'

@Injectable()
export class PermissionsService extends BaseService<Permission> {
  private readonly logger = new Logger(PermissionsService.name)

  constructor(
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
  ) {
    super(permissionsRepository, ['name', 'description', 'resource', 'action'], ['name', 'createdAt', 'updatedAt'])
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    this.logger.log(`Creating permission with name: ${createPermissionDto.name}`)

    const existingPermission = await this.permissionsRepository.findOne({
      where: { name: createPermissionDto.name },
    })

    if (existingPermission) {
      this.logger.error(`Permission with name ${createPermissionDto.name} already exists`)
      throw new ConflictException(`Quyền với tên '${createPermissionDto.name}' đã tồn tại`)
    }

    const permission = this.permissionsRepository.create(createPermissionDto)
    const savedPermission = await this.permissionsRepository.save(permission)

    this.logger.log(`Permission created with ID: ${savedPermission.id}`)
    return savedPermission
  }

  async findAll(queryParams: BaseQueryParams): Promise<PaginatedData<PermissionResponseDto>> {
    this.logger.log('Fetching all permissions with query params', queryParams)
    const queryBuilder = this.permissionsRepository.createQueryBuilder('permission')

    const dataList = await this.getFilteredQueryBuilder(queryBuilder, queryParams, PermissionResponseDto)
    return dataList
  }

  async findOne(id: number): Promise<Permission> {
    this.logger.log(`Finding permission with ID: ${id}`)
    const permission = await this.permissionsRepository.findOne({
      where: { id },
      relations: ['roles'],
    })

    if (!permission) {
      this.logger.error(`Permission with ID ${id} not found`)
      throw new NotFoundException(MessageConstant.getIdNotFoundMessage('Quyền', id))
    }

    return permission
  }

  async findByName(name: string): Promise<Permission> {
    this.logger.log(`Finding permission by name: ${name}`)
    const permission = await this.permissionsRepository.findOne({
      where: { name },
      relations: ['roles'],
    })

    if (!permission) {
      this.logger.error(`Permission with name ${name} not found`)
      throw new NotFoundException(`Quyền với tên '${name}' không tồn tại`)
    }

    return permission
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    this.logger.log(`Updating permission with ID: ${id}`)

    const permission = await this.findOne(id)

    if (updatePermissionDto.name && updatePermissionDto.name !== permission.name) {
      const existingPermission = await this.permissionsRepository.findOne({
        where: { name: updatePermissionDto.name },
      })

      if (existingPermission) {
        this.logger.error(`Permission with name ${updatePermissionDto.name} already exists`)
        throw new ConflictException(`Quyền với tên '${updatePermissionDto.name}' đã tồn tại`)
      }
    }

    Object.assign(permission, updatePermissionDto)
    const updatedPermission = await this.permissionsRepository.save(permission)

    this.logger.log(`Permission updated with ID: ${updatedPermission.id}`)
    return updatedPermission
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing permission with ID: ${id}`)

    const permission = await this.findOne(id)
    await this.permissionsRepository.remove(permission)

    this.logger.log(`Permission removed with ID: ${id}`)
  }

  async findByResourceAndAction(resource: string, action: string): Promise<Permission[]> {
    this.logger.log(`Finding permissions by resource: ${resource} and action: ${action}`)

    return await this.permissionsRepository.find({
      where: { resource, action },
      relations: ['roles'],
    })
  }

  async findByRoleId(roleId: number): Promise<Permission[]> {
    this.logger.log(`Finding permissions for role ID: ${roleId}`)

    return await this.permissionsRepository
      .createQueryBuilder('permission')
      .innerJoin('permission.roles', 'role')
      .where('role.id = :roleId', { roleId })
      .getMany()
  }
}
