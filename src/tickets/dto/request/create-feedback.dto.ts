import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Feedback comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string

  @ApiProperty({ description: 'Feedback channel', required: false })
  @IsOptional()
  @IsString()
  channel?: string
}
