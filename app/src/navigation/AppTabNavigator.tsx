import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/stores/authStore';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import type { AppTabParamList } from './types';

// Tab screens — will be replaced in Phase 5–6
function HomeTabScreen() { return <PlaceholderScreen name="Home" />; }
function BrowseTabScreen() { return <PlaceholderScreen name="Browse PGs" />; }
function DashboardTabScreen() { return <PlaceholderScreen name="Dashboard" />; }
function InquiriesTabScreen() { return <PlaceholderScreen name="Inquiries" />; }
function SavedTabScreen() { return <PlaceholderScreen name="Saved Listings" />; }
function ListingsTabScreen() { return <PlaceholderScreen name="My Listings" />; }

/**
 * NOTE: Using a Stack temporarily until Phase 5 when real screens are ready.
 * This will be replaced with createBottomTabNavigator in Phase 5.
 */
const Stack = createNativeStackNavigator<AppTabParamList>();

export function AppTabNavigator() {
  const { user } = useAuthStore();
  const isOwner = user?.role === 'owner';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeTab" component={HomeTabScreen} />
      <Stack.Screen name="BrowseTab" component={BrowseTabScreen} />
      {isOwner ? (
        <>
          <Stack.Screen name="DashboardTab" component={DashboardTabScreen} />
          <Stack.Screen name="ListingsTab" component={ListingsTabScreen} />
          <Stack.Screen name="InquiriesTab" component={InquiriesTabScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="InquiriesTab" component={InquiriesTabScreen} />
          <Stack.Screen name="SavedTab" component={SavedTabScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
