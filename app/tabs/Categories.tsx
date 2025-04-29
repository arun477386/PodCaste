import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { colors } from '../../styles/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Category {
  id: string;
  name: string;
  icon: string;
}

const categories: Category[] = [
  { id: '1', name: 'Health', icon: 'fitness-outline' },
  { id: '2', name: 'Tech', icon: 'hardware-chip-outline' },
  { id: '3', name: 'Finance', icon: 'wallet-outline' },
  { id: '4', name: 'Lifestyle', icon: 'heart-outline' },
  { id: '5', name: 'Travel', icon: 'airplane-outline' },
  { id: '6', name: 'Education', icon: 'school-outline' },
  { id: '7', name: 'Entertainment', icon: 'game-controller-outline' },
  { id: '8', name: 'Science', icon: 'flask-outline' },
];

export default function CategoriesScreen() {
  const colorScheme = useColorScheme();
  const themeColors = colors[colorScheme ?? 'light'];

  const handleCategoryPress = (categoryName: string) => {
    // Navigate to the articles list for the selected category
    router.push({
      pathname: '/category-articles',
      params: { categoryName }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView style={styles.scrollView}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          Categories
        </Text>
        
        <View style={styles.gridContainer}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.categoryItem,
                { backgroundColor: themeColors.cardBackground }
              ]}
              onPress={() => handleCategoryPress(item.name)}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={item.icon as any}
                  size={32}
                  color={themeColors.buttonPrimary}
                />
              </View>
              <Text style={[styles.categoryText, { color: themeColors.textPrimary }]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  categoryItem: {
    alignItems: 'center',
    padding: 16,
    margin: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: '45%',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 