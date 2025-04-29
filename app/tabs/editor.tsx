import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useColorScheme } from 'react-native';
import { colors } from '../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { articleService } from '../../services/articleService';
import { userService } from '../../services/userService';
import { Article } from '../../types/database';
import { Ionicons } from '@expo/vector-icons';

export default function EditorScreen() {
  const colorScheme = useColorScheme();
  const themeColors = colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { articles, isLoadingArticles, refreshArticles } = useApp();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [userLanguage, setUserLanguage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserLanguage = async () => {
      if (!user) return;
      try {
        const userData = await userService.getUser(user.uid);
        if (userData) {
          setUserLanguage(userData.language);
        }
      } catch (err) {
        console.error('Failed to fetch user language:', err);
      }
    };

    fetchUserLanguage();
  }, [user]);

  // Filter articles that need editor approval and match user's language
  const pendingArticles = articles.filter(
    article => article.editorStatus === 'pending' && article.language === userLanguage
  );

  const handleApproveArticle = async (articleId: string) => {
    if (!articleId || !user) {
      Alert.alert('Error', 'Article ID or user information is missing');
      return;
    }
    
    try {
      setUpdatingStatus(articleId);
      await articleService.approveArticleAsEditor(articleId, user.uid);
      await refreshArticles();
      Alert.alert('Success', 'Article approved successfully');
    } catch (error: any) {
      console.error('Error approving article:', error);
      Alert.alert('Error', error.message || 'Failed to approve article');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const renderArticleItem = ({ item }: { item: Article }) => (
    <View style={[styles.articleCard, { backgroundColor: themeColors.cardBackground }]}>
      <TouchableOpacity
        style={styles.articleContent}
        onPress={() => router.push(`/article-view?id=${item.id}`)}
      >
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.articleImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.contentWrapper}>
          <View style={styles.titleSection}>
            <Text style={[styles.label, { color: themeColors.buttonPrimary }]}>Article</Text>
            <Text style={[styles.articleTitle, { color: themeColors.textPrimary }]}>
              {item.title}
            </Text>
          </View>
          
          <View style={styles.contentSection}>
            <Text style={[styles.articleExcerpt, { color: themeColors.textSecondary }]}>
              {item.content.substring(0, 100)}...
            </Text>
          </View>

          <View style={styles.articleMeta}>
            <View style={styles.metaItem}>
              <View style={styles.metaLabelContainer}>
                <Ionicons name="person-outline" size={14} color={themeColors.textSecondary} />
                <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Author</Text>
              </View>
              <Text 
                style={[styles.articleAuthor, { color: themeColors.textPrimary }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.authorId}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <View style={styles.metaLabelContainer}>
                <Ionicons name="calendar-outline" size={14} color={themeColors.textSecondary} />
                <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Submitted</Text>
              </View>
              <Text 
                style={[styles.articleDate, { color: themeColors.textPrimary }]}
                numberOfLines={1}
              >
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (isLoadingArticles) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.buttonPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
            Editor Review
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={refreshArticles}
          >
            <Ionicons name="refresh" size={24} color={themeColors.buttonPrimary} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={pendingArticles}
          renderItem={renderArticleItem}
          keyExtractor={(item) => item.id || `article-${item.title}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                {userLanguage ? 'No articles to review in your language' : 'Loading language preferences...'}
              </Text>
            </View>
          }
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  refreshButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  articleCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  articleImage: {
    width: '100%',
    height: 180,
  },
  articleContent: {
    flex: 1,
  },
  contentWrapper: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
    lineHeight: 24,
  },
  contentSection: {
    marginBottom: 12,
  },
  articleExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Open Sans',
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: 16,
  },
  metaItem: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  metaLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Inter',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  articleAuthor: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter',
    flexShrink: 1,
  },
  articleDate: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter',
    flexShrink: 1,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: 8,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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