import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Alert,
  StatusBar, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const CLASSES = ['Balvatika', '1', '2', '3', '4', '5', '6', '7', '8'];

const AdminCreateTeacherScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', employeeId: '', email: '',
    phone: '', classTeacher: '', subjectInput: '',
  });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);

  const updateField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const addSubject = () => {
    const s = form.subjectInput.trim();
    if (s && !subjects.includes(s)) {
      setSubjects(prev => [...prev, s]);
      updateField('subjectInput', '');
    }
  };

  const toggleClass = (cls: string) => {
    setAssignedClasses(prev => prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.employeeId || !form.email) {
      Alert.alert('Missing Fields', 'Please fill Name, Employee ID, and Email.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (__DEV__) console.log('Creating teacher:', form.name);
      
      const response = await apiService.createTeacher({
        name: form.name,
        employeeId: form.employeeId,
        email: form.email,
        phone: form.phone,
        classTeacher: form.classTeacher || null,
        subjects,
        assignedClasses,
      });
      
      if (__DEV__) console.log('Teacher created successfully:', response);
      
      // Success - show confirmation
      Alert.alert(
        '✅ Success',
        `Teacher ${form.name} created successfully!\n\n� Auto-generated password sent to ${form.email}\n\nThe teacher can login with their email and the password received via email.`,
        [
          {
            text: 'Add Another Teacher',
            onPress: () => {
              setForm({
                name: '',
                employeeId: '',
                email: '',
                phone: '',
                classTeacher: '',
                subjectInput: '',
              });
              setSubjects([]);
              setAssignedClasses([]);
            },
          },
          {
            text: 'View All Teachers',
            onPress: () => navigation.navigate('AdminTeachers'),
          },
          { text: 'Go Back', onPress: () => navigation.goBack(), style: 'cancel' },
        ]
      );
    } catch (err: any) {
      if (__DEV__) {
        console.error('Error creating teacher:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create teacher';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (label: string, key: string, icon: string, opts: any = {}) => (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{label}{opts.required && ' *'}</Text>
      <View style={[styles.inputRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
        <MaterialCommunityIcons name={icon} size={20} color={theme.colors.textTertiary} />
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          placeholder={opts.placeholder || label}
          placeholderTextColor={theme.colors.textTertiary}
          value={(form as any)[key]}
          onChangeText={(v) => updateField(key, v)}
          keyboardType={opts.keyboard || 'default'}
          autoCapitalize={opts.cap || 'words'}
          secureTextEntry={opts.secure}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Create Teacher</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.banner, { backgroundColor: theme.colors.accent }]}>
            <MaterialCommunityIcons name="account-tie" size={36} color="#FFF" />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={styles.bannerTitle}>New Teacher</Text>
              <Text style={styles.bannerDesc}>A welcome email will be sent with credentials</Text>
            </View>
          </View>

          {/* Basic Info */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Basic Information</Text>
          {renderInput('Full Name', 'name', 'account', { required: true })}
          {renderInput('Employee ID', 'employeeId', 'badge-account', { required: true, cap: 'characters' })}
          {renderInput('Email', 'email', 'email-outline', { required: true, keyboard: 'email-address', cap: 'none' })}
          
          {/* Password auto-generated info */}
          <View style={[styles.autoPassInfo, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }]}>
            <MaterialCommunityIcons name="lock-check" size={20} color={theme.colors.primary} />
            <Text style={[styles.autoPassText, { color: theme.colors.primary }]}>
              Password will be auto-generated and sent to teacher's email
            </Text>
          </View>

          {renderInput('Phone', 'phone', 'phone', { keyboard: 'phone-pad' })}

          {/* Subjects */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Subjects</Text>
          <View style={[styles.inputRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight, marginBottom: 10 }]}>
            <MaterialCommunityIcons name="book-outline" size={20} color={theme.colors.textTertiary} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Add subject (e.g. Mathematics)"
              placeholderTextColor={theme.colors.textTertiary}
              value={form.subjectInput}
              onChangeText={(v) => updateField('subjectInput', v)}
              onSubmitEditing={addSubject}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={addSubject} style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}>
              <MaterialCommunityIcons name="plus" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsRow}>
            {subjects.map((s, i) => (
              <TouchableOpacity key={i} style={[styles.tag, { backgroundColor: theme.colors.primaryLight }]} onPress={() => setSubjects(prev => prev.filter((_, idx) => idx !== i))}>
                <Text style={[styles.tagText, { color: theme.colors.primary }]}>{s}</Text>
                <MaterialCommunityIcons name="close" size={14} color={theme.colors.primary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Assigned Classes */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Assigned Classes</Text>
          <View style={styles.classGrid}>
            {CLASSES.map(cls => {
              const active = assignedClasses.includes(cls);
              return (
                <TouchableOpacity
                  key={cls}
                  style={[styles.classChip, { backgroundColor: active ? theme.colors.primary : theme.colors.card, borderColor: active ? theme.colors.primary : theme.colors.borderLight }]}
                  onPress={() => toggleClass(cls)}
                >
                  <Text style={[styles.classChipText, { color: active ? '#FFF' : theme.colors.text }]}>Class {cls}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Class Teacher */}
          {renderInput('Class Teacher Of', 'classTeacher', 'school', { placeholder: 'e.g. 10A' })}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: theme.colors.accent, opacity: isSubmitting ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#FFF" /> : (
              <>
                <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
                <Text style={styles.submitText}>Create Teacher</Text>
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
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 48, gap: 10 },
  input: { flex: 1, fontSize: 14, fontWeight: '500', padding: 0 },
  addBtn: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4 },
  tagText: { fontSize: 13, fontWeight: '600' },
  classGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  classChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  classChipText: { fontSize: 13, fontWeight: '600' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, gap: 8, marginTop: 10 },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  autoPassInfo: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 14, gap: 10 },
  autoPassText: { fontSize: 13, fontWeight: '600', flex: 1 },
});

export default AdminCreateTeacherScreen;
