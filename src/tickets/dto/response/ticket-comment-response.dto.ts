import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { UserResponseDto } from 'src/users/dto/response/user-response.dto'

export class TicketCommentResponseDto {
  @ApiProperty()
  @Expose()
  id: string

  @ApiProperty()
  @Expose()
  content: string

  @ApiProperty({ type: () => UserResponseDto })
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  createdAt: string
}
