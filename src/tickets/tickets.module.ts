import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TicketsService } from './tickets.service'
import { TicketsController } from './tickets.controller'
import { Ticket } from './entities/ticket.entity'
import { TicketComment } from './entities/ticket-comment.entity'
import { TicketRemind } from './entities/ticket-remind.entity'
import { FeedbackCustomer } from './entities/feedback-customer.entity'
import { TicketHistory } from './entities/ticket-history.entity'
import { TicketPhoto } from './entities/ticket-photo.entity'
import { User } from 'src/users/entities/user.entity'
import { Organization } from 'src/organizations/entities/organization.entity'
import { RolesModule } from 'src/roles/roles.module'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ticket,
      TicketComment,
      TicketRemind,
      FeedbackCustomer,
      TicketHistory,
      TicketPhoto,
      User,
      Organization,
    ]),
    RolesModule,
    UsersModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
