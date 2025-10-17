import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateUserDto } from './dto/request/create-user.dto'
import { AdminUpdateUserDto, UpdateUserDto } from './dto/request/update-user.dto'
import { UserQueryParamDto } from './dto/request/user-query-param.dto'
import { UsersService } from './users.service'
import { UserResponseDto } from './dto/response/user-response.dto'
import { plainToInstance } from 'class-transformer'
import { PermissionsGuard } from 'src/auth/guards/permissions.guard'
import { RequirePermissions } from 'src/auth/decorators/require-permissions.decorator'

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  private readonly logger = new Logger(UsersController.name)
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('users:create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`Creating user with email: ${createUserDto.email}`)
    const user = await this.usersService.create(createUserDto)
    console.log(user)
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true })
  }

  @Get()
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  findAll(@Query() query: UserQueryParamDto, @Req() req: Request) {
    const user = req.user as { role: string; organization: string }
    console.log('user', user)
    this.logger.log(`Fetching all users with query: ${JSON.stringify(query)}`)
    return this.usersService.findAll(query, user.role, user.organization)
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Not logged in' })
  async getProfile(@Req() req: Request) {
    const user = req.user as { id: string }
    this.logger.log(`Fetching profile for user ID: ${user.id}`)
    return this.usersService.getCurrentUserProfile(+user.id)
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile successfully updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Not logged in' })
  async updateProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const user = req.user as { id: string }
    this.logger.log(`Updating profile for user ID: ${user.id}`)
    return this.usersService.update(+user.id, updateUserDto)
  }

  @Get(':id')
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Returns the user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    this.logger.log(`Fetching user with ID: ${id}`)
    return this.usersService.findOne(+id)
  }

  @Patch(':id')
  @RequirePermissions('users:update')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  async update(@Param('id') id: string, @Body() updateUserDto: AdminUpdateUserDto) {
    this.logger.log(`Updating user with ID: ${id}`)
    const user = await this.usersService.adminUpdateUser(+id, updateUserDto)
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true })
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { id: string }
    this.logger.log(`Deleting user with ID: ${id}`)
    return this.usersService.remove(+id, +user.id)
  }

  @Get(':id/roles')
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Get user roles' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Returns the user roles' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  getUserRoles(@Param('id') id: string) {
    this.logger.log(`Fetching roles for user ID: ${id}`)
    return this.usersService.getUserRole(+id)
  }
}
