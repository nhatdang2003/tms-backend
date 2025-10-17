import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional, IsEmail, IsNumber, IsDateString } from 'class-validator'

export class CreateTicketDto {
  @ApiProperty({ description: 'Ticket title' })
  @IsString()
  title: string

  @ApiProperty({ description: 'Ticket description', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  customerName: string

  @ApiProperty({ description: 'Customer phone number', required: false })
  @IsOptional()
  @IsString()
  customerPhone?: string

  @ApiProperty({ description: 'Customer email', required: false })
  @IsOptional()
  @IsEmail()
  customerEmail?: string

  @ApiProperty({ description: 'Customer address', required: false })
  @IsOptional()
  @IsString()
  customerAddress?: string

  @ApiProperty({ description: 'Customer latitude', required: false })
  @IsOptional()
  @IsNumber()
  customerLat?: number

  @ApiProperty({ description: 'Customer longitude', required: false })
  @IsOptional()
  @IsNumber()
  customerLng?: number

  @ApiProperty({ description: 'Assigned technician ID', required: false })
  @IsOptional()
  @IsNumber()
  assignedTechnicianId?: number

  @ApiProperty({ description: 'Assigned organization ID', required: false })
  @IsOptional()
  @IsNumber()
  assignedOrganizationId?: number

  @ApiProperty({ description: 'Scheduled date and time', required: false })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string
}
