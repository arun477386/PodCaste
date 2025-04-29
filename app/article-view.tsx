import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useColorScheme } from 'react-native';
import { colors } from '../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { articleService } from '../services/articleService';
import { Ionicons } from '@expo/vector-icons';

export default function ArticleViewScreen() {
  const colorScheme = useColorScheme();
  const themeColors = colors[colorScheme ?? 'light'];
  const { id, source } = useLocalSearchParams<{ id: string, source?: string }>();
  const { articles, isLoadingArticles, refreshArticles } = useApp();
  const { user } = useAuth();
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(null);

  const article = articles.find(a => a.id === id);

  // Add console.log to debug article status
  console.log('Article status:', {
    id: article?.id,
    editorStatus: article?.editorStatus,
    adminStatus: article?.adminStatus,
    source
  });

  const handleApproveArticle = async (articleId: string) => {
    if (!articleId || !user) {
      Alert.alert('Error', 'Article ID or user information is missing');
      return;
    }
    
    try {
      setUpdatingStatus(articleId);
      await articleService.approveArticleAsAdmin(articleId, user.uid);
      // Wait a moment to ensure Firebase has updated
      await new Promise(resolve => setTimeout(resolve, 500));
      await refreshArticles();
      Alert.alert('Success', 'Article approved successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error approving article:', error);
      Alert.alert('Error', error.message || 'Failed to approve article');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleApproveArticleAsEditor = async (articleId: string) => {
    if (!articleId || !user) {
      Alert.alert('Error', 'Article ID or user information is missing');
      return;
    }
    
    try {
      setUpdatingStatus(articleId);
      await articleService.approveArticleAsEditor(articleId, user.uid);
      await refreshArticles();
      Alert.alert('Success', 'Article approved successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error approving article:', error);
      Alert.alert('Error', error.message || 'Failed to approve article');
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (isLoadingArticles) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.buttonPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: themeColors.textPrimary }]}>
            Article not found
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: themeColors.buttonPrimary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: themeColors.buttonText }]}>
              Go Back
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
          Article Details
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
        {article.imageUrl && (
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.articleImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.contentContainer}>
          <View style={styles.titleSection}>
            <Text style={[styles.label, { color: themeColors.buttonPrimary }]}>Article</Text>
            <Text style={[styles.articleTitle, { color: themeColors.textPrimary }]}>
              {article.title}
            </Text>
            {source === 'admin_approval' && (
              <View style={[
                styles.statusBadge, 
                { 
                  backgroundColor: article.editorStatus === 'approved' 
                    ? themeColors.buttonPrimary 
                    : themeColors.buttonSecondary 
                }
              ]}>
                <Text style={[styles.statusText, { color: themeColors.textPrimary }]}>
                  Editor: {article.editorStatus}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.articleMeta}>
            <View style={styles.metaItem}>
              <View style={styles.metaLabelContainer}>
                <Ionicons name="person-outline" size={14} color={themeColors.textSecondary} />
                <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Author</Text>
              </View>
              <Text style={[styles.articleAuthor, { color: themeColors.textPrimary }]}>
                {article.authorId}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <View style={styles.metaLabelContainer}>
                <Ionicons name="calendar-outline" size={14} color={themeColors.textSecondary} />
                <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Published</Text>
              </View>
              <Text style={[styles.articleDate, { color: themeColors.textPrimary }]}>
                {new Date(article.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.articleMeta}>
            <View style={styles.metaItem}>
              <View style={styles.metaLabelContainer}>
                <Ionicons name="folder-outline" size={14} color={themeColors.textSecondary} />
                <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Category</Text>
              </View>
              <Text style={[styles.articleCategory, { color: themeColors.textPrimary }]}>
                {article.categoryId}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <View style={styles.metaLabelContainer}>
                <Ionicons name="language-outline" size={14} color={themeColors.textSecondary} />
                <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Language</Text>
              </View>
              <Text style={[styles.articleLanguage, { color: themeColors.textPrimary }]}>
                {article.language}
              </Text>
            </View>
          </View>

          <View style={styles.contentSection}>
            <Text style={[styles.articleContent, { color: themeColors.textPrimary }]}>
              {article.content}
            </Text>
          </View>
        </View>
      </ScrollView>

      {article.editorStatus === 'pending' && source !== 'profile' && (
        <TouchableOpacity
          style={[
            styles.approveButton, 
            { 
              backgroundColor: themeColors.buttonPrimary,
              marginHorizontal: 16,
              marginBottom: 16,
              borderRadius: 12
            }
          ]}
          onPress={() => handleApproveArticleAsEditor(article.id || '')}
          disabled={updatingStatus === article.id}
        >
          {updatingStatus === article.id ? (
            <ActivityIndicator size="small" color={themeColors.buttonText} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={themeColors.buttonText} />
              <Text style={[styles.approveButtonText, { color: themeColors.buttonText }]}>
                Approve as Editor
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {article.editorStatus === 'approved' && article.adminStatus !== 'approved' && source !== 'profile' && (
        <TouchableOpacity
          style={[
            styles.approveButton, 
            { 
              backgroundColor: themeColors.buttonPrimary,
              marginHorizontal: 16,
              marginBottom: 16,
              borderRadius: 12
            }
          ]}
          onPress={() => handleApproveArticle(article.id || '')}
          disabled={updatingStatus === article.id}
        >
          {updatingStatus === article.id ? (
            <ActivityIndicator size="small" color={themeColors.buttonText} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={themeColors.buttonText} />
              <Text style={[styles.approveButtonText, { color: themeColors.buttonText }]}>
                Approve as Admin
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  headerRight: {
    width: 24,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  articleImage: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 16,
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
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter',
    lineHeight: 32,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    gap: 16,
  },
  metaItem: {
    flex: 1,
    minWidth: 0,
  },
  metaLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  articleDate: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  articleCategory: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  articleLanguage: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  contentSection: {
    marginBottom: 24,
  },
  articleContent: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Open Sans',
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
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Open Sans',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
}); 