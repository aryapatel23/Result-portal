import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  StatusBar, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';
import DatePickerInput from '../../components/DatePickerInput';

const AdminAttendanceScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [summary, setSummary] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const [summaryRes, allRes] = await Promise.all([
        apiService.getAdminTodaySummary().catch(() => null),
        apiService.getAdminAttendanceAll({ date: dateStr }).catch(() => null),
      ]);
      if (summaryRes) setSummary(summaryRes?.data || summaryRes);
      const list = allRes?.data || allRes?.attendance || allRes || [];
      setRecords(Array.isArray(list) ? list : []);
    } catch (e: any) {
      if (__DEV__) console.log('Attendance fetch err:', e.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statusColor: Record<string, string> = {
    present: '#10B981',
    absent: '#EF4444',
    late: '#F59E0B',
    'half-day': '#3B82F6',
  };

  const getStatusIcon = (s: string) => {
    const map: Record<string, string> = { present: 'check-circle', absent: 'close-circle', late: 'clock-alert', 'half-day': 'circle-half-full' };
    return map[s] || 'help-circle';
  };

  const summaryCards = summary ? [
    { label: 'Total', value: summary.total || summary.totalTeachers || 0, icon: 'account-group', color: '#6366F1' },
    { label: 'Present', value: summary.present || 0, icon: 'check-circle', color: '#10B981' },
    { label: 'Absent', value: summary.absent || 0, icon: 'close-circle', color: '#EF4444' },
    { label: 'Late', value: summary.late || 0, icon: 'clock-alert', color: '#F59E0B' },
  ] : [];

  if (isLoading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>Loading attendance...</Text>
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Teacher Attendance</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Picker */}
        <View style={styles.datePickerWrap}>
          <DatePickerInput
            value={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setIsLoading(true);
            }}
            mode="date"
            maximumDate={new Date()}
          />
        </View>

        {/* Summary */}
        {summaryCards.length > 0 && (
          <View style={styles.summaryGrid}>
            {summaryCards.map((sc, idx) => (
              <View key={idx} style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
                <View style={[styles.summaryIcon, { backgroundColor: sc.color + '20' }]}>
                  <MaterialCommunityIcons name={sc.icon} size={20} color={sc.color} />
                </View>
                <Text style={[styles.summaryVal, { color: theme.colors.text }]}>{sc.value}</Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.textTertiary }]}>{sc.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Records */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Attendance Records</Text>
        {records.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="clipboard-text-off-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>No records for this date</Text>
          </View>
        ) : (
          records.map((r, idx) => {
            const teacherName = r.teacher?.name || r.teacherName || 'Unknown';
            const status = r.status || 'absent';
            const sColor = statusColor[status] || '#999';

            return (
              <View key={r._id || idx} style={[styles.recCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
                <View style={[styles.statusStripe, { backgroundColor: sColor }]} />
                <View style={styles.recContent}>
                  <View style={styles.recTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.recName, { color: theme.colors.text }]}>{teacherName}</Text>
                      {r.teacher?.employeeId && (
                        <Text style={[styles.recMeta, { color: theme.colors.textTertiary }]}>ID: {r.teacher.employeeId}</Text>
                      )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: sColor + '20' }]}>
                      <MaterialCommunityIcons name={getStatusIcon(status)} size={14} color={sColor} />
                      <Text style={[styles.statusText, { color: sColor }]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
                    </View>
                  </View>
                  {/* Check-in/out times */}
                  {(r.checkInTime || r.checkOutTime) && (
                    <View style={[styles.timeRow, { borderTopColor: theme.colors.borderLight }]}>
                      {r.checkInTime && (
                        <View style={styles.timeItem}>
                          <MaterialCommunityIcons name="login" size={14} color={theme.colors.success} />
                          <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                            In: {new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      )}
                      {r.checkOutTime && (
                        <View style={styles.timeItem}>
                          <MaterialCommunityIcons name="logout" size={14} color={theme.colors.error} />
                          <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                            Out: {new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  {r.location?.address && (
                    <View style={[styles.locationRow, { borderTopColor: theme.colors.borderLight }]}>
                      <MaterialCommunityIcons name="map-marker" size={13} color={theme.colors.textTertiary} />
                      <Text style={[styles.locationText, { color: theme.colors.textTertiary }]} numberOfLines={1}>{r.location.address}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  content: { padding: 16 },
  datePickerWrap: { marginBottom: 16 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  summaryCard: { width: '47%' as any, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center' },
  summaryIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  summaryVal: { fontSize: 22, fontWeight: '900' },
  summaryLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  emptyWrap: { alignItems: 'center', paddingTop: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  recCard: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  statusStripe: { width: 4 },
  recContent: { flex: 1, padding: 12 },
  recTop: { flexDirection: 'row', alignItems: 'flex-start' },
  recName: { fontSize: 14, fontWeight: '700' },
  recMeta: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '700' },
  timeRow: { flexDirection: 'row', gap: 16, borderTopWidth: 1, paddingTop: 8, marginTop: 8 },
  timeItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 12, fontWeight: '500' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, borderTopWidth: 1, paddingTop: 8, marginTop: 8 },
  locationText: { fontSize: 11, fontWeight: '500', flex: 1 },
});

export default AdminAttendanceScreen;
