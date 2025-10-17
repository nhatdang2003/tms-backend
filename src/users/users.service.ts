import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseService } from 'src/common/base/base.service'
import { MessageConstant } from 'src/common/constant/message-constant'
import { PaginatedData } from 'src/common/interceptors/global-response.interceptor'
import { Repository } from 'typeorm'
import { CreateUserDto } from './dto/request/create-user.dto'
import { AdminUpdateUserDto, UpdateUserDto } from './dto/request/update-user.dto'
import { UserQueryParamDto } from './dto/request/user-query-param.dto'
import { UserProfileDto } from './dto/response/user-profile.dto'
import { UserResponseAdminDto } from './dto/response/user-response-admin.dto'
import { User } from './entities/user.entity'
import { Transactional } from 'typeorm-transactional'
import { ROLE } from 'src/common/enum/user-type.enum'

@Injectable()
export class UsersService extends BaseService<User> {
  private readonly logger = new Logger(UsersService.name)
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super(
      usersRepository,
      ['email', 'firstName', 'lastName', 'phoneNumber'],
      ['createdAt', 'updatedAt', 'status', 'id', 'email', 'firstName', 'lastName'],
    )
  }

  @Transactional()
  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`)
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    })

    if (existingUser) {
      this.logger.warn(`User with email ${createUserDto.email} already exists`)
      throw new ConflictException('Email đã tồn tại')
    }

    const user = this.usersRepository.create({
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      password: createUserDto.password,
      phoneNumber: createUserDto.phoneNumber,
      organizationId: createUserDto.organizationId,
      roleId: createUserDto.roleId,
    })

    const savedUser = await this.usersRepository.save(user)
    this.logger.log(`User created with ID: ${savedUser.id}`)

    return this.findOne(savedUser.id)
  }

  async findAll(
    queryParams: UserQueryParamDto,
    roleName?: string,
    organizationName?: string,
  ): Promise<PaginatedData<UserResponseAdminDto>> {
    this.logger.log('Fetching all users with query params', queryParams)
    const queryBuilder = this.usersRepository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.role', 'role')
      .leftJoinAndSelect('entity.organization', 'organization')
    if (roleName === ROLE.SUPERVISOR) {
      queryBuilder.andWhere('organization.name = :organizationName', { organizationName: organizationName })
    }
    if (queryParams.organizationId) {
      queryBuilder.andWhere('organization.id = :organizationId', { organizationId: queryParams.organizationId })
    }
    if (queryParams.status !== undefined) {
      queryBuilder.andWhere('entity.status = :status', { status: queryParams.status })
    }
    if (queryParams.role) {
      queryBuilder.andWhere('role.name = :role', { role: queryParams.role })
    }
    const dataList = await this.getFilteredQueryBuilder(queryBuilder, queryParams, UserResponseAdminDto)
    return dataList
  }

  async findOne(id: number): Promise<User> {
    this.logger.log(`Finding user with ID: ${id}`)
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'organization'],
      select: ['id', 'email', 'firstName', 'lastName', 'status', 'password', 'createdAt', 'updatedAt', 'phoneNumber'],
    })

    if (!user) {
      this.logger.error(`User with ID ${id} not found`)
      throw new NotFoundException(MessageConstant.getIdNotFoundMessage('Người dùng', id))
    }

    return user
  }

  async findOneByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user by email: ${email}`)
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['role', 'organization'],
      select: ['id', 'email', 'firstName', 'lastName', 'status', 'password', 'createdAt', 'updatedAt'],
    })
    return user
  }

  async getCurrentUserProfile(userId: number): Promise<UserProfileDto> {
    this.logger.log(`Fetching profile for user ID: ${userId}`)
    const user = await this.findById(userId, ['role', 'organization'])
    if (!user) {
      this.logger.error(`User with ID ${userId} not found`)
      throw new NotFoundException(`User with ID ${userId} not found`)
    }
    return this.toDto(UserProfileDto, { ...user, role: user.role, organization: user.organization })
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.log(`Finding user by email: ${email}`)

    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['role', 'organization'],
      select: ['email', 'password'],
    })
    console.log(user)

    if (!user) {
      this.logger.error(`User with email ${email} not found`)
      throw new NotFoundException(`User with email ${email} not found`)
    }

    return user
  }

  @Transactional()
  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserProfileDto> {
    this.logger.log(`Updating user ID: ${id} with data: ${JSON.stringify(updateUserDto)}`)
    const user = await this.findById(id)
    if (!user) {
      throw new NotFoundException(MessageConstant.getIdNotFoundMessage('Người dùng', id))
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      })

      if (existingUser) {
        this.logger.error(`User with email ${updateUserDto.email} already exists`)
        throw new ConflictException('Email đã tồn tại')
      }
    }

    Object.assign(user, updateUserDto)

    const savedUser = await this.usersRepository.save(user)
    this.logger.log(`User ID: ${id} updated successfully`)
    return this.getCurrentUserProfile(savedUser.id)
  }

  async remove(id: number, deletedById: number): Promise<void> {
    console.log(id, deletedById)
    this.logger.log(`Removing user with ID: ${id}`)
    const user = await this.findOne(id)
    user.deletedAt = new Date()
    user.deletedBy = deletedById
    await this.usersRepository.save(user)
  }

  async hasRole(userId: number, roleName: string): Promise<boolean> {
    this.logger.log(`Checking if user ID: ${userId} has role: ${roleName}`)
    const user = await this.findOne(userId)
    return user.hasRole(roleName)
  }

  async getUserRole(userId: number): Promise<string> {
    this.logger.log(`Fetching roles for user ID: ${userId}`)
    const user = await this.findOne(userId)
    return user.getRoleName
  }

  @Transactional()
  async updatePassword(userId: number, newPassword: string): Promise<User> {
    this.logger.log(`Updating password for user ID: ${userId}`)
    const user = await this.findOne(userId)
    user.password = newPassword
    return this.usersRepository.save(user)
  }

  @Transactional()
  async adminUpdateUser(id: number, updateUserDto: AdminUpdateUserDto): Promise<UserProfileDto> {
    this.logger.log(`Updating user ID: ${id} with data: ${JSON.stringify(updateUserDto)}`)
    const user = await this.findById(id)
    if (!user) {
      throw new NotFoundException(MessageConstant.getIdNotFoundMessage('Người dùng', id))
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      })

      if (existingUser) {
        this.logger.error(`User with email ${updateUserDto.email} already exists`)
        throw new ConflictException('Email đã tồn tại')
      }
    }

    Object.assign(user, updateUserDto)

    const savedUser = await this.usersRepository.save(user)

    this.logger.log(`User ID: ${id} updated successfully`)
    return this.getCurrentUserProfile(savedUser.id)
  }
}
