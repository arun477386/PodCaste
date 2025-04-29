import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { User } from '../types/database';
import { activityService } from './activityService';

export const userService = {
  // Create a new user document in Firestore
  createUser: async (
    userId: string,
    email: string,
    displayName: string,
    role: 'user' | 'editor' | 'admin' = 'user',
    language: string = 'English'  // Default language is English
  ): Promise<void> => {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);

    const newUser: User = {
      email,
      displayName,
      role,
      language,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(userRef, newUser);

    // Record activity
    await activityService.recordActivity(
      userId,
      'profile_update',
      'Created new user profile',
      { email, displayName, role, language }
    );
  },

  // Get user data
  getUser: async (userId: string): Promise<User | null> => {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return null;
  },

  // Update user language
  updateUserLanguage: async (userId: string, language: string): Promise<void> => {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
      language,
      updatedAt: new Date(),
    });

    // Record activity
    await activityService.recordActivity(
      userId,
      'language_change',
      `Changed language preference to ${language}`,
      { language }
    );
  },

  // Update user role and language (for admin use)
  updateUserRoleAndLanguage: async (
    userId: string,
    role: 'user' | 'editor' | 'admin',
    language: string
  ): Promise<void> => {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
      role,
      language,
      updatedAt: new Date(),
    });

    // Record activity
    await activityService.recordActivity(
      userId,
      'profile_update',
      `Updated profile: role changed to ${role}, language to ${language}`,
      { role, language }
    );
  },
}; 