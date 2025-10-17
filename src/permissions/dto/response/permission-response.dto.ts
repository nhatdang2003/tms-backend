import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { BaseResponseDto } from 'src/common/base/base.response.dto'

export class PermissionResponseDto extends BaseResponseDto {
  @ApiProperty({ example: 'users:create' })
  @Expose()
  name: string

  @ApiPropertyOptional({ example: 'Quyền tạo người dùng mới' })
  @Expose()
  description?: string

  @ApiPropertyOptional({ example: 'users' })
  @Expose()
  resource?: string

  @ApiPropertyOptional({ example: 'create' })
  @Expose()
  action?: string
}
