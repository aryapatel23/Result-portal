import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { TimetablePeriod, TimetableSchedule } from '../../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const DAY_COLORS = ['#0D9488', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981'];

const StudentTimetableScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<TimetableSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date().getDay();
    // Sunday=0, Monday=1, etc. Map to our 0-indexed DAYS array
    return today >= 1 && today <= 6 ? today - 1 : 0;
  });

  const fetchTimetable = async () => {
    try {
      const res = await apiService.getStudentTimetable();
      setSchedule(res?.timetable?.schedule || null);
    } catch (e: any) {
      console.log('Timetable error:', e.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTimetable(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchTimetable(); };

  const currentDayPeriods: TimetablePeriod[] = schedule
    ? (schedule as any)[DAYS[selectedDay]] || []
    : [];

  const hasTimetable = schedule && DAYS.some(day => ((schedule as any)[day] || []).length > 0);

  if (isLoading) {
    return (
      <View style={[s.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="loading" size={32} color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[s.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.colors.text }]}>Timetable</Text>
        <View style={s.spacer} />
      </View>

      {/* Day Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.dayRow}
      >
        {DAYS.map((day, idx) => {
          const isActive = selectedDay === idx;
          const dayPeriods = schedule ? ((schedule as any)[day] || []).length : 0;
          return (
            <TouchableOpacity
              key={day}
              style={[
                s.dayChip,
                { borderColor: theme.colors.border },
                isActive && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
              ]}
              onPress={() => setSelectedDay(idx)}
              activeOpacity={0.7}
            >
              <Text style={[
                s.dayText,
                { color: theme.colors.textSecondary },
                isActive && { color: '#FFFFFF' },
              ]}>
                {day.slice(0, 3)}
              </Text>
              {dayPeriods > 0 && (
                <View style={[s.dayDot, { backgroundColor: isActive ? '#fff' : theme.colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={s.flex}
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {!hasTimetable ? (
          <View style={[s.emptyCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <View style={[s.iconWrap, { backgroundColor: theme.colors.warningLight }]}>
              <MaterialCommunityIcons name="clock-outline" size={48} color={theme.colors.warning} />
            </View>
            <Text style={[s.emptyTitle, { color: theme.colors.text }]}>No Timetable Available</Text>
            <Text style={[s.emptySub, { color: theme.colors.textTertiary }]}>
              Your class timetable will appear here once it's set up by the admin.
            </Text>
          </View>
        ) : currentDayPeriods.length === 0 ? (
          <View style={[s.emptyCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <MaterialCommunityIcons name="beach" size={40} color={theme.colors.textTertiary} />
            <Text style={[s.emptyTitle, { color: theme.colors.text }]}>No Classes</Text>
            <Text style={[s.emptySub, { color: theme.colors.textTertiary }]}>
              No classes scheduled for {DAYS[selectedDay]}.
            </Text>
          </View>
        ) : (
          currentDayPeriods.map((period, idx) => (
            <View
              key={period._id || idx}
              style={[s.periodCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}
            >
              <View style={[s.periodAccent, { backgroundColor: DAY_COLORS[selectedDay % DAY_COLORS.length] }]} />
              <View style={s.periodContent}>
                <View style={s.periodTop}>
                  <Text style={[s.periodSubject, { color: theme.colors.text }]}>{period.subject}</Text>
                  <View style={[s.periodTimeBadge, { backgroundColor: theme.colors.primaryLight }]}>
                    <MaterialCommunityIcons name="clock-outline" size={12} color={theme.colors.primary} />
                    <Text style={[s.periodTimeText, { color: theme.colors.primary }]}>
                      {period.startTime && period.endTime
                        ? `${period.startTime} - ${period.endTime}`
                        : period.timeSlot}
                    </Text>
                  </View>
                </View>
                <View style={s.periodBottom}>
                  {period.teacher && (
                    <View style={s.periodMeta}>
                      <MaterialCommunityIcons name="account-outline" size={14} color={theme.colors.textTertiary} />
                      <Text style={[s.periodMetaText, { color: theme.colors.textTertiary }]}>{period.teacher}</Text>
                    </View>
                  )}
                  {period.room && (
                    <View style={s.periodMeta}>
                      <MaterialCommunityIcons name="map-marker-outline" size={14} color={theme.colors.textTertiary} />
                      <Text style={[s.periodMetaText, { color: theme.colors.textTertiary }]}>{period.room}</Text>
                    </View>
                  )}
                  <View style={s.periodMeta}>
                    <MaterialCommunityIcons name="school-outline" size={14} color={theme.colors.textTertiary} />
                    <Text style={[s.periodMetaText, { color: theme.colors.textTertiary }]}>{period.class}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Summary */}
        {hasTimetable && (
          <View style={[s.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.accent} />
            <Text style={[s.summaryText, { color: theme.colors.textSecondary }]}>
              {currentDayPeriods.length} class{currentDayPeriods.length !== 1 ? 'es' : ''} on {DAYS[selectedDay]}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { marginRight: 14 },
  headerTitle: { fontSize: 20, fontWeight: '800', flex: 1, letterSpacing: -0.3 },
  spacer: { width: 36 },

  dayRow: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  dayChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 52,
  },
  dayText: { fontSize: 13, fontWeight: '700' },
  dayDot: { width: 5, height: 5, borderRadius: 3, marginTop: 4 },

  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  iconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 20 },

  periodCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  periodAccent: { width: 4 },
  periodContent: { flex: 1, padding: 16 },
  periodTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  periodSubject: { fontSize: 16, fontWeight: '700', flex: 1 },
  periodTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  periodTimeText: { fontSize: 11, fontWeight: '600' },
  periodBottom: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  periodMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  periodMetaText: { fontSize: 12, fontWeight: '500' },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 6,
  },
  summaryText: { fontSize: 13, fontWeight: '500' },
});

export default StudentTimetableScreen;
