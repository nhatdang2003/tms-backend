import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiParam } from '@nestjs/swagger'
import { OrganizationsService } from './organizations.service'
import { CreateOrganizationDto, UpdateOrganizationDto, OrganizationResponseDto } from './dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { plainToInstance } from 'class-transformer'
import { RequirePermissions } from 'src/auth/decorators/require-permissions.decorator'
import { PermissionsGuard } from 'src/auth/guards/permissions.guard'
import { BaseQueryParams } from 'src/common/base/base.service'
import { PaginatedData } from 'src/common/interceptors/global-response.interceptor'
import { Request } from 'express'

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class OrganizationsController {
  private readonly logger = new Logger(OrganizationsController.name)
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @RequirePermissions('organizations:create')
  @ApiOperation({ summary: 'Tạo đơn vị mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Đơn vị đã được tạo thành công',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Tên đơn vị đã tồn tại',
  })
  async create(@Body() createOrganizationDto: CreateOrganizationDto) {
    const organization = await this.organizationsService.create(createOrganizationDto)
    return plainToInstance(OrganizationResponseDto, organization, { excludeExtraneousValues: true })
  }

  @Get()
  @RequirePermissions('organizations:read')
  @ApiOperation({ summary: 'Lấy danh sách đơn vị' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm kiếm theo tên đơn vị' })
  @ApiQuery({ name: 'sort', required: false, enum: ['name', 'createdAt', 'updatedAt'] })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng mỗi trang (mặc định: 10)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang (mặc định: 1)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách đơn vị',
  })
  async findAll(@Query() queryParams: BaseQueryParams): Promise<PaginatedData<OrganizationResponseDto>> {
    return await this.organizationsService.findAll(queryParams)
  }

  @Get(':id')
  @RequirePermissions('organizations:read')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết đơn vị' })
  @ApiParam({ name: 'id', type: Number, description: 'ID đơn vị' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin chi tiết đơn vị',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy đơn vị',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const organization = await this.organizationsService.findOne(id)
    return plainToInstance(OrganizationResponseDto, organization, { excludeExtraneousValues: true })
  }

  @Patch(':id')
  @RequirePermissions('organizations:update')
  @ApiOperation({ summary: 'Cập nhật thông tin đơn vị' })
  @ApiParam({ name: 'id', type: Number, description: 'ID đơn vị' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đơn vị đã được cập nhật thành công',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy đơn vị',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Tên đơn vị đã tồn tại',
  })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    const organization = await this.organizationsService.update(id, updateOrganizationDto)
    return plainToInstance(OrganizationResponseDto, organization, { excludeExtraneousValues: true })
  }

  @Delete(':id')
  @RequirePermissions('organizations:delete')
  @ApiOperation({ summary: 'Xóa đơn vị' })
  @ApiParam({ name: 'id', type: Number, description: 'ID đơn vị' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đơn vị đã được xóa thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy đơn vị',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể xóa đơn vị đang có người dùng',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as { id: string }
    this.logger.log(`Deleting organization with ID: ${id}`)
    return this.organizationsService.remove(+id, +user.id)
  }
}
