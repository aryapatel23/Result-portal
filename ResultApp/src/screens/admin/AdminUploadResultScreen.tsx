import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Alert,
  StatusBar, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const EXAM_TYPES = ['Unit Test 1', 'Unit Test 2', 'Mid Term', 'Final', 'Prelim'];

const AdminUploadResultScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [grNumber, setGrNumber] = useState('');
  const [student, setStudent] = useState<any>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [examType, setExamType] = useState('');
  const [subjects, setSubjects] = useState<{ name: string; marksObtained: string; totalMarks: string }[]>([
    { name: '', marksObtained: '', totalMarks: '100' },
  ]);

  const lookupStudent = async () => {
    if (!grNumber.trim()) { Alert.alert('Enter GR Number'); return; }
    setLookingUp(true);
    try {
      const res = await apiService.getStudentByGRNumberAdmin(grNumber.trim());
      const data = res?.student || res?.data?.student || res;
      if (data && data.name) {
        setStudent(data);
      } else {
        Alert.alert('Not Found', 'No student with that GR number');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Student not found');
    } finally {
      setLookingUp(false);
    }
  };

  const updateSubject = (idx: number, key: string, val: string) => {
    setSubjects(prev => prev.map((s, i) => i === idx ? { ...s, [key]: val } : s));
  };

  const addSubject = () => setSubjects(prev => [...prev, { name: '', marksObtained: '', totalMarks: '100' }]);
  const rmSubject = (idx: number) => setSubjects(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!student) { Alert.alert('Find Student First'); return; }
    if (!examType) { Alert.alert('Select Exam Type'); return; }
    const validSubjects = subjects.filter(s => s.name && s.marksObtained);
    if (validSubjects.length === 0) { Alert.alert('Add at least one subject with marks'); return; }

    setIsSubmitting(true);
    try {
      await apiService.adminUploadResult({
        studentId: student._id,
        grNumber: student.grNumber,
        examType,
        subjects: validSubjects.map(s => ({
          name: s.name,
          marksObtained: Number(s.marksObtained),
          totalMarks: Number(s.totalMarks) || 100,
        })),
      });
      Alert.alert('Success', `Result uploaded for ${student.name}`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Upload Result</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Banner */}
          <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
            <MaterialCommunityIcons name="file-upload" size={36} color="#FFF" />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={styles.bannerTitle}>Upload Result</Text>
              <Text style={styles.bannerDesc}>Search student by GR and add marks</Text>
            </View>
          </View>

          {/* Student Lookup */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Find Student</Text>
          <View style={styles.lookupRow}>
            <View style={[styles.inputRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight, flex: 1 }]}>
              <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Enter GR Number"
                placeholderTextColor={theme.colors.textTertiary}
                value={grNumber}
                onChangeText={setGrNumber}
                autoCapitalize="characters"
                onSubmitEditing={lookupStudent}
              />
            </View>
            <TouchableOpacity style={[styles.lookupBtn, { backgroundColor: theme.colors.primary }]} onPress={lookupStudent} disabled={lookingUp}>
              {lookingUp ? <ActivityIndicator color="#FFF" size="small" /> : <MaterialCommunityIcons name="account-search" size={22} color="#FFF" />}
            </TouchableOpacity>
          </View>

          {student && (
            <View style={[styles.studentCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
              <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.success} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.studentName, { color: theme.colors.text }]}>{student.name}</Text>
                <Text style={[styles.studentMeta, { color: theme.colors.textTertiary }]}>
                  GR: {student.grNumber} • Class {student.standard}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setStudent(null)}>
                <MaterialCommunityIcons name="close" size={18} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Exam Type */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Exam Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.examRow}>
            {EXAM_TYPES.map(et => {
              const active = examType === et;
              return (
                <TouchableOpacity
                  key={et}
                  style={[styles.examChip, { backgroundColor: active ? theme.colors.accent : theme.colors.card, borderColor: active ? theme.colors.accent : theme.colors.borderLight }]}
                  onPress={() => setExamType(et)}
                >
                  <Text style={[styles.examChipText, { color: active ? '#FFF' : theme.colors.text }]}>{et}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Subjects */}
          <View style={styles.subjectHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0 }]}>Subjects & Marks</Text>
            <TouchableOpacity onPress={addSubject} style={[styles.addSubBtn, { backgroundColor: theme.colors.primaryLight }]}>
              <MaterialCommunityIcons name="plus" size={16} color={theme.colors.primary} />
              <Text style={[styles.addSubText, { color: theme.colors.primary }]}>Add</Text>
            </TouchableOpacity>
          </View>

          {subjects.map((sub, idx) => (
            <View key={idx} style={[styles.subjectRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[styles.subInput, { color: theme.colors.text, borderColor: theme.colors.borderLight }]}
                  placeholder="Subject Name"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={sub.name}
                  onChangeText={v => updateSubject(idx, 'name', v)}
                />
                <View style={styles.marksRow}>
                  <TextInput
                    style={[styles.marksInput, { color: theme.colors.text, borderColor: theme.colors.borderLight }]}
                    placeholder="Marks"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={sub.marksObtained}
                    onChangeText={v => updateSubject(idx, 'marksObtained', v)}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.ofText, { color: theme.colors.textTertiary }]}>/</Text>
                  <TextInput
                    style={[styles.marksInput, { color: theme.colors.text, borderColor: theme.colors.borderLight }]}
                    placeholder="Total"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={sub.totalMarks}
                    onChangeText={v => updateSubject(idx, 'totalMarks', v)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              {subjects.length > 1 && (
                <TouchableOpacity onPress={() => rmSubject(idx)} style={styles.rmBtn}>
                  <MaterialCommunityIcons name="delete-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: theme.colors.primary, opacity: (!student || isSubmitting) ? 0.6 : 1 }]}
            onPress={handleSubmit}
            disabled={!student || isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#FFF" /> : (
              <>
                <MaterialCommunityIcons name="upload" size={20} color="#FFF" />
                <Text style={styles.submitText}>Upload Result</Text>
              </>
            )}
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  content: { padding: 16 },
  banner: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 20, marginBottom: 20 },
  bannerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  bannerDesc: { color: '#FFFFFFB0', fontSize: 12, fontWeight: '500', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  lookupRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 48, gap: 10 },
  input: { flex: 1, fontSize: 14, fontWeight: '500', padding: 0 },
  lookupBtn: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  studentCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  studentName: { fontSize: 15, fontWeight: '700' },
  studentMeta: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  examRow: { gap: 8, marginBottom: 10 },
  examChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  examChipText: { fontSize: 13, fontWeight: '600' },
  subjectHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 12 },
  addSubBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 4 },
  addSubText: { fontSize: 13, fontWeight: '600' },
  subjectRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10 },
  subInput: { borderBottomWidth: 1, paddingVertical: 6, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  marksRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  marksInput: { flex: 1, borderBottomWidth: 1, paddingVertical: 4, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  ofText: { fontSize: 16, fontWeight: '700' },
  rmBtn: { padding: 8 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, gap: 8, marginTop: 16 },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default AdminUploadResultScreen;
