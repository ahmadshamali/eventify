import { apiRequest } from '../../lib/axiosClient'
import type { RegisterRequest, User } from './auth.types'

export async function register(data: RegisterRequest): Promise<User> {
  return apiRequest<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
