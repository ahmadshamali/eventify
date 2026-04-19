import { apiRequest } from '../../lib/axiosClient'
import type { LoginRequest, LoginResponse, RegisterRequest, User, VerifyEmailRequest } from './auth.types'

export async function register(data: RegisterRequest): Promise<User> {
  return apiRequest<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function verifyEmail(data: VerifyEmailRequest): Promise<User> {
  return apiRequest<User>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
