import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsNumber } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string

  @ApiProperty({ example: '0909090909' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string

  @ApiPropertyOptional({ example: 1, description: 'ID đơn vị' })
  @IsNumber()
  @IsOptional()
  organizationId?: number

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  roleId?: number
}
