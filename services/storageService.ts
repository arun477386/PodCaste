import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';

export const storageService = {
  uploadImage: async (uri: string, path: string = 'article-images'): Promise<string> => {
    try {
      // Get the file extension
      const fileExtension = uri.split('.').pop();
      
      // Create a unique filename
      const filename = `${path}/${Date.now()}.${fileExtension}`;
      
      // Get a reference to the storage location
      const storage = getStorage();
      const storageRef = ref(storage, filename);
      
      // Convert the image URI to a blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload the blob to Firebase Storage
      await uploadBytes(storageRef, blob);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  },

  uploadAudio: async (uri: string, path: string = 'article-audio'): Promise<string> => {
    try {
      // Get the file extension
      const fileExtension = uri.split('.').pop();
      
      // Create a unique filename
      const filename = `${path}/${Date.now()}.${fileExtension}`;
      
      // Get a reference to the storage location
      const storage = getStorage();
      const storageRef = ref(storage, filename);
      
      // Convert the audio URI to a blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload the blob to Firebase Storage
      await uploadBytes(storageRef, blob);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw new Error('Failed to upload audio');
    }
  },
  
  deleteImage: async (url: string): Promise<void> => {
    try {
      const storage = getStorage();
      const imageRef = ref(storage, url);
      
      // Delete the file using deleteObject
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }
}; 