import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

interface AuthUser {
  id: string
  email: string
  roles?: string[]
}

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<T extends AuthUser>(err: any, user: T, info: any, context: ExecutionContext): T | null {
    if (err || !user) {
      return null
    }

    return user
  }
}
