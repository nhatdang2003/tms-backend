import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { BaseResponseDto } from '../../../common/base/base.response.dto'

export class DocumentResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: 'Tiêu đề tài liệu',
    example: 'Báo cáo tháng 10/2025',
  })
  @Expose()
  title: string

  @ApiPropertyOptional({
    description: 'Mô tả tài liệu',
    example: 'Báo cáo chi tiết về hoạt động trong tháng 10',
  })
  @Expose()
  description?: string

  @ApiProperty({
    description: 'URL của tài liệu',
    example: 'https://example.com/document.pdf',
  })
  @Expose()
  url: string
}
