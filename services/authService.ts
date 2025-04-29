import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

export const authService = {
  // 🔹 Sign in using Google credential tokens (from expo-auth-session)
  signInWithGoogleCredential: async (idToken: string, accessToken: string) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      const result = await signInWithCredential(auth, credential);
      return result.user;
    } catch (error: any) {
      console.error('Google sign-in error:', error.message);
      throw error;
    }
  },

  // 🔹 Sign in with Email/Password
  signInWithEmail: async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error: any) {
      console.error('Email sign-in error:', error.message);
      throw error;
    }
  },

  // 🔹 Sign up with Email/Password
  signUpWithEmail: async (email: string, password: string): Promise<UserCredential> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error: any) {
      console.error('Email sign-up error:', error.message);
      throw error;
    }
  },

  // 🔹 Sign out
  signOut: async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error.message);
      throw error;
    }
  },
};
