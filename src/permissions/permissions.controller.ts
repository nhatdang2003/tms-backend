import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { PermissionsService } from './permissions.service'
import { CreatePermissionDto } from './dto/request/create-permission.dto'
import { UpdatePermissionDto } from './dto/request/update-permission.dto'
import { PermissionResponseDto } from './dto/response/permission-response.dto'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { BaseQueryParams } from 'src/common/base/base.service'
import { PaginatedData } from 'src/common/interceptors/global-response.interceptor'
import { plainToInstance } from 'class-transformer'
import { PermissionsGuard } from 'src/auth/guards/permissions.guard'
import { RequirePermissions } from 'src/auth/decorators/require-permissions.decorator'

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @RequirePermissions('permissions:create')
  @ApiOperation({
    summary: 'Tạo quyền mới',
    description: 'Tạo một quyền mới trong hệ thống. Chỉ ADMIN mới có thể thực hiện.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Quyền đã được tạo thành công',
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Tên quyền đã tồn tại',
  })
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    const permission = await this.permissionsService.create(createPermissionDto)
    return plainToInstance(PermissionResponseDto, permission, { excludeExtraneousValues: true })
  }

  @Get()
  @RequirePermissions('permissions:read')
  @ApiOperation({
    summary: 'Lấy danh sách quyền',
    description: 'Lấy danh sách tất cả quyền với phân trang và tìm kiếm.',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo tên, mô tả, resource, action' })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sắp xếp theo field',
    enum: ['name', 'createdAt', 'updatedAt'],
  })
  @ApiQuery({ name: 'order', required: false, description: 'Thứ tự sắp xếp', enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi trên trang', type: Number })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách quyền',
    type: [PermissionResponseDto],
  })
  async findAll(@Query() queryParams: BaseQueryParams): Promise<PaginatedData<PermissionResponseDto>> {
    return await this.permissionsService.findAll(queryParams)
  }

  @Get(':id')
  @RequirePermissions('permissions:read')
  @ApiOperation({
    summary: 'Lấy thông tin quyền theo ID',
    description: 'Lấy thông tin chi tiết của một quyền theo ID.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin quyền',
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy quyền',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PermissionResponseDto> {
    const permission = await this.permissionsService.findOne(id)
    return plainToInstance(PermissionResponseDto, permission, { excludeExtraneousValues: true })
  }

  @Patch(':id')
  @RequirePermissions('permissions:update')
  @ApiOperation({
    summary: 'Cập nhật quyền',
    description: 'Cập nhật thông tin của một quyền. Chỉ ADMIN mới có thể thực hiện.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quyền đã được cập nhật thành công',
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy quyền',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Tên quyền đã tồn tại',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const permission = await this.permissionsService.update(id, updatePermissionDto)
    return plainToInstance(PermissionResponseDto, permission, { excludeExtraneousValues: true })
  }

  @Delete(':id')
  @RequirePermissions('permissions:delete')
  @ApiOperation({
    summary: 'Xóa quyền',
    description: 'Xóa một quyền khỏi hệ thống. Chỉ ADMIN mới có thể thực hiện.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quyền đã được xóa thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy quyền',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.permissionsService.remove(id)
    return { message: 'Quyền đã được xóa thành công' }
  }

  @Get('resource/:resource/action/:action')
  @RequirePermissions('permissions:read')
  @ApiOperation({
    summary: 'Tìm quyền theo resource và action',
    description: 'Tìm tất cả quyền theo resource và action cụ thể.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách quyền',
    type: [PermissionResponseDto],
  })
  async findByResourceAndAction(
    @Param('resource') resource: string,
    @Param('action') action: string,
  ): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionsService.findByResourceAndAction(resource, action)
    return plainToInstance(PermissionResponseDto, permissions, { excludeExtraneousValues: true })
  }
}
