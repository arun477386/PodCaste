import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator, Alert } from 'react-native';
import { useColorScheme } from 'react-native';
import { colors } from '../../styles/colors';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '../../types/database';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const themeColors = colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      router.replace('/signin');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: themeColors.buttonPrimary }]}>
                <Ionicons name="person" size={40} color={themeColors.buttonText} />
              </View>
            )}
          </View>
          <Text style={[styles.name, { color: themeColors.textPrimary }]}>
            {user?.displayName || 'User'}
          </Text>
          <Text style={[styles.email, { color: themeColors.textSecondary }]}>
            {user?.email}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
            Account Settings
          </Text>
          
          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: themeColors.border }]}
            onPress={() => router.push('/profile/edit')}
          >
            <View style={styles.settingContent}>
              <Ionicons name="person-outline" size={24} color={themeColors.textPrimary} />
              <Text style={[styles.settingText, { color: themeColors.textPrimary }]}>
                Edit Profile
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={themeColors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: themeColors.border }]}
            onPress={() => router.push('/profile/my-articles')}
          >
            <View style={styles.settingContent}>
              <MaterialCommunityIcons name="newspaper-variant-outline" size={24} color={themeColors.textPrimary} />
              <Text style={[styles.settingText, { color: themeColors.textPrimary }]}>
                My Articles
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={themeColors.textSecondary} />
          </TouchableOpacity>

          {userData?.role === 'editor' && (
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: themeColors.border }]}
              onPress={() => router.push('/profile/recent-activities')}
            >
              <View style={styles.settingContent}>
                <Ionicons name="time-outline" size={24} color={themeColors.textPrimary} />
                <Text style={[styles.settingText, { color: themeColors.textPrimary }]}>
                  Recent Activities
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={themeColors.textSecondary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: themeColors.border }]}
            onPress={() => router.push('/profile/preferences')}
          >
            <View style={styles.settingContent}>
              <Ionicons name="settings-outline" size={24} color={themeColors.textPrimary} />
              <Text style={[styles.settingText, { color: themeColors.textPrimary }]}>
                Preferences
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={themeColors.textSecondary} />
          </TouchableOpacity>

          {userData?.role === 'admin' && (
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: themeColors.border }]}
              onPress={() => router.push('/admin-folder/dashboard')}
            >
              <View style={styles.settingContent}>
                <Ionicons name="shield-outline" size={24} color={themeColors.textPrimary} />
                <Text style={[styles.settingText, { color: themeColors.textPrimary }]}>
                  Admin Mode
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={themeColors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: themeColors.error }]}
          onPress={handleSignOut}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={themeColors.buttonText} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={24} color={themeColors.buttonText} />
              <Text style={[styles.signOutText, { color: themeColors.buttonText }]}>
                Sign Out
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'Roboto', android: 'Roboto' }),
  },
  email: {
    fontSize: 16,
    fontFamily: Platform.select({ ios: 'Open Sans', android: 'OpenSans' }),
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: Platform.select({ ios: 'Roboto', android: 'Roboto' }),
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 16,
    fontFamily: Platform.select({ ios: 'Open Sans', android: 'OpenSans' }),
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  signOutText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Roboto', android: 'Roboto' }),
  },
}); 