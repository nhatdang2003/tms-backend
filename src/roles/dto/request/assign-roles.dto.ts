import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator'

export class AssignRolesDto {
  @ApiProperty({ example: [1, 2], type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  roleIds: number[]
}
