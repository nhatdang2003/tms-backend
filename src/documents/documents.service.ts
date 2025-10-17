import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { Transactional } from 'typeorm-transactional'
import { Document } from './entities/document.entity'
import { CreateDocumentDto } from './dto/request/create-document.dto'
import { UpdateDocumentDto } from './dto/request/update-document.dto'
import { DocumentQueryParamDto } from './dto/request/document-query-param.dto'
import { DocumentResponseDto } from './dto/response/document-response.dto'
import { BaseService } from '../common/base/base.service'
import { PaginatedData } from '../common/interceptors/global-response.interceptor'

@Injectable()
export class DocumentsService extends BaseService<Document> {
  private readonly logger = new Logger(DocumentsService.name)

  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {
    super(documentsRepository)
  }

  @Transactional()
  async create(createDocumentDto: CreateDocumentDto): Promise<DocumentResponseDto> {
    this.logger.log('Creating new document', createDocumentDto)

    const existingDocument = await this.documentsRepository.findOne({
      where: { title: createDocumentDto.title },
    })

    if (existingDocument) {
      throw new BadRequestException(`Tài liệu "${createDocumentDto.title}" đã tồn tại`)
    }

    const document = this.documentsRepository.create(createDocumentDto)
    const savedDocument = await this.documentsRepository.save(document)

    this.logger.log(`Document created successfully with ID: ${savedDocument.id}`)
    return this.toDto(DocumentResponseDto, savedDocument)
  }

  async findAll(queryParams: DocumentQueryParamDto): Promise<PaginatedData<DocumentResponseDto>> {
    this.logger.log('Fetching documents with query params', queryParams)

    const queryBuilder = this.documentsRepository.createQueryBuilder('document')

    this.applyFilters(queryBuilder, queryParams)

    if (queryParams.title?.trim()) {
      queryBuilder.andWhere(
        '(document.title ILIKE :title OR document.description ILIKE :title OR document.url ILIKE :title)',
        { title: `%${queryParams.title.trim()}%` },
      )
    }

    const sortField = this.getSortField(queryParams.sort)
    const sortDirection = queryParams.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    queryBuilder.orderBy(`document.${sortField}`, sortDirection)

    const limit = Number(queryParams.limit) || 10
    const page = Number(queryParams.page) || 1
    const skip = (page - 1) * limit

    queryBuilder.skip(skip).take(limit)

    const [items, total] = await queryBuilder.getManyAndCount()

    return {
      items: this.toDtoList(DocumentResponseDto, items),
      total,
      page,
      limit,
    }
  }

  async findOne(id: number): Promise<DocumentResponseDto> {
    this.logger.log(`Finding document with ID: ${id}`)

    const document = await this.documentsRepository.findOne({
      where: { id },
    })

    if (!document) {
      throw new NotFoundException(`Tài liệu với ID ${id} không tồn tại`)
    }

    return this.toDto(DocumentResponseDto, document)
  }

  @Transactional()
  async update(id: number, updateDocumentDto: UpdateDocumentDto): Promise<DocumentResponseDto> {
    this.logger.log(`Updating document with ID: ${id}`)

    const document = await this.documentsRepository.findOne({
      where: { id },
    })

    if (!document) {
      throw new NotFoundException(`Tài liệu với ID ${id} không tồn tại`)
    }

    if (updateDocumentDto.title && updateDocumentDto.title !== document.title) {
      const existingDocument = await this.documentsRepository.findOne({
        where: { title: updateDocumentDto.title },
      })

      if (existingDocument) {
        throw new BadRequestException(`Tài liệu "${updateDocumentDto.title}" đã tồn tại`)
      }
    }

    Object.assign(document, updateDocumentDto)

    const updatedDocument = await this.documentsRepository.save(document)
    this.logger.log(`Document updated successfully: ${id}`)

    return this.toDto(DocumentResponseDto, updatedDocument)
  }

  @Transactional()
  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting document with ID: ${id}`)

    const document = await this.documentsRepository.findOne({
      where: { id },
    })

    if (!document) {
      throw new NotFoundException(`Tài liệu với ID ${id} không tồn tại`)
    }

    await this.documentsRepository.remove(document)
    this.logger.log(`Document deleted successfully: ${id}`)
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<Document>, queryParams: DocumentQueryParamDto): void {
    if (queryParams.title) {
      queryBuilder.andWhere('document.title ILIKE :title', { title: `%${queryParams.title}%` })
    }

    if (queryParams.createdById) {
      queryBuilder.andWhere('document.uploadedById = :uploadedById', { uploadedById: queryParams.createdById })
    }
  }

  private getSortField(sort?: string): string {
    const allowedFields = ['createdAt', 'updatedAt', 'title', 'url']
    return allowedFields.includes(sort || '') ? sort! : 'createdAt'
  }
}
