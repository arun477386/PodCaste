import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, useColorScheme, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { articleService } from '../services/articleService';
import { Article } from '../types/database';
import { colors } from '../styles/colors';

type SortOption = 'latest' | 'popular';

export default function CategoryArticlesScreen() {
  const { categoryName } = useLocalSearchParams<{ categoryName: string }>();
  const colorScheme = useColorScheme();
  const themeColors = colors[colorScheme ?? 'light'];
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, [categoryName]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allArticles = await articleService.getAllArticles();
      
      const filteredArticles = allArticles.filter(article => {
        const articleCategory = article.categoryId?.toLowerCase().trim();
        const targetCategory = categoryName?.toLowerCase().trim();
        return articleCategory === targetCategory && article.adminStatus === 'approved';
      });
      
      setArticles(filteredArticles);
    } catch (err) {
      setError('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchArticles();
    setRefreshing(false);
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
              <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Published</Text>
            </View>
            <Text 
              style={[styles.articleDate, { color: themeColors.textPrimary }]}
              numberOfLines={1}
            >
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={themeColors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
              {categoryName}
            </Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeColors.buttonPrimary} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={themeColors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
              {categoryName}
            </Text>
          </View>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: themeColors.textPrimary }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: themeColors.buttonPrimary }]}
              onPress={fetchArticles}
            >
              <Text style={[styles.retryButtonText, { color: themeColors.buttonText }]}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={themeColors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
            {categoryName}
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
          data={articles}
          renderItem={renderArticleItem}
          keyExtractor={(item) => item.id || ''}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                No articles found in this category
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  filterText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
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
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Open Sans',
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
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