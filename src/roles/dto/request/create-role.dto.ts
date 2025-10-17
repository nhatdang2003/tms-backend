import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsOptional } from 'class-validator'

export class CreateRoleDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    example: 'Administrator role with full access',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string
}
