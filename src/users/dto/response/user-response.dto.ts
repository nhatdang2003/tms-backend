import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { BaseResponseDto } from 'src/common/base/base.response.dto'
import { OrganizationResponseDto } from 'src/organizations/dto/organization-response.dto'
import { RoleResponseDto } from 'src/roles/dto/response/role-response.dto'

export class UserResponseDto extends BaseResponseDto {
  @ApiProperty({ example: 'user@example.com' })
  @Expose()
  email: string

  @ApiProperty({ example: 'John' })
  @Expose()
  firstName: string

  @ApiProperty({ example: 'Doe' })
  @Expose()
  lastName: string

  @ApiProperty({ example: '0909090909' })
  @Expose()
  phoneNumber: string

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @Expose()
  avatar?: string

  @ApiPropertyOptional({ type: RoleResponseDto, description: 'Tên vai trò' })
  @Expose()
  @Type(() => RoleResponseDto)
  role?: RoleResponseDto

  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'] })
  @Expose()
  status: string

  @ApiPropertyOptional({ type: OrganizationResponseDto, description: 'Thông tin đơn vị' })
  @Expose()
  @Type(() => OrganizationResponseDto)
  organization?: OrganizationResponseDto
}
