import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const AdminDashboard = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dashboardData, setDashboardData] = useState<any>({
    totalStudents: 0,
    totalTeachers: 0,
    totalResults: 0,
    totalClasses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await apiService.getAdminDashboard();
      const data = response?.overview || response?.data || response || {};
      setDashboardData({
        totalStudents: data.totalStudents || 0,
        totalTeachers: data.totalTeachers || 0,
        totalResults: data.totalResults || 0,
        totalClasses: data.totalClasses || 0,
      });
    } catch (error: any) {
      if (__DEV__) console.log('Dashboard load error:', error.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-navigate to change password if required
  useEffect(() => {
    if (user?.passwordResetRequired) {
      navigation.navigate('TeacherChangePassword', { required: true });
    }
  }, [user, navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const STATS = [
    {
      icon: 'account-group',
      label: 'Students',
      key: 'totalStudents',
      color: theme.colors.primary,
      bg: theme.colors.primaryLight,
    },
    {
      icon: 'human-male-board',
      label: 'Teachers',
      key: 'totalTeachers',
      color: theme.colors.accent,
      bg: theme.colors.accentLight,
    },
    {
      icon: 'file-document-multiple',
      label: 'Results',
      key: 'totalResults',
      color: theme.colors.success,
      bg: theme.colors.successLight,
    },
    {
      icon: 'google-classroom',
      label: 'Classes',
      key: 'totalClasses',
      color: theme.colors.warning,
      bg: theme.colors.warningLight,
    },
  ];

  const USER_ACTIONS = [
    {
      icon: 'account-group-outline',
      label: 'Students',
      desc: 'View all students',
      color: theme.colors.primary,
      bg: theme.colors.primaryLight,
      screen: 'AdminStudents',
    },
    {
      icon: 'human-male-board',
      label: 'Teachers',
      desc: 'Manage teachers',
      color: theme.colors.accent,
      bg: theme.colors.accentLight,
      screen: 'AdminTeachers',
    },
    {
      icon: 'account-plus-outline',
      label: 'Add Student',
      desc: 'Create new',
      color: theme.colors.success,
      bg: theme.colors.successLight,
      screen: 'AdminCreateStudent',
    },
    {
      icon: 'account-tie-outline',
      label: 'Add Teacher',
      desc: 'Create new',
      color: theme.colors.info,
      bg: theme.colors.infoLight,
      screen: 'AdminCreateTeacher',
    },
  ];

  const SYSTEM_ACTIONS = [
    {
      icon: 'chart-box-outline',
      label: 'Results',
      desc: 'All results',
      color: theme.colors.warning,
      bg: theme.colors.warningLight,
      screen: 'AdminResults',
    },
    {
      icon: 'file-upload-outline',
      label: 'Upload Result',
      desc: 'Add marks',
      color: theme.colors.success,
      bg: theme.colors.successLight,
      screen: 'AdminUploadResult',
    },
    {
      icon: 'calendar-check-outline',
      label: 'Attendance',
      desc: 'Track records',
      color: theme.colors.error,
      bg: theme.colors.errorLight,
      screen: 'AdminAttendance',
    },
    {
      icon: 'calendar-star',
      label: 'Holidays',
      desc: 'Manage holidays',
      color: theme.colors.info,
      bg: theme.colors.infoLight,
      screen: 'AdminHolidays',
    },
    {
      icon: 'timetable',
      label: 'Timetable',
      desc: 'Set schedules',
      color: theme.colors.primary,
      bg: theme.colors.primaryLight,
      screen: 'AdminTimetable',
    },
    {
      icon: 'account-arrow-up',
      label: 'Promote',
      desc: 'Promote class',
      color: theme.colors.accent,
      bg: theme.colors.accentLight,
      screen: 'AdminPromoteStudents',
    },
    {
      icon: 'cog-outline',
      label: 'Settings',
      desc: 'System config',
      color: theme.colors.warning,
      bg: theme.colors.warningLight,
      screen: 'AdminSettings',
    },
  ];

  if (isLoading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="loading" size={32} color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: theme.colors.textTertiary }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text }]} numberOfLines={1}>
              {user?.name || 'Admin'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.colors.card }]}
              onPress={toggleTheme}
            >
              <MaterialCommunityIcons
                name={theme.isDark ? 'white-balance-sunny' : 'moon-waning-crescent'}
                size={18}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
            <View style={[styles.avatar, { backgroundColor: theme.colors.accent }]}>
              <Text style={styles.avatarText}>{getInitials(user?.name || 'A')}</Text>
            </View>
          </View>
        </View>

        {/* Admin Banner */}
        <View style={[styles.bannerCard, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.bannerInner}>
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerTitle}>Admin Panel</Text>
              <Text style={styles.bannerSubtitle}>
                Manage your institution, students, teachers and results from one place.
              </Text>
            </View>
            <View style={styles.bannerIcon}>
              <MaterialCommunityIcons
                name="shield-crown-outline"
                size={52}
                color="rgba(255,255,255,0.15)"
              />
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Overview</Text>
        <View style={styles.statsGrid}>
          {STATS.map((stat, idx) => (
            <View
              key={idx}
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
              ]}
            >
              <View style={[styles.statIconWrap, { backgroundColor: stat.bg }]}>
                <MaterialCommunityIcons name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {dashboardData?.[stat.key] || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* User Management */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>User Management</Text>
        <View style={styles.actionsGrid}>
          {USER_ACTIONS.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.actionCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
              ]}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: action.bg }]}>
                <MaterialCommunityIcons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.colors.text }]}>
                {action.label}
              </Text>
              <Text style={[styles.actionDesc, { color: theme.colors.textTertiary }]}>
                {action.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* System Management */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>System Management</Text>
        <View style={styles.actionsGrid}>
          {SYSTEM_ACTIONS.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.actionCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
              ]}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: action.bg }]}>
                <MaterialCommunityIcons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.colors.text }]}>
                {action.label}
              </Text>
              <Text style={[styles.actionDesc, { color: theme.colors.textTertiary }]}>
                {action.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity Placeholder */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Activity</Text>
        <View
          style={[
            styles.activityCard,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
          ]}
        >
          {[
            {
              icon: 'account-plus',
              text: 'System is ready for management',
              time: 'Now',
              color: theme.colors.primary,
            },
            {
              icon: 'file-document-check',
              text: `${dashboardData?.totalResults || 0} results uploaded`,
              time: 'Total',
              color: theme.colors.success,
            },
            {
              icon: 'account-group',
              text: `${dashboardData?.totalStudents || 0} students enrolled`,
              time: 'Total',
              color: theme.colors.accent,
            },
          ].map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.activityRow,
                idx < 2 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.borderLight,
                },
              ]}
            >
              <View style={[styles.activityIcon, { backgroundColor: item.color + '15' }]}>
                <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
              </View>
              <Text
                style={[styles.activityText, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {item.text}
              </Text>
              <Text style={[styles.activityTime, { color: theme.colors.textTertiary }]}>
                {item.time}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: '500' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greeting: { fontSize: 13, fontWeight: '500' },
  userName: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  bannerCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  bannerInner: { flexDirection: 'row', alignItems: 'center' },
  bannerLeft: { flex: 1 },
  bannerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  bannerIcon: { marginLeft: 12 },

  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12, marginTop: 4 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '500' },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  actionDesc: { fontSize: 11, fontWeight: '500', textAlign: 'center' },

  activityCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityText: { flex: 1, fontSize: 13, fontWeight: '600' },
  activityTime: { fontSize: 11, fontWeight: '500' },
});

export default AdminDashboard;
