import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class OrganizationResponseDto {
  @ApiProperty({
    description: 'ID đơn vị',
    example: 1,
  })
  @Expose()
  id: number

  @ApiProperty({
    description: 'Tên đơn vị',
    example: 'Công ty TNHH ABC',
  })
  @Expose()
  name: string

  @ApiPropertyOptional({
    description: 'Mô tả về đơn vị',
    example: 'Công ty chuyên về phát triển phần mềm',
  })
  @Expose()
  description?: string
}
