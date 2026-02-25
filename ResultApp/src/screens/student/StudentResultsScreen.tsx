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
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';
import { Result, getResultTotals } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FILTERS = ['All', 'Current', 'Previous'] as const;

const StudentResultsScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState(0);

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const res = await apiService.getStudentResults();
      setResults(Array.isArray(res) ? res : []);
    } catch (e: any) {
      console.log('Results error:', e.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchResults(); };

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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Results</Text>
        <View style={styles.headerRight}>
          <Text style={[styles.countBadge, { color: theme.colors.primary, backgroundColor: theme.colors.primaryLight }]}>
            {results.length}
          </Text>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f, idx) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              { borderColor: theme.colors.border },
              filter === idx && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
            ]}
            onPress={() => setFilter(idx)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterText,
              { color: theme.colors.textSecondary },
              filter === idx && { color: '#FFFFFF' },
            ]}>
              {f}
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
        {results.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <MaterialCommunityIcons name="file-search-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Results Found</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textTertiary }]}>
              Your exam results will appear here once published by your teachers.
            </Text>
          </View>
        ) : (
          results.map((result, index) => {
            const { percentage, grade, obtainedMarks, totalMarks } = getResultTotals(result);
            const gradeColor = getGradeColor(percentage);
            return (
              <TouchableOpacity
                key={result._id || index}
                style={[styles.resultCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}
                onPress={() => navigation.navigate('ResultDetail', { resultId: result._id })}
                activeOpacity={0.7}
              >
                {/* Top Section */}
                <View style={styles.resultTop}>
                  <View style={[styles.resultIcon, { backgroundColor: theme.colors.primaryLight }]}>
                    <MaterialCommunityIcons name="file-document-outline" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.resultMeta}>
                    <Text style={[styles.resultTitle, { color: theme.colors.text }]} numberOfLines={1}>
                      {result.examType}
                    </Text>
                    <Text style={[styles.resultSub, { color: theme.colors.textTertiary }]}>
                      {result.term} | {result.academicYear}
                    </Text>
                  </View>
                  <View style={[styles.percentBadge, { backgroundColor: gradeColor + '14' }]}>
                    <Text style={[styles.percentText, { color: gradeColor }]}>
                      {percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>

                {/* Stats Row */}
                <View style={[styles.statsRow, { borderTopColor: theme.colors.borderLight }]}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statItemLabel, { color: theme.colors.textTertiary }]}>Marks</Text>
                    <Text style={[styles.statItemValue, { color: theme.colors.text }]}>
                      {obtainedMarks}/{totalMarks}
                    </Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statItemLabel, { color: theme.colors.textTertiary }]}>Grade</Text>
                    <Text style={[styles.statItemValue, { color: gradeColor }]}>{grade}</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statItemLabel, { color: theme.colors.textTertiary }]}>Subjects</Text>
                    <Text style={[styles.statItemValue, { color: theme.colors.text }]}>{result.subjects?.length || 0}</Text>
                  </View>
                </View>

                {/* View Details */}
                <View style={styles.viewRow}>
                  <Text style={[styles.viewText, { color: theme.colors.primary }]}>View Details</Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.primary} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', marginLeft: 8, letterSpacing: -0.3 },
  headerRight: {},
  countBadge: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },

  filterRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: '600' },

  resultCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  resultTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  resultIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  resultMeta: { flex: 1 },
  resultTitle: { fontSize: 16, fontWeight: '700', marginBottom: 3 },
  resultSub: { fontSize: 12, fontWeight: '500' },
  percentBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  percentText: { fontSize: 15, fontWeight: '800' },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 14,
    borderTopWidth: 1,
    marginBottom: 12,
  },
  statItem: { alignItems: 'center' },
  statItemLabel: { fontSize: 11, fontWeight: '500', marginBottom: 3 },
  statItemValue: { fontSize: 14, fontWeight: '700' },
  statDivider: { width: 1, height: 28 },

  viewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  viewText: { fontSize: 13, fontWeight: '600' },

  emptyCard: { alignItems: 'center', padding: 40, borderRadius: 20, borderWidth: 1, gap: 10, marginTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});

export default StudentResultsScreen;
