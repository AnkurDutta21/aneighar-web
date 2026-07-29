import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/stores/authStore';
import { AppTabNavigator } from './AppTabNavigator';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import { navigationRef } from './navigationRef';
import type { RootStackParamList } from './types';

// Public screens — placeholders until Phase 4–5
function HomeScreen() { return <PlaceholderScreen name="Home" />; }
function LoginScreen() { return <PlaceholderScreen name="Login" />; }
function RegisterScreen() { return <PlaceholderScreen name="Register" />; }
function PhoneLoginScreen() { return <PlaceholderScreen name="Phone Login" />; }
function ResetPasswordScreen() { return <PlaceholderScreen name="Reset Password" />; }
function PGListScreen() { return <PlaceholderScreen name="Browse PGs" />; }
function PGDetailScreen() { return <PlaceholderScreen name="PG Details" />; }
function OnboardingScreen() { return <PlaceholderScreen name="Onboarding" />; }

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, user } = useAuthStore();
  const needsOnboarding = isAuthenticated && user && user.isOnboarded === false;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Always accessible public screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PGList" component={PGListScreen} />
        <Stack.Screen name="PGDetail" component={PGDetailScreen} />

        {!isAuthenticated ? (
          // ── Unauthenticated ────────────────────────────────────────────────
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
            />
          </>
        ) : needsOnboarding ? (
          // ── Authenticated but needs onboarding ────────────────────────────
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ gestureEnabled: false }}
          />
        ) : (
          // ── Fully authenticated ───────────────────────────────────────────
          <Stack.Screen name="AppTabs" component={AppTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
