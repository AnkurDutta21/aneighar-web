import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { RootNavigator } from '@/navigation/RootNavigator';

/**
 * App root — wires all providers together.
 *
 * Provider order (outside-in):
 * 1. GestureHandlerRootView — required by react-native-gesture-handler
 * 2. SafeAreaProvider — provides safe area insets to all children
 * 3. QueryClientProvider — TanStack Query
 * 4. RootNavigator — navigation + screens
 */
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <RootNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
