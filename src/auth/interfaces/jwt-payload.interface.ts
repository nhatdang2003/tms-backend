export interface JwtPayload {
  sub: string
  email: string
  tokenType?: string
  iat?: number
  exp?: number
}
