import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { colors } from '../../styles/colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/firebase';
import { articleService } from '../../services/articleService';
import { storageService } from '../../services/storageService';
import { useApp } from '../../contexts/AppContext';

const categories = [
  { id: '1', name: 'Health' },
  { id: '2', name: 'Tech' },
  { id: '3', name: 'Finance' },
  { id: '4', name: 'Lifestyle' },
  { id: '5', name: 'Travel' },
  { id: '6', name: 'Education' },
  { id: '7', name: 'Entertainment' },
  { id: '8', name: 'Science' },
];

const languages = ['Hindi', 'English', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];

export default function UploadScreen() {
  const colorScheme = useColorScheme();
  const themeColors = colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { user } = useAuth();
  const { refreshArticles } = useApp();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Please grant permission to access your photos to upload images.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Open Settings',
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                },
              },
            ]
          );
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingImage(true);
        try {
          const imageUrl = await storageService.uploadImage(result.assets[0].uri);
          setImage(imageUrl);
        } catch (error) {
          console.error('Image upload error:', error);
          Alert.alert(
            'Upload Error',
            'Failed to upload image. Please try again.',
            [{ text: 'OK' }]
          );
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(
        'Error',
        'Failed to pick image. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const validateForm = () => {
    if (!title || !content || !selectedCategory || !selectedLanguage) {
      setError('Please fill in all fields');
      return false;
    }
    if (title.length < 5) {
      setError('Title must be at least 5 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to submit an article');
        return;
      }

      // Find the category name from the selected ID
      const selectedCategoryObj = categories.find(cat => cat.id === selectedCategory);
      if (!selectedCategoryObj) {
        setError('Invalid category selected');
        return;
      }

      await articleService.createArticle(
        title,
        content,
        user.uid,
        selectedCategoryObj.name,
        selectedLanguage!,
        image
      );

      // Reset form
      setTitle('');
      setContent('');
      setSelectedCategory(null);
      setSelectedLanguage(null);
      setImage(null);
      setError('');

      // Refresh articles in the app context
      await refreshArticles();

      // Show success message
      Alert.alert(
        'Success',
        'Article submitted successfully!',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      setError(error.message || 'Failed to submit article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>Submit Article</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.form}>
          <TouchableOpacity
            style={[styles.imagePicker, { backgroundColor: themeColors.inputBackground }]}
            onPress={pickImage}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <View style={styles.imagePlaceholder}>
                <ActivityIndicator size="large" color={themeColors.buttonPrimary} />
                <Text style={[styles.imageText, { color: themeColors.textSecondary }]}>
                  Uploading image...
                </Text>
              </View>
            ) : image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color={themeColors.textSecondary} />
                <Text style={[styles.imageText, { color: themeColors.textSecondary }]}>
                  Tap to add cover image
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: themeColors.textPrimary }]}>Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: themeColors.inputBackground, color: themeColors.textPrimary }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter article title"
              placeholderTextColor={themeColors.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: themeColors.textPrimary }]}>Content</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: themeColors.inputBackground, color: themeColors.textPrimary }]}
              value={content}
              onChangeText={setContent}
              placeholder="Enter article content"
              placeholderTextColor={themeColors.textSecondary}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: themeColors.textPrimary }]}>Category</Text>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.selectedCategory,
                    { backgroundColor: themeColors.inputBackground }
                  ]}
                  onPress={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: selectedCategory === category.id ? themeColors.buttonPrimary : themeColors.textPrimary }
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: themeColors.textPrimary }]}>Language</Text>
            <View style={styles.languageContainer}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language}
                  style={[
                    styles.languageButton,
                    selectedLanguage === language && styles.selectedLanguage,
                    { backgroundColor: themeColors.inputBackground }
                  ]}
                  onPress={() => setSelectedLanguage(selectedLanguage === language ? null : language)}
                >
                  <Text
                    style={[
                      styles.languageText,
                      { color: selectedLanguage === language ? themeColors.buttonPrimary : themeColors.textPrimary }
                    ]}
                  >
                    {language}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: themeColors.buttonPrimary }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={themeColors.buttonText} />
            ) : (
              <Text style={[styles.submitButtonText, { color: themeColors.buttonText }]}>
                Submit Article
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    gap: 16,
  },
  imagePicker: {
    width: '100%',
    aspectRatio: 16/9,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  imageText: {
    marginTop: 8,
    fontSize: 14,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 14,
  },
  languageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectedLanguage: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  languageText: {
    fontSize: 14,
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#D32F2F',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
}); 