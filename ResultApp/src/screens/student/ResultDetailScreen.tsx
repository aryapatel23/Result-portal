import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import apiService from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { Result } from '../../types';

const ResultDetailScreen = ({ route, navigation }: any) => {
  const { resultId } = route.params;
  const { theme } = useTheme();
  const [result, setResult] = useState<Result | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchResultDetail(); }, []);

  const fetchResultDetail = async () => {
    try {
      const response = await apiService.getResultById(resultId);
      setResult(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load result details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const gradeColor = (pct: number) =>
    pct >= 80 ? theme.colors.success :
    pct >= 60 ? theme.colors.info :
    pct >= 40 ? theme.colors.warning : theme.colors.error;

  const gradeBg = (pct: number) =>
    pct >= 80 ? theme.colors.successLight :
    pct >= 60 ? theme.colors.infoLight :
    pct >= 40 ? theme.colors.warningLight : theme.colors.errorLight;

  if (isLoading || !result) {
    return (
      <View style={[s.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="loading" size={32} color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[s.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={[s.headerTitle, { color: theme.colors.text }]}>Result Details</Text>
          <Text style={[s.headerSub, { color: theme.colors.textTertiary }]}>{result.examType}</Text>
        </View>
        <View style={s.spacer} />
      </View>

      <ScrollView style={s.flex} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Score Card */}
        <View style={[s.scoreCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={[s.scoreCircle, { borderColor: gradeColor(result.percentage) }]}>
            <Text style={[s.scorePct, { color: gradeColor(result.percentage) }]}>
              {result.percentage.toFixed(1)}%
            </Text>
          </View>
          <View style={[s.gradeBadge, { backgroundColor: gradeBg(result.percentage) }]}>
            <Text style={[s.gradeText, { color: gradeColor(result.percentage) }]}>Grade {result.grade}</Text>
          </View>

          <View style={[s.statsRow, { borderTopColor: theme.colors.borderLight }]}>
            <View style={s.statItem}>
              <Text style={[s.statLabel, { color: theme.colors.textTertiary }]}>Obtained</Text>
              <Text style={[s.statValue, { color: theme.colors.text }]}>{result.obtainedMarks}</Text>
            </View>
            <View style={[s.statDivider, { backgroundColor: theme.colors.borderLight }]} />
            <View style={s.statItem}>
              <Text style={[s.statLabel, { color: theme.colors.textTertiary }]}>Total</Text>
              <Text style={[s.statValue, { color: theme.colors.text }]}>{result.totalMarks}</Text>
            </View>
            {result.rank && (
              <>
                <View style={[s.statDivider, { backgroundColor: theme.colors.borderLight }]} />
                <View style={s.statItem}>
                  <Text style={[s.statLabel, { color: theme.colors.textTertiary }]}>Rank</Text>
                  <Text style={[s.statValue, { color: theme.colors.primary }]}>#{result.rank}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Exam Info */}
        <View style={[s.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={s.cardHeader}>
            <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.accent} />
            <Text style={[s.cardTitle, { color: theme.colors.text }]}>Exam Information</Text>
          </View>
          {[
            ['Exam Type', result.examType],
            ['Term', result.term],
            ['Academic Year', result.academicYear],
            ['Published', new Date(result.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
          ].map(([label, val], idx) => (
            <View key={idx} style={[s.infoRow, idx < 3 && { borderBottomColor: theme.colors.borderLight, borderBottomWidth: 1 }]}>
              <Text style={[s.infoLabel, { color: theme.colors.textTertiary }]}>{label}</Text>
              <Text style={[s.infoValue, { color: theme.colors.text }]}>{val}</Text>
            </View>
          ))}
        </View>

        {/* Subjects */}
        <View style={[s.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={s.cardHeader}>
            <MaterialCommunityIcons name="book-open-variant" size={20} color={theme.colors.info} />
            <Text style={[s.cardTitle, { color: theme.colors.text }]}>Subject-wise Performance</Text>
          </View>
          {result.subjects.map((sub, idx) => {
            const pct = sub.totalMarks > 0 ? (sub.obtainedMarks / sub.totalMarks) * 100 : 0;
            return (
              <View key={idx} style={[s.subjectRow, idx < result.subjects.length - 1 && { borderBottomColor: theme.colors.borderLight, borderBottomWidth: 1 }]}>
                <View style={s.subjectTop}>
                  <Text style={[s.subjectName, { color: theme.colors.text }]}>{sub.name}</Text>
                  <View style={[s.subjectGradeBadge, { backgroundColor: gradeBg(pct) }]}>
                    <Text style={[s.subjectGradeText, { color: gradeColor(pct) }]}>{sub.grade}</Text>
                  </View>
                </View>
                <View style={s.subjectBottom}>
                  <Text style={[s.subjectMarks, { color: theme.colors.textTertiary }]}>
                    {sub.obtainedMarks} / {sub.totalMarks}
                  </Text>
                  <Text style={[s.subjectPct, { color: gradeColor(pct) }]}>{pct.toFixed(1)}%</Text>
                </View>
                <View style={[s.progressBg, { backgroundColor: theme.colors.borderLight }]}>
                  <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: gradeColor(pct) }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Remarks */}
        {result.remarks && (
          <View style={[s.remarkCard, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }]}>
            <View style={s.remarkHeader}>
              <MaterialCommunityIcons name="message-text-outline" size={18} color={theme.colors.primary} />
              <Text style={[s.remarkTitle, { color: theme.colors.primary }]}>Teacher's Remarks</Text>
            </View>
            <Text style={[s.remarkText, { color: theme.colors.text }]}>"{result.remarks}"</Text>
          </View>
        )}

        {/* Attendance */}
        {result.attendance !== undefined && (
          <View style={[s.attendanceCard, { backgroundColor: theme.colors.successLight, borderColor: theme.colors.success }]}>
            <MaterialCommunityIcons name="calendar-check" size={20} color={theme.colors.success} />
            <Text style={[s.attendanceLabel, { color: theme.colors.success }]}>Attendance</Text>
            <Text style={[s.attendanceValue, { color: theme.colors.success }]}>{result.attendance}%</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  backBtn: { marginRight: 14 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  spacer: { width: 36 },

  scoreCard: { borderRadius: 18, borderWidth: 1, padding: 24, alignItems: 'center', marginTop: 12, marginBottom: 14 },
  scoreCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  scorePct: { fontSize: 24, fontWeight: '900' },
  gradeBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  gradeText: { fontSize: 15, fontWeight: '800' },
  statsRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: 16, width: '100%' },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, fontWeight: '500', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statDivider: { width: 1, height: 30 },

  card: { borderRadius: 18, borderWidth: 1, padding: 18, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700' },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  infoLabel: { fontSize: 13, fontWeight: '500' },
  infoValue: { fontSize: 13, fontWeight: '700' },

  subjectRow: { paddingVertical: 12 },
  subjectTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  subjectName: { fontSize: 14, fontWeight: '700', flex: 1 },
  subjectGradeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  subjectGradeText: { fontSize: 12, fontWeight: '800' },
  subjectBottom: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  subjectMarks: { fontSize: 12, fontWeight: '500' },
  subjectPct: { fontSize: 13, fontWeight: '700' },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  remarkCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14 },
  remarkHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  remarkTitle: { fontSize: 14, fontWeight: '700' },
  remarkText: { fontSize: 13, fontWeight: '500', lineHeight: 20 },

  attendanceCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  attendanceLabel: { fontSize: 14, fontWeight: '600', flex: 1 },
  attendanceValue: { fontSize: 22, fontWeight: '900' },
});

export default ResultDetailScreen;
