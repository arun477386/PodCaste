import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'react-native';
import { colors } from '../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { articleService } from '../../services/articleService';
import { userService } from '../../services/userService';
import { Article } from '../../types/database';
import { useAuth } from '../../contexts/AuthContext';

export default function RecentActivitiesScreen() {
  const colorScheme = useColorScheme();
  const themeColors = colors[colorScheme ?? 'light'];
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        const data = await userService.getUser(user.uid);
        setUserData(data);
        fetchActivities(data);
      }
    };

    fetchUserData();
  }, [user?.uid]);

  const fetchActivities = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.uid) {
        setError('User not authenticated');
        return;
      }
      
      // Fetch all articles
      const allArticles = await articleService.getAllArticles();
      
      // Create activity items for editor actions
      const activityItems = await Promise.all(
        allArticles.flatMap(async (article) => {
          const author = await userService.getUser(article.authorId);
          const editor = article.approvedEditorIdUid ? 
            await userService.getUser(article.approvedEditorIdUid) : null;

          const activities = [];

          // Editor approval activity
          if (article.editorStatus === 'approved' && article.approvedEditorIdUid) {
            // For admin, show all activities. For editor, show only their own activities
            if (userData?.role === 'admin' || article.approvedEditorIdUid === user.uid) {
              activities.push({
                id: `${article.id}-editor-approved`,
                type: 'editor_approved',
                timestamp: article.updatedAt || new Date(),
                articleId: article.id,
                articleTitle: article.title,
                userName: editor?.displayName || 'Unknown Editor',
                userRole: 'Editor',
                status: 'approved',
                authorName: author?.displayName || 'Unknown Author'
              });
            }
          }

          return activities;
        })
      );

      // Flatten and sort all activities by timestamp
      const sortedActivities = activityItems
        .flat()
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setActivities(sortedActivities);
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

  const renderActivityItem = ({ item }: { item: any }) => {
    const isCurrentUser = item.userName === userData?.displayName;
    
    return (
      <View style={[styles.activityCard, { backgroundColor: themeColors.cardBackground }]}>
        <View style={styles.activityHeader}>
          <Ionicons 
            name="checkmark-circle-outline" 
            size={24} 
            color={themeColors.buttonPrimary} 
            style={styles.activityIcon}
          />
          <View style={styles.activityContent}>
            <Text style={[styles.activityText, { color: themeColors.textPrimary }]}>
              {isCurrentUser 
                ? `You approved article "${item.articleTitle}" by ${item.authorName}`
                : `${item.userName} (Editor) approved article "${item.articleTitle}" by ${item.authorName}`
              }
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
            {userData?.role === 'admin' ? 'All Editor Activities' : 'Editor Activities'}
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
            {userData?.role === 'admin' ? 'All Editor Activities' : 'Editor Activities'}
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: themeColors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: themeColors.buttonPrimary }]}
            onPress={() => fetchActivities(userData)}
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
          {userData?.role === 'admin' ? 'All Editor Activities' : 'Editor Activities'}
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
              No editor activities found
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