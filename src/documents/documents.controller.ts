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
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger'
import { DocumentsService } from './documents.service'
import { CreateDocumentDto } from './dto/request/create-document.dto'
import { UpdateDocumentDto } from './dto/request/update-document.dto'
import { DocumentQueryParamDto } from './dto/request/document-query-param.dto'
import { DocumentResponseDto } from './dto/response/document-response.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PermissionsGuard } from '../auth/guards/permissions.guard'
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator'
import { CanCreate, CanRead, CanUpdate, CanDelete } from '../auth/decorators/resource-action.decorator'
import { PaginatedData } from '../common/interceptors/global-response.interceptor'

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @CanCreate('documents')
  @ApiOperation({
    summary: 'Tạo tài liệu mới',
    description: 'Tạo một tài liệu mới trong hệ thống',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tài liệu đã được tạo thành công',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ hoặc tiêu đề đã tồn tại',
  })
  async create(@Body() createDocumentDto: CreateDocumentDto): Promise<DocumentResponseDto> {
    return this.documentsService.create(createDocumentDto)
  }

  @Get()
  @CanRead('documents')
  @ApiOperation({
    summary: 'Lấy danh sách tài liệu',
    description: 'Lấy danh sách tất cả tài liệu với phân trang và bộ lọc',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo tiêu đề, mô tả, URL' })
  @ApiQuery({ name: 'title', required: false, description: 'Tìm kiếm theo tiêu đề tài liệu' })
  @ApiQuery({ name: 'createdById', required: false, type: Number, description: 'Lọc theo ID người tạo' })
  @ApiQuery({ name: 'sort', required: false, enum: ['createdAt', 'updatedAt', 'title', 'url'] })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng bản ghi trên trang' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách tài liệu',
    type: [DocumentResponseDto],
  })
  async findAll(@Query() queryParams: DocumentQueryParamDto): Promise<PaginatedData<DocumentResponseDto>> {
    return this.documentsService.findAll(queryParams)
  }

  @Get(':id')
  @CanRead('documents')
  @ApiOperation({
    summary: 'Lấy thông tin tài liệu theo ID',
    description: 'Lấy thông tin chi tiết của một tài liệu theo ID',
  })
  @ApiParam({ name: 'id', description: 'ID tài liệu' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin tài liệu',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy tài liệu',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DocumentResponseDto> {
    return this.documentsService.findOne(id)
  }

  @Patch(':id')
  @CanUpdate('documents')
  @ApiOperation({
    summary: 'Cập nhật thông tin tài liệu',
    description: 'Cập nhật thông tin tài liệu',
  })
  @ApiParam({ name: 'id', description: 'ID tài liệu' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tài liệu đã được cập nhật thành công',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy tài liệu',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Tiêu đề đã tồn tại',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.update(id, updateDocumentDto)
  }

  @Delete(':id')
  @CanDelete('documents')
  @ApiOperation({
    summary: 'Xóa tài liệu',
    description: 'Xóa tài liệu khỏi hệ thống',
  })
  @ApiParam({ name: 'id', description: 'ID tài liệu' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tài liệu đã được xóa thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Tài liệu đã được xóa thành công',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy tài liệu',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.documentsService.remove(id)
    return { message: 'Tài liệu đã được xóa thành công' }
  }
}
