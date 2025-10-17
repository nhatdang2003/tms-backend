import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsEmail, IsString, MinLength, MaxLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({
    example: 'admin@email.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  email: string

  @ApiProperty({
    example: 'passwd2@',
    description: 'User password (Min 8 characters)',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
  password: string
}
