import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { TicketStatus } from 'src/common/enum/ticket.enum'
import { UserResponseDto } from 'src/users/dto/response/user-response.dto'
import { OrganizationResponseDto } from 'src/organizations/dto/organization-response.dto'

export class TicketResponseDto {
  @ApiProperty()
  @Expose()
  id: string

  @ApiProperty()
  @Expose()
  code: string

  @ApiProperty()
  @Expose()
  title: string

  @ApiProperty()
  @Expose()
  description?: string

  @ApiProperty()
  @Expose()
  customerName: string

  @ApiProperty()
  @Expose()
  customerPhone?: string

  @ApiProperty()
  @Expose()
  customerEmail?: string

  @ApiProperty()
  @Expose()
  customerAddress?: string

  @ApiProperty()
  @Expose()
  customerLat?: number

  @ApiProperty()
  @Expose()
  customerLng?: number

  @ApiProperty({ type: () => UserResponseDto })
  @Expose()
  @Type(() => UserResponseDto)
  assignedTechnician?: UserResponseDto

  @ApiProperty({ type: () => OrganizationResponseDto })
  @Expose()
  @Type(() => OrganizationResponseDto)
  assignedOrganization?: OrganizationResponseDto

  @ApiProperty({ enum: TicketStatus })
  @Expose()
  status: TicketStatus

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  scheduledAt?: string

  @ApiProperty({ type: () => UserResponseDto })
  @Expose()
  @Type(() => UserResponseDto)
  createdBy: UserResponseDto

  @ApiProperty({ type: () => UserResponseDto })
  @Expose()
  @Type(() => UserResponseDto)
  updatedBy?: UserResponseDto

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  createdAt: string

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  updatedAt: string
}
