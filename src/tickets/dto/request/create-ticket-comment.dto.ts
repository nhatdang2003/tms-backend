import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateTicketCommentDto {
  @ApiProperty({ description: 'Comment content' })
  @IsString()
  content: string
}
