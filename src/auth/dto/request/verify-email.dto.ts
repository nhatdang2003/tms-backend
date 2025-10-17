import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator'
import { IsString } from 'class-validator'

export class VerifyEmailDto {
  @IsString()
  @ApiProperty({
    description: "Verification token sent to the user's email",
    example: 'verification-token-1234567890',
  })
  token: string
}
