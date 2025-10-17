import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

interface AuthUser {
  id: string
  email: string
  roles?: string[]
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<T extends AuthUser>(err: any, user: T, info: any, context: ExecutionContext): T {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token')
    }

    return user
  }
}
