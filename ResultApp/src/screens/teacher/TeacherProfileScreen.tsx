import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const TeacherProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await apiService.getMyProfile();
      setProfile(res);
    } catch (err: any) {
      console.log('Profile error:', err.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchProfile(); };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', onPress: logout, style: 'destructive' },
    ]);
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const userData = { ...user, ...profile };

  const PROFILE_SECTIONS = [
    {
      title: 'Personal Information',
      icon: 'account-circle-outline',
      fields: [
        { label: 'Name', value: userData.name, icon: 'account' },
        { label: 'Employee ID', value: userData.employeeId, icon: 'badge-account' },
        { label: 'Email', value: userData.email, icon: 'email' },
        { label: 'Phone', value: userData.phone || 'Not set', icon: 'phone' },
      ],
    },
    {
      title: 'Teaching Details',
      icon: 'school-outline',
      fields: [
        { label: 'Subjects', value: userData.subjects?.join(', ') || 'None', icon: 'book-open-variant' },
        { label: 'Class Teacher', value: userData.classTeacher || 'None', icon: 'google-classroom' },
        { label: 'Assigned Classes', value: userData.assignedClasses?.join(', ') || 'None', icon: 'view-list' },
        { label: 'Status', value: userData.isActive ? 'Active' : 'Inactive', icon: 'check-circle' },
      ],
    },
  ];

  const ACTIONS = [
    {
      icon: 'lock-outline',
      label: 'Change Password',
      desc: 'Update your password',
      color: theme.colors.warning,
      onPress: () => navigation.navigate('TeacherChangePassword'),
    },
    {
      icon: 'cog-outline',
      label: 'Settings',
      desc: 'App preferences',
      color: theme.colors.info,
      onPress: () => Alert.alert('Coming Soon', 'Settings will be available soon'),
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      desc: 'Get assistance',
      color: theme.colors.success,
      onPress: () => Alert.alert('Support', 'Contact admin for support'),
    },
    {
      icon: 'logout',
      label: 'Sign Out',
      desc: 'Logout from app',
      color: theme.colors.error,
      onPress: handleLogout,
    },
  ];

  if (isLoading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profile</Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
          <MaterialCommunityIcons
            name={theme.isDark ? 'white-balance-sunny' : 'moon-waning-crescent'}
            size={22}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Avatar & Name */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>{getInitials(userData.name || 'T')}</Text>
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>{userData.name}</Text>
          <Text style={[styles.role, { color: theme.colors.textSecondary }]}>
            {userData.employeeId || 'Teacher'}
          </Text>
        </View>

        {/* Profile Sections */}
        {PROFILE_SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name={section.icon} size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {section.title}
              </Text>
            </View>
            <View style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
              {section.fields.map((field, i) => (
                <View
                  key={i}
                  style={[
                    styles.fieldRow,
                    i < section.fields.length - 1 && { borderBottomColor: theme.colors.borderLight, borderBottomWidth: 1 },
                  ]}
                >
                  <View style={styles.fieldLeft}>
                    <MaterialCommunityIcons name={field.icon} size={18} color={theme.colors.textTertiary} />
                    <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                      {field.label}
                    </Text>
                  </View>
                  <Text style={[styles.fieldValue, { color: theme.colors.text }]} numberOfLines={2}>
                    {field.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cog" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Actions</Text>
          </View>
          <View style={[styles.actionsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            {ACTIONS.map((action, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.actionRow,
                  i < ACTIONS.length - 1 && { borderBottomColor: theme.colors.borderLight, borderBottomWidth: 1 },
                ]}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: `${action.color}15` }]}>
                  <MaterialCommunityIcons name={action.icon} size={20} color={action.color} />
                </View>
                <View style={styles.actionText}>
                  <Text style={[styles.actionLabel, { color: theme.colors.text }]}>{action.label}</Text>
                  <Text style={[styles.actionDesc, { color: theme.colors.textTertiary }]}>
                    {action.desc}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', flex: 1, marginLeft: 12 },
  themeBtn: { padding: 4 },
  scrollContent: { paddingBottom: 20 },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  name: { fontSize: 20, fontWeight: '600', marginBottom: 4 },
  role: { fontSize: 14 },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  sectionCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  fieldLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  fieldLabel: { fontSize: 14, marginLeft: 10, flex: 1 },
  fieldValue: { fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right' },
  actionsCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: { flex: 1 },
  actionLabel: { fontSize: 15, fontWeight: '500', marginBottom: 2 },
  actionDesc: { fontSize: 12 },
  bottomSpace: { height: 20 },
});

export default TeacherProfileScreen;
