import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class LogoutDto {
  @ApiProperty({ example: 'your-refresh-token-here' })
  @IsString()
  @IsNotEmpty()
  refresh_token: string
}
