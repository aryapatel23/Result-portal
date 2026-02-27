import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  StatusBar, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const AdminResultDetailScreen = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { resultId } = route.params;
  const [result, setResult] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiService.getResultById(resultId);
        setResult(res?.result || res?.data || res);
        
        // Also fetch student details if available
        const studentId = res?.student?._id || res?.studentId || res?.result?.student?._id;
        if (studentId) {
          try {
            const studentRes = await apiService.getStudentById(studentId);
            setStudent(studentRes?.student || studentRes?.data || studentRes);
          } catch (e) {
            if (__DEV__) console.log('Student fetch error:', e);
          }
        }
      } catch (err: any) {
        Alert.alert('Error', err.response?.data?.message || 'Failed to load result details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [resultId]);

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A+', color: '#10B981', bg: '#ECFDF5' };
    if (pct >= 80) return { grade: 'A', color: '#0D9488', bg: '#F0FDFA' };
    if (pct >= 70) return { grade: 'B+', color: '#3B82F6', bg: '#EFF6FF' };
    if (pct >= 60) return { grade: 'B', color: '#6366F1', bg: '#EEF2FF' };
    if (pct >= 50) return { grade: 'C', color: '#F59E0B', bg: '#FFFBEB' };
    return { grade: 'F', color: '#EF4444', bg: '#FEF2F2' };
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>
          Loading result details...
        </Text>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={56} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>Result not found</Text>
      </View>
    );
  }

  const studentName = result.studentName || result.student?.name || student?.name || 'Unknown';
  const grNumber = result.grNumber || result.student?.grNumber || student?.grNumber || '-';
  const standard = result.standard || result.student?.standard || student?.standard || '-';
  const examType = result.examType || 'Final Exam';
  const uploadedBy = result.uploadedBy?.name || result.teacherName || 'Unknown';
  const uploadedAt = result.createdAt || result.uploadedAt;
  
  const subjects = result.subjects || [];
  const totalMarks = subjects.reduce((a: number, s: any) => a + (s.marksObtained || 0), 0);
  const maxMarks = subjects.reduce((a: number, s: any) => a + (s.totalMarks || 100), 0);
  const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;
  const gradeInfo = getGrade(percentage);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Result Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Student Info Card */}
        <View style={[styles.studentCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={[styles.studentAvatar, { backgroundColor: theme.colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              {studentName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={[styles.studentName, { color: theme.colors.text }]}>{studentName}</Text>
            <View style={styles.studentMetaRow}>
              <MaterialCommunityIcons name="card-account-details" size={14} color={theme.colors.textTertiary} />
              <Text style={[styles.studentMeta, { color: theme.colors.textTertiary }]}>GR: {grNumber}</Text>
              <Text style={[styles.studentMeta, { color: theme.colors.textTertiary }]}>•</Text>
              <Text style={[styles.studentMeta, { color: theme.colors.textTertiary }]}>Class {standard}</Text>
            </View>
            {student?.parentContact && (
              <View style={styles.studentMetaRow}>
                <MaterialCommunityIcons name="phone" size={14} color={theme.colors.textTertiary} />
                <Text style={[styles.studentMeta, { color: theme.colors.textTertiary }]}>
                  Parent: {student.parentContact}
                </Text>
              </View>
            )}
          </View>
          <View style={[styles.gradeBadge, { backgroundColor: gradeInfo.bg || gradeInfo.color + '20' }]}>
            <Text style={[styles.gradeText, { color: gradeInfo.color }]}>{gradeInfo.grade}</Text>
          </View>
        </View>

        {/* Exam Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Exam Information</Text>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clipboard-text" size={18} color={theme.colors.primary} />
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Exam Type</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{examType}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account-tie" size={18} color={theme.colors.primary} />
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Uploaded By</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{uploadedBy}</Text>
          </View>

          {uploadedAt && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar" size={18} color={theme.colors.primary} />
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Upload Date</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {new Date(uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </View>
          )}
        </View>

        {/* Overall Performance */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Overall Performance</Text>
          
          <View style={styles.performanceRow}>
            <View style={styles.performanceItem}>
              <Text style={[styles.perfLabel, { color: theme.colors.textTertiary }]}>Total Marks</Text>
              <Text style={[styles.perfValue, { color: theme.colors.text }]}>{totalMarks} / {maxMarks}</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={[styles.perfLabel, { color: theme.colors.textTertiary }]}>Percentage</Text>
              <Text style={[styles.perfValue, { color: gradeInfo.color }]}>{percentage.toFixed(2)}%</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={[styles.perfLabel, { color: theme.colors.textTertiary }]}>Grade</Text>
              <Text style={[styles.perfValue, { color: gradeInfo.color }]}>{gradeInfo.grade}</Text>
            </View>
          </View>
        </View>

        {/* Subject-wise Marks */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Subject-wise Marks</Text>
          
          {subjects.map((subject: any, idx: number) => {
            const subjectPct = subject.totalMarks > 0 
              ? (subject.marksObtained / subject.totalMarks) * 100 
              : 0;
            const subjectGrade = getGrade(subjectPct);
            
            return (
              <View key={idx} style={[styles.subjectRow, idx !== subjects.length - 1 && { borderBottomColor: theme.colors.borderLight, borderBottomWidth: 1, marginBottom: 12, paddingBottom: 12 }]}>
                <View style={styles.subjectLeft}>
                  <Text style={[styles.subjectName, { color: theme.colors.text }]}>
                    {subject.name || subject.subject || `Subject ${idx + 1}`}
                  </Text>
                  <View style={styles.subjectMetaRow}>
                    <Text style={[styles.subjectMarks, { color: theme.colors.textSecondary }]}>
                      {subject.marksObtained || 0} / {subject.totalMarks || 100}
                    </Text>
                    <Text style={[styles.subjectPct, { color: subjectGrade.color }]}>
                      {subjectPct.toFixed(1)}%
                    </Text>
                  </View>
                </View>
                <View style={[styles.subjectGradeBadge, { backgroundColor: subjectGrade.bg || subjectGrade.color + '20' }]}>
                  <Text style={[styles.subjectGradeText, { color: subjectGrade.color }]}>
                    {subjectGrade.grade}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Remarks */}
        {result.remarks && (
          <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Remarks</Text>
            <Text style={[styles.remarksText, { color: theme.colors.textSecondary }]}>
              {result.remarks}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, fontWeight: '500' },
  errorText: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center', marginRight: -44 },
  content: { padding: 16, gap: 16 },
  studentCard: { flexDirection: 'row', padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center', gap: 14 },
  studentAvatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700' },
  studentInfo: { flex: 1, gap: 4 },
  studentName: { fontSize: 17, fontWeight: '700' },
  studentMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  studentMeta: { fontSize: 13 },
  gradeBadge: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  gradeText: { fontSize: 20, fontWeight: '800' },
  infoCard: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoLabel: { fontSize: 14, fontWeight: '500', flex: 1 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  performanceRow: { flexDirection: 'row', gap: 12 },
  performanceItem: { flex: 1, alignItems: 'center', gap: 6 },
  perfLabel: { fontSize: 12, fontWeight: '500' },
  perfValue: { fontSize: 18, fontWeight: '800' },
  subjectRow: { gap: 8 },
  subjectLeft: { flex: 1, gap: 6 },
  subjectName: { fontSize: 15, fontWeight: '700' },
  subjectMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subjectMarks: { fontSize: 14, fontWeight: '600' },
  subjectPct: { fontSize: 13, fontWeight: '700' },
  subjectGradeBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start', marginTop: 6 },
  subjectGradeText: { fontSize: 15, fontWeight: '800' },
  remarksText: { fontSize: 14, lineHeight: 20 },
});

export default AdminResultDetailScreen;
