import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';
import { Result } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const StudentDashboard = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [results, setResults] = useState<Result[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await apiService.getStudentResults(user?.grNumber || '');
      setResults(res.data || []);
    } catch (e: any) {
      console.log('Dashboard load error:', e.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.grNumber]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const avgPercentage =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length)
      : 0;
  const totalExams = results.length;
  const bestGrade = results.length > 0
    ? results.reduce((best, r) => (r.percentage > best.percentage ? r : best), results[0])
    : null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const renderStatCard = (
    icon: string, label: string, value: string | number,
    color: string, bgColor: string,
  ) => (
    <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
      <View style={[styles.statIconWrap, { backgroundColor: bgColor }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>{label}</Text>
    </View>
  );

  const renderResultCard = (result: Result, index: number) => {
    const gradeColor =
      result.percentage >= 80 ? theme.colors.success :
      result.percentage >= 60 ? theme.colors.info :
      result.percentage >= 40 ? theme.colors.warning : theme.colors.error;
    return (
      <TouchableOpacity
        key={result._id || index}
        style={[styles.resultCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}
        onPress={() => navigation.navigate('ResultDetail', { resultId: result._id })}
        activeOpacity={0.7}
      >
        <View style={[styles.resultIconWrap, { backgroundColor: theme.colors.primaryLight }]}>
          <MaterialCommunityIcons name="file-document-outline" size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.resultInfo}>
          <Text style={[styles.resultTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {result.examType}
          </Text>
          <Text style={[styles.resultSub, { color: theme.colors.textTertiary }]}>
            {result.term} {result.academicYear}
          </Text>
        </View>
        <View style={styles.resultRight}>
          <Text style={[styles.resultPercent, { color: gradeColor }]}>
            {result.percentage}%
          </Text>
          <View style={[styles.gradeBadge, { backgroundColor: gradeColor + '18' }]}>
            <Text style={[styles.gradeText, { color: gradeColor }]}>{result.grade}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="loading" size={32} color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading...</Text>
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
              {user?.name || 'Student'}
            </Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>{getInitials(user?.name || 'S')}</Text>
          </View>
        </View>

        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerTextWrap}>
              <Text style={styles.bannerLabel}>Class</Text>
              <Text style={styles.bannerValue}>{user?.standard || 'N/A'}</Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerTextWrap}>
              <Text style={styles.bannerLabel}>GR No.</Text>
              <Text style={styles.bannerValue}>{user?.grNumber || 'N/A'}</Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerTextWrap}>
              <Text style={styles.bannerLabel}>Exams</Text>
              <Text style={styles.bannerValue}>{totalExams}</Text>
            </View>
          </View>
          <View style={styles.bannerDecor}>
            <MaterialCommunityIcons name="school-outline" size={64} color="rgba(255,255,255,0.12)" />
          </View>
        </View>

        {/* Quick Stats */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Overview</Text>
        <View style={styles.statsGrid}>
          {renderStatCard('chart-line', 'Average', `${avgPercentage}%`, theme.colors.info, theme.colors.infoLight)}
          {renderStatCard('trophy-outline', 'Best Score', bestGrade ? `${bestGrade.percentage}%` : '--', theme.colors.warning, theme.colors.warningLight)}
          {renderStatCard('file-multiple-outline', 'Total Exams', totalExams, theme.colors.accent, theme.colors.accentLight)}
          {renderStatCard('star-outline', 'Best Grade', bestGrade?.grade || '--', theme.colors.success, theme.colors.successLight)}
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          {[
            { icon: 'clipboard-text-outline', label: 'Results', screen: 'Results', isTab: true, color: theme.colors.primary },
            { icon: 'calendar-clock-outline', label: 'Attendance', screen: 'StudentAttendance', isTab: false, color: theme.colors.success },
            { icon: 'clock-outline', label: 'Timetable', screen: 'StudentTimetable', isTab: false, color: theme.colors.accent },
            { icon: 'account-outline', label: 'Profile', screen: 'Profile', isTab: true, color: theme.colors.warning },
          ].map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.actionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}
              onPress={() => action.isTab ? navigation.navigate(action.screen) : navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: action.color + '14' }]}>
                <MaterialCommunityIcons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.colors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Results */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Results</Text>
          {results.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Results')}>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>See All</Text>
            </TouchableOpacity>
          )}
        </View>

        {results.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <MaterialCommunityIcons name="file-search-outline" size={40} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>No Results Yet</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textTertiary }]}>
              Your exam results will appear here once published.
            </Text>
          </View>
        ) : (
          results.slice(0, 3).map(renderResultCard)
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  userName: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  avatar: { width: 46, height: 46, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  infoBanner: { borderRadius: 20, padding: 20, marginBottom: 24, overflow: 'hidden' },
  bannerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  bannerTextWrap: { alignItems: 'center' },
  bannerLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500', marginBottom: 4 },
  bannerValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  bannerDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
  bannerDecor: { position: 'absolute', right: -10, bottom: -10 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 14, letterSpacing: -0.2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  seeAll: { fontSize: 13, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: (SCREEN_WIDTH - 52) / 2, padding: 16, borderRadius: 16, borderWidth: 1 },
  statIconWrap: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '500' },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  actionCard: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 16, borderWidth: 1 },
  actionIconWrap: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 11, fontWeight: '600' },
  resultCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  resultIconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  resultInfo: { flex: 1 },
  resultTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  resultSub: { fontSize: 12, fontWeight: '500' },
  resultRight: { alignItems: 'flex-end' },
  resultPercent: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  gradeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  gradeText: { fontSize: 11, fontWeight: '700' },
  emptyCard: { alignItems: 'center', padding: 32, borderRadius: 20, borderWidth: 1, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptyDesc: { fontSize: 13, textAlign: 'center' },
});

export default StudentDashboard;
