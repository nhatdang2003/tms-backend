import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseService } from 'src/common/base/base.service'
import { PaginatedData } from 'src/common/interceptors/global-response.interceptor'
import { Transactional } from 'typeorm-transactional'
import { Ticket } from './entities/ticket.entity'
import { TicketComment } from './entities/ticket-comment.entity'
import { TicketRemind } from './entities/ticket-remind.entity'
import { FeedbackCustomer } from './entities/feedback-customer.entity'
import { TicketHistory } from './entities/ticket-history.entity'
import { CreateTicketDto } from './dto/request/create-ticket.dto'
import { UpdateTicketDto } from './dto/request/update-ticket.dto'
import { UpdateTicketStatusDto } from './dto/request/update-ticket-status.dto'
import { CreateTicketCommentDto } from './dto/request/create-ticket-comment.dto'
import { CreateTicketRemindDto } from './dto/request/create-ticket-remind.dto'
import { CreateFeedbackDto } from './dto/request/create-feedback.dto'
import { TicketQueryParamDto } from './dto/request/ticket-query-param.dto'
import { TicketResponseDto } from './dto/response/ticket-response.dto'
import { User } from 'src/users/entities/user.entity'
import { Organization } from 'src/organizations/entities/organization.entity'
import { geocodeAddress } from 'src/common/utils/geocoding'
import { TicketStatus } from 'src/common/enum/ticket.enum'

