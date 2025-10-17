import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserLoginResponseDto } from '../dto/response/user-response.dto'
import { Request } from 'express'

interface RequestWithUser extends Request {
  user: UserLoginResponseDto
}

/**
 * Custom decorator để truy cập người dùng hiện tại từ request
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: UserLoginResponseDto) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): UserLoginResponseDto => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>()
  return request.user
})
