import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Request } from 'express'
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client'
import { Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'
import { ChangePasswordDto } from './dto/request/change-password.dto'
import { LoginDto } from './dto/request/login.dto'
import { LogoutDto } from './dto/request/logout.dto'
import { RefreshTokenDto } from './dto/request/refresh-token.dto'
import { AuthResponseDto } from './dto/response/auth-response.dto'
import { RefreshToken } from './entities/refresh-token.entity'
import { MailService } from './services/mail-sender.service'
import { TokenService } from './services/token.service'
import { STATUS } from 'src/common/enum/user-type.enum'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, passwordToValidate: string): Promise<Partial<User> | null> {
    try {
      const user = await this.usersService.findByEmail(email)

      if (!user || user.status !== STATUS.ACTIVE) return null

      const isPasswordValid = await user.validatePassword(passwordToValidate)

      if (!isPasswordValid) return null

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user
      return result
    } catch {
      return null
    }
  }

  async login(loginDto: LoginDto, req: Request): Promise<AuthResponseDto> {
    try {
      const user = await this.usersService.findOneByEmail(loginDto.email)

      if (!user) {
        throw new UnauthorizedException('Tài khoản hoặc mật khẩu không hợp lệ.')
      }

      if (user.status !== STATUS.ACTIVE) {
        throw new UnauthorizedException('Tài khoản đang bị khoá. Vui lòng liên hệ với quản trị viên.')
      }

      const isPasswordValid = await user.validatePassword(loginDto.password)

      if (!isPasswordValid) {
        throw new UnauthorizedException('Tài khoản hoặc mật khẩu không hợp lệ.')
      }

      const tokens = await this.tokenService.generateTokenPair(user, {
        deviceInfo: req.headers['user-agent'] as string,
        ip: req.ip,
      })

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.getRoleName,
          organization: user.getOrganizationName,
        },
      }
    } catch (error) {
      console.error('Login error:', error instanceof Error ? error.message : 'Unknown error')
      if (error instanceof UnauthorizedException) {
        throw error
      }

      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không hợp lệ.')
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      const { token: storedToken } = await this.tokenService.verifyRefreshToken(refreshTokenDto)

      if (storedToken.user.status !== STATUS.ACTIVE) {
        throw new UnauthorizedException('User is inactive')
      }

      const originalExpirationTime = Math.floor(storedToken.expiresAt.getTime() / 1000)

      const tokens = await this.tokenService.generateTokenPairWithExistingExpiration(
        storedToken.user,
        originalExpirationTime,
      )

      return {
        ...tokens,
        user: {
          id: storedToken.user.id,
          email: storedToken.user.email,
          firstName: storedToken.user.firstName,
          lastName: storedToken.user.lastName,
          role: storedToken.user.getRoleName,
          organization: storedToken.user.getOrganizationName,
        },
      }
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
        throw error
      }

      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async logout(logoutDto: LogoutDto): Promise<{ success: boolean }> {
    try {
      await this.tokenService.revokeRefreshToken(logoutDto)
    } catch {
      return { success: true }
    }
    return { success: true }
  }

  async revokeAllUserTokens(userId: number): Promise<{ success: boolean; message: string }> {
    const count = await this.tokenService.revokeAllUserTokens(userId)
    return {
      success: true,
      message: `All refresh tokens revoked (${count} tokens)`,
    }
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.usersService.findOne(userId)
      const isPasswordValid = await user.validatePassword(changePasswordDto.currentPassword)

      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect')
      }

      if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
        throw new ConflictException('New password must be different from the current password')
      }

      await this.usersService.updatePassword(userId, changePasswordDto.newPassword)

      await this.revokeAllUserTokens(userId)

      return {
        success: true,
        message: 'Password changed successfully. You will need to log in again with your new password.',
      }
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ConflictException) {
        throw error
      }

      throw new UnauthorizedException('Failed to change password')
    }
  }

  async handleForgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email)
    if (!user) {
      throw new NotFoundException('Email không tồn tại')
    }
    const token = this.jwtService.sign({ sub: user.id, email: user.email }, { expiresIn: '15m' })
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
    const brandName = process.env.BRAND_NAME || 'Rakuni'
    const logoUrl =
      process.env.LOGO_URL ||
      'https://firebasestorage.googleapis.com/v0/b/society-7c8c1.appspot.com/o/005daee8-5d20-4d5a-8c3b-9ee406655a38png?alt=media&token=d5da25fa-f95d-4201-8f64-1033f6b63e35'
    this.logger.log(`Sending password reset email to ${user.email} with link: ${resetLink}`)
    await this.mailService.sendEmail({
      to: user.email,
      subject: `Yêu cầu đặt lại mật khẩu - ${brandName}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="background-color: #0056b3; padding: 20px 40px;">
              <img src="${logoUrl}" alt="${brandName} Logo" style="height: 40px;" />
            </div>
            <div style="padding: 30px 40px; color: #333;">
              <h2 style="color: #0056b3;">Yêu cầu đặt lại mật khẩu</h2>
              <p>Xin chào <strong>${user.fullName || user.email}</strong>,</p>
              <p>Bạn vừa yêu cầu đặt lại mật khẩu tài khoản của mình. Nếu đây là bạn, vui lòng nhấn vào nút bên dưới để tiếp tục.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #0056b3; color: white; text-decoration: none; border-radius: 4px;">
                  Đặt lại mật khẩu
                </a>
              </div>
              <p>Nếu bạn không yêu cầu điều này, bạn có thể bỏ qua email này.</p>
              <p>Liên kết sẽ hết hạn sau <strong>15 phút</strong> vì lý do bảo mật.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 14px; color: #888;">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
              <p style="font-size: 14px; color: #888;">Đội ngũ ${brandName}</p>
            </div>
            <div style="background-color: #f1f1f1; padding: 20px 40px; text-align: center; font-size: 12px; color: #888;">
              © ${new Date().getFullYear()} ${brandName}. All rights reserved.
            </div>
          </div>
        </div>
        `,
    })
    return { message: 'Link đặt lại mật khẩu đã được gửi đến email của bạn.' }
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: any
    try {
      payload = this.jwtService.verify(token)
    } catch (e) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn')
    }
    const user = await this.usersService.findOne(+payload.sub)
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại')
    }
    await this.usersService.updatePassword(user.id, newPassword)

    return { message: 'Mật khẩu đã được thay đổi thành công.' }
  }
}
