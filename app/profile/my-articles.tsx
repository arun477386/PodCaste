import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { colors } from '../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Article } from '../../types/database';

export default function MyArticlesScreen() {
  const colorScheme = useColorScheme();
  const themeColors = colors[colorScheme ?? 'light'];
  const { articles, isLoadingArticles, refreshArticles } = useApp();
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  // Add logging to debug articles
  console.log('All articles:', articles);
  console.log('Current user ID:', user?.uid);

  // Filter articles by the current user
  const userArticles = articles.filter(article => {
    console.log('Checking article:', {
      articleId: article.id,
      authorId: article.authorId,
      matchesUser: article.authorId === user?.uid
    });
    return article.authorId === user?.uid;
  });

  console.log('Filtered user articles:', userArticles);

  const renderArticleItem = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={[styles.articleCard, { backgroundColor: themeColors.cardBackground }]}
      onPress={() => router.push({
        pathname: '/article-view',
        params: { 
          id: item.id || '',
          source: 'profile'
        }
      })}
    >
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.articleImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.articleContent}>
        <Text style={[styles.articleTitle, { color: themeColors.textPrimary }]}>
          {item.title}
        </Text>
        <Text style={[styles.articleExcerpt, { color: themeColors.textSecondary }]}>
          {item.content.substring(0, 100)}...
        </Text>
        <View style={styles.articleMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={themeColors.textSecondary} />
            <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="folder-outline" size={14} color={themeColors.textSecondary} />
            <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
              {item.categoryId}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
          My Articles
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            sortBy === 'latest' && { backgroundColor: themeColors.buttonPrimary }
          ]}
          onPress={() => setSortBy('latest')}
        >
          <Text
            style={[
              styles.filterText,
              { color: sortBy === 'latest' ? themeColors.buttonText : themeColors.textSecondary }
            ]}
          >
            Latest
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            sortBy === 'popular' && { backgroundColor: themeColors.buttonPrimary }
          ]}
          onPress={() => setSortBy('popular')}
        >
          <Text
            style={[
              styles.filterText,
              { color: sortBy === 'popular' ? themeColors.buttonText : themeColors.textSecondary }
            ]}
          >
            Popular
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={userArticles}
        renderItem={renderArticleItem}
        keyExtractor={(item) => item.id || `article-${item.title}`}
        contentContainerStyle={styles.listContainer}
        onRefresh={refreshArticles}
        refreshing={isLoadingArticles}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
              No articles found
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
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  listContainer: {
    padding: 16,
  },
  articleCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  articleImage: {
    width: '100%',
    height: 200,
  },
  articleContent: {
    padding: 16,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  articleExcerpt: {
    fontSize: 14,
    fontFamily: 'Open Sans',
    marginBottom: 12,
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Open Sans',
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