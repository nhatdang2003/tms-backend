import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator'

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Tên quyền (unique)',
    example: 'users:create',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({
    description: 'Mô tả quyền',
    example: 'Quyền tạo người dùng mới',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string

  @ApiPropertyOptional({
    description: 'Tài nguyên được phân quyền',
    example: 'users',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  resource?: string

  @ApiPropertyOptional({
    description: 'Hành động được phép',
    example: 'create',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  action?: string
}
