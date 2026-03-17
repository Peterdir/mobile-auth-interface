import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/src/components/haptic-tab';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { usePresenceSync } from '@/src/hooks/usePresenceSync';
import { Platform, View } from 'react-native';
import { useSelector } from 'react-redux';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const user = useSelector((state: any) => state.auth.user);

  // Connect to presence websocket globally while user is in tabs
  usePresenceSync();

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
        name="notifications"
        options={{
          title: 'Các Thông Báo',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bell.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Bạn',
          tabBarIcon: ({ color }) => (
            <View style={{ position: 'relative' }}>
              <IconSymbol size={28} name="person.crop.circle.fill" color={color} />
              {user && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    right: -1,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#23A559',
                    borderWidth: 2,
                    borderColor: '#1E1F22',
                  }}
                />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
