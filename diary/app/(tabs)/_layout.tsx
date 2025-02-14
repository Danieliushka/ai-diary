import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LogoutButton } from '@/components/LogoutButton';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        headerRight: () => <LogoutButton />,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
      }}
      initialRouteName="ai-chat"
    >
      <Tabs.Screen
        name="ai-chat"
        options={{
          title: 'AI Чат',
          tabBarIcon: ({ color }) => <MaterialIcons name="chat" size={24} color={color} />,
          tabBarLabel: 'AI Чат'
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Задачник',
          tabBarIcon: ({ color }) => <MaterialIcons name="assignment" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Цілі',
          tabBarIcon: ({ color }) => <MaterialIcons name="flag" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: 'Щоденник',
          tabBarIcon: ({ color }) => <MaterialIcons name="book" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
