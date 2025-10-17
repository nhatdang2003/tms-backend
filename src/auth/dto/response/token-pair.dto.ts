import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class TokenPairDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty()
  access_token: string

  @ApiProperty({
    example: 1672531200,
    description: 'Access token expiration time in Unix timestamp format (seconds)',
  })
  @IsNumber()
  access_token_expires_at: number

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty()
  refresh_token: string

  @ApiProperty({
    example: 1673136000,
    description: 'Refresh token expiration time in Unix timestamp format (seconds)',
  })
  @IsNumber()
  refresh_token_expires_at: number
}
