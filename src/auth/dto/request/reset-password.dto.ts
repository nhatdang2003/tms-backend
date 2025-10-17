import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class ResetPasswordDto {
  @IsString()
  @ApiProperty({
    description: 'New password for the user',
    example: 'NewPassword123!',
  })
  newPassword: string

  @IsString()
  @ApiProperty({
    description: "Reset token sent to the user's email",
    example: 'reset-token-1234567890',
  })
  resetToken: string
}
