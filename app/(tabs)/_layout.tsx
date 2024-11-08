import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarStyle: {
          display: route.name === 'example' ? 'none' : 'flex',
        },
      })}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
                      <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
                    ),
        }}
      />
      <Tabs.Screen
        name="auth"
        options={{
          title: 'Auth',
          tabBarButton:()=>null
        }}
      />
      <Tabs.Screen
        name="beer-details/[id]"
        options={{
          title: 'Beer',
          tabBarButton:()=>null
        }}
      />
    </Tabs>
  );
}
