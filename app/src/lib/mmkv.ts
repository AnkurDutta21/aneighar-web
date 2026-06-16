import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

/**
 * MMKV instance for the app (react-native-mmkv v3 API).
 * - v3 uses `createMMKV()` factory (not `new MMKV()`)
 * - v3 uses `storage.set()` for all types
 * - v3 uses `storage.remove()` (not `delete()`)
 *
 * Replaces localStorage from web — synchronous and ~10x faster than AsyncStorage.
 */
export const storage = createMMKV({
  id: 'anei-ghar-storage',
});

/**
 * Zustand-compatible MMKV storage adapter.
 * Pass this as `storage` in zustand/middleware `persist()`.
 */
export const mmkvStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.remove(name);
  },
};
