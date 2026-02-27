import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, Switch,
  StatusBar, TextInput, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const AdminSettingsScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [systemConfig, setSystemConfig] = useState<any>({});
  const [attendanceSettings, setAttendanceSettings] = useState<any>({});

  const fetchSettings = async () => {
    try {
      const [sysRes, attRes] = await Promise.all([
        apiService.getSystemConfig().catch(() => ({})),
        apiService.getAttendanceSettings().catch(() => ({})),
      ]);
      setSystemConfig(sysRes?.config || sysRes?.data || sysRes || {});
      setAttendanceSettings(attRes?.settings || attRes?.data || attRes || {});
    } catch (e: any) {
      if (__DEV__) console.log('Settings err:', e.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const updateSysConfig = (key: string, value: any) => {
    setSystemConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateAttConfig = (key: string, value: any) => {
    setAttendanceSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSaveSystem = async () => {
    setSaving(true);
    try {
      await apiService.updateSystemConfig(systemConfig);
      Alert.alert('Success', 'System configuration saved');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      await apiService.updateAttendanceSettings(attendanceSettings);
      Alert.alert('Success', 'Attendance settings saved');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const renderSwitch = (label: string, value: boolean, onToggle: (v: boolean) => void, icon: string) => (
    <View style={[styles.settingRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
      <View style={styles.settingLeft}>
        <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primary} />
        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.colors.borderLight, true: theme.colors.primaryLight }}
        thumbColor={value ? theme.colors.primary : '#CCC'}
      />
    </View>
  );

  const renderInput = (label: string, value: string, onChange: (v: string) => void, icon: string, opts: any = {}) => (
    <View style={[styles.settingRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
      <View style={[styles.settingLeft, { flex: 0.5 }]}>
        <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primary} />
        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{label}</Text>
      </View>
      <TextInput
        style={[styles.settingInput, { color: theme.colors.text, borderColor: theme.colors.borderLight }]}
        value={value}
        onChangeText={onChange}
        keyboardType={opts.numeric ? 'numeric' : 'default'}
        placeholder={opts.placeholder}
        placeholderTextColor={theme.colors.textTertiary}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>System Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSettings(); }} />}
        showsVerticalScrollIndicator={false}
      >
        {/* System Config */}
        <View style={[styles.sectionHeader, { backgroundColor: theme.colors.primary }]}>
          <MaterialCommunityIcons name="cog" size={20} color="#FFF" />
          <Text style={styles.sectionHeaderText}>System Configuration</Text>
        </View>

        {renderInput('School Name', systemConfig.schoolName || '', v => updateSysConfig('schoolName', v), 'school', { placeholder: 'Enter school name' })}
        {renderInput('Academic Year', systemConfig.academicYear || '', v => updateSysConfig('academicYear', v), 'calendar-range', { placeholder: '2024-25' })}
        {renderInput('Contact Email', systemConfig.contactEmail || '', v => updateSysConfig('contactEmail', v), 'email-outline', { placeholder: 'admin@school.com' })}
        {renderInput('Contact Phone', systemConfig.contactPhone || '', v => updateSysConfig('contactPhone', v), 'phone', { placeholder: 'Phone' })}
        {renderSwitch('Maintenance Mode', systemConfig.maintenanceMode || false, v => updateSysConfig('maintenanceMode', v), 'wrench')}
        {renderSwitch('Allow Registration', systemConfig.allowRegistration !== false, v => updateSysConfig('allowRegistration', v), 'account-plus')}
        {renderSwitch('Email Notifications', systemConfig.emailNotifications !== false, v => updateSysConfig('emailNotifications', v), 'bell')}

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.colors.primary, opacity: saving ? 0.6 : 1 }]}
          onPress={handleSaveSystem}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#FFF" /> : (
            <>
              <MaterialCommunityIcons name="content-save" size={18} color="#FFF" />
              <Text style={styles.saveBtnText}>Save System Config</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Attendance Settings */}
        <View style={[styles.sectionHeader, { backgroundColor: theme.colors.accent, marginTop: 20 }]}>
          <MaterialCommunityIcons name="clipboard-check" size={20} color="#FFF" />
          <Text style={styles.sectionHeaderText}>Attendance Settings</Text>
        </View>

        {renderSwitch('Auto Attendance', attendanceSettings.autoAttendance || false, v => updateAttConfig('autoAttendance', v), 'robot')}
        {renderSwitch('GPS Required', attendanceSettings.gpsRequired !== false, v => updateAttConfig('gpsRequired', v), 'crosshairs-gps')}
        {renderSwitch('Face Recognition', attendanceSettings.faceRecognition || false, v => updateAttConfig('faceRecognition', v), 'face-recognition')}
        {renderInput('Check-In Time', attendanceSettings.checkInTime || '', v => updateAttConfig('checkInTime', v), 'clock-in', { placeholder: '09:00' })}
        {renderInput('Check-Out Time', attendanceSettings.checkOutTime || '', v => updateAttConfig('checkOutTime', v), 'clock-out', { placeholder: '17:00' })}
        {renderInput('Late Threshold (min)', String(attendanceSettings.lateThreshold || ''), v => updateAttConfig('lateThreshold', Number(v) || 0), 'timer-alert', { numeric: true, placeholder: '15' })}
        {renderInput('Geofence Radius (m)', String(attendanceSettings.geofenceRadius || ''), v => updateAttConfig('geofenceRadius', Number(v) || 0), 'map-marker-radius', { numeric: true, placeholder: '200' })}

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.colors.accent, opacity: saving ? 0.6 : 1 }]}
          onPress={handleSaveAttendance}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#FFF" /> : (
            <>
              <MaterialCommunityIcons name="content-save" size={18} color="#FFF" />
              <Text style={styles.saveBtnText}>Save Attendance Settings</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  content: { padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, marginBottom: 12 },
  sectionHeaderText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '600' },
  settingInput: { borderBottomWidth: 1, flex: 0.5, textAlign: 'right', fontSize: 14, fontWeight: '500', paddingVertical: 2 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, gap: 8, marginTop: 12 },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default AdminSettingsScreen;
