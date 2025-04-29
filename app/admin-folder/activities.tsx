import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'react-native';
import { colors } from '../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { articleService } from '../../services/articleService';
import { userService } from '../../services/userService';
import { activityService } from '../../services/activityService';
import { Article } from '../../types/database';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';

export default function RecentActivitiesScreen() {
  const colorScheme = useColorScheme();
  const themeColors = colors[colorScheme ?? 'light'];
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all activities from Firebase
      const db = getFirestore();
      const activitiesRef = collection(db, 'activities');
      const q = query(activitiesRef, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const activitiesList = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const user = await userService.getUser(data.userId);
          
          return {
            id: doc.id,
            type: data.type,
            description: data.description,
            metadata: data.metadata || {},
            timestamp: data.createdAt?.toDate() || new Date(),
            userName: user?.displayName || 'Unknown User',
            userRole: user?.role || 'user'
          };
        })
      );

      setActivities(activitiesList);
    } catch (err) {
      setError('Failed to fetch activities');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    if (!date) return 'Unknown time';
    try {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'article_view':
        return 'eye-outline';
      case 'article_edit':
        return 'create-outline';
      case 'article_create':
        return 'add-circle-outline';
      case 'article_publish':
        return 'send-outline';
      case 'article_approve':
        return 'checkmark-circle-outline';
      case 'profile_update':
        return 'person-outline';
      case 'language_change':
        return 'language-outline';
      default:
        return 'time-outline';
    }
  };

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'article_view':
        return `${activity.userName} viewed article "${activity.metadata?.articleTitle || 'Unknown'}"`;
      case 'article_edit':
        return `${activity.userName} edited article "${activity.metadata?.articleTitle || 'Unknown'}"`;
      case 'article_create':
        return `${activity.userName} created article "${activity.metadata?.articleTitle || 'Unknown'}"`;
      case 'article_publish':
        return `${activity.userName} published article "${activity.metadata?.articleTitle || 'Unknown'}"`;
      case 'article_approve':
        return `${activity.userName} (${activity.userRole}) approved article "${activity.metadata?.articleTitle || 'Unknown'}"`;
      case 'profile_update':
        return `${activity.userName} updated their profile`;
      case 'language_change':
        return `${activity.userName} changed language to ${activity.metadata?.language || 'Unknown'}`;
      default:
        return activity.description || 'Unknown activity';
    }
  };

  const renderActivityItem = ({ item }: { item: any }) => {
    return (
      <View style={[styles.activityCard, { backgroundColor: themeColors.cardBackground }]}>
        <View style={styles.activityHeader}>
          <Ionicons 
            name={getActivityIcon(item.type)} 
            size={24} 
            color={themeColors.buttonPrimary} 
            style={styles.activityIcon}
          />
          <View style={styles.activityContent}>
            <Text style={[styles.activityText, { color: themeColors.textPrimary }]}>
              {getActivityText(item)}
            </Text>
            <Text style={[styles.timestamp, { color: themeColors.textSecondary }]}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
            Recent Activities
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.buttonPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
            Recent Activities
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: themeColors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: themeColors.buttonPrimary }]}
            onPress={fetchActivities}
          >
            <Text style={[styles.retryButtonText, { color: themeColors.buttonText }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
          Recent Activities
        </Text>
      </View>

      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id || ''}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
              No activities found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityIcon: {
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Open Sans',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Open Sans',
  },
}); 