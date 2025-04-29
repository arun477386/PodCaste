import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useColorScheme } from 'react-native';
import { colors } from '../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { auth } from '../../services/firebase';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'editor';
  language: string;
}

type UserRole = 'user' | 'admin' | 'editor';

const languages = ['Hindi', 'English', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];

export default function UsersScreen() {
  const colorScheme = useColorScheme();
  const themeColors = colors[colorScheme ?? 'light'];
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRole, setNewRole] = useState<'user' | 'admin' | 'editor'>('user');
  const [newLanguage, setNewLanguage] = useState('English');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const usersList: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push({
          id: doc.id,
          email: data.email || '',
          displayName: data.displayName || 'Anonymous',
          role: data.role || 'user',
          language: data.language || 'English',
        });
      });
      
      setUsers(usersList);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', selectedUser.id);
      
      await updateDoc(userRef, {
        role: newRole,
        language: newLanguage,
      });

      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, role: newRole, language: newLanguage }
          : user
      ));

      setModalVisible(false);
      Alert.alert('Success', 'User updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setNewLanguage(user.language);
    setModalVisible(true);
  };

  if (loading) {
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
          User Management
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={[styles.userCard, { backgroundColor: themeColors.cardBackground }]}
            onPress={() => openEditModal(user)}
          >
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: themeColors.textPrimary }]}>
                {user.displayName}
              </Text>
              <Text style={[styles.userEmail, { color: themeColors.textSecondary }]}>
                {user.email}
              </Text>
            </View>
            <View style={styles.userMeta}>
              <View style={[styles.roleBadge, { backgroundColor: themeColors.buttonSecondary }]}>
                <Text style={[styles.roleText, { color: themeColors.textPrimary }]}>
                  {user.role}
                </Text>
              </View>
              <Text style={[styles.languageText, { color: themeColors.textSecondary }]}>
                {user.language}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={themeColors.textSecondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
              Edit User
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: themeColors.textPrimary }]}>Role</Text>
              <View style={[styles.pickerContainer, { backgroundColor: themeColors.inputBackground }]}>
                <Picker
                  selectedValue={newRole}
                  onValueChange={(value: UserRole) => setNewRole(value)}
                  style={[styles.picker, { color: themeColors.textPrimary }]}
                >
                  <Picker.Item label="User" value="user" />
                  <Picker.Item label="Admin" value="admin" />
                  <Picker.Item label="Editor" value="editor" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: themeColors.textPrimary }]}>Language</Text>
              <View style={[styles.pickerContainer, { backgroundColor: themeColors.inputBackground }]}>
                <Picker
                  selectedValue={newLanguage}
                  onValueChange={(value: string) => setNewLanguage(value)}
                  style={[styles.picker, { color: themeColors.textPrimary }]}
                >
                  {languages.map((lang) => (
                    <Picker.Item key={lang} label={lang} value={lang} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: themeColors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: themeColors.buttonPrimary }]}
                onPress={handleUpdateUser}
              >
                <Text style={[styles.buttonText, { color: themeColors.buttonText }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Open Sans',
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  languageText: {
    fontSize: 12,
    fontFamily: 'Open Sans',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    paddingVertical: 4,
  },
  picker: {
    height: 55,
    paddingVertical: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
}); 