import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, MaxLength } from 'class-validator'

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Tiêu đề tài liệu',
    example: 'Báo cáo tháng 10/2025',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  title: string

  @ApiPropertyOptional({
    description: 'Mô tả tài liệu',
    example: 'Báo cáo chi tiết về hoạt động trong tháng 10',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string

  @ApiProperty({
    description: 'URL của tài liệu',
    example: 'https://example.com/document.pdf',
  })
  @IsString()
  url: string
}
