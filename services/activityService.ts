import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  getDocs, 
  orderBy, 
  where,
  limit,
  DocumentData,
  Timestamp
} from 'firebase/firestore';

export type ActivityType = 
  | 'article_view'
  | 'article_edit'
  | 'article_create'
  | 'article_publish'
  | 'article_approve'
  | 'profile_update'
  | 'language_change';

export interface Activity {
  id?: string;
  userId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export const activityService = {
  // Record a new activity
  recordActivity: async (
    userId: string,
    type: ActivityType,
    description: string,
    metadata?: Record<string, any>
  ): Promise<string> => {
    const db = getFirestore();
    const activitiesRef = collection(db, 'activities');

    try {
      const docRef = await addDoc(activitiesRef, {
        userId,
        type,
        description,
        metadata: metadata || {},
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error recording activity:', error);
      throw error;
    }
  },

  // Get recent activities for a user
  getRecentActivities: async (
    userId: string,
    limitCount: number = 10
  ): Promise<Activity[]> => {
    const db = getFirestore();
    const activitiesRef = collection(db, 'activities');
    
    try {
      const q = query(
        activitiesRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const activities: Activity[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        activities.push({
          id: doc.id,
          userId: data.userId,
          type: data.type,
          description: data.description,
          metadata: data.metadata || {},
          createdAt: (data.createdAt as Timestamp).toDate(),
        });
      });

      return activities;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  // Get recent activities by type
  getRecentActivitiesByType: async (
    userId: string,
    type: ActivityType,
    limitCount: number = 10
  ): Promise<Activity[]> => {
    const db = getFirestore();
    const activitiesRef = collection(db, 'activities');
    
    try {
      const q = query(
        activitiesRef,
        where('userId', '==', userId),
        where('type', '==', type),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const activities: Activity[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        activities.push({
          id: doc.id,
          userId: data.userId,
          type: data.type,
          description: data.description,
          metadata: data.metadata || {},
          createdAt: (data.createdAt as Timestamp).toDate(),
        });
      });

      return activities;
    } catch (error) {
      console.error('Error fetching recent activities by type:', error);
      throw error;
    }
  },
}; 