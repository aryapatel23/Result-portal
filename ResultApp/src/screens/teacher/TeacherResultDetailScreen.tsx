import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const TeacherResultDetailScreen = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { resultId } = route.params;
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedResult, setEditedResult] = useState<any>(null);

  useEffect(() => {
    fetchResult();
  }, [resultId]);

  const fetchResult = async () => {
    try {
      const data = await apiService.getTeacherResultById(resultId);
      setResult(data);
      setEditedResult(JSON.parse(JSON.stringify(data))); // Deep clone
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load result');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedResult) return;

    // Validate
    for (const subject of editedResult.subjects) {
      if (subject.marks > subject.maxMarks) {
        Alert.alert('Validation Error', `Marks cannot exceed max marks for ${subject.name}`);
        return;
      }
    }

    setIsSaving(true);
    try {
      await apiService.editTeacherResult(resultId, {
        subjects: editedResult.subjects,
        remarks: editedResult.remarks,
      });
      setResult(editedResult);
      setIsEditing(false);
      Alert.alert('Success', 'Result updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update result');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedResult(JSON.parse(JSON.stringify(result)));
    setIsEditing(false);
  };

  const updateSubjectMarks = (index: number, field: 'marks' | 'maxMarks', value: string) => {
    const numValue = parseInt(value) || 0;
    const updated = { ...editedResult };
    updated.subjects[index][field] = numValue;
    setEditedResult(updated);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!result) return null;

  const currentData = isEditing ? editedResult : result;
  const obtained = currentData.subjects.reduce((s: number, sub: any) => s + sub.marks, 0);
  const total = currentData.subjects.reduce((s: number, sub: any) => s + sub.maxMarks, 0);
  const percentage = total > 0 ? (obtained / total) * 100 : 0;

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A+', color: '#10B981' };
    if (pct >= 80) return { grade: 'A', color: '#0D9488' };
    if (pct >= 70) return { grade: 'B+', color: '#3B82F6' };
    if (pct >= 60) return { grade: 'B', color: '#6366F1' };
    if (pct >= 50) return { grade: 'C', color: '#F59E0B' };
    if (pct >= 35) return { grade: 'D', color: '#F97316' };
    return { grade: 'F', color: '#EF4444' };
  };

  const { grade, color } = getGrade(percentage);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Result Details</Text>
        {!isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editBtn}>
            <MaterialCommunityIcons name="pencil" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        {isEditing && <View style={{ width: 32 }} />}
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Student Info */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={styles.studentHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}>
              <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                {result.studentName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={[styles.studentName, { color: theme.colors.text }]}>{result.studentName}</Text>
              <View style={styles.metaRow}>
                <MaterialCommunityIcons name="card-account-details" size={14} color={theme.colors.textTertiary} />
                <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>{result.grNumber}</Text>
                <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>•</Text>
                <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>{result.standard}</Text>
              </View>
            </View>
            <View style={[styles.gradeBadge, { backgroundColor: `${color}15` }]}>
              <Text style={[styles.gradeText, { color }]}>{grade}</Text>
            </View>
          </View>
        </View>

        {/* Score Summary */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Score Summary</Text>
          <View style={styles.scoreGrid}>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreLabel, { color: theme.colors.textTertiary }]}>Total Marks</Text>
              <Text style={[styles.scoreValue, { color: theme.colors.text }]}>{obtained}/{total}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreLabel, { color: theme.colors.textTertiary }]}>Percentage</Text>
              <Text style={[styles.scoreValue, { color }]}>{percentage.toFixed(1)}%</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreLabel, { color: theme.colors.textTertiary }]}>Grade</Text>
              <Text style={[styles.scoreValue, { color }]}>{grade}</Text>
            </View>
          </View>
          <View style={[styles.progressBg, { backgroundColor: theme.colors.borderLight }]}>
            <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: color }]} />
          </View>
        </View>

        {/* Subjects */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Subject-wise Marks</Text>
            {isEditing && (
              <View style={[styles.editBadge, { backgroundColor: theme.colors.primaryLight }]}>
                <MaterialCommunityIcons name="pencil" size={12} color={theme.colors.primary} />
                <Text style={[styles.editBadgeText, { color: theme.colors.primary }]}>Editing</Text>
              </View>
            )}
          </View>
          {currentData.subjects.map((subject: any, idx: number) => {
            const subPerc = subject.maxMarks > 0 ? (subject.marks / subject.maxMarks) * 100 : 0;
            const subColor = subPerc >= 35 ? '#10B981' : '#EF4444';

            return (
              <View key={idx} style={[styles.subjectRow, idx < currentData.subjects.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight }]}>
                <View style={styles.subjectLeft}>
                  <Text style={[styles.subjectName, { color: theme.colors.text }]}>{subject.name}</Text>
                  {!isEditing && (
                    <View style={[styles.subPercentChip, { backgroundColor: `${subColor}15` }]}>
                      <Text style={[styles.subPercentText, { color: subColor }]}>{subPerc.toFixed(0)}%</Text>
                    </View>
                  )}
                </View>
                {isEditing ? (
                  <View style={styles.editRow}>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.borderLight }]}
                      value={String(subject.marks)}
                      onChangeText={(val) => updateSubjectMarks(idx, 'marks', val)}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={theme.colors.textTertiary}
                    />
                    <Text style={[styles.slash, { color: theme.colors.textTertiary }]}>/</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.borderLight }]}
                      value={String(subject.maxMarks)}
                      onChangeText={(val) => updateSubjectMarks(idx, 'maxMarks', val)}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={theme.colors.textTertiary}
                    />
                  </View>
                ) : (
                  <Text style={[styles.subjectMarks, { color: theme.colors.text }]}>
                    {subject.marks}/{subject.maxMarks}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Remarks */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Remarks</Text>
          {isEditing ? (
            <TextInput
              style={[styles.remarksInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.borderLight }]}
              value={currentData.remarks}
              onChangeText={(val) => setEditedResult({ ...editedResult, remarks: val })}
              multiline
              numberOfLines={3}
              placeholder="Add remarks..."
              placeholderTextColor={theme.colors.textTertiary}
            />
          ) : (
            <Text style={[styles.remarksText, { color: theme.colors.textSecondary }]}>
              {result.remarks || 'No remarks'}
            </Text>
          )}
        </View>

        {/* Metadata */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Additional Information</Text>
          {[
            { label: 'Term', value: result.term, icon: 'calendar' },
            { label: 'Academic Year', value: result.academicYear, icon: 'calendar-range' },
            { label: 'Uploaded On', value: new Date(result.createdAt).toLocaleDateString('en-IN'), icon: 'clock-outline' },
          ].map((info, idx) => (
            <View key={idx} style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <MaterialCommunityIcons name={info.icon} size={16} color={theme.colors.textTertiary} />
                <Text style={[styles.infoLabel, { color: theme.colors.textTertiary }]}>{info.label}</Text>
              </View>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{info.value}</Text>
            </View>
          ))}
        </View>

        {isEditing && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight }]}
              onPress={handleCancel}
              disabled={isSaving}
            >
              <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.colors.primary, opacity: isSaving ? 0.7 : 1 }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check" size={18} color="#FFF" />
                  <Text style={styles.saveText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  editBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  content: { padding: 16 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  studentHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '500' },
  gradeBadge: {
    width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center',
  },
  gradeText: { fontSize: 17, fontWeight: '800' },
  scoreGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  scoreItem: { alignItems: 'center', flex: 1 },
  scoreLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  scoreValue: { fontSize: 17, fontWeight: '800' },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  editBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10, gap: 4,
  },
  editBadgeText: { fontSize: 11, fontWeight: '700' },
  subjectRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12,
  },
  subjectLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  subjectName: { fontSize: 14, fontWeight: '600' },
  subPercentChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  subPercentText: { fontSize: 10, fontWeight: '700' },
  subjectMarks: { fontSize: 14, fontWeight: '700' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: {
    width: 50, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, textAlign: 'center', fontSize: 13, fontWeight: '600',
  },
  slash: { fontSize: 14, fontWeight: '600' },
  remarksText: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  remarksInput: {
    borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 13,
    fontWeight: '500', textAlignVertical: 'top', minHeight: 80,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { fontSize: 13, fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1, paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '700' },
  saveBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  saveText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default TeacherResultDetailScreen;
