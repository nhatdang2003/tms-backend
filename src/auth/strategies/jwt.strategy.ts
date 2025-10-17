import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { UsersService } from '../../users/users.service'
import { STATUS } from 'src/common/enum/user-type.enum'

interface JwtPayload {
  sub: number // user id
  email: string
  iat?: number
  exp?: number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secretKey = configService.get<string>('JWT_ACCESS_SECRET')

    if (!secretKey) {
      throw new Error('JWT_ACCESS_SECRET environment variable is not set')
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    })
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.usersService.findOne(payload.sub)

      if (!user || user.status !== STATUS.ACTIVE) {
        throw new UnauthorizedException('User is inactive or does not exist')
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.getRoleName,
        organization: user.getOrganizationName,
      }
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
