import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator'

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'CurrentPassword123!',
  })
  @IsString({ message: 'Current password must be a string' })
  @IsNotEmpty({ message: 'Current password cannot be empty' })
  currentPassword: string

  @ApiProperty({
    description: 'New password (Min 8 characters, must include letters, numbers, and special characters)',
    example: 'NewPassword123!',
  })
  @IsString({ message: 'New password must be a string' })
  @IsNotEmpty({ message: 'New password cannot be empty' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(100, { message: 'New password cannot exceed 100 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string
}
