import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert,
  StatusBar, TextInput, StyleSheet, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';
import DatePickerInput from '../../components/DatePickerInput';

const HOLIDAY_TYPES = ['national', 'state', 'school', 'festival', 'other'];

const AdminHolidaysScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [holidays, setHolidays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'school', description: '', isRecurring: false });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchHolidays = useCallback(async () => {
    try {
      const res = await apiService.getAllHolidays();
      const list = res?.holidays || res?.data || res || [];
      setHolidays(Array.isArray(list) ? list : []);
    } catch (e: any) {
      if (__DEV__) console.log('Holidays err:', e.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchHolidays(); }, [fetchHolidays]);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', type: 'school', description: '', isRecurring: false });
    setSelectedDate(new Date());
    setShowModal(true);
  };

  const openEdit = (h: any) => {
    setEditItem(h);
    setForm({
      name: h.name || '',
      type: h.type || 'school', description: h.description || '',
      isRecurring: h.isRecurring || false,
    });
    setSelectedDate(h.date ? new Date(h.date) : new Date());
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { Alert.alert('Error', 'Please enter holiday name'); return; }
    setSaving(true);
    try {
      const data = { ...form, date: selectedDate.toISOString().split('T')[0] };
      if (editItem) {
        await apiService.updateHoliday(editItem._id, data);
      } else {
        await apiService.createHoliday(data);
      }
      setShowModal(false);
      fetchHolidays();
      Alert.alert('Success', `Holiday ${editItem ? 'updated' : 'created'} successfully`);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (h: any) => {
    Alert.alert('Delete Holiday', `Remove "${h.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await apiService.deleteHoliday(h._id); fetchHolidays(); } catch {} } },
    ]);
  };

  const typeColors: Record<string, string> = {
    national: '#EF4444', state: '#6366F1', school: '#0D9488', festival: '#F59E0B', other: '#64748B',
  };

  const typeIcons: Record<string, string> = {
    national: 'flag', state: 'map-marker', school: 'school', festival: 'party-popper', other: 'calendar-star',
  };

  const isUpcoming = (d: string) => new Date(d) >= new Date(new Date().toDateString());

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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Holidays</Text>
        <TouchableOpacity onPress={openAdd} style={[styles.addHBtn, { backgroundColor: theme.colors.primary }]}>
          <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
          <Text style={styles.addHText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHolidays(); }} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Upcoming */}
        {holidays.filter(h => isUpcoming(h.date)).length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Upcoming Holidays</Text>
            {holidays.filter(h => isUpcoming(h.date)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(h => renderHolidayCard(h))}
          </>
        )}

        {/* Past */}
        {holidays.filter(h => !isUpcoming(h.date)).length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Past Holidays</Text>
            {holidays.filter(h => !isUpcoming(h.date)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(h => renderHolidayCard(h, true))}
          </>
        )}

        {holidays.length === 0 && (
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={56} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>No Holidays Added</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textTertiary }]}>Tap "Add" to create one</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{editItem ? 'Edit Holiday' : 'Add Holiday'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.fLabel, { color: theme.colors.textSecondary }]}>Name *</Text>
              <TextInput
                style={[styles.fInput, { color: theme.colors.text, backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}
                placeholder="Holiday name"
                placeholderTextColor={theme.colors.textTertiary}
                value={form.name}
                onChangeText={v => setForm(p => ({ ...p, name: v }))}
              />

              <DatePickerInput
                label="Date"
                value={selectedDate}
                onChange={setSelectedDate}
                mode="date"
                required
              />

              <Text style={[styles.fLabel, { color: theme.colors.textSecondary }]}>Type</Text>
              <View style={styles.typesRow}>
                {HOLIDAY_TYPES.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, { backgroundColor: form.type === t ? (typeColors[t] || '#999') : theme.colors.card, borderColor: form.type === t ? typeColors[t] : theme.colors.borderLight }]}
                    onPress={() => setForm(p => ({ ...p, type: t }))}
                  >
                    <Text style={[styles.typeText, { color: form.type === t ? '#FFF' : theme.colors.text }]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.fLabel, { color: theme.colors.textSecondary }]}>Description</Text>
              <TextInput
                style={[styles.fInput, styles.fTextArea, { color: theme.colors.text, backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}
                placeholder="Description (optional)"
                placeholderTextColor={theme.colors.textTertiary}
                value={form.description}
                onChangeText={v => setForm(p => ({ ...p, description: v }))}
                multiline
              />

              <TouchableOpacity
                style={[styles.recurToggle, { backgroundColor: theme.colors.card }]}
                onPress={() => setForm(p => ({ ...p, isRecurring: !p.isRecurring }))}
              >
                <MaterialCommunityIcons
                  name={form.isRecurring ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={22}
                  color={form.isRecurring ? theme.colors.primary : theme.colors.textTertiary}
                />
                <Text style={[styles.recurText, { color: theme.colors.text }]}>Recurring yearly</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.colors.primary, opacity: saving ? 0.7 : 1 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#FFF" /> : (
                  <Text style={styles.saveBtnText}>{editItem ? 'Update Holiday' : 'Create Holiday'}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );

  function renderHolidayCard(h: any, past = false) {
    const d = new Date(h.date);
    const tColor = typeColors[h.type] || '#999';
    return (
      <View key={h._id} style={[styles.hCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight, opacity: past ? 0.6 : 1 }]}>
        <View style={[styles.hStripe, { backgroundColor: tColor }]} />
        <View style={styles.hCardContent}>
          <View style={styles.hCardTop}>
            <View style={[styles.hDateBox, { backgroundColor: tColor + '15' }]}>
              <Text style={[styles.hDay, { color: tColor }]}>{d.getDate()}</Text>
              <Text style={[styles.hMonth, { color: tColor }]}>{d.toLocaleString('default', { month: 'short' })}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.hName, { color: theme.colors.text }]}>{h.name}</Text>
              <View style={styles.hTagRow}>
                <View style={[styles.hTypeBadge, { backgroundColor: tColor + '20' }]}>
                  <MaterialCommunityIcons name={typeIcons[h.type] || 'calendar'} size={11} color={tColor} />
                  <Text style={[styles.hTypeText, { color: tColor }]}>{h.type}</Text>
                </View>
                {h.isRecurring && (
                  <View style={[styles.hTypeBadge, { backgroundColor: theme.colors.primaryLight }]}>
                    <MaterialCommunityIcons name="refresh" size={11} color={theme.colors.primary} />
                    <Text style={[styles.hTypeText, { color: theme.colors.primary }]}>Recurring</Text>
                  </View>
                )}
              </View>
              {h.description && <Text style={[styles.hDesc, { color: theme.colors.textTertiary }]} numberOfLines={2}>{h.description}</Text>}
            </View>
          </View>
          <View style={[styles.hActions, { borderTopColor: theme.colors.borderLight }]}>
            <TouchableOpacity style={[styles.hActBtn, { backgroundColor: theme.colors.primaryLight }]} onPress={() => openEdit(h)}>
              <MaterialCommunityIcons name="pencil" size={14} color={theme.colors.primary} />
              <Text style={[styles.hActText, { color: theme.colors.primary }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.hActBtn, { backgroundColor: theme.colors.errorLight }]} onPress={() => handleDelete(h)}>
              <MaterialCommunityIcons name="delete" size={14} color={theme.colors.error} />
              <Text style={[styles.hActText, { color: theme.colors.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  addHBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, gap: 4 },
  addHText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  content: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 4 },
  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptyDesc: { fontSize: 13, marginTop: 4 },
  hCard: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  hStripe: { width: 4 },
  hCardContent: { flex: 1 },
  hCardTop: { flexDirection: 'row', padding: 12 },
  hDateBox: { width: 50, height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  hDay: { fontSize: 20, fontWeight: '900' },
  hMonth: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  hName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  hTagRow: { flexDirection: 'row', gap: 6 },
  hTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  hTypeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  hDesc: { fontSize: 12, marginTop: 4 },
  hActions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, padding: 10 },
  hActBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 10, gap: 4 },
  hActText: { fontSize: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: '#00000060', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  fLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  fInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 46, fontSize: 14, fontWeight: '500' },
  fTextArea: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  typesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1 },
  typeText: { fontSize: 12, fontWeight: '600' },
  recurToggle: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, marginTop: 12 },
  recurText: { fontSize: 14, fontWeight: '600' },
  saveBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 16, marginBottom: 20 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default AdminHolidaysScreen;
