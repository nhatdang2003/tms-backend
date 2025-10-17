import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class FeedbackResponseDto {
  @ApiProperty()
  @Expose()
  id: string

  @ApiProperty()
  @Expose()
  comment?: string

  @ApiProperty()
  @Expose()
  channel?: string

  @ApiProperty()
  @Expose()
  createdAt: string
}
