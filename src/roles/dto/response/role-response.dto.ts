import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional } from 'class-validator'
import { Expose } from 'class-transformer'

export class RoleResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number

  @ApiProperty({ example: 'admin' })
  @IsString()
  @Expose()
  name: string

  @ApiProperty({ example: 'Administrator role with full access', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string
}
