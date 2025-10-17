import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { UserResponseDto } from 'src/users/dto/response/user-response.dto'

export class TicketRemindResponseDto {
  @ApiProperty()
  @Expose()
  id: string

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  remindAt: string

  @ApiProperty()
  @Expose()
  note?: string

  @ApiProperty({ type: () => UserResponseDto })
  @Expose()
  @Type(() => UserResponseDto)
  createdBy: UserResponseDto

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  createdAt: string
}
