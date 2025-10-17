import { Injectable, Logger, UnauthorizedException, InternalServerErrorException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RefreshToken } from '../entities/refresh-token.entity'
import { User } from '../../users/entities/user.entity'
import { TokenPairDto } from '../dto/response/token-pair.dto'
import { RefreshTokenDto } from '../dto/request/refresh-token.dto'
import { LogoutDto } from '../dto/request/logout.dto'
import { TokenExpiredError } from 'jsonwebtoken'

export class TokenException extends UnauthorizedException {
  constructor(message: string = 'Token error') {
    super(message)
  }
}

export class TokenExpiredException extends TokenException {
  constructor() {
    super('Token expired')
  }
}

export class InvalidTokenException extends TokenException {
  constructor(message: string = 'Invalid token') {
    super(message)
  }
}

export class TokenRevokedException extends TokenException {
  constructor() {
    super('Token has been revoked')
  }
}

export class TokenNotFoundException extends TokenException {
  constructor() {
    super('Token not found')
  }
}

export interface JwtPayload {
  sub: number
  email: string
  tokenType?: string
  iat?: number
  exp?: number
}

interface ErrorWithMessage {
  message: string
  stack?: string
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,
  ) {}

  /**
   * Create a new pair of access token and refresh token for a user
   * @param user User information
   * @param deviceInfo Device information and IP (optional)
   * @returns New token pair
   */
  async generateTokenPair(user: User, deviceInfo?: { deviceInfo?: string; ip?: string }): Promise<TokenPairDto> {
    try {
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.getRoleName,
        organization: user.getOrganizationName,
      }

      const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET')
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')

      if (!accessSecret) {
        throw new InternalServerErrorException('JWT_ACCESS_SECRET environment variable is not set')
      }
      if (!refreshSecret) {
        throw new InternalServerErrorException('JWT_REFRESH_SECRET environment variable is not set')
      }

      const accessExpiration = this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m')
      const refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d')

      const accessTokenExpiration = this.calculateTokenExpiration(accessExpiration)
      const refreshTokenExpiration = this.calculateTokenExpiration(refreshExpiration)

      const access_token = this.jwtService.sign(payload, {
        secret: accessSecret,
        expiresIn: accessExpiration,
      })

      const refreshPayload = {
        ...payload,
        tokenType: 'refresh',
      }
      const refresh_token = this.jwtService.sign(refreshPayload, {
        secret: refreshSecret,
        expiresIn: refreshExpiration,
      })

      let existingToken: RefreshToken | null = null

      if (deviceInfo?.deviceInfo) {
        existingToken = await this.refreshTokensRepository.findOne({
          where: {
            userId: user.id,
            deviceInfo: deviceInfo.deviceInfo,
            isRevoked: false,
          },
        })
      }

      if (existingToken) {
        this.logger.debug(`Updating existing refresh token for user ${user.id}`)
        existingToken.token = refresh_token
        existingToken.expiresAt = refreshTokenExpiration
        existingToken.updatedAt = new Date()

        if (deviceInfo?.ip) {
          existingToken.ip = deviceInfo.ip
        }

        await this.refreshTokensRepository.save(existingToken)
      } else {
        await this.saveRefreshToken(refresh_token, refreshTokenExpiration, user, deviceInfo)
      }

      this.logger.debug(`Token pair generated successfully for user ${user.id}`)
      return {
        access_token,
        access_token_expires_at: Math.floor(accessTokenExpiration.getTime() / 1000),
        refresh_token,
        refresh_token_expires_at: Math.floor(refreshTokenExpiration.getTime() / 1000),
      }
    } catch (error) {
      const errorMessage = isErrorWithMessage(error) ? error.message : 'Unknown error'
      const errorStack = isErrorWithMessage(error) && error.stack ? error.stack : undefined
      this.logger.error(`Error generating token pair for user ${user.id}: ${errorMessage}`, errorStack)
      throw error
    }
  }

  /**
   * Verify refresh token and return token information
   * @param refreshTokenDto DTO containing the refresh token
   * @returns Token information and payload
   */
  async verifyRefreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ token: RefreshToken; payload: JwtPayload }> {
    this.logger.debug('Verifying refresh token')

    try {
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')
      if (!refreshSecret) {
        throw new InternalServerErrorException('JWT_REFRESH_SECRET environment variable is not set')
      }

      let payload: JwtPayload

      try {
        payload = this.jwtService.verify<JwtPayload>(refreshTokenDto.refresh_token, {
          secret: refreshSecret,
        })
      } catch (error) {
        if (error instanceof TokenExpiredError) {
          this.logger.warn(`Token expired: ${error.message}`)
          throw new TokenExpiredException()
        }
        const errorMessage = isErrorWithMessage(error) ? error.message : 'Invalid token'
        this.logger.warn(`Invalid token: ${errorMessage}`)
        throw new InvalidTokenException()
      }

      if (payload.tokenType !== 'refresh') {
        this.logger.warn(`Token type is not 'refresh': ${payload.tokenType}`)
        throw new InvalidTokenException('Token is not a refresh token')
      }

      const token = await this.refreshTokensRepository
        .createQueryBuilder('token')
        .where('token.token = :tokenValue', { tokenValue: refreshTokenDto.refresh_token })
        .leftJoinAndSelect('token.user', 'user')
        .leftJoin('user.userRoles', 'userRole')
        .leftJoinAndSelect('userRole.role', 'role')
        .select([
          'token',
          'user.id',
          'user.email',
          'user.firstName',
          'user.lastName',
          'user.isActive',
          'user.password',
          'userRole.id',
          'userRole.userId',
          'userRole.roleId',
          'role.id',
          'role.name',
        ])
        .getOne()

      if (!token) {
        this.logger.warn(`Refresh token not found in database: ${refreshTokenDto.refresh_token.substring(0, 10)}...`)
        throw new TokenNotFoundException()
      }

      if (token.isRevoked) {
        this.logger.warn(`Refresh token has been revoked: ${refreshTokenDto.refresh_token.substring(0, 10)}...`)
        throw new TokenRevokedException()
      }

      this.logger.debug(`Refresh token verified successfully for user ${token.userId}`)
      return { token, payload }
    } catch (error) {
      if (error instanceof TokenException) {
        throw error
      }
      const errorMessage = isErrorWithMessage(error) ? error.message : 'Unknown error'
      const errorStack = isErrorWithMessage(error) && error.stack ? error.stack : undefined
      this.logger.error(`Error verifying refresh token: ${errorMessage}`, errorStack)
      throw new InvalidTokenException()
    }
  }

  async revokeRefreshToken(logoutDto: LogoutDto): Promise<boolean> {
    this.logger.debug(`Revoking refresh token: ${logoutDto.refresh_token.substring(0, 10)}...`)

    try {
      const refreshToken = await this.refreshTokensRepository.findOne({
        where: { token: logoutDto.refresh_token },
      })

      if (!refreshToken) {
        this.logger.warn(`Refresh token not found: ${logoutDto.refresh_token.substring(0, 10)}...`)
        return false
      }

      refreshToken.isRevoked = true
      refreshToken.revokedAt = new Date()
      refreshToken.revokedReason = 'User logout'

      await this.refreshTokensRepository.save(refreshToken)

      this.logger.debug(`Refresh token revoked successfully for user ${refreshToken.userId}`)
      return true
    } catch (error) {
      const errorMessage = isErrorWithMessage(error) ? error.message : 'Unknown error'
      const errorStack = isErrorWithMessage(error) && error.stack ? error.stack : undefined
      this.logger.error(`Error revoking refresh token: ${errorMessage}`, errorStack)
      return false
    }
  }

  async revokeAllUserTokens(userId: number): Promise<number> {
    this.logger.debug(`Revoking all refresh tokens for user ${userId}`)

    try {
      const tokens = await this.refreshTokensRepository.find({
        where: { userId, isRevoked: false },
      })

      if (tokens.length === 0) {
        this.logger.debug(`No active tokens found for user ${userId}`)
        return 0
      }

      for (const token of tokens) {
        token.isRevoked = true
        token.revokedAt = new Date()
        token.revokedReason = 'Admin revoked all sessions'
      }

      await this.refreshTokensRepository.save(tokens)

      this.logger.debug(`Revoked ${tokens.length} tokens for user ${userId}`)
      return tokens.length
    } catch (error) {
      const errorMessage = isErrorWithMessage(error) ? error.message : 'Unknown error'
      const errorStack = isErrorWithMessage(error) && error.stack ? error.stack : undefined
      this.logger.error(`Error revoking all tokens for user ${userId}: ${errorMessage}`, errorStack)
      return 0
    }
  }

  async generateTokenPairWithExistingExpiration(user: User, refreshTokenExpiresAt: number): Promise<TokenPairDto> {
    this.logger.debug(`Generating token pair with existing expiration for user ${user.id}`)

    try {
      const payload = { sub: user.id, email: user.email, role: user.getRoleName }

      const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET')
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')

      if (!accessSecret) {
        throw new InternalServerErrorException('JWT_ACCESS_SECRET environment variable is not set')
      }
      if (!refreshSecret) {
        throw new InternalServerErrorException('JWT_REFRESH_SECRET environment variable is not set')
      }

      const accessExpiration = this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m')
      const accessTokenExpiration = this.calculateTokenExpiration(accessExpiration)

      const refreshTokenExpiration = new Date(refreshTokenExpiresAt * 1000)
      const secondsUntilRefreshExpires = Math.floor((refreshTokenExpiration.getTime() - Date.now()) / 1000)

      if (secondsUntilRefreshExpires <= 0) {
        throw new TokenExpiredException()
      }

      console.log(payload)
      const access_token = this.jwtService.sign(payload, {
        secret: accessSecret,
        expiresIn: accessExpiration,
      })

      const refreshPayload = {
        ...payload,
        tokenType: 'refresh',
      }
      console.log(refreshPayload)

      const refresh_token = this.jwtService.sign(refreshPayload, {
        secret: refreshSecret,
        expiresIn: secondsUntilRefreshExpires,
      })

      const existingToken = await this.refreshTokensRepository.findOne({
        where: {
          userId: user.id,
          isRevoked: false,
        },
      })

      if (existingToken) {
        this.logger.debug(`Updating existing refresh token for user ${user.id}`)
        existingToken.token = refresh_token
        existingToken.expiresAt = refreshTokenExpiration
        existingToken.updatedAt = new Date()
        await this.refreshTokensRepository.save(existingToken)
      } else {
        await this.saveRefreshToken(refresh_token, refreshTokenExpiration, user)
      }

      this.logger.debug(`Token pair with existing expiration generated successfully for user ${user.id}`)
      return {
        access_token,
        access_token_expires_at: Math.floor(accessTokenExpiration.getTime() / 1000),
        refresh_token,
        refresh_token_expires_at: refreshTokenExpiresAt, // Use the original expiration time
      }
    } catch (error) {
      const errorMessage = isErrorWithMessage(error) ? error.message : 'Unknown error'
      const errorStack = isErrorWithMessage(error) && error.stack ? error.stack : undefined
      this.logger.error(
        `Error generating token pair with existing expiration for user ${user.id}: ${errorMessage}`,
        errorStack,
      )
      throw error
    }
  }

  private calculateTokenExpiration(expiration: string): Date {
    const tokenExpiration = new Date()

    if (expiration.includes('d')) {
      const days = parseInt(expiration.replace('d', ''))
      tokenExpiration.setDate(tokenExpiration.getDate() + days)
    } else if (expiration.includes('h')) {
      const hours = parseInt(expiration.replace('h', ''))
      tokenExpiration.setHours(tokenExpiration.getHours() + hours)
    } else if (expiration.includes('m')) {
      const minutes = parseInt(expiration.replace('m', ''))
      tokenExpiration.setMinutes(tokenExpiration.getMinutes() + minutes)
    } else if (expiration.includes('s')) {
      const seconds = parseInt(expiration.replace('s', ''))
      tokenExpiration.setSeconds(tokenExpiration.getSeconds() + seconds)
    } else {
      if (expiration === 'JWT_ACCESS_EXPIRATION') {
        tokenExpiration.setMinutes(tokenExpiration.getMinutes() + 15)
      } else {
        tokenExpiration.setDate(tokenExpiration.getDate() + 7)
      }
    }

    return tokenExpiration
  }

  private async saveRefreshToken(
    token: string,
    expiresAt: Date,
    user: User,
    deviceInfo?: { deviceInfo?: string; ip?: string },
  ): Promise<RefreshToken> {
    const refreshTokenEntity = new RefreshToken()
    refreshTokenEntity.token = token
    refreshTokenEntity.expiresAt = expiresAt
    refreshTokenEntity.user = user
    refreshTokenEntity.userId = user.id
    refreshTokenEntity.isRevoked = false

    if (deviceInfo?.deviceInfo) {
      refreshTokenEntity.deviceInfo = deviceInfo.deviceInfo
    }

    if (deviceInfo?.ip) {
      refreshTokenEntity.ip = deviceInfo.ip
    }

    return this.refreshTokensRepository.save(refreshTokenEntity)
  }
}
