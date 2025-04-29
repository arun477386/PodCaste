import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { colors } from '../../styles/colors';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { User } from '../../types/database';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeColors = colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const data = await userService.getUser(user.uid);
        setUserData(data);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: Platform.OS === 'android' ? 64 : 80,
          paddingBottom: Platform.OS === 'android' ? 8 : 24,
          paddingTop: 8,
          backgroundColor: themeColors.background,
          borderTopWidth: 0.5,
          borderTopColor: themeColors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          color: themeColors.textSecondary,
        },
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textSecondary,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="Categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="format-list-bulleted" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="upload"
        options={{
          title: 'Upload',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="editor"
        options={{
          title: 'Editor',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-edit-outline" size={size} color={color} />
          ),
          href: userData?.role === 'editor' ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 