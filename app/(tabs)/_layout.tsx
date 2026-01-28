import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/src/components/haptic-tab';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Platform } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#DBDEE1',
        tabBarInactiveTintColor: '#949BA4',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: '#1E1F22',
            borderTopColor: '#2B2D31',
          },
          default: {
            backgroundColor: '#1E1F22',
            borderTopColor: '#2B2D31',
          },
        }),
        tabBarBackground: () => null,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications" // Assuming you might have/want this, otherwise we can point to something else
        options={{
          title: 'Các Thông Báo',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bell.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile" // Assuming a profile screen
        options={{
          title: 'Bạn',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="smiley.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
