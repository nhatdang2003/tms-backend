import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator'
import { STATUS } from 'src/common/enum/user-type.enum'

export class UpdateUserDto {
  @ApiProperty({ example: 'user@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({ example: 'John', required: false })
  @IsString()
  @IsOptional()
  firstName?: string

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  lastName?: string

  @ApiProperty({ example: '0909090909', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string
}

export class AdminUpdateUserDto extends UpdateUserDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  roleId?: number

  @ApiPropertyOptional({ example: 1, description: 'ID đơn vị' })
  @IsNumber()
  @IsOptional()
  organizationId?: number

  @ApiPropertyOptional({ enum: STATUS, description: 'Trạng thái người dùng' })
  @IsEnum(STATUS)
  @IsOptional()
  status?: STATUS
}
