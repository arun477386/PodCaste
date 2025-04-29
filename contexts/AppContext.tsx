import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Article, Category, User } from '../types/database';
import { articleService } from '../services/articleService';
import { useAuth } from './AuthContext';
import { router } from 'expo-router';

interface AppContextType {
  // Data states
  articles: Article[];
  categories: Category[];
  currentUser: User | null;
  
  // Loading states
  isLoadingArticles: boolean;
  isLoadingCategories: boolean;
  
  // Error states
  error: string | null;
  
  // Navigation helpers
  navigateToArticle: (articleId: string) => void;
  navigateToCategory: (categoryId: string) => void;
  navigateToProfile: (userId: string) => void;
  
  // Data fetching
  refreshArticles: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  articles: [],
  categories: [],
  currentUser: null,
  isLoadingArticles: false,
  isLoadingCategories: false,
  error: null,
  navigateToArticle: () => {},
  navigateToCategory: () => {},
  navigateToProfile: () => {},
  refreshArticles: async () => {},
  refreshCategories: async () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Navigation helpers
  const navigateToArticle = useCallback((articleId: string) => {
    router.push(`/article/${articleId}`);
  }, []);

  const navigateToCategory = useCallback((categoryId: string) => {
    router.push(`/category/${categoryId}`);
  }, []);

  const navigateToProfile = useCallback((userId: string) => {
    router.push(`/profile/${userId}`);
  }, []);

  // Data fetching functions
  const refreshArticles = useCallback(async () => {
    try {
      setIsLoadingArticles(true);
      setError(null);
      console.log('Fetching articles...');
      const fetchedArticles = await articleService.getAllArticles();
      console.log('Fetched articles:', fetchedArticles);
      setArticles(fetchedArticles);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to fetch articles');
    } finally {
      setIsLoadingArticles(false);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      setError(null);
      // TODO: Implement category service
      // const fetchedCategories = await categoryService.getAllCategories();
      // setCategories(fetchedCategories);
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    if (user) {
      refreshArticles();
      refreshCategories();
    }
  }, [user, refreshArticles, refreshCategories]);

  return (
    <AppContext.Provider
      value={{
        articles,
        categories,
        currentUser,
        isLoadingArticles,
        isLoadingCategories,
        error,
        navigateToArticle,
        navigateToCategory,
        navigateToProfile,
        refreshArticles,
        refreshCategories,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext); 