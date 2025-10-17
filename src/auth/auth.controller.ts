import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Request,
  SetMetadata,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger'
import { ThrottlerGuard } from '@nestjs/throttler'
import { Request as ExpressRequest } from 'express'
import { AuthService } from './auth.service'
import { CurrentUser } from './decorators/current-user.decorator'
import { ChangePasswordDto } from './dto/request/change-password.dto'
import { ForgotPasswordDto } from './dto/request/forgot-password.dto'
import { LoginDto } from './dto/request/login.dto'
import { LogoutDto } from './dto/request/logout.dto'
import { RefreshTokenDto } from './dto/request/refresh-token.dto'
import { RegisterDto } from './dto/request/register.dto'
import { ResetPasswordDto } from './dto/request/reset-password.dto'
import { AuthResponseDto } from './dto/response/auth-response.dto'
import { UserLoginResponseDto } from './dto/response/user-response.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

export const IS_PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

@ApiTags('Authentication')
@Controller('auth')
@ApiExtraModels(
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  LogoutDto,
  ChangePasswordDto,
  UserLoginResponseDto,
  AuthResponseDto,
)
export class AuthController {
  private readonly logger = new Logger(AuthController.name)
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password. Rate limited to 5 requests per minute.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      allOf: [
        { $ref: getSchemaPath(AuthResponseDto) },
        {
          example: {
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            access_token_expires_at: 1672531200,
            refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refresh_token_expires_at: 1673136000,
            user: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              email: 'user@example.com',
              firstName: 'John',
              lastName: 'Doe',
              roles: ['user'],
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too Many Requests - Rate limit exceeded' })
  async login(@Body() loginDto: LoginDto, @Request() req: ExpressRequest): Promise<AuthResponseDto> {
    this.logger.log(`User login attempt with email: ${loginDto.email}`)
    return this.authService.login(loginDto, req)
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Use refresh token to get a new access token. Rate limited to 10 requests per minute.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(AuthResponseDto) },
        {
          example: {
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            access_token_expires_at: 1672531200,
            refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refresh_token_expires_at: 1673136000,
            user: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              email: 'user@example.com',
              firstName: 'John',
              lastName: 'Doe',
              roles: ['user'],
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired refresh token' })
  @ApiResponse({ status: 429, description: 'Too Many Requests - Rate limit exceeded' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    this.logger.log(`Refreshing token for user with refresh token: ${refreshTokenDto.refresh_token}`)
    return this.authService.refreshToken(refreshTokenDto)
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Revoke the current refresh token to logout user from current device.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Not logged in or invalid token' })
  async logout(@Body() logoutDto: LogoutDto): Promise<{ success: boolean }> {
    this.logger.log(`Logging out user with refresh token: ${logoutDto.refresh_token}`)
    return this.authService.logout(logoutDto)
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Change user password',
    description: 'Change the password for the currently authenticated user. Requires current password verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      example: {
        success: true,
        message: 'Password changed successfully. You will need to log in again with your new password.',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Current password is incorrect or user not authenticated' })
  @ApiResponse({ status: 409, description: 'Conflict - New password must be different from the current password' })
  async changePassword(
    @CurrentUser() user: UserLoginResponseDto,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`User ${user.id} is changing their password`)
    return this.authService.changePassword(user.id, changePasswordDto)
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Get information about the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the user profile',
    schema: {
      allOf: [
        { $ref: getSchemaPath(UserLoginResponseDto) },
        {
          example: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            email: 'user@example.com',
            roles: ['user'],
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Not logged in or invalid token' })
  getProfile(@CurrentUser() user: UserLoginResponseDto): UserLoginResponseDto {
    return user
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send a password reset link to the provided email address. Rate limited to 5 requests per minute.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
    schema: {
      example: {
        success: true,
        message: 'If the email exists in our system, a password reset link has been sent.',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid email format' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    this.logger.log(`Password reset requested for email: ${forgotPasswordDto.email}`)
    return this.authService.handleForgotPassword(forgotPasswordDto.email)
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({
    summary: 'Reset user password',
    description: 'Reset user password using the token received via email. Rate limited to 5 requests per minute.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    schema: {
      example: {
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid or missing data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired reset token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    this.logger.log(`Resetting password with token: ${resetPasswordDto.resetToken}`)
    return this.authService.resetPassword(resetPasswordDto.resetToken, resetPasswordDto.newPassword)
  }
}
