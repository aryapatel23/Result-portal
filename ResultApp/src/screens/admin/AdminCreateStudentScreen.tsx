import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Alert,
  StatusBar, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';
import DatePickerInput from '../../components/DatePickerInput';

const STANDARDS = ['Balvatika', '1', '2', '3', '4', '5', '6', '7', '8'];

const AdminCreateStudentScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [form, setForm] = useState({
    name: '', grNumber: '', standard: '',
    penNo: '', aadharNo: '', uidNumber: '', mobile: '',
    email: '', parentContact: '',
  });

  const updateField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.grNumber || !form.standard) {
      Alert.alert('Missing Fields', 'Please fill Name, GR Number, Date of Birth, and Standard.');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiService.createStudent({
        ...form,
        dateOfBirth: dateOfBirth.toISOString().split('T')[0],
      });
      Alert.alert('Success', `Student ${form.name} created successfully!`, [
        {
          text: 'Add Another',
          onPress: () => {
            setForm({ name: '', grNumber: '', standard: '', penNo: '', aadharNo: '', uidNumber: '', mobile: '', email: '', parentContact: '' });
            setDateOfBirth(new Date());
          },
        },
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create student');
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Create Student</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Banner */}
          <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
            <MaterialCommunityIcons name="account-plus" size={36} color="#FFF" />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={styles.bannerTitle}>New Student</Text>
              <Text style={styles.bannerDesc}>Fill in details to create a student account</Text>
            </View>
          </View>

          {/* Basic Info */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Basic Information</Text>
          {renderInput('Full Name', 'name', 'account', { required: true })}
          {renderInput('GR Number', 'grNumber', 'card-account-details', { required: true, cap: 'characters' })}
          <DatePickerInput
            label="Date of Birth"
            value={dateOfBirth}
            onChange={setDateOfBirth}
            mode="date"
            maximumDate={new Date()}
            required
          />

          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Standard *</Text>
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

          {/* ID Details */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>ID Details</Text>
          {renderInput('PEN Number', 'penNo', 'identifier', { cap: 'characters' })}
          {renderInput('Aadhar Number', 'aadharNo', 'card-account-details-outline', { keyboard: 'numeric' })}
          {renderInput('UID Number', 'uidNumber', 'shield-account', { cap: 'characters' })}

          {/* Contact */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contact Information</Text>
          {renderInput('Mobile', 'mobile', 'phone', { keyboard: 'phone-pad' })}
          {renderInput('Email', 'email', 'email-outline', { keyboard: 'email-address', cap: 'none' })}
          {renderInput('Parent Contact', 'parentContact', 'phone-classic', { keyboard: 'phone-pad' })}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: theme.colors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
                <Text style={styles.submitText}>Create Student</Text>
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
  chipsRow: { gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, gap: 8, marginTop: 10 },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default AdminCreateStudentScreen;
