import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, FindOptionsWhere, Like } from 'typeorm'
import { Organization } from './entities/organization.entity'
import { CreateOrganizationDto, OrganizationResponseDto, UpdateOrganizationDto } from './dto'
import { PaginatedData } from 'src/common/interceptors/global-response.interceptor'
import { plainToInstance } from 'class-transformer'
import { BaseQueryParams } from 'src/common/base/base.service'
import { BaseService } from 'src/common/base/base.service'

@Injectable()
export class OrganizationsService extends BaseService<Organization> {
  private readonly logger = new Logger(OrganizationsService.name)
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {
    super(organizationRepository, ['name'], ['createdAt', 'updatedAt', 'id', 'name'])
  }

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const existingOrganization = await this.organizationRepository.findOne({
      where: { name: createOrganizationDto.name },
    })

    if (existingOrganization) {
      throw new ConflictException('Tên đơn vị đã tồn tại')
    }

    const organization = this.organizationRepository.create(createOrganizationDto)
    return await this.organizationRepository.save(organization)
  }

  async findAll(queryParams: BaseQueryParams): Promise<PaginatedData<OrganizationResponseDto>> {
    const queryBuilder = this.organizationRepository.createQueryBuilder('entity')
    return await this.getFilteredQueryBuilder(queryBuilder, queryParams, OrganizationResponseDto)
  }

  async findOne(id: number): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['users'],
    })

    if (!organization) {
      throw new NotFoundException('Không tìm thấy đơn vị')
    }

    return organization
  }

  async findByName(name: string): Promise<Organization | null> {
    return await this.organizationRepository.findOne({
      where: { name },
    })
  }

  async update(id: number, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.findOne(id)

    if (updateOrganizationDto.name && updateOrganizationDto.name !== organization.name) {
      const existingOrganization = await this.organizationRepository.findOne({
        where: { name: updateOrganizationDto.name },
      })

      if (existingOrganization) {
        throw new ConflictException('Tên đơn vị đã tồn tại')
      }
    }

    Object.assign(organization, updateOrganizationDto)
    return await this.organizationRepository.save(organization)
  }

  async remove(id: number, deletedById: number): Promise<void> {
    console.log(id, deletedById)
    this.logger.log(`Removing organization with ID: ${id}`)
    const organization = await this.findOne(id)
    organization.deletedAt = new Date()
    organization.deletedBy = deletedById
    await this.organizationRepository.save(organization)
  }
}
