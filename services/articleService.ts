import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  getDocs, 
  orderBy, 
  where,
  DocumentData,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { Article } from '../types/database';
import { activityService } from './activityService';

export const articleService = {
  // Create a new article document in Firestore
  createArticle: async (
    title: string,
    content: string,
    authorId: string,
    categoryId: string,
    language: string,
    imageUrl?: string | null,
    audioUrl?: string | null
  ): Promise<string> => {
    const db = getFirestore();
    const articlesRef = collection(db, 'articles');

    const newArticle: Omit<Article, 'createdAt' | 'updatedAt'> = {
      title,
      content,
      authorId,
      categoryId,
      language,
      status: 'pending',
      editorStatus: 'pending',
      adminStatus: 'pending',
      plagiarismStatus: 'unchecked',
      isPublished: false,
      imageUrl: imageUrl || null,
      audioUrl: audioUrl || null,
    };

    try {
      const docRef = await addDoc(articlesRef, {
        ...newArticle,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Record activity
      await activityService.recordActivity(
        authorId,
        'article_create',
        `Created article: ${title}`,
        { articleId: docRef.id, categoryId }
      );

      return docRef.id;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  },

  // Fetch all articles
  getAllArticles: async (): Promise<Article[]> => {
    const db = getFirestore();
    const articlesRef = collection(db, 'articles');
    
    try {
      console.log('Fetching all articles from Firestore...');
      const q = query(articlesRef);
      const querySnapshot = await getDocs(q);
      const articles: Article[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        const article = {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Article;
        articles.push(article);
      });

      console.log('Total articles fetched:', articles.length);
      return articles;
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  },

  // Publish an article
  publishArticle: async (articleId: string, userId: string): Promise<void> => {
    const db = getFirestore();
    const articleRef = doc(db, 'articles', articleId);

    try {
      const articleDoc = await getDoc(articleRef);
      if (!articleDoc.exists()) {
        throw new Error('Article not found');
      }

      const articleData = articleDoc.data() as Article;
      
      await updateDoc(articleRef, {
        isPublished: true,
        status: 'approved',
        updatedAt: serverTimestamp()
      });

      // Record activity
      await activityService.recordActivity(
        userId,
        'article_publish',
        `Published article: ${articleData.title}`,
        { articleId, categoryId: articleData.categoryId }
      );
    } catch (error) {
      console.error('Error publishing article:', error);
      throw error;
    }
  },

  // Update article status
  updateArticleStatus: async (
    articleId: string, 
    status: 'pending' | 'approved' | 'rejected',
    userId: string
  ): Promise<void> => {
    if (!articleId) {
      throw new Error('Article ID is required');
    }

    const db = getFirestore();
    const articleRef = doc(db, 'articles', articleId);

    try {
      // First verify the document exists
      const articleDoc = await getDoc(articleRef);
      if (!articleDoc.exists()) {
        throw new Error('Article not found');
      }

      const articleData = articleDoc.data() as Article;

      // Update the document
      await updateDoc(articleRef, {
        status,
        updatedAt: serverTimestamp()
      });

      // Record activity
      await activityService.recordActivity(
        userId,
        'article_approve',
        `Updated article status to ${status}: ${articleData.title}`,
        { articleId, status, categoryId: articleData.categoryId }
      );

      console.log(`Article ${articleId} status updated to ${status}`);
    } catch (error) {
      console.error('Error updating article status:', error);
      throw error;
    }
  },

  // Approve article as editor
  approveArticleAsEditor: async (articleId: string, editorUid: string): Promise<void> => {
    if (!articleId || !editorUid) {
      throw new Error('Article ID and editor UID are required');
    }

    const db = getFirestore();
    const articleRef = doc(db, 'articles', articleId);

    try {
      // First verify the document exists
      const articleDoc = await getDoc(articleRef);
      if (!articleDoc.exists()) {
        throw new Error('Article not found');
      }

      // Update the document with editor approval
      await updateDoc(articleRef, {
        editorStatus: 'approved',
        approvedEditorIdUid: editorUid,
        updatedAt: serverTimestamp()
      });

      console.log(`Article ${articleId} approved by editor ${editorUid}`);
    } catch (error) {
      console.error('Error approving article as editor:', error);
      throw error;
    }
  },

  // Approve article as admin
  approveArticleAsAdmin: async (articleId: string, adminUid: string): Promise<void> => {
    if (!articleId || !adminUid) {
      throw new Error('Article ID and admin UID are required');
    }

    const db = getFirestore();
    const articleRef = doc(db, 'articles', articleId);

    try {
      // First verify the document exists
      const articleDoc = await getDoc(articleRef);
      if (!articleDoc.exists()) {
        throw new Error('Article not found');
      }

      // Update the document with admin approval
      await updateDoc(articleRef, {
        adminStatus: 'approved',
        approvedAdminUid: adminUid,
        status: 'approved', // Update the general status as well
        updatedAt: serverTimestamp()
      });

      console.log(`Article ${articleId} approved by admin ${adminUid}`);
    } catch (error) {
      console.error('Error approving article as admin:', error);
      throw error;
    }
  },

  // Fetch articles by category
  getArticlesByCategory: async (categoryId: string): Promise<Article[]> => {
    const db = getFirestore();
    const articlesRef = collection(db, 'articles');
    
    try {
      const q = query(
        articlesRef,
        where('categoryId', '==', categoryId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const articles: Article[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        articles.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Article);
      });

      return articles;
    } catch (error: any) {
      // If the index is not ready, fall back to a simpler query
      if (error.code === 'failed-precondition') {
        console.warn('Index not ready, falling back to simple query for category:', categoryId);
        const q = query(
          articlesRef,
          where('categoryId', '==', categoryId)
        );

        const querySnapshot = await getDocs(q);
        const articles: Article[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data() as DocumentData;
          const article = {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Article;
          articles.push(article);
        });

        // Sort articles by createdAt in memory
        const sortedArticles = articles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return sortedArticles;
      }
      
      console.error('Error fetching articles by category:', error);
      throw error;
    }
  },
}; 