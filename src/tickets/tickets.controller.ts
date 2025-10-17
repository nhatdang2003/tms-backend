import { Body, Controller, Get, Logger, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { plainToInstance } from 'class-transformer'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PermissionsGuard } from 'src/auth/guards/permissions.guard'
import { RequirePermissions } from 'src/auth/decorators/require-permissions.decorator'
import { TicketsService } from './tickets.service'
import { CreateTicketDto } from './dto/request/create-ticket.dto'
import { UpdateTicketDto } from './dto/request/update-ticket.dto'
import { UpdateTicketStatusDto } from './dto/request/update-ticket-status.dto'
import { CreateTicketCommentDto } from './dto/request/create-ticket-comment.dto'
import { CreateTicketRemindDto } from './dto/request/create-ticket-remind.dto'
import { CreateFeedbackDto } from './dto/request/create-feedback.dto'
import { TicketQueryParamDto } from './dto/request/ticket-query-param.dto'
import { TicketResponseDto } from './dto/response/ticket-response.dto'
import { TicketCommentResponseDto } from './dto/response/ticket-comment-response.dto'
import { TicketRemindResponseDto } from './dto/response/ticket-remind-response.dto'
import { FeedbackResponseDto } from './dto/response/feedback-response.dto'

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class TicketsController {
  private readonly logger = new Logger(TicketsController.name)

  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @RequirePermissions('tickets:create')
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({ status: 201, description: 'Ticket successfully created', type: TicketResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async create(@Body() createTicketDto: CreateTicketDto, @Req() req: Request) {
    const user = req.user as { id: string }
    this.logger.log(`Creating ticket: ${createTicketDto.title} by user ${user.id}`)

    const ticket = await this.ticketsService.create(createTicketDto, parseInt(user.id))
    return plainToInstance(TicketResponseDto, ticket, { excludeExtraneousValues: true })
  }

  @Get()
  @RequirePermissions('tickets:read')
  @ApiOperation({ summary: 'Get all tickets' })
  @ApiResponse({ status: 200, description: 'List of all tickets' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findAll(@Query() query: TicketQueryParamDto) {
    this.logger.log(`Fetching all tickets with query: ${JSON.stringify(query)}`)
    return this.ticketsService.findAll(query)
  }

  @Get(':id')
  @RequirePermissions('tickets:read')
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Returns the ticket', type: TicketResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Fetching ticket with ID: ${id}`)

    const ticket = await this.ticketsService.findOne(id)
    return plainToInstance(TicketResponseDto, ticket, { excludeExtraneousValues: true })
  }

  @Patch(':id')
  @RequirePermissions('tickets:update')
  @ApiOperation({ summary: 'Update a ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket successfully updated', type: TicketResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateTicketDto: UpdateTicketDto, @Req() req: Request) {
    const user = req.user as { id: string }
    this.logger.log(`Updating ticket with ID: ${id} by user ${user.id}`)

    const ticket = await this.ticketsService.update(id, updateTicketDto, parseInt(user.id))
    return plainToInstance(TicketResponseDto, ticket, { excludeExtraneousValues: true })
  }

  @Patch(':id/status')
  @RequirePermissions('tickets:update')
  @ApiOperation({ summary: 'Update ticket status' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket status successfully updated', type: TicketResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateTicketStatusDto,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string }
    this.logger.log(`Updating ticket status with ID: ${id} to ${updateStatusDto.status} by user ${user.id}`)

    const ticket = await this.ticketsService.updateStatus(id, updateStatusDto, parseInt(user.id))
    return plainToInstance(TicketResponseDto, ticket, { excludeExtraneousValues: true })
  }

  @Post(':id/comments')
  @RequirePermissions('tickets:comment')
  @ApiOperation({ summary: 'Add comment to ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 201, description: 'Comment successfully added', type: TicketCommentResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCommentDto: CreateTicketCommentDto,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string }
    this.logger.log(`Adding comment to ticket ID: ${id} by user ${user.id}`)

    const comment = await this.ticketsService.addComment(id, createCommentDto, parseInt(user.id))
    return plainToInstance(TicketCommentResponseDto, comment, { excludeExtraneousValues: true })
  }

  @Post(':id/reminds')
  @RequirePermissions('tickets:remind')
  @ApiOperation({ summary: 'Add remind to ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 201, description: 'Remind successfully added', type: TicketRemindResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async addRemind(
    @Param('id', ParseIntPipe) id: number,
    @Body() createRemindDto: CreateTicketRemindDto,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string }
    this.logger.log(`Adding remind to ticket ID: ${id} by user ${user.id}`)

    const remind = await this.ticketsService.addRemind(id, createRemindDto, parseInt(user.id))
    return plainToInstance(TicketRemindResponseDto, remind, { excludeExtraneousValues: true })
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Add customer feedback to ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 201, description: 'Feedback successfully added', type: FeedbackResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async addFeedback(@Param('id', ParseIntPipe) id: number, @Body() createFeedbackDto: CreateFeedbackDto) {
    this.logger.log(`Adding feedback to ticket ID: ${id}`)

    const feedback = await this.ticketsService.addFeedback(id, createFeedbackDto)
    return plainToInstance(FeedbackResponseDto, feedback, { excludeExtraneousValues: true })
  }
}
