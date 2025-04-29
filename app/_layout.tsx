import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from '../contexts/AuthContext';
import { AppProvider } from '../contexts/AppContext';

export default function Layout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <AuthProvider>
      <AppProvider>
        <SafeAreaProvider>
          <StatusBar 
            style={isDark ? 'light' : 'dark'}
            backgroundColor={isDark ? '#121212' : '#F5F5F5'}
            translucent={true}
          />
          <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#F5F5F5' }}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: isDark ? '#121212' : '#F5F5F5',
                },
              }}
            />
          </SafeAreaView>
        </SafeAreaProvider>
      </AppProvider>
    </AuthProvider>
  );
} 