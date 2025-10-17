import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional } from 'class-validator'

export class UpdateRoleDto {
  @ApiProperty({ example: 'admin', required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({
    example: 'Administrator role with full access',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string
}
