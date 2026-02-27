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

const AdminEditTeacherScreen = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { teacher } = route.params || {};
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: teacher?.name || '',
    email: teacher?.email || '',
    phone: teacher?.phone || '',
    classTeacher: teacher?.classTeacher || '',
    password: '',
  });
  const [subjects, setSubjects] = useState<string[]>(teacher?.subjects || []);
  const [assignedClasses, setAssignedClasses] = useState<string[]>(teacher?.assignedClasses || []);
  const [subjectInput, setSubjectInput] = useState('');

  const updateField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const addSubject = () => {
    const s = subjectInput.trim();
    if (s && !subjects.includes(s)) {
      setSubjects(prev => [...prev, s]);
      setSubjectInput('');
    }
  };

  const toggleClass = (cls: string) => {
    setAssignedClasses(prev => prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      Alert.alert('Required', 'Name and email are required');
      return;
    }
    setSaving(true);
    try {
      const data: any = {
        name: form.name, email: form.email, phone: form.phone,
        classTeacher: form.classTeacher, subjects, assignedClasses,
      };
      if (form.password) data.password = form.password;
      await apiService.updateTeacher(teacher._id, data);
      Alert.alert('Success', 'Teacher updated', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Edit Teacher</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.idRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <MaterialCommunityIcons name="badge-account" size={20} color={theme.colors.primary} />
            <Text style={[styles.idText, { color: theme.colors.text }]}>Employee ID: {teacher?.employeeId}</Text>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.fLabel, { color: theme.colors.textSecondary }]}>Full Name *</Text>
            <TextInput style={[styles.fInput, { color: theme.colors.text, backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]} value={form.name} onChangeText={v => updateField('name', v)} />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.fLabel, { color: theme.colors.textSecondary }]}>Email *</Text>
            <TextInput style={[styles.fInput, { color: theme.colors.text, backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]} value={form.email} onChangeText={v => updateField('email', v)} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.fLabel, { color: theme.colors.textSecondary }]}>Phone</Text>
            <TextInput style={[styles.fInput, { color: theme.colors.text, backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]} value={form.phone} onChangeText={v => updateField('phone', v)} keyboardType="phone-pad" />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.fLabel, { color: theme.colors.textSecondary }]}>New Password (leave blank to keep)</Text>
            <TextInput style={[styles.fInput, { color: theme.colors.text, backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]} value={form.password} onChangeText={v => updateField('password', v)} secureTextEntry placeholder="••••••" placeholderTextColor={theme.colors.textTertiary} />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.fLabel, { color: theme.colors.textSecondary }]}>Class Teacher Of</Text>
            <TextInput style={[styles.fInput, { color: theme.colors.text, backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]} value={form.classTeacher} onChangeText={v => updateField('classTeacher', v)} placeholder="e.g. 10A" placeholderTextColor={theme.colors.textTertiary} />
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Subjects</Text>
          <View style={[styles.addRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <TextInput
              style={[styles.addInput, { color: theme.colors.text }]}
              placeholder="Add subject"
              placeholderTextColor={theme.colors.textTertiary}
              value={subjectInput}
              onChangeText={setSubjectInput}
              onSubmitEditing={addSubject}
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

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary, opacity: saving ? 0.6 : 1 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#FFF" /> : (
              <>
                <MaterialCommunityIcons name="content-save" size={20} color="#FFF" />
                <Text style={styles.saveBtnText}>Save Changes</Text>
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
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 16 },
  idText: { fontSize: 14, fontWeight: '600' },
  fieldWrap: { marginBottom: 14 },
  fLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  fInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 46, fontSize: 14, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  addRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 46, gap: 8, marginBottom: 10 },
  addInput: { flex: 1, fontSize: 14, fontWeight: '500', padding: 0 },
  addBtn: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4 },
  tagText: { fontSize: 13, fontWeight: '600' },
  classGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  classChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  classChipText: { fontSize: 13, fontWeight: '600' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, gap: 8, marginTop: 10 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default AdminEditTeacherScreen;
