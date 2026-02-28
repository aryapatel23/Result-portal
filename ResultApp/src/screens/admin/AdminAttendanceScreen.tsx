import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  StatusBar, StyleSheet, ActivityIndicator, Modal,
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
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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

  const openDetailModal = (record: any) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return 'Not marked';
    return timeStr;
  };

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
    <>
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
              <TouchableOpacity key={r._id || idx} style={[styles.recCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]} onPress={() => openDetailModal(r)}>
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
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>

    {/* Detail Modal */}
    <Modal
      visible={showDetailModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowDetailModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalBox, { backgroundColor: theme.colors.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.borderLight }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Attendance Details</Text>
            <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.modalCloseBtn}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedRecord && (
              <View>
                {/* Teacher Info */}
                <View style={[styles.detailSection, { borderBottomColor: theme.colors.borderLight }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>Teacher</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {selectedRecord.teacher?.name || selectedRecord.teacherName || 'Unknown'}
                  </Text>
                  {selectedRecord.teacher?.employeeId && (
                    <Text style={[styles.detailSubValue, { color: theme.colors.textSecondary }]}>
                      ID: {selectedRecord.teacher.employeeId}
                    </Text>
                  )}
                </View>

                {/* Date & Day */}
                <View style={[styles.detailSection, { borderBottomColor: theme.colors.borderLight }]}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>Date</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      {formatDate(selectedRecord.date)}
                    </Text>
                    {selectedRecord.day && (
                      <Text style={[styles.detailSubValue, { color: theme.colors.textSecondary }]}>
                        Day {selectedRecord.day}
                      </Text>
                  )}
                </View>

                {/* Status */}
                <View style={[styles.detailSection, { borderBottomColor: theme.colors.borderLight }]}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>Status</Text>
                    <View style={[styles.statusBadgeLarge, { backgroundColor: (statusColor[selectedRecord.status] || '#999') + '20' }]}>
                      <MaterialCommunityIcons 
                        name={getStatusIcon(selectedRecord.status)} 
                        size={18} 
                        color={statusColor[selectedRecord.status] || '#999'} 
                      />
                      <Text style={[styles.statusTextLarge, { color: statusColor[selectedRecord.status] || '#999' }]}>
                        {(selectedRecord.status || 'absent').charAt(0).toUpperCase() + (selectedRecord.status || 'absent').slice(1)}
                      </Text>
                    </View>
                </View>

                {/* Check In Time */}
                {selectedRecord.checkInTime && (
                    <View style={[styles.detailSection, { borderBottomColor: theme.colors.borderLight }]}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>Check In</Text>
                      <View style={styles.detailTimeRow}>
                        <MaterialCommunityIcons name="login" size={18} color={theme.colors.success} />
                        <Text style={[styles.detailValue, { color: theme.colors.text, marginLeft: 8 }]}>
                          {formatTime(selectedRecord.checkInTime)}
                        </Text>
                      </View>
                    </View>
                )}

                {/* Check Out Time */}
                {selectedRecord.checkOutTime && (
                    <View style={[styles.detailSection, { borderBottomColor: theme.colors.borderLight }]}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>Check Out</Text>
                      <View style={styles.detailTimeRow}>
                        <MaterialCommunityIcons name="logout" size={18} color={theme.colors.error} />
                        <Text style={[styles.detailValue, { color: theme.colors.text, marginLeft: 8 }]}>
                          {formatTime(selectedRecord.checkOutTime)}
                        </Text>
                      </View>
                    </View>
                )}

                {/* Working Hours */}
                {selectedRecord.workingHours !== undefined && (
                    <View style={[styles.detailSection, { borderBottomColor: theme.colors.borderLight }]}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>Working Hours</Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                        {selectedRecord.workingHours.toFixed(2)} hours
                      </Text>
                    </View>
                )}

                {/* Location */}
                {selectedRecord.location && (
                    <View style={[styles.detailSection, { borderBottomColor: theme.colors.borderLight }]}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>Location</Text>
                      {selectedRecord.location.address && (
                        <View style={styles.detailLocationRow}>
                          <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.primary} />
                          <Text style={[styles.detailValue, { color: theme.colors.text, flex: 1, marginLeft: 8 }]}>
                            {selectedRecord.location.address}
                          </Text>
                        </View>
                      )}
                      {selectedRecord.location.coordinates && (
                        <Text style={[styles.detailSubValue, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                          Lat: {selectedRecord.location.coordinates[1]?.toFixed(6)}, 
                          Lng: {selectedRecord.location.coordinates[0]?.toFixed(6)}
                        </Text>
                      )}
                    </View>
                )}

                {/* Marked By */}
                {selectedRecord.markedBy && (
                    <View style={[styles.detailSection, { borderBottomColor: theme.colors.borderLight }]}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>Marked By</Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                        {selectedRecord.markedBy.charAt(0).toUpperCase() + selectedRecord.markedBy.slice(1)}
                      </Text>
                    </View>
                )}

                {/* Auto Marked Info */}
                {selectedRecord.autoMarked && (
                    <View style={[styles.detailSection, { borderBottomColor: theme.colors.borderLight }]}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>Auto-Marked</Text>
                      <View style={[styles.autoMarkedBadge, { backgroundColor: theme.colors.warning + '20' }]}>
                        <MaterialCommunityIcons name="robot" size={16} color={theme.colors.warning} />
                        <Text style={[styles.autoMarkedText, { color: theme.colors.warning }]}>
                          Automatically marked
                        </Text>
                      </View>
                      {selectedRecord.autoMarkedReason && (
                        <Text style={[styles.detailSubValue, { color: theme.colors.textSecondary, marginTop: 6 }]}>
                          Reason: {selectedRecord.autoMarkedReason}
                        </Text>
                      )}
                      {selectedRecord.autoMarkedAt && (
                        <Text style={[styles.detailSubValue, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                          At: {formatTime(selectedRecord.autoMarkedAt)}
                        </Text>
                      )}
                    </View>
                )}

                {/* Remarks */}
                {selectedRecord.remarks && (
                    <View style={[styles.detailSection, { borderBottomColor: 'transparent' }]}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>Remarks</Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                        {selectedRecord.remarks}
                      </Text>
                    </View>
                )}
              </View>
            )}
          </ScrollView>
          </View>
        </View>
      </Modal>
    </>
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
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  detailSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailSubValue: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  detailTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLocationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: '700',
  },
  autoMarkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  autoMarkedText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default AdminAttendanceScreen;
