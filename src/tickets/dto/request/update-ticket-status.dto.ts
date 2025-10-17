import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { TicketStatus } from 'src/common/enum/ticket.enum'

export class UpdateTicketStatusDto {
  @ApiProperty({ 
    description: 'New ticket status',
    enum: TicketStatus,
    example: TicketStatus.ASSIGNED
  })
  @IsEnum(TicketStatus)
  status: TicketStatus
}
