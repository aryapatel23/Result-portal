import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const STATUS_OPTIONS = [
  { key: 'Present', icon: 'check-circle', color: '#10B981' },
  { key: 'Late', icon: 'clock-alert-outline', color: '#F59E0B' },
  { key: 'Half-Day', icon: 'circle-half-full', color: '#6366F1' },
  { key: 'Leave', icon: 'calendar-remove', color: '#EF4444' },
];

const TeacherAttendanceScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [isMarked, setIsMarked] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Present');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const [tab, setTab] = useState<'today' | 'history'>('today');

  const fetchData = useCallback(async () => {
    try {
      const [todayRes, historyRes] = await Promise.all([
        apiService.getTodayAttendance(),
        apiService.getAttendanceHistory(),
      ]);

      if (todayRes.marked) {
        setIsMarked(true);
        setTodayStatus(todayRes.attendance);
      }

      setHistory(historyRes.attendance || []);
      setStats(historyRes.stats || null);
    } catch (err: any) {
      console.log('Attendance error:', err.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs location access to mark attendance.',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch { return false; }
    }
    return true;
  };

  const getLocation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setLocationError('Location permission denied');
      return;
    }

    Geolocation.getCurrentPosition(
      (pos: any) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocationError('');
      },
      (err: any) => {
        setLocationError(err.message || 'Unable to get location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  useEffect(() => { getLocation(); }, [getLocation]);

  const handleMarkAttendance = async () => {
    if (selectedStatus !== 'Leave' && !location) {
      Alert.alert('Location Required', 'Please enable location services to mark attendance.');
      getLocation();
      return;
    }

    setIsMarking(true);
    try {
      const payload: any = { status: selectedStatus };
      if (selectedStatus !== 'Leave' && location) {
        payload.location = location;
      }

      const res = await apiService.markAttendance(payload);
      setIsMarked(true);
      setTodayStatus(res.attendance);
      Alert.alert('Success', res.message || 'Attendance marked successfully');
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setIsMarking(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); getLocation(); };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Present': return { color: '#10B981', bg: '#10B98115', icon: 'check-circle' };
      case 'Late': return { color: '#F59E0B', bg: '#F59E0B15', icon: 'clock-alert-outline' };
      case 'Half-Day': return { color: '#6366F1', bg: '#6366F115', icon: 'circle-half-full' };
      case 'Leave': return { color: '#EF4444', bg: '#EF444415', icon: 'calendar-remove' };
      case 'Absent': return { color: '#EF4444', bg: '#EF444415', icon: 'close-circle' };
      default: return { color: '#6B7280', bg: '#6B728015', icon: 'help-circle-outline' };
    }
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' }); }
    catch { return d; }
  };

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

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Attendance</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Stats Summary */}
      {stats && (
        <View style={styles.statsRow}>
          {[
            { label: 'Present', value: stats.present, color: '#10B981' },
            { label: 'Absent', value: stats.absent, color: '#EF4444' },
            { label: 'Leaves', value: `${stats.leaves}/${stats.yearlyLeaveLimit || 12}`, color: '#F59E0B' },
            { label: 'Rate', value: `${stats.percentage}%`, color: theme.colors.primary },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Tab Switcher */}
      <View style={[styles.tabRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
        {(['today', 'history'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && { backgroundColor: theme.colors.primary }]}
            onPress={() => setTab(t)}
          >
            <MaterialCommunityIcons
              name={t === 'today' ? 'calendar-today' : 'history'}
              size={16}
              color={tab === t ? '#FFF' : theme.colors.textSecondary}
            />
            <Text style={[styles.tabText, { color: tab === t ? '#FFF' : theme.colors.textSecondary }]}>
              {t === 'today' ? 'Today' : 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'today' ? (
          <>
            {isMarked && todayStatus ? (
              /* Already Marked */
              <View style={[styles.markedCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
                <View style={[styles.markedIconWrap, { backgroundColor: getStatusStyle(todayStatus.status).bg }]}>
                  <MaterialCommunityIcons
                    name={getStatusStyle(todayStatus.status).icon}
                    size={44}
                    color={getStatusStyle(todayStatus.status).color}
                  />
                </View>
                <Text style={[styles.markedTitle, { color: theme.colors.text }]}>Attendance Marked!</Text>
                <View style={[styles.statusChip, { backgroundColor: getStatusStyle(todayStatus.status).bg }]}>
                  <Text style={[styles.statusChipText, { color: getStatusStyle(todayStatus.status).color }]}>
                    {todayStatus.status}
                  </Text>
                </View>
                <View style={styles.markedDetails}>
                  {todayStatus.checkInTime && (
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.textTertiary} />
                      <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                        Checked in at {todayStatus.checkInTime}
                      </Text>
                    </View>
                  )}
                  {todayStatus.location?.address && (
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.textTertiary} />
                      <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                        {todayStatus.location.address}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              /* Mark Attendance Form */
              <View style={[styles.formCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
                <Text style={[styles.formTitle, { color: theme.colors.text }]}>Mark Today's Attendance</Text>
                <Text style={[styles.formDesc, { color: theme.colors.textTertiary }]}>
                  Select your status and confirm
                </Text>

                {/* Status Options */}
                <View style={styles.statusGrid}>
                  {STATUS_OPTIONS.map(opt => {
                    const isActive = selectedStatus === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        style={[
                          styles.statusOption,
                          { borderColor: isActive ? opt.color : theme.colors.borderLight, backgroundColor: isActive ? `${opt.color}10` : theme.colors.surface },
                        ]}
                        onPress={() => setSelectedStatus(opt.key)}
                      >
                        <MaterialCommunityIcons name={opt.icon} size={28} color={isActive ? opt.color : theme.colors.textTertiary} />
                        <Text style={[styles.statusOptionText, { color: isActive ? opt.color : theme.colors.textSecondary }]}>
                          {opt.key}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Location Status */}
                {selectedStatus !== 'Leave' && (
                  <View style={[styles.locationRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight }]}>
                    <MaterialCommunityIcons
                      name={location ? 'map-marker-check' : 'map-marker-off'}
                      size={20}
                      color={location ? '#10B981' : '#EF4444'}
                    />
                    <Text style={[styles.locationText, { color: location ? '#10B981' : '#EF4444' }]}>
                      {location
                        ? `Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                        : locationError || 'Fetching location...'
                      }
                    </Text>
                    {!location && (
                      <TouchableOpacity onPress={getLocation} style={styles.retryBtn}>
                        <MaterialCommunityIcons name="refresh" size={18} color={theme.colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Mark Button */}
                <TouchableOpacity
                  style={[styles.markBtn, { backgroundColor: theme.colors.primary, opacity: isMarking ? 0.7 : 1 }]}
                  onPress={handleMarkAttendance}
                  disabled={isMarking}
                >
                  {isMarking ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="check-bold" size={20} color="#FFF" />
                      <Text style={styles.markBtnText}>Mark Attendance</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          /* History Tab */
          <>
            {history.length === 0 ? (
              <View style={styles.emptyWrap}>
                <MaterialCommunityIcons name="calendar-blank-outline" size={56} color={theme.colors.textTertiary} />
                <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>No History</Text>
                <Text style={[styles.emptyDesc, { color: theme.colors.textTertiary }]}>
                  Your attendance records will appear here
                </Text>
              </View>
            ) : (
              history.map((record, idx) => {
                const st = getStatusStyle(record.status);
                return (
                  <View
                    key={record._id || idx}
                    style={[styles.historyCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}
                  >
                    <View style={[styles.historyIcon, { backgroundColor: st.bg }]}>
                      <MaterialCommunityIcons name={st.icon} size={20} color={st.color} />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={[styles.historyDate, { color: theme.colors.text }]}>{formatDate(record.date)}</Text>
                      <View style={styles.historyMeta}>
                        {record.checkInTime && (
                          <Text style={[styles.historyTime, { color: theme.colors.textTertiary }]}>
                            {record.checkInTime}
                          </Text>
                        )}
                        {record.remarks ? (
                          <Text style={[styles.historyRemarks, { color: theme.colors.textTertiary }]} numberOfLines={1}>
                            {record.remarks}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <View style={[styles.historyBadge, { backgroundColor: st.bg }]}>
                      <Text style={[styles.historyBadgeText, { color: st.color }]}>{record.status}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  statCard: {
    flex: 1, alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingVertical: 10,
  },
  statVal: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  tabRow: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 12, borderRadius: 12,
    borderWidth: 1, overflow: 'hidden',
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, gap: 6,
  },
  tabText: { fontSize: 14, fontWeight: '600' },
  content: { padding: 16 },
  /* Marked Card */
  markedCard: {
    borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center',
  },
  markedIconWrap: {
    width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  markedTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  statusChip: { paddingHorizontal: 20, paddingVertical: 6, borderRadius: 16, marginBottom: 16 },
  statusChipText: { fontSize: 14, fontWeight: '700' },
  markedDetails: { gap: 8, width: '100%' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13, fontWeight: '500' },
  /* Form */
  formCard: { borderRadius: 16, borderWidth: 1, padding: 20 },
  formTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  formDesc: { fontSize: 13, fontWeight: '500', marginBottom: 16 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statusOption: {
    flex: 1, minWidth: '45%', alignItems: 'center', paddingVertical: 16,
    borderRadius: 14, borderWidth: 1.5, gap: 6,
  },
  statusOptionText: { fontSize: 13, fontWeight: '600' },
  locationRow: {
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12,
    borderWidth: 1, marginBottom: 16, gap: 8,
  },
  locationText: { flex: 1, fontSize: 12, fontWeight: '500' },
  retryBtn: { padding: 4 },
  markBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 14, gap: 8,
  },
  markBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  /* Empty */
  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptyDesc: { fontSize: 13, fontWeight: '500', marginTop: 6 },
  /* History */
  historyCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12,
    borderWidth: 1, padding: 12, marginBottom: 8, gap: 12,
  },
  historyIcon: {
    width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center',
  },
  historyInfo: { flex: 1 },
  historyDate: { fontSize: 14, fontWeight: '600' },
  historyMeta: { flexDirection: 'row', gap: 8, marginTop: 2 },
  historyTime: { fontSize: 12, fontWeight: '500' },
  historyRemarks: { fontSize: 12, fontWeight: '500' },
  historyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  historyBadgeText: { fontSize: 11, fontWeight: '700' },
});

export default TeacherAttendanceScreen;
