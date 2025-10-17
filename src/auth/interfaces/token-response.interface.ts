export interface TokenResponse {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse extends TokenResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    organization: string
  }
}
