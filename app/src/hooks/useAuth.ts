import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import type { LoginPayload, RegisterPayload, UpdateProfilePayload } from '@/types';

/**
 * Auth hooks — identical business logic to web hooks/useAuth.ts.
 * Only difference: logout navigates via the navigation ref instead of window.location.
 */

export function useLogin() {
  const { setAuth } = useAuthStore();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data.data.user, data.data.accessToken);
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      setAuth(data.data.user, data.data.accessToken);
    },
  });
}

export function usePhoneLogin() {
  const { setAuth } = useAuthStore();
  return useMutation({
    mutationFn: (idToken: string) => authApi.phoneLogin(idToken),
    onSuccess: (data) => {
      setAuth(data.data.user, data.data.accessToken);
    },
  });
}

export function useUpdateProfile() {
  const { setAuth, accessToken } = useAuthStore();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authApi.updateProfile(payload),
    onSuccess: (data) => {
      if (accessToken) {
        setAuth(data.data.user, accessToken);
      }
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      qc.clear();
    },
    onError: () => {
      // Always clear local state even if server call fails
      logout();
      qc.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword({ token, password }),
  });
}
