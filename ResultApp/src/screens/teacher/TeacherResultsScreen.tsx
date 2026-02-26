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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const TeacherResultsScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const fetchResults = useCallback(async () => {
    try {
      const res = await apiService.getTeacherResults();
      setResults(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.log('Results error:', err.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const onRefresh = () => { setRefreshing(true); fetchResults(); };

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A+', color: '#10B981' };
    if (pct >= 80) return { grade: 'A', color: '#0D9488' };
    if (pct >= 70) return { grade: 'B+', color: '#3B82F6' };
    if (pct >= 60) return { grade: 'B', color: '#6366F1' };
    if (pct >= 50) return { grade: 'C', color: '#F59E0B' };
    if (pct >= 35) return { grade: 'D', color: '#F97316' };
    return { grade: 'F', color: '#EF4444' };
  };

  const computeTotals = (result: any) => {
    const subs = result.subjects || [];
    const obtained = subs.reduce((s: number, sub: any) => s + (sub.marks || 0), 0);
    const total = subs.reduce((s: number, sub: any) => s + (sub.maxMarks || 0), 0);
    const percentage = total > 0 ? (obtained / total) * 100 : 0;
    return { obtained, total, percentage };
  };

  // Get unique classes and terms for filtering
  const allClasses = [...new Set(results.map(r => r.standard))].sort();
  const allTerms = [...new Set(results.map(r => r.term))].sort();
  const filterOptions = ['all', ...allClasses, ...allTerms];

  const filteredResults = selectedFilter === 'all'
    ? results
    : results.filter(r => r.standard === selectedFilter || r.term === selectedFilter);

  const handleDelete = (resultId: string, studentName: string) => {
    Alert.alert('Delete Result', `Delete result for ${studentName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiService.deleteTeacherResult(resultId);
            setResults(prev => prev.filter(r => r._id !== resultId));
            Alert.alert('Deleted', 'Result removed successfully');
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>Loading results...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Results</Text>
        <View style={[styles.countBadge, { backgroundColor: theme.colors.primaryLight }]}>
          <Text style={[styles.countText, { color: theme.colors.primary }]}>{filteredResults.length}</Text>
        </View>
      </View>

      {/* Summary Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total', value: results.length, icon: 'file-document-multiple', color: theme.colors.primary },
          { label: 'Classes', value: allClasses.length, icon: 'google-classroom', color: theme.colors.accent },
          { label: 'Terms', value: allTerms.length, icon: 'calendar-range', color: theme.colors.success },
        ].map((stat, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <MaterialCommunityIcons name={stat.icon} size={18} color={stat.color} />
            <Text style={[styles.statVal, { color: theme.colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {filterOptions.map(f => {
          const isActive = selectedFilter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, { backgroundColor: isActive ? theme.colors.primary : theme.colors.card, borderColor: isActive ? theme.colors.primary : theme.colors.borderLight }]}
              onPress={() => setSelectedFilter(f)}
            >
              <Text style={[styles.filterText, { color: isActive ? '#FFF' : theme.colors.textSecondary }]}>
                {f === 'all' ? 'All' : f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Results List */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredResults.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="file-document-remove-outline" size={56} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>No Results Found</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textTertiary }]}>Upload results to see them here</Text>
          </View>
        ) : (
          filteredResults.map((result, idx) => {
            const { obtained, total, percentage } = computeTotals(result);
            const { grade, color } = getGrade(percentage);

            return (
              <View
                key={result._id || idx}
                style={[styles.resultCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    <Text style={[styles.studentName, { color: theme.colors.text }]}>{result.studentName}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons name="card-account-details-outline" size={12} color={theme.colors.textTertiary} />
                        <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>{result.grNumber}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons name="school-outline" size={12} color={theme.colors.textTertiary} />
                        <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>{result.standard}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.gradeBadge, { backgroundColor: `${color}15` }]}>
                    <Text style={[styles.gradeText, { color }]}>{grade}</Text>
                  </View>
                </View>

                {/* Marks & Percentage */}
                <View style={styles.scoreRow}>
                  <View style={styles.scoreItem}>
                    <Text style={[styles.scoreLabel, { color: theme.colors.textTertiary }]}>Marks</Text>
                    <Text style={[styles.scoreValue, { color: theme.colors.text }]}>{obtained}/{total}</Text>
                  </View>
                  <View style={styles.scoreItem}>
                    <Text style={[styles.scoreLabel, { color: theme.colors.textTertiary }]}>Percentage</Text>
                    <Text style={[styles.scoreValue, { color }]}>{percentage.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.scoreItem}>
                    <Text style={[styles.scoreLabel, { color: theme.colors.textTertiary }]}>Term</Text>
                    <Text style={[styles.scoreValue, { color: theme.colors.text }]}>{result.term}</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={[styles.progressBg, { backgroundColor: theme.colors.borderLight }]}>
                  <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: color }]} />
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <Text style={[styles.dateText, { color: theme.colors.textTertiary }]}>
                    <MaterialCommunityIcons name="clock-outline" size={12} color={theme.colors.textTertiary} />
                    {' '}{formatDate(result.createdAt)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDelete(result._id, result.studentName)}
                    style={styles.deleteBtn}
                  >
                    <MaterialCommunityIcons name="delete-outline" size={18} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  countBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  statCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1,
    paddingVertical: 10, paddingHorizontal: 12, gap: 8,
  },
  statVal: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 11, fontWeight: '500' },
  filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: '600' },
  listContent: { paddingHorizontal: 16 },
  resultCard: {
    borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardLeft: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  metaRow: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '500' },
  gradeBadge: {
    width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center',
  },
  gradeText: { fontSize: 16, fontWeight: '800' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  scoreItem: { alignItems: 'center' },
  scoreLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  scoreValue: { fontSize: 15, fontWeight: '700' },
  progressBg: { height: 6, borderRadius: 3, marginBottom: 12, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 12, fontWeight: '500' },
  deleteBtn: { padding: 4 },
  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptyDesc: { fontSize: 13, fontWeight: '500', marginTop: 6 },
});

export default TeacherResultsScreen;