@Injectable()
export class TicketsService extends BaseService<Ticket> {
  private readonly logger = new Logger(TicketsService.name)

  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @InjectRepository(TicketComment)
    private ticketCommentsRepository: Repository<TicketComment>,
    @InjectRepository(TicketRemind)
    private ticketRemindsRepository: Repository<TicketRemind>,
    @InjectRepository(FeedbackCustomer)
    private feedbackRepository: Repository<FeedbackCustomer>,
    @InjectRepository(TicketHistory)
    private ticketHistoryRepository: Repository<TicketHistory>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
  ) {
    super(
      ticketsRepository,
      ['title', 'description', 'customerName', 'customerPhone', 'customerEmail', 'code'],
      ['createdAt', 'updatedAt', 'status', 'id', 'code', 'title', 'customerName'],
    )
  }

  private generateTicketCode(): string {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')
    return `TK${timestamp.slice(-6)}${random}`
  }

  @Transactional()
  async create(createTicketDto: CreateTicketDto, userId: number): Promise<Ticket> {
    this.logger.log(`Creating ticket: ${createTicketDto.title}`)

    if (createTicketDto.assignedTechnicianId) {
      const technician = await this.usersRepository.findOne({
        where: { id: createTicketDto.assignedTechnicianId },
      })
      if (!technician) {
        throw new BadRequestException('Assigned technician not found')
      }
    }

    if (createTicketDto.assignedOrganizationId) {
      const organization = await this.organizationsRepository.findOne({
        where: { id: createTicketDto.assignedOrganizationId },
      })
      if (!organization) {
        throw new BadRequestException('Assigned organization not found')
      }
    }

    if (createTicketDto.customerAddress) {
      const { lat, lng } = await geocodeAddress(createTicketDto.customerAddress)
      createTicketDto.customerLat = lat
      createTicketDto.customerLng = lng
    }

    const ticket = this.ticketsRepository.create({
      ...createTicketDto,
      code: this.generateTicketCode(),
      createdBy: { id: userId } as User,
      assignedTechnician: createTicketDto.assignedTechnicianId
        ? ({ id: createTicketDto.assignedTechnicianId } as User)
        : undefined,
      assignedOrganization: createTicketDto.assignedOrganizationId
        ? ({ id: createTicketDto.assignedOrganizationId } as Organization)
        : undefined,
      scheduledAt: createTicketDto.scheduledAt ? new Date(createTicketDto.scheduledAt) : undefined,
      status: createTicketDto.assignedTechnicianId ? TicketStatus.ASSIGNED : TicketStatus.NEW,
    })

    const savedTicket = await this.ticketsRepository.save(ticket)

    await this.createHistoryRecord(savedTicket.id, userId, 'CREATED', {
      title: savedTicket.title,
      description: savedTicket.description,
      customerName: savedTicket.customerName,
      customerAddress: savedTicket.customerAddress,
      assignedOrganizationId: savedTicket.assignedOrganization?.id,
      assignedTechnicianId: savedTicket.assignedTechnician?.id,
      scheduledAt: savedTicket.scheduledAt?.toISOString(),
      status: savedTicket.status,
    })

    this.logger.log(`Ticket created with ID: ${savedTicket.id}`)
    return this.findOne(savedTicket.id)
  }

  async findAll(queryParams: TicketQueryParamDto): Promise<PaginatedData<TicketResponseDto>> {
    this.logger.log('Fetching all tickets with query params', queryParams)

    const queryBuilder = this.ticketsRepository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.assignedTechnician', 'assignedTechnician')
      .leftJoinAndSelect('entity.assignedOrganization', 'assignedOrganization')
      .leftJoinAndSelect('entity.createdBy', 'createdBy')
      .leftJoinAndSelect('entity.updatedBy', 'updatedBy')

    if (queryParams.status) {
      queryBuilder.andWhere('entity.status = :status', { status: queryParams.status })
    }

    if (queryParams.assignedTechnicianId) {
      queryBuilder.andWhere('entity.assigned_technician_id = :assignedTechnicianId', {
        assignedTechnicianId: parseInt(queryParams.assignedTechnicianId),
      })
    }

    if (queryParams.customerName) {
      queryBuilder.andWhere('entity.customerName ILIKE :customerName', {
        customerName: `%${queryParams.customerName}%`,
      })
    }

    if (queryParams.createdFrom) {
      queryBuilder.andWhere('entity.createdAt >= :createdFrom', {
        createdFrom: new Date(queryParams.createdFrom),
      })
    }

    if (queryParams.createdTo) {
      queryBuilder.andWhere('entity.createdAt <= :createdTo', {
        createdTo: new Date(queryParams.createdTo),
      })
    }

    return this.getFilteredQueryBuilder(queryBuilder, queryParams, TicketResponseDto)
  }

  async findOne(id: number): Promise<Ticket> {
    this.logger.log(`Finding ticket with ID: ${id}`)

    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: ['assignedTechnician', 'assignedOrganization', 'createdBy', 'updatedBy'],
    })

    if (!ticket) {
      this.logger.error(`Ticket with ID ${id} not found`)
      throw new NotFoundException(`Ticket with ID ${id} not found`)
    }

    return ticket
  }

  @Transactional()
  async update(id: number, updateTicketDto: UpdateTicketDto, userId: number): Promise<Ticket> {
    this.logger.log(`Updating ticket ID: ${id}`)

    const ticket = await this.findOne(id)

    if (updateTicketDto.assignedTechnicianId) {
      const technician = await this.usersRepository.findOne({
        where: { id: updateTicketDto.assignedTechnicianId },
      })
      if (!technician) {
        throw new BadRequestException('Assigned technician not found')
      }
    }

    if (updateTicketDto.assignedOrganizationId) {
      const organization = await this.organizationsRepository.findOne({
        where: { id: updateTicketDto.assignedOrganizationId },
      })
      if (!organization) {
        throw new BadRequestException('Assigned organization not found')
      }
    }

    if (updateTicketDto.customerAddress) {
      const { lat, lng } = await geocodeAddress(updateTicketDto.customerAddress)
      updateTicketDto.customerLat = lat
      updateTicketDto.customerLng = lng
    }

    const oldData = { ...ticket }

    Object.assign(ticket, {
      ...updateTicketDto,
      updatedBy: { id: userId } as User,
      assignedTechnician: updateTicketDto.assignedTechnicianId
        ? ({ id: updateTicketDto.assignedTechnicianId } as User)
        : ticket.assignedTechnician,
      assignedOrganization: updateTicketDto.assignedOrganizationId
        ? ({ id: updateTicketDto.assignedOrganizationId } as Organization)
        : ticket.assignedOrganization,
      scheduledAt: updateTicketDto.scheduledAt ? new Date(updateTicketDto.scheduledAt) : ticket.scheduledAt,
      status: updateTicketDto.assignedTechnicianId ? TicketStatus.ASSIGNED : TicketStatus.NEW,
    })

    const savedTicket = await this.ticketsRepository.save(ticket)

    await this.createHistoryRecord(savedTicket.id, userId, 'UPDATED', {
      changes: this.getChanges(
        oldData as unknown as Record<string, unknown>,
        savedTicket as unknown as Record<string, unknown>,
      ),
    })

    this.logger.log(`Ticket ID: ${id} updated successfully`)
    return this.findOne(savedTicket.id)
  }

  @Transactional()
  async updateStatus(id: number, updateStatusDto: UpdateTicketStatusDto, userId: number): Promise<Ticket> {
    this.logger.log(`Updating ticket status ID: ${id} to ${updateStatusDto.status}`)

    const ticket = await this.findOne(id)
    const oldStatus = ticket.status

    ticket.status = updateStatusDto.status
    ticket.updatedBy = { id: userId } as User

    const savedTicket = await this.ticketsRepository.save(ticket)

    await this.createHistoryRecord(savedTicket.id, userId, 'STATUS_CHANGED', {
      oldStatus,
      newStatus: updateStatusDto.status,
    })

    this.logger.log(`Ticket ID: ${id} status updated to ${updateStatusDto.status}`)
    return this.findOne(savedTicket.id)
  }

  @Transactional()
  async addComment(ticketId: number, createCommentDto: CreateTicketCommentDto, userId: number): Promise<TicketComment> {
    this.logger.log(`Adding comment to ticket ID: ${ticketId}`)

    await this.findOne(ticketId)

    const newComment = this.ticketCommentsRepository.create({
      ...createCommentDto,
      ticket: { id: ticketId } as unknown as Ticket,
      user: { id: userId } as User,
    })

    const savedComment = await this.ticketCommentsRepository.save(newComment)

    await this.createHistoryRecord(ticketId, userId, 'COMMENT_ADDED', {
      commentId: savedComment.id,
      content: createCommentDto.content,
    })

    this.logger.log(`Comment added to ticket ID: ${ticketId}`)
    const comment = await this.ticketCommentsRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    })
    if (!comment) {
      throw new NotFoundException('Comment not found after creation')
    }
    return comment
  }

  @Transactional()
  async addRemind(ticketId: number, createRemindDto: CreateTicketRemindDto, userId: number): Promise<TicketRemind> {
    this.logger.log(`Adding remind to ticket ID: ${ticketId}`)

    await this.findOne(ticketId)

    const newRemind = this.ticketRemindsRepository.create({
      ...createRemindDto,
      ticket: { id: ticketId } as unknown as Ticket,
      createdBy: { id: userId } as User,
      remindAt: new Date(createRemindDto.remindAt),
    })

    const savedRemind = await this.ticketRemindsRepository.save(newRemind)

    await this.createHistoryRecord(ticketId, userId, 'REMIND_ADDED', {
      remindId: savedRemind.id,
      remindAt: createRemindDto.remindAt,
      note: createRemindDto.note,
    })

    this.logger.log(`Remind added to ticket ID: ${ticketId}`)
    const remind = await this.ticketRemindsRepository.findOne({
      where: { id: savedRemind.id },
      relations: ['createdBy'],
    })
    if (!remind) {
      throw new NotFoundException('Remind not found after creation')
    }
    return remind
  }

  @Transactional()
  async addFeedback(ticketId: number, createFeedbackDto: CreateFeedbackDto): Promise<FeedbackCustomer> {
    this.logger.log(`Adding feedback to ticket ID: ${ticketId}`)

    await this.findOne(ticketId)

    const feedback = this.feedbackRepository.create({
      ...createFeedbackDto,
      ticket: { id: ticketId } as unknown as Ticket,
    })

    const savedFeedback = await this.feedbackRepository.save(feedback)

    this.logger.log(`Feedback added to ticket ID: ${ticketId}`)
    return savedFeedback
  }

  private async createHistoryRecord(ticketId: number, userId: number, action: string, data?: unknown): Promise<void> {
    const history = this.ticketHistoryRepository.create({
      ticket: { id: ticketId } as unknown as Ticket,
      actor: { id: userId } as User,
      action,
      data,
    })

    await this.ticketHistoryRepository.save(history)
  }

  private getChanges(
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
  ): Record<string, { old: unknown; new: unknown }> {
    const changes: Record<string, { old: unknown; new: unknown }> = {}
    const fieldsToCheck = [
      'title',
      'description',
      'customerName',
      'customerPhone',
      'customerEmail',
      'customerAddress',
      'assignedOrganizationId',
      'assignedTechnicianId',
      'scheduledAt',
    ]

    fieldsToCheck.forEach((field) => {
      if (oldData[field] !== newData[field]) {
        changes[field] = {
          old: oldData[field],
          new: newData[field],
        }
      }
    })

    return changes
  }
}
