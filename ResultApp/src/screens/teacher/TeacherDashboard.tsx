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

const TeacherDashboard = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await apiService.getTeacherDashboard();
      setDashboardData(response || null);
    } catch (error: any) {
      console.log('Dashboard load error:', error.message);
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

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', onPress: logout, style: 'destructive' },
    ]);
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

  const QUICK_ACTIONS = [
    {
      icon: 'account-group-outline',
      label: 'Students',
      desc: 'View & manage',
      color: theme.colors.primary,
      bg: theme.colors.primaryLight,
      screen: 'TeacherStudents',
    },
    {
      icon: 'file-document-edit-outline',
      label: 'Upload',
      desc: 'Add results',
      color: theme.colors.success,
      bg: theme.colors.successLight,
      screen: 'TeacherUploadResult',
    },
    {
      icon: 'chart-box-outline',
      label: 'Results',
      desc: 'All results',
      color: theme.colors.accent,
      bg: theme.colors.accentLight,
      screen: 'TeacherResults',
    },
    {
      icon: 'calendar-check-outline',
      label: 'Attendance',
      desc: 'Mark today',
      color: theme.colors.warning,
      bg: theme.colors.warningLight,
      screen: 'TeacherAttendance',
    },
    {
      icon: 'clock-outline',
      label: 'Timetable',
      desc: 'Class schedule',
      color: theme.colors.info,
      bg: theme.colors.infoLight,
      screen: 'TeacherTimetable',
    },
    {
      icon: 'account-circle-outline',
      label: 'Profile',
      desc: 'My profile',
      color: theme.colors.error,
      bg: theme.colors.errorLight,
      screen: 'TeacherProfile',
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
              {user?.name || 'Teacher'}
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
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.avatarText}>{getInitials(user?.name || 'T')}</Text>
            </View>
          </View>
        </View>

        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerTextWrap}>
              <Text style={styles.bannerLabel}>Employee ID</Text>
              <Text style={styles.bannerValue}>{user?.employeeId || 'N/A'}</Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerTextWrap}>
              <Text style={styles.bannerLabel}>Classes</Text>
              <Text style={styles.bannerValue}>
                {user?.assignedClasses?.length || 0}
              </Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerTextWrap}>
              <Text style={styles.bannerLabel}>Students</Text>
              <Text style={styles.bannerValue}>
                {dashboardData?.statistics?.totalStudents || 0}
              </Text>
            </View>
          </View>
          <View style={styles.bannerDecor}>
            <MaterialCommunityIcons
              name="school-outline"
              size={64}
              color="rgba(255,255,255,0.1)"
            />
          </View>
        </View>

        {/* Stats Row */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Overview</Text>
        <View style={styles.statsRow}>
          {[
            {
              icon: 'account-group',
              label: 'Students',
              value: dashboardData?.statistics?.totalStudents || 0,
              color: theme.colors.primary,
              bg: theme.colors.primaryLight,
            },
            {
              icon: 'file-document-multiple',
              label: 'Results',
              value: dashboardData?.recentResults?.length || 0,
              color: theme.colors.accent,
              bg: theme.colors.accentLight,
            },
            {
              icon: 'book-open-variant',
              label: 'Subjects',
              value: user?.subjects?.length || 0,
              color: theme.colors.info,
              bg: theme.colors.infoLight,
            },
          ].map((stat, idx) => (
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
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action, idx) => (
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

        {/* Assigned Classes */}
        {user?.assignedClasses && user.assignedClasses.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Assigned Classes
            </Text>
            <View
              style={[
                styles.classesCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
              ]}
            >
              {user.assignedClasses.map((cls: string, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.classRow,
                    idx < (user.assignedClasses?.length || 0) - 1 && {
                      borderBottomColor: theme.colors.borderLight,
                      borderBottomWidth: 1,
                    },
                  ]}
                  onPress={() => navigation.navigate('TeacherStudents', { standard: cls })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.classIcon, { backgroundColor: theme.colors.primaryLight }]}>
                    <MaterialCommunityIcons
                      name="google-classroom"
                      size={18}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.classInfo}>
                    <Text style={[styles.className, { color: theme.colors.text }]}>{cls}</Text>
                    {user.classTeacher === cls && (
                      <Text style={[styles.classBadge, { color: theme.colors.primary }]}>
                        Class Teacher
                      </Text>
                    )}
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={theme.colors.textTertiary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Subjects */}
        {user?.subjects && user.subjects.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>My Subjects</Text>
            <View style={styles.subjectsWrap}>
              {user.subjects.map((sub: string, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.subjectChip,
                    {
                      backgroundColor: theme.colors.accentLight,
                      borderColor: theme.colors.accent + '30',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="book-open-page-variant-outline"
                    size={14}
                    color={theme.colors.accent}
                  />
                  <Text style={[styles.subjectText, { color: theme.colors.accent }]}>{sub}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Sign Out */}
        <TouchableOpacity
          style={[
            styles.logoutBtn,
            { backgroundColor: theme.colors.errorLight, borderColor: theme.colors.error },
          ]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="logout" size={20} color={theme.colors.error} />
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>Sign Out</Text>
        </TouchableOpacity>

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

  infoBanner: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  bannerContent: { flexDirection: 'row', alignItems: 'center' },
  bannerTextWrap: { flex: 1, alignItems: 'center' },
  bannerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  bannerValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  bannerDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bannerDecor: { position: 'absolute', right: -10, bottom: -10 },

  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12, marginTop: 4 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
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
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '500' },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    width: '31%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  actionDesc: { fontSize: 10, fontWeight: '500', textAlign: 'center' },

  classesCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  classIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  classInfo: { flex: 1 },
  className: { fontSize: 14, fontWeight: '600' },
  classBadge: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  subjectsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  subjectText: { fontSize: 13, fontWeight: '600' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '700' },
});

export default TeacherDashboard;
