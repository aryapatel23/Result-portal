import React, { useState, useEffect } from 'react';
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
const BAR_MAX_HEIGHT = 120;

const TABS = ['All', 'Lessons', 'Score'] as const;

const StudentAnalyticsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [results, setResults] = useState<Result[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await apiService.getStudentResults(user?.grNumber || '');
      setResults(res.data || []);
    } catch (e: any) {
      console.log('Analytics error:', e.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // Calculate analytics data
  const totalExams = results.length;
  const avgPercentage = totalExams > 0
    ? Math.round(results.reduce((s, r) => s + (r.percentage || 0), 0) / totalExams)
    : 0;
  const highestScore = totalExams > 0
    ? Math.max(...results.map(r => r.percentage || 0))
    : 0;
  const lowestScore = totalExams > 0
    ? Math.min(...results.map(r => r.percentage || 0))
    : 0;

  // Subject-wise analysis from latest result
  const latestResult = results.length > 0 ? results[0] : null;
  const subjectData = latestResult?.subjects || [];

  // Performance trend (last 5 exams)
  const trendData = results.slice(0, 5).reverse();

  const getGradeColor = (pct: number) =>
    pct >= 80 ? theme.colors.success :
    pct >= 60 ? theme.colors.info :
    pct >= 40 ? theme.colors.warning : theme.colors.error;

  if (isLoading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="loading" size={32} color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Analytics</Text>
        <TouchableOpacity
          style={[styles.optionsBtn, { backgroundColor: theme.colors.card }]}
          onPress={() => {}}
        >
          <MaterialCommunityIcons name="dots-horizontal" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={[styles.tabRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === idx && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab(idx)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText,
              { color: theme.colors.textSecondary },
              activeTab === idx && { color: '#FFFFFF' },
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Overview Card */}
        <View style={[styles.scoreCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={styles.scoreHeader}>
            <MaterialCommunityIcons name="chart-arc" size={20} color={theme.colors.primary} />
            <Text style={[styles.scoreHeaderText, { color: theme.colors.text }]}>Score Overview</Text>
          </View>
          <View style={styles.scoreGrid}>
            <View style={styles.scoreStat}>
              <View style={[styles.scoreCircle, { borderColor: theme.colors.primary }]}>
                <Text style={[styles.scoreCircleText, { color: theme.colors.primary }]}>{avgPercentage}%</Text>
              </View>
              <Text style={[styles.scoreStatLabel, { color: theme.colors.textTertiary }]}>Average</Text>
            </View>
            <View style={styles.scoreStat}>
              <View style={[styles.scoreCircle, { borderColor: theme.colors.success }]}>
                <Text style={[styles.scoreCircleText, { color: theme.colors.success }]}>{highestScore}%</Text>
              </View>
              <Text style={[styles.scoreStatLabel, { color: theme.colors.textTertiary }]}>Highest</Text>
            </View>
            <View style={styles.scoreStat}>
              <View style={[styles.scoreCircle, { borderColor: theme.colors.warning }]}>
                <Text style={[styles.scoreCircleText, { color: theme.colors.warning }]}>{lowestScore}%</Text>
              </View>
              <Text style={[styles.scoreStatLabel, { color: theme.colors.textTertiary }]}>Lowest</Text>
            </View>
          </View>
        </View>

        {/* Performance Chart */}
        {trendData.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <View style={styles.chartHeader}>
              <MaterialCommunityIcons name="chart-bar" size={20} color={theme.colors.accent} />
              <Text style={[styles.chartHeaderText, { color: theme.colors.text }]}>Performance Trend</Text>
            </View>
            <View style={styles.chartBody}>
              {trendData.map((result, idx) => {
                const barHeight = (result.percentage / 100) * BAR_MAX_HEIGHT;
                const color = getGradeColor(result.percentage);
                return (
                  <View key={idx} style={styles.barWrap}>
                    <Text style={[styles.barValue, { color: theme.colors.textSecondary }]}>
                      {result.percentage}%
                    </Text>
                    <View style={[styles.barTrack, { backgroundColor: theme.colors.borderLight }]}>
                      <View style={[styles.barFill, { height: barHeight, backgroundColor: color }]} />
                    </View>
                    <Text style={[styles.barLabel, { color: theme.colors.textTertiary }]} numberOfLines={1}>
                      {result.examType?.slice(0, 6)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Subject Breakdown */}
        {subjectData.length > 0 && (
          <View style={[styles.subjectCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <View style={styles.chartHeader}>
              <MaterialCommunityIcons name="book-open-variant" size={20} color={theme.colors.info} />
              <Text style={[styles.chartHeaderText, { color: theme.colors.text }]}>Subject Breakdown</Text>
              <Text style={[styles.subjectExam, { color: theme.colors.textTertiary }]}>
                {latestResult?.examType}
              </Text>
            </View>

            {subjectData.map((sub, idx) => {
              const pct = sub.totalMarks > 0 ? Math.round((sub.obtainedMarks / sub.totalMarks) * 100) : 0;
              const barColor = getGradeColor(pct);
              return (
                <View key={idx} style={styles.subjectRow}>
                  <View style={styles.subjectInfo}>
                    <Text style={[styles.subjectName, { color: theme.colors.text }]}>{sub.name}</Text>
                    <Text style={[styles.subjectMarks, { color: theme.colors.textTertiary }]}>
                      {sub.obtainedMarks}/{sub.totalMarks}
                    </Text>
                  </View>
                  <View style={[styles.progressBg, { backgroundColor: theme.colors.borderLight }]}>
                    <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                  </View>
                  <Text style={[styles.subjectPct, { color: barColor }]}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Exam History */}
        <View style={[styles.historyCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={styles.chartHeader}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.warning} />
            <Text style={[styles.chartHeaderText, { color: theme.colors.text }]}>Exam History</Text>
          </View>

          {results.length === 0 ? (
            <Text style={[styles.noDataText, { color: theme.colors.textTertiary }]}>No exam data available</Text>
          ) : (
            results.slice(0, 5).map((result, idx) => (
              <View key={idx} style={[styles.historyRow, { borderBottomColor: theme.colors.borderLight }]}>
                <View style={[styles.historyDot, { backgroundColor: getGradeColor(result.percentage) }]} />
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyTitle, { color: theme.colors.text }]}>{result.examType}</Text>
                  <Text style={[styles.historySub, { color: theme.colors.textTertiary }]}>
                    {result.term} | {result.academicYear}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={[styles.historyPct, { color: getGradeColor(result.percentage) }]}>
                    {result.percentage}%
                  </Text>
                  <Text style={[styles.historyGrade, { color: theme.colors.textTertiary }]}>{result.grade}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  optionsBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: { fontSize: 13, fontWeight: '600' },

  scoreCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  scoreHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  scoreHeaderText: { fontSize: 16, fontWeight: '700' },
  scoreGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  scoreStat: { alignItems: 'center' },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreCircleText: { fontSize: 18, fontWeight: '800' },
  scoreStatLabel: { fontSize: 12, fontWeight: '500' },

  chartCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  chartHeaderText: { fontSize: 16, fontWeight: '700', flex: 1 },
  chartBody: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: BAR_MAX_HEIGHT + 50,
    paddingTop: 10,
  },
  barWrap: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  barTrack: {
    width: 28,
    height: BAR_MAX_HEIGHT,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 8 },
  barLabel: { fontSize: 10, fontWeight: '500', marginTop: 6, maxWidth: 50, textAlign: 'center' },

  subjectCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  subjectExam: { fontSize: 12, fontWeight: '500' },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  subjectInfo: { width: 90 },
  subjectName: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  subjectMarks: { fontSize: 11, fontWeight: '500' },
  progressBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  subjectPct: { fontSize: 13, fontWeight: '700', width: 40, textAlign: 'right' },

  historyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  noDataText: { fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  historyInfo: { flex: 1 },
  historyTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  historySub: { fontSize: 11, fontWeight: '500' },
  historyRight: { alignItems: 'flex-end' },
  historyPct: { fontSize: 15, fontWeight: '800' },
  historyGrade: { fontSize: 11, fontWeight: '500' },
});

export default StudentAnalyticsScreen;
