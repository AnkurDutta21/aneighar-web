import { createRef } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/**
 * Global navigation ref — allows navigating from outside React components
 * (e.g., from apiClient interceptor on 401 auth failure).
 *
 * Equivalent to web's `window.location.href = '/login'` in apiClient.ts.
 */
export const navigationRef =
  createRef<NavigationContainerRef<RootStackParamList>>();

/**
 * Navigate to any route by name.
 * Uses `as never` cast — standard RN Navigation pattern for imperative navigation.
 */
export function navigate(name: string, params?: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore — imperative navigation outside React requires this cast
  navigationRef.current?.navigate(name, params);
}


export function resetToLogin() {
  navigationRef.current?.reset({
    index: 0,
    routes: [{ name: 'Login' }],
  });
}
