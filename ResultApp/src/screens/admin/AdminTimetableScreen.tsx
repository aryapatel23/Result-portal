import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  StatusBar, TextInput, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const AdminTimetableScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [timetable, setTimetable] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiService.getAllTeachers();
        setTeachers(Array.isArray(res) ? res : res?.data || []);
      } catch (e: any) {
        if (__DEV__) console.log('Teachers fetch err:', e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const loadTimetable = useCallback(async (teacherId: string) => {
    try {
      setIsLoading(true);
      const res = await apiService.getAdminTeacherTimetable(teacherId);
      const tt = res?.timetable || res?.data?.timetable || res?.schedule || res?.data || {};
      // Normalize timetable to { Monday: [{period, subject, class}, ...], ... }
      const normalized: any = {};
      DAYS.forEach(day => {
        if (tt[day] && Array.isArray(tt[day])) {
          // Ensure each period has period number
          normalized[day] = tt[day].map((p: any, idx: number) => ({
            period: p.period || idx + 1,
            subject: p.subject || '',
            class: p.class || p.standard || '',
          }));
          // Pad to 8 periods if needed
          while (normalized[day].length < PERIODS.length) {
            normalized[day].push({
              period: normalized[day].length + 1,
              subject: '',
              class: '',
            });
          }
        } else {
          normalized[day] = PERIODS.map(p => ({ period: p, subject: '', class: '' }));
        }
      });
      setTimetable(normalized);
      if (__DEV__) console.log('Loaded timetable:', normalized);
    } catch (e: any) {
      if (__DEV__) console.log('Timetable load err:', e.message);
      // Init empty
      const empty: any = {};
      DAYS.forEach(d => { empty[d] = PERIODS.map(p => ({ period: p, subject: '', class: '' })); });
      setTimetable(empty);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectTeacher = (t: any) => {
    setSelectedTeacher(t);
    loadTimetable(t._id);
  };

  const updatePeriod = (day: string, periodIdx: number, field: string, value: string) => {
    setTimetable((prev: any) => ({
      ...prev,
      [day]: prev[day].map((p: any, i: number) => i === periodIdx ? { ...p, [field]: value } : p),
    }));
  };

  const handleSave = async () => {
    if (!selectedTeacher) return;
    setSaving(true);
    try {
      await apiService.saveAdminTeacherTimetable(selectedTeacher._id, { schedule: timetable });
      Alert.alert('Success', `Timetable saved for ${selectedTeacher.name}`);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to save timetable');
    } finally {
      setSaving(false);
    }
  };

  const filteredTeachers = teachers.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.name?.toLowerCase().includes(q) || t.employeeId?.toLowerCase().includes(q);
  });

  if (isLoading && !selectedTeacher) {
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
        <TouchableOpacity onPress={() => selectedTeacher ? setSelectedTeacher(null) : navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {selectedTeacher ? `${selectedTeacher.name}'s Timetable` : 'Set Timetable'}
        </Text>
        {selectedTeacher && (
          <TouchableOpacity onPress={handleSave} disabled={saving} style={[styles.saveHeaderBtn, { backgroundColor: theme.colors.primary, opacity: saving ? 0.6 : 1 }]}>
            {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveHeaderText}>Save</Text>}
          </TouchableOpacity>
        )}
      </View>

      {!selectedTeacher ? (
        /* Teacher Selection */
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
            <MaterialCommunityIcons name="timetable" size={36} color="#FFF" />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={styles.bannerTitle}>Timetable Management</Text>
              <Text style={styles.bannerDesc}>Select a teacher to set their weekly schedule</Text>
            </View>
          </View>

          <View style={[styles.searchBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search teachers..."
              placeholderTextColor={theme.colors.textTertiary}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {filteredTeachers.map((t, idx) => (
            <TouchableOpacity
              key={t._id || idx}
              style={[styles.teacherCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}
              onPress={() => selectTeacher(t)}
            >
              <View style={[styles.tAvatar, { backgroundColor: theme.colors.primaryLight }]}>
                <Text style={[styles.tAvatarText, { color: theme.colors.primary }]}>
                  {t.name?.charAt(0)?.toUpperCase() || 'T'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tName, { color: theme.colors.text }]}>{t.name}</Text>
                <Text style={[styles.tMeta, { color: theme.colors.textTertiary }]}>
                  {t.employeeId} • {t.subjects?.join(', ') || 'No subjects'}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        /* Timetable Editor */
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
          ) : (
            DAYS.map(day => (
              <View key={day} style={{ marginBottom: 16 }}>
                <View style={[styles.dayHeader, { backgroundColor: theme.colors.primary }]}>
                  <MaterialCommunityIcons name="calendar-today" size={16} color="#FFF" />
                  <Text style={styles.dayTitle}>{day}</Text>
                </View>
                {(timetable[day] || []).map((p: any, idx: number) => (
                  <View key={idx} style={[styles.periodRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
                    <View style={[styles.periodNum, { backgroundColor: theme.colors.primaryLight }]}>
                      <Text style={[styles.periodNumText, { color: theme.colors.primary }]}>{p.period || idx + 1}</Text>
                    </View>
                    <TextInput
                      style={[styles.periodInput, { color: theme.colors.text, borderColor: theme.colors.borderLight }]}
                      placeholder="Subject"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={p.subject || ''}
                      onChangeText={v => updatePeriod(day, idx, 'subject', v)}
                    />
                    <TextInput
                      style={[styles.periodInput, { color: theme.colors.text, borderColor: theme.colors.borderLight, width: 70 }]}
                      placeholder="Class"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={p.class || p.standard || ''}
                      onChangeText={v => updatePeriod(day, idx, 'class', v)}
                    />
                  </View>
                ))}
              </View>
            ))
          )}

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary, opacity: saving ? 0.6 : 1 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#FFF" /> : (
              <>
                <MaterialCommunityIcons name="content-save" size={20} color="#FFF" />
                <Text style={styles.saveBtnText}>Save Timetable</Text>
              </>
            )}
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  saveHeaderBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveHeaderText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  content: { padding: 16 },
  banner: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 20, marginBottom: 20 },
  bannerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  bannerDesc: { color: '#FFFFFFB0', fontSize: 12, fontWeight: '500', marginTop: 2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 46, gap: 8, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', padding: 0 },
  teacherCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  tAvatar: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  tAvatarText: { fontSize: 16, fontWeight: '800' },
  tName: { fontSize: 15, fontWeight: '700' },
  tMeta: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  dayTitle: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  periodRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderTopWidth: 0, paddingHorizontal: 8, paddingVertical: 6, gap: 6 },
  periodNum: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  periodNumText: { fontSize: 13, fontWeight: '800' },
  periodInput: { flex: 1, borderBottomWidth: 1, paddingVertical: 4, fontSize: 13, fontWeight: '500' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, gap: 8, marginTop: 10 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default AdminTimetableScreen;
