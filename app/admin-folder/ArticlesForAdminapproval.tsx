import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { colors } from '../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { articleService } from '../../services/articleService';
import { Article } from '../../types/database';
import { Ionicons } from '@expo/vector-icons';

export default function ArticlesForAdminapproval() {
  const colorScheme = useColorScheme();
  const themeColors = colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { articles, isLoadingArticles, refreshArticles } = useApp();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Filter articles that have been approved by editors but not by admin
  const approvedArticles = articles.filter(
    article => article.editorStatus === 'approved' && article.adminStatus !== 'approved'
  );

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
        onPress={() => {
          console.log('Navigating to article:', {
            id: item.id,
            editorStatus: item.editorStatus,
            adminStatus: item.adminStatus
          });
          router.push({
            pathname: '/article-view',
            params: { 
              id: item.id,
              source: 'admin_approval'
            }
          });
        }}
      >
        {item.imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.articleImage}
              resizeMode="cover"
            />
          </View>
        )}
        <View style={styles.articleHeader}>
          <View style={styles.titleContainer}>
            <Text style={[styles.label, { color: themeColors.buttonPrimary }]}>Article</Text>
            <Text style={[styles.articleTitle, { color: themeColors.textPrimary }]}>
              {item.title}
            </Text>
          </View>
          <View style={[
            styles.statusBadge, 
            { 
              backgroundColor: item.editorStatus === 'approved' 
                ? themeColors.buttonPrimary 
                : themeColors.buttonSecondary 
            }
          ]}>
            <Text style={[styles.statusText, { color: themeColors.textPrimary }]}>
              Editor: {item.editorStatus}
            </Text>
          </View>
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

        <View style={styles.articleMeta}>
          <View style={styles.metaItem}>
            <View style={styles.metaLabelContainer}>
              <Ionicons name="folder-outline" size={14} color={themeColors.textSecondary} />
              <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Category</Text>
            </View>
            <Text 
              style={[styles.articleCategory, { color: themeColors.textPrimary }]}
              numberOfLines={1}
            >
              {item.categoryId}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <View style={styles.metaLabelContainer}>
              <Ionicons name="language-outline" size={14} color={themeColors.textSecondary} />
              <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Language</Text>
            </View>
            <Text 
              style={[styles.articleLanguage, { color: themeColors.textPrimary }]}
              numberOfLines={1}
            >
              {item.language}
            </Text>
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
            Articles for Admin Approval
          </Text>
        </View>
        
        <FlatList
          data={approvedArticles}
          renderItem={renderArticleItem}
          keyExtractor={(item) => item.id || `article-${item.title}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                No articles pending admin approval
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
  listContainer: {
    padding: 16,
  },
  articleCard: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  articleContent: {
    padding: 16,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
    lineHeight: 24,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flex: 1,
    marginRight: 12,
  },
  metaLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 12,
    fontFamily: 'Open Sans',
    marginLeft: 4,
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
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  articleImage: {
    width: '100%',
    height: '100%',
  },
}); 