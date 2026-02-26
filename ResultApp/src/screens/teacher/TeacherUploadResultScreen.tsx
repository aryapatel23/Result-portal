import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

interface SubjectInput {
  name: string;
  marks: string;
  maxMarks: string;
}

const EXAM_TYPES = ['Term-1', 'Term-2', 'Mid-Term', 'Final', 'Unit Test'];

const TeacherUploadResultScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState('Term-1');

  // Form fields
  const [studentName, setStudentName] = useState('');
  const [grNumber, setGrNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [standard, setStandard] = useState('');
  const [remarks, setRemarks] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [subjects, setSubjects] = useState<SubjectInput[]>([
    { name: '', marks: '', maxMarks: '100' },
  ]);

  // Auto-fill standard from assigned classes
  useEffect(() => {
    if (user?.assignedClasses?.length === 1) {
      setStandard(user.assignedClasses[0]);
    }
  }, [user]);

  const addSubject = () => {
    setSubjects([...subjects, { name: '', marks: '', maxMarks: '100' }]);
  };

  const removeSubject = (idx: number) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter((_, i) => i !== idx));
  };

  const updateSubject = (idx: number, field: keyof SubjectInput, value: string) => {
    const updated = [...subjects];
    updated[idx][field] = value;
    setSubjects(updated);
  };

  const validateForm = (): boolean => {
    if (!studentName.trim()) { Alert.alert('Missing Field', 'Please enter student name'); return false; }
    if (!grNumber.trim()) { Alert.alert('Missing Field', 'Please enter GR number'); return false; }
    if (!dateOfBirth.trim()) { Alert.alert('Missing Field', 'Please enter date of birth (YYYY-MM-DD)'); return false; }
    if (!standard.trim()) { Alert.alert('Missing Field', 'Please select a class/standard'); return false; }

    for (let i = 0; i < subjects.length; i++) {
      const sub = subjects[i];
      if (!sub.name.trim()) { Alert.alert('Missing Field', `Please enter subject name for subject ${i + 1}`); return false; }
      if (!sub.marks.trim() || isNaN(Number(sub.marks))) { Alert.alert('Invalid Marks', `Please enter valid marks for ${sub.name}`); return false; }
      if (!sub.maxMarks.trim() || isNaN(Number(sub.maxMarks))) { Alert.alert('Invalid Marks', `Please enter valid max marks for ${sub.name}`); return false; }
      if (Number(sub.marks) > Number(sub.maxMarks)) { Alert.alert('Invalid Marks', `Marks cannot exceed max marks for ${sub.name}`); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        studentName: studentName.trim(),
        grNumber: grNumber.trim(),
        dateOfBirth: dateOfBirth.trim(),
        standard: standard.trim(),
        subjects: subjects.map(s => ({
          name: s.name.trim(),
          marks: Number(s.marks),
          maxMarks: Number(s.maxMarks),
        })),
        remarks: remarks.trim(),
        term: selectedTerm,
        academicYear,
      };

      await apiService.uploadTeacherResult(payload);
      Alert.alert('Success', 'Result uploaded successfully!', [
        { text: 'Upload Another', onPress: resetForm },
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to upload result';
      Alert.alert('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStudentName('');
    setGrNumber('');
    setDateOfBirth('');
    setRemarks('');
    setSubjects([{ name: '', marks: '', maxMarks: '100' }]);
  };

  const renderInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    icon: string,
    placeholder: string,
    keyboardType: any = 'default',
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
        <MaterialCommunityIcons name={icon} size={14} color={theme.colors.textTertiary} /> {label}
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight, color: theme.colors.text }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Upload Result</Text>
        <TouchableOpacity onPress={resetForm} style={styles.resetBtn}>
          <MaterialCommunityIcons name="refresh" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Student Info Section */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Student Information</Text>
          </View>

          {renderInput('Student Name', studentName, setStudentName, 'account', 'Enter full name')}
          {renderInput('GR Number', grNumber, setGrNumber, 'card-account-details', 'e.g. GR001')}
          {renderInput('Date of Birth', dateOfBirth, setDateOfBirth, 'calendar', 'YYYY-MM-DD')}

          {/* Class Selector */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              <MaterialCommunityIcons name="google-classroom" size={14} color={theme.colors.textTertiary} /> Class / Standard
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {(user?.assignedClasses || []).map((cls: string) => {
                const isActive = standard === cls;
                return (
                  <TouchableOpacity
                    key={cls}
                    style={[styles.chip, { backgroundColor: isActive ? theme.colors.primary : theme.colors.card, borderColor: isActive ? theme.colors.primary : theme.colors.borderLight }]}
                    onPress={() => setStandard(cls)}
                  >
                    <Text style={[styles.chipText, { color: isActive ? '#FFF' : theme.colors.text }]}>{cls}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Exam Details */}
          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Exam Details</Text>
          </View>

          {/* Term Selector */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Term / Exam Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {EXAM_TYPES.map(term => {
                const isActive = selectedTerm === term;
                return (
                  <TouchableOpacity
                    key={term}
                    style={[styles.chip, { backgroundColor: isActive ? theme.colors.primary : theme.colors.card, borderColor: isActive ? theme.colors.primary : theme.colors.borderLight }]}
                    onPress={() => setSelectedTerm(term)}
                  >
                    <Text style={[styles.chipText, { color: isActive ? '#FFF' : theme.colors.text }]}>{term}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {renderInput('Academic Year', academicYear, setAcademicYear, 'calendar-range', '2024-25')}

          {/* Subjects Section */}
          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <MaterialCommunityIcons name="book-open-variant" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Subjects & Marks</Text>
          </View>

          {subjects.map((sub, idx) => (
            <View key={idx} style={[styles.subjectCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
              <View style={styles.subjectHeader}>
                <Text style={[styles.subjectNum, { color: theme.colors.primary }]}>Subject {idx + 1}</Text>
                {subjects.length > 1 && (
                  <TouchableOpacity onPress={() => removeSubject(idx)}>
                    <MaterialCommunityIcons name="close-circle" size={22} color={theme.colors.error} />
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={[styles.subInput, { backgroundColor: theme.colors.background, borderColor: theme.colors.borderLight, color: theme.colors.text }]}
                value={sub.name}
                onChangeText={v => updateSubject(idx, 'name', v)}
                placeholder="Subject name (e.g. Mathematics)"
                placeholderTextColor={theme.colors.textTertiary}
              />
              <View style={styles.marksRow}>
                <View style={styles.marksCol}>
                  <Text style={[styles.marksLabel, { color: theme.colors.textTertiary }]}>Obtained</Text>
                  <TextInput
                    style={[styles.marksInput, { backgroundColor: theme.colors.background, borderColor: theme.colors.borderLight, color: theme.colors.text }]}
                    value={sub.marks}
                    onChangeText={v => updateSubject(idx, 'marks', v)}
                    placeholder="0"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={[styles.marksSlash, { color: theme.colors.textTertiary }]}>/</Text>
                <View style={styles.marksCol}>
                  <Text style={[styles.marksLabel, { color: theme.colors.textTertiary }]}>Max</Text>
                  <TextInput
                    style={[styles.marksInput, { backgroundColor: theme.colors.background, borderColor: theme.colors.borderLight, color: theme.colors.text }]}
                    value={sub.maxMarks}
                    onChangeText={v => updateSubject(idx, 'maxMarks', v)}
                    placeholder="100"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.addSubBtn, { borderColor: theme.colors.primary }]}
            onPress={addSubject}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.addSubText, { color: theme.colors.primary }]}>Add Subject</Text>
          </TouchableOpacity>

          {/* Remarks */}
          {renderInput('Remarks (Optional)', remarks, setRemarks, 'comment-text-outline', 'Any additional remarks...')}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: theme.colors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
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
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  resetBtn: { padding: 4 },
  scrollContent: { padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, fontWeight: '500',
  },
  chipRow: { gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  subjectCard: {
    borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12,
  },
  subjectHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  subjectNum: { fontSize: 14, fontWeight: '700' },
  subInput: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, fontWeight: '500', marginBottom: 10,
  },
  marksRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  marksCol: { flex: 1 },
  marksLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  marksInput: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 15, fontWeight: '600', textAlign: 'center',
  },
  marksSlash: { fontSize: 22, fontWeight: '300', marginBottom: 8 },
  addSubBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed',
    marginBottom: 16, gap: 8,
  },
  addSubText: { fontSize: 14, fontWeight: '600' },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 14, gap: 8, marginTop: 8,
  },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default TeacherUploadResultScreen;
