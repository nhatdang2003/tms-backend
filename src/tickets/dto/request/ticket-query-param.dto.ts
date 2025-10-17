import { TicketStatus } from 'src/common/enum/ticket.enum'
import { BaseQueryParams } from 'src/common/base/base.service'

export interface TicketQueryParamDto extends BaseQueryParams {
  status?: TicketStatus
  assignedTechnicianId?: string
  customerName?: string
  createdFrom?: string
  createdTo?: string
}
