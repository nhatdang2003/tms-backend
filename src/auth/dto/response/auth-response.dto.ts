import { ApiProperty } from '@nestjs/swagger'
import { UserLoginResponseDto } from './user-response.dto'

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string

  @ApiProperty({
    example: 1672531200,
    description: 'Access token expiration time in Unix timestamp format (seconds)',
  })
  access_token_expires_at: number

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refresh_token: string

  @ApiProperty({
    example: 1673136000,
    description: 'Refresh token expiration time in Unix timestamp format (seconds)',
  })
  refresh_token_expires_at: number

  @ApiProperty({
    type: UserLoginResponseDto,
    example: {
      id: 1,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      organization: 'Organization 1',
    },
  })
  user: UserLoginResponseDto
}
