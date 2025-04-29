import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useColorScheme } from 'react-native';
import { colors } from '../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const themeColors = colors[colorScheme ?? 'light'];

  const adminOptions = [
    {
      id: '1',
      title: 'Article Management',
      icon: 'newspaper-outline',
      route: '/admin-folder/ArticlesForAdminapproval',
    },
    {
      id: '2',
      title: 'User Management',
      icon: 'people-outline',
      route: '/admin-folder/users',
    },
    {
      id: '3',
      title: 'Category Management',
      icon: 'grid-outline',
      route: '/admin-folder/category-management',
    },
    {
      id: '4',
      title: 'Analytics',
      icon: 'bar-chart-outline',
      route: '/admin-folder/analytics',
    },
    {
      id: '5',
      title: 'Recent Activities',
      icon: 'time-outline',
      route: '/admin-folder/activities',
    },
  ];

  const renderAdminOption = ({ item }: { item: typeof adminOptions[0] }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        { backgroundColor: themeColors.cardBackground }
      ]}
      onPress={() => router.push(item.route)}
    >
      <View style={styles.optionContent}>
        <Ionicons
          name={item.icon as any}
          size={24}
          color={themeColors.buttonPrimary}
          style={styles.optionIcon}
        />
        <Text style={[styles.optionText, { color: themeColors.textPrimary }]}>
          {item.title}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={themeColors.textSecondary}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
            Admin Dashboard
          </Text>
        </View>
        
        <FlatList
          data={adminOptions}
          renderItem={renderAdminOption}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 8,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
}); 