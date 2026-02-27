import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  StatusBar, TextInput, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const STANDARDS = ['All', 'Balvatika', '1', '2', '3', '4', '5', '6', '7', '8'];

const AdminResultsScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStandard, setSelectedStandard] = useState('All');

  const fetchResults = useCallback(async () => {
    try {
      const params: any = {};
      if (selectedStandard !== 'All') params.standard = selectedStandard;
      const res = await apiService.getAllResults(params);
      const list = Array.isArray(res) ? res : res?.results || res?.data || [];
      setResults(list);
    } catch (err: any) {
      if (__DEV__) console.log('Results fetch err:', err.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [selectedStandard]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const filtered = results.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.studentName?.toLowerCase().includes(q) ||
      r.grNumber?.toLowerCase().includes(q) ||
      r.student?.name?.toLowerCase().includes(q) ||
      r.student?.grNumber?.toLowerCase().includes(q)
    );
  });

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A+', color: '#10B981' };
    if (pct >= 80) return { grade: 'A', color: '#0D9488' };
    if (pct >= 70) return { grade: 'B+', color: '#3B82F6' };
    if (pct >= 60) return { grade: 'B', color: '#6366F1' };
    if (pct >= 50) return { grade: 'C', color: '#F59E0B' };
    return { grade: 'F', color: '#EF4444' };
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

      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>All Results</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AdminUploadResult')} style={[styles.uploadBtn, { backgroundColor: theme.colors.primary }]}>
          <MaterialCommunityIcons name="upload" size={16} color="#FFF" />
          <Text style={styles.uploadText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search student name or GR..."
            placeholderTextColor={theme.colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Standard Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.filterRow}>
        {STANDARDS.map(s => {
          const active = selectedStandard === s;
          return (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, { backgroundColor: active ? theme.colors.primary : theme.colors.card, borderColor: active ? theme.colors.primary : theme.colors.borderLight }]}
              onPress={() => { setSelectedStandard(s); setIsLoading(true); }}
            >
              <Text style={[styles.filterText, { color: active ? '#FFF' : theme.colors.text }]}>{s === 'All' ? 'All' : `Class ${s}`}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchResults(); }} />}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="file-document-remove-outline" size={56} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>No Results Found</Text>
          </View>
        ) : (
          filtered.map((r, idx) => {
            const studentName = r.studentName || r.student?.name || 'Unknown';
            const grNumber = r.grNumber || r.student?.grNumber || '-';
            const standard = r.standard || r.student?.standard || '-';
            const totalMarks = r.subjects?.reduce((a: number, s: any) => a + (s.marksObtained || 0), 0) || r.totalMarks || 0;
            const maxMarks = r.subjects?.reduce((a: number, s: any) => a + (s.totalMarks || 100), 0) || r.maxMarks || 0;
            const pct = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;
            const { grade, color } = getGrade(pct);
            const teacherName = r.uploadedBy?.name || r.teacherName || 'Unknown';

            return (
              <TouchableOpacity
                key={r._id || idx}
                style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}
                onPress={() => navigation.navigate('AdminResultDetail', { resultId: r._id })}
                activeOpacity={0.7}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentName, { color: theme.colors.text }]}>{studentName}</Text>
                    <View style={styles.metaRow}>
                      <MaterialCommunityIcons name="card-account-details" size={12} color={theme.colors.textTertiary} />
                      <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>GR: {grNumber}</Text>
                      <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>•</Text>
                      <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>Class {standard}</Text>
                    </View>
                  </View>
                  <View style={[styles.gradeBox, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.gradeLetter, { color }]}>{grade}</Text>
                    <Text style={[styles.gradePct, { color }]}>{pct.toFixed(1)}%</Text>
                  </View>
                </View>

                {/* Subject mini bar */}
                {r.subjects && r.subjects.length > 0 && (
                  <View style={[styles.subjectsWrap, { borderTopColor: theme.colors.borderLight }]}>
                    {r.subjects.slice(0, 5).map((sub: any, si: number) => (
                      <View key={si} style={styles.subjectItem}>
                        <Text style={[styles.subjectName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                          {sub.name || sub.subject}
                        </Text>
                        <Text style={[styles.subjectMarks, { color: theme.colors.text }]}>
                          {sub.marksObtained}/{sub.totalMarks || 100}
                        </Text>
                      </View>
                    ))}
                    {r.subjects.length > 5 && (
                      <Text style={[styles.moreSubjects, { color: theme.colors.textTertiary }]}>+{r.subjects.length - 5} more</Text>
                    )}
                  </View>
                )}

                {/* Teacher info + exam */}
                <View style={[styles.footerRow, { borderTopColor: theme.colors.borderLight }]}>
                  <View style={styles.footerItem}>
                    <MaterialCommunityIcons name="account-tie" size={14} color={theme.colors.textTertiary} />
                    <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>{teacherName}</Text>
                  </View>
                  {r.examType && (
                    <View style={[styles.examBadge, { backgroundColor: theme.colors.primaryLight }]}>
                      <Text style={[styles.examText, { color: theme.colors.primary }]}>{r.examType}</Text>
                    </View>
                  )}
                  {r.createdAt && (
                    <Text style={[styles.dateText, { color: theme.colors.textTertiary }]}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, gap: 4 },
  uploadText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 46, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', padding: 0 },
  filterRow: { gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: '600' },
  content: { padding: 16 },
  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', padding: 14 },
  studentName: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '500' },
  gradeBox: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  gradeLetter: { fontSize: 18, fontWeight: '900' },
  gradePct: { fontSize: 10, fontWeight: '600' },
  subjectsWrap: { borderTopWidth: 1, padding: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subjectItem: { alignItems: 'center' },
  subjectName: { fontSize: 10, fontWeight: '500', maxWidth: 60 },
  subjectMarks: { fontSize: 12, fontWeight: '700' },
  moreSubjects: { alignSelf: 'center', fontSize: 11, fontWeight: '600' },
  footerRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, padding: 10, gap: 8 },
  footerItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 11, fontWeight: '500' },
  examBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  examText: { fontSize: 10, fontWeight: '700' },
  dateText: { fontSize: 10, fontWeight: '500' },
});

export default AdminResultsScreen;
