import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsEmail, IsNumber, IsArray, IsOptional } from 'class-validator'

export class UserLoginResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  @IsNumber()
  id: number

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string

  @ApiProperty({
    description: 'User roles',
    example: ['user', 'admin'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  role: string

  @ApiProperty({
    description: 'User organization',
    example: 'Organization 1',
    required: false,
  })
  @IsString()
  @IsOptional()
  organization?: string
}
