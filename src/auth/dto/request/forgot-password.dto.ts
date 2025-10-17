import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address to send the password reset link to',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsString({ message: 'Email must be a string' })
  email: string
}
