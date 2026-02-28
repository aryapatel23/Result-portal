import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Alert,
  StatusBar, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const STANDARDS = ['Balvatika', '1', '2', '3', '4', '5', '6', '7', '8'];

const AdminEditStudentScreen = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { studentId } = route.params || {};
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    grNumber: '',
    dateOfBirth: '',
    standard: '',
    penNo: '',
    aadharNo: '',
    uidNumber: '',
    mobile: '',
    email: '',
    parentContact: '',
  });

  useEffect(() => {
    const fetchStudent = async () => {
      if (!studentId) {
        Alert.alert('Error', 'No student ID provided');
        navigation.goBack();
        return;
      }
      
      setLoading(true);
      try {
        const response = await apiService.getStudentById(studentId);
        const studentData = response?.student || response?.data || response;
        setStudent(studentData);
        
        // Populate form with fetched data
        setForm({
          name: studentData?.name || '',
          grNumber: studentData?.grNumber || '',
          dateOfBirth: studentData?.dateOfBirth?.split('T')[0] || '',
          standard: studentData?.standard || '',
          penNo: studentData?.penNo || '',
          aadharNo: studentData?.aadharNo || '',
          uidNumber: studentData?.uidNumber || '',
          mobile: studentData?.mobile || '',
          email: studentData?.email || '',
          parentContact: studentData?.parentContact || '',
        });
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to load student data');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId, navigation]);

  const updateField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.name || !form.grNumber || !form.standard) {
      Alert.alert('Required', 'Name, GR Number, and Standard are required');
      return;
    }
    setSaving(true);
    try {
      await apiService.updateStudent(studentId, form);
      Alert.alert('Success', 'Student updated successfully', [{ 
        text: 'OK', 
        onPress: () => navigation.goBack() 
      }]);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Student', `Delete ${student?.name}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiService.deleteStudent(studentId);
            Alert.alert('Deleted', 'Student removed');
            navigation.goBack();
          } catch (e: any) { 
            Alert.alert('Error', e.response?.data?.message || 'Failed'); 
          }
        },
      },
    ]);
  };

  const renderInput = (label: string, key: string, icon: string, opts: any = {}) => (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fLabel, { color: theme.colors.textSecondary }]}>{label}{opts.required && ' *'}</Text>
      <View style={[styles.inputRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
        <MaterialCommunityIcons name={icon} size={20} color={theme.colors.textTertiary} />
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          value={(form as any)[key]}
          onChangeText={v => updateField(key, v)}
          keyboardType={opts.keyboard || 'default'}
          autoCapitalize={opts.cap || 'words'}
          placeholder={opts.placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          editable={opts.editable !== false}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Edit Student</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>Loading student data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Edit Student</Text>
        <TouchableOpacity onPress={handleDelete} style={{ padding: 4 }}>
          <MaterialCommunityIcons name="delete-outline" size={22} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {renderInput('Full Name', 'name', 'account', { required: true })}
          {renderInput('GR Number', 'grNumber', 'card-account-details', { required: true, editable: false })}
          {renderInput('Date of Birth', 'dateOfBirth', 'calendar', { placeholder: 'YYYY-MM-DD' })}

          <View style={styles.fieldWrap}>
            <Text style={[styles.fLabel, { color: theme.colors.textSecondary }]}>Standard *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {STANDARDS.map(s => {
                const active = form.standard === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, { backgroundColor: active ? theme.colors.primary : theme.colors.card, borderColor: active ? theme.colors.primary : theme.colors.borderLight }]}
                    onPress={() => updateField('standard', s)}
                  >
                    <Text style={[styles.chipText, { color: active ? '#FFF' : theme.colors.text }]}>Class {s}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {renderInput('PEN Number', 'penNo', 'identifier', { cap: 'characters' })}
          {renderInput('Aadhar Number', 'aadharNo', 'card-account-details-outline', { keyboard: 'numeric' })}
          {renderInput('UID Number', 'uidNumber', 'shield-account', { cap: 'characters' })}
          {renderInput('Mobile', 'mobile', 'phone', { keyboard: 'phone-pad' })}
          {renderInput('Email', 'email', 'email-outline', { keyboard: 'email-address', cap: 'none' })}
          {renderInput('Parent Contact', 'parentContact', 'phone-classic', { keyboard: 'phone-pad' })}

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
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: '500' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  content: { padding: 16 },
  fieldWrap: { marginBottom: 14 },
  fLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 48, gap: 10 },
  input: { flex: 1, fontSize: 14, fontWeight: '500', padding: 0 },
  chipsRow: { gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, gap: 8, marginTop: 10 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default AdminEditStudentScreen;
