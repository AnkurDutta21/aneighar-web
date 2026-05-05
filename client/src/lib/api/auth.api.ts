import apiClient from './client'
import type { LoginInput, RegisterInput } from '@/features/auth/auth.types'

export const authApi = {
  register: (data: RegisterInput) =>
    apiClient.post('/auth/register', data).then((r) => r.data.data),

  login: (data: LoginInput) =>
    apiClient.post('/auth/login', data).then((r) => r.data.data),

  logout: () => apiClient.post('/auth/logout'),

  getMe: () => apiClient.get('/auth/me').then((r) => r.data.data.user),

  refresh: () => apiClient.post('/auth/refresh').then((r) => r.data.data),
}
