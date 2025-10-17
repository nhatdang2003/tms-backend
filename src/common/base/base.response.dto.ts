import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'

export class BaseResponseDto {
  @ApiProperty({ description: 'ID' })
  @Expose()
  id: number

  @ApiProperty({ description: 'Creation date' })
  @Expose()
  createdAt: Date

  @ApiProperty({ description: 'Last update date' })
  @Expose()
  updatedAt: Date

  @ApiProperty({ description: 'version' })
  @Expose()
  version: number
}
