import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Tên đơn vị',
    example: 'Công ty TNHH ABC',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string

  @ApiPropertyOptional({
    description: 'Mô tả về đơn vị',
    example: 'Công ty chuyên về phát triển phần mềm',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string
}
