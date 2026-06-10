import { apiRequest } from '../../lib/axiosClient'
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  User,
  VerifyEmailRequest,
} from './auth.types'

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

export async function forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
