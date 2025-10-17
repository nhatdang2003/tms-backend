import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsOptional, IsString } from 'class-validator'

export class CreateTicketRemindDto {
  @ApiProperty({ description: 'Remind date and time' })
  @IsDateString()
  remindAt: string

  @ApiProperty({ description: 'Remind note', required: false })
  @IsOptional()
  @IsString()
  note?: string
}
