import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginInput, RegisterInput } from '@/features/auth/auth.types'

export const useRegister = () => {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: ({ user, accessToken }) => {
      setAuth(user, accessToken)
      navigate(user.role === 'owner' ? '/dashboard' : '/listings')
    },
  })
}

export const useLogin = () => {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: ({ user, accessToken }) => {
      setAuth(user, accessToken)
      navigate(user.role === 'owner' ? '/dashboard' : '/listings')
    },
  })
}

export const useLogout = () => {
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout()
      queryClient.clear()
      navigate('/login')
    },
    onError: () => {
      logout()
      queryClient.clear()
      navigate('/login')
    },
  })
}
