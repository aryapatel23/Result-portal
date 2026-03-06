/**
 * Profile Screen
 * 
 * Professional user profile with modern UI
 * Shows user information and action buttons
 * Integrated with backend for profile updates and password changes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  RefreshControl,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';

const { width } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Modals state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState<any>(user);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PROFILE.ME);
      setProfileData(res.data);
      updateUser(res.data); // Keep auth context in sync

      // Update form state with fresh data
      setName(res.data.name || '');
      setEmail(res.data.email || '');
      setPhone(res.data.phone || '');
      setParentPhone(res.data.parentPhone || '');
    } catch (error) {
      console.error('Fetch Profile Error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [parentPhone, setParentPhone] = useState(user?.parentPhone || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          // navigation.navigate('Login' as never); // useAuth handles this
        },
      },
    ]);
  };

  const handleUpdateProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Name and Email are required');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.put(API_ENDPOINTS.PROFILE.UPDATE, {
        name,
        email,
        phone,
        parentPhone
      });

      if (res.status === 200) {
        await fetchProfile(); // Refresh data from server
        Alert.alert('Success', 'Profile updated successfully!');
        setEditModalVisible(false);
      }
    } catch (error: any) {
      console.error('Update Profile Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.put(API_ENDPOINTS.PROFILE.CHANGE_PASSWORD, {
        oldPassword,
        newPassword
      });

      if (res.status === 200) {
        Alert.alert('Success', 'Password changed successfully');
        setPasswordModalVisible(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      console.error('Change Password Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.notAuthContainer, { backgroundColor: theme.colors.background }]}>
        <Icon name="person-circle-outline" size={120} color={theme.colors.disabled} />
        <Text style={[styles.notAuthTitle, { color: theme.colors.text }]}>Welcome!</Text>
        <Text style={[styles.notAuthText, { color: theme.colors.textSecondary }]}>Sign in to access your profile and management tools.</Text>
        <TouchableOpacity style={[styles.loginButton, { backgroundColor: theme.colors.primary }]} onPress={() => navigation.navigate('Login' as never)}>
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.primary} 
      />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profileData?.name?.charAt(0) || '?'}</Text>
          </View>
          <Text style={styles.profileName}>{profileData?.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{profileData?.role?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={[styles.infoSection, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.infoLabel, { color: theme.colors.textTertiary }]}>Username / ID</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{profileData?.username || profileData?.employeeId || profileData?.rollNumber || 'N/A'}</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.infoLabel, { color: theme.colors.textTertiary }]}>Email</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{profileData?.email || 'N/A'}</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.infoLabel, { color: theme.colors.textTertiary }]}>Phone</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{profileData?.phone || 'Not provided'}</Text>
          </View>
          {profileData?.employeeId && profileData?.role === 'admin' && (
            <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.infoLabel, { color: theme.colors.textTertiary }]}>Employee ID</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{profileData.employeeId}</Text>
            </View>
          )}
          {profileData?.role === 'teacher' && (
            <>
              {profileData.employeeId && (
                <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textTertiary }]}>Employee ID</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{profileData.employeeId}</Text>
                </View>
              )}
              {profileData.classTeacher && (
                <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textTertiary }]}>Class Teacher Of</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{profileData.classTeacher}</Text>
                </View>
              )}
              {profileData.subjects && (
                <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textTertiary }]}>Subjects Handled</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{Array.isArray(profileData.subjects) ? profileData.subjects.join(', ') : profileData.subjects}</Text>
                </View>
              )}
            </>
          )}
          {profileData?.role === 'student' && (
            <>
              <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.infoLabel, { color: theme.colors.textTertiary }]}>Roll Number</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>{profileData.rollNumber || 'N/A'}</Text>
              </View>
              {profileData.className && (
                <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textTertiary }]}>Class / Standard</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{profileData.className} {profileData.section ? `- ${profileData.section}` : ''}</Text>
                </View>
              )}
              {profileData.parentPhone && (
                <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textTertiary }]}>Parent Contact</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{profileData.parentPhone}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Actions */}
        <View style={[styles.actionSection, { backgroundColor: theme.colors.background }]}>
          {/* Theme Toggle */}
          <View style={[styles.actionItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={[styles.actionIcon, { backgroundColor: theme.isDark ? '#312e81' : '#eef2ff' }]}>
              <Icon name={theme.isDark ? 'moon' : 'sunny'} size={24} color={theme.colors.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>
              {theme.isDark ? 'Dark Mode' : 'Light Mode'}
            </Text>
            <Switch
              value={theme.isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#cbd5e1', true: theme.colors.primaryLight }}
              thumbColor={theme.isDark ? theme.colors.primary : '#fff'}
              ios_backgroundColor="#cbd5e1"
            />
          </View>

          <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={() => setEditModalVisible(true)}>
            <View style={[styles.actionIcon, { backgroundColor: theme.isDark ? '#312e81' : '#eef2ff' }]}>
              <Icon name="create-outline" size={24} color={theme.colors.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Edit Profile Info</Text>
            <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={() => setPasswordModalVisible(true)}>
            <View style={[styles.actionIcon, { backgroundColor: theme.isDark ? '#7c2d12' : '#fff7ed' }]}>
              <Icon name="key-outline" size={24} color={theme.colors.warning} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Change Password</Text>
            <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon!')}>
            <View style={[styles.actionIcon, { backgroundColor: theme.isDark ? '#14532d' : '#f0fdf4' }]}>
              <Icon name="lock-closed-outline" size={24} color={theme.colors.success} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Privacy & Security</Text>
            <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.colors.card, borderColor: theme.isDark ? '#7f1d1d' : '#fecaca' }]} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color={theme.colors.error} />
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>Logout Account</Text>
        </TouchableOpacity>

        {/* Edit Profile Modal */}
        <Modal visible={editModalVisible} animationType="slide" transparent={true}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalBg}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Edit Profile</Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Full Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.colors.placeholder}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email Address</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email"
                  placeholderTextColor={theme.colors.placeholder}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Phone Number</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter phone"
                  placeholderTextColor={theme.colors.placeholder}
                  keyboardType="phone-pad"
                />
              </View>

              {user?.role === 'student' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Parent Phone</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                    value={parentPhone}
                    onChangeText={setParentPhone}
                    placeholder="Enter parent phone"
                    placeholderTextColor={theme.colors.placeholder}
                    keyboardType="phone-pad"
                  />
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.colors.background }]} onPress={() => setEditModalVisible(false)}>
                  <Text style={[styles.cancelTxt, { color: theme.colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]} onPress={handleUpdateProfile} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveTxt}>Save Changes</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Change Password Modal */}
        <Modal visible={passwordModalVisible} animationType="slide" transparent={true}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalBg}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Change Password</Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Current Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Current password"
                  placeholderTextColor={theme.colors.placeholder}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>New Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="New password (min 6 chars)"
                  placeholderTextColor={theme.colors.placeholder}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Confirm New Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  placeholderTextColor={theme.colors.placeholder}
                  secureTextEntry
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.colors.background }]} onPress={() => setPasswordModalVisible(false)}>
                  <Text style={[styles.cancelTxt, { color: theme.colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]} onPress={handleChangePassword} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveTxt}>Apply Secret</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  infoSection: {
    padding: 20,
    marginTop: 10,
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionSection: {
    padding: 20,
    paddingTop: 0,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  // Modal styles
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelTxt: {
    fontWeight: 'bold',
  },
  saveBtn: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveTxt: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Not Auth styles
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notAuthTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
  },
  notAuthText: {
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  loginButton: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
});

export default ProfileScreen;
