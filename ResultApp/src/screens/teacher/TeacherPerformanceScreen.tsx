import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const { width } = Dimensions.get('window');

const TeacherPerformanceScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [performance, setPerformance] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [perfData, dashData] = await Promise.all([
        apiService.getTeacherPerformance(),
        apiService.getTeacherDashboard(),
      ]);
      setPerformance(perfData);
      setDashboard(dashData);
    } catch (err: any) {
      if (__DEV__) console.log('Performance error:', err.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (isLoading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>Loading performance...</Text>
      </View>
    );
  }

  const stats = dashboard?.statistics || {};
  const recentResults = dashboard?.recentResults || [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Performance</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={[styles.headerCard, { backgroundColor: theme.colors.primary }]}>
          <MaterialCommunityIcons name="chart-line" size={48} color="#FFF" />
          <Text style={styles.headerCardTitle}>Teaching Excellence</Text>
          <Text style={styles.headerCardDesc}>Track your teaching performance and student outcomes</Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            {[
              { label: 'Students Taught', value: stats.totalStudents || 0, icon: 'account-group', color: theme.colors.primary },
              { label: 'Classes', value: stats.classesTaught || 0, icon: 'google-classroom', color: theme.colors.accent },
              { label: 'Avg Performance', value: `${stats.averagePercentage || 0}%`, icon: 'chart-arc', color: theme.colors.success },
              { label: 'Results Uploaded', value: recentResults.length, icon: 'file-upload', color: '#F59E0B' },
            ].map((metric, idx) => (
              <View key={idx} style={[styles.metricCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
                <View style={[styles.metricIcon, { backgroundColor: `${metric.color}15` }]}>
                  <MaterialCommunityIcons name={metric.icon} size={24} color={metric.color} />
                </View>
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>{metric.value}</Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textTertiary }]}>{metric.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Classes Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Assigned Classes</Text>
          <View style={styles.classesRow}>
            {(stats.classes || []).map((cls: string, idx: number) => (
              <View key={idx} style={[styles.classChip, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }]}>
                <MaterialCommunityIcons name="school" size={14} color={theme.colors.primary} />
                <Text style={[styles.classChipText, { color: theme.colors.primary }]}>{cls}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Attendance Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Attendance Summary</Text>
          <View style={[styles.attendanceCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <View style={styles.attendanceRow}>
              <View style={styles.attendanceItem}>
                <Text style={[styles.attendanceLabel, { color: theme.colors.textTertiary }]}>Leaves Taken</Text>
                <Text style={[styles.attendanceValue, { color: theme.colors.text }]}>{stats.leavesTaken || 0}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.colors.borderLight }]} />
              <View style={styles.attendanceItem}>
                <Text style={[styles.attendanceLabel, { color: theme.colors.textTertiary }]}>Yearly Limit</Text>
                <Text style={[styles.attendanceValue, { color: theme.colors.text }]}>{stats.yearlyLeaveLimit || 12}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.colors.borderLight }]} />
              <View style={styles.attendanceItem}>
                <Text style={[styles.attendanceLabel, { color: theme.colors.textTertiary }]}>Remaining</Text>
                <Text style={[styles.attendanceValue, { color: theme.colors.success }]}>
                  {(stats.yearlyLeaveLimit || 12) - (stats.leavesTaken || 0)}
                </Text>
              </View>
            </View>
            {/* Progress Bar */}
            <View style={[styles.progressBg, { backgroundColor: theme.colors.borderLight }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(((stats.leavesTaken || 0) / (stats.yearlyLeaveLimit || 12)) * 100, 100)}%`,
                    backgroundColor: (stats.leavesTaken || 0) > (stats.yearlyLeaveLimit || 12) * 0.8 ? theme.colors.error : theme.colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Recent Results */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Uploads</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TeacherResults')}>
              <Text style={[styles.viewAll, { color: theme.colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentResults.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
              <MaterialCommunityIcons name="file-document-outline" size={40} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No recent results uploaded</Text>
            </View>
          ) : (
            recentResults.slice(0, 5).map((result: any, idx: number) => (
              <View key={idx} style={[styles.resultCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
                <View style={[styles.resultIcon, { backgroundColor: theme.colors.primaryLight }]}>
                  <MaterialCommunityIcons name="account" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: theme.colors.text }]}>{result.studentName}</Text>
                  <View style={styles.resultMeta}>
                    <Text style={[styles.resultMetaText, { color: theme.colors.textTertiary }]}>{result.grNumber}</Text>
                    <Text style={[styles.resultMetaText, { color: theme.colors.textTertiary }]}>•</Text>
                    <Text style={[styles.resultMetaText, { color: theme.colors.textTertiary }]}>{result.standard}</Text>
                  </View>
                </View>
                <Text style={[styles.resultDate, { color: theme.colors.textTertiary }]}>
                  {new Date(result.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { label: 'Upload Results', icon: 'file-upload-outline', screen: 'TeacherUploadResult', color: theme.colors.primary },
              { label: 'View Students', icon: 'account-group-outline', screen: 'TeacherStudents', color: theme.colors.accent },
              { label: 'My Timetable', icon: 'calendar-outline', screen: 'TeacherTimetable', color: theme.colors.success },
              { label: 'Attendance', icon: 'calendar-check-outline', screen: 'TeacherAttendance', color: '#F59E0B' },
            ].map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.actionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}
                onPress={() => navigation.navigate(action.screen)}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                  <MaterialCommunityIcons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.colors.text }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 30 }} />
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
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  content: { padding: 16 },
  headerCard: {
    borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 20,
  },
  headerCardTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginTop: 12 },
  headerCardDesc: { color: '#FFFFFFC0', fontSize: 13, fontWeight: '500', marginTop: 6, textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  viewAll: { fontSize: 13, fontWeight: '600' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: {
    width: (width - 52) / 2, borderRadius: 16, borderWidth: 1, padding: 16, alignItems: 'center',
  },
  metricIcon: {
    width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  metricValue: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  metricLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  classesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  classChip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12, borderWidth: 1, gap: 6,
  },
  classChipText: { fontSize: 12, fontWeight: '600' },
  attendanceCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  attendanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  attendanceItem: { flex: 1, alignItems: 'center' },
  attendanceLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  attendanceValue: { fontSize: 18, fontWeight: '800' },
  divider: { width: 1, marginHorizontal: 8 },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  emptyCard: {
    borderRadius: 12, borderWidth: 1, padding: 32, alignItems: 'center',
  },
  emptyText: { fontSize: 13, fontWeight: '500', marginTop: 8 },
  resultCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1,
    padding: 12, marginBottom: 8, gap: 12,
  },
  resultIcon: {
    width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center',
  },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  resultMeta: { flexDirection: 'row', gap: 6 },
  resultMetaText: { fontSize: 11, fontWeight: '500' },
  resultDate: { fontSize: 11, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: (width - 52) / 2, borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'center',
  },
  actionIcon: {
    width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  actionLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
});

export default TeacherPerformanceScreen;
