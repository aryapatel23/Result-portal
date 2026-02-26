import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const DAY_COLORS = ['#0D9488', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981'];

const TeacherTimetableScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date().getDay();
    return today >= 1 && today <= 6 ? today - 1 : 0;
  });

  const fetchTimetable = async () => {
    try {
      const res = await apiService.getTeacherTimetable(user?._id || '');
      setTimetable(res?.timetable || null);
    } catch (e: any) {
      console.log('Timetable error:', e.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTimetable(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchTimetable(); };

  const currentDayPeriods = timetable?.schedule?.[DAYS[selectedDay]] || [];

  if (isLoading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>
          Loading timetable...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Timetable</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Day Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll} contentContainerStyle={styles.dayScrollContent}>
          {DAYS.map((day, idx) => {
            const hasClasses = (timetable?.schedule?.[day]?.length || 0) > 0;
            const isSelected = selectedDay === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dayBtn,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
                  },
                ]}
                onPress={() => setSelectedDay(idx)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    { color: isSelected ? '#FFF' : theme.colors.text },
                  ]}
                >
                  {day.slice(0, 3)}
                </Text>
                {hasClasses && (
                  <View style={[styles.dayDot, { backgroundColor: isSelected ? '#FFF' : DAY_COLORS[idx] }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected Day Header */}
        <View style={styles.selectedDayHeader}>
          <MaterialCommunityIcons name="calendar-today" size={20} color={theme.colors.primary} />
          <Text style={[styles.selectedDayText, { color: theme.colors.text }]}>
            {DAYS[selectedDay]}
          </Text>
        </View>

        {/* Periods List */}
        {currentDayPeriods.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.card }]}>
            <MaterialCommunityIcons name="calendar-remove" size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No Classes Scheduled
            </Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textTertiary }]}>
              You don't have any classes on {DAYS[selectedDay]}
            </Text>
          </View>
        ) : (
          <>
            {/* Summary */}
            <View style={[styles.summaryCard, { backgroundColor: `${theme.colors.primary}10`, borderColor: theme.colors.primary }]}>
              <MaterialCommunityIcons name="clock-check-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.summaryText, { color: theme.colors.primary }]}>
                {currentDayPeriods.length} {currentDayPeriods.length === 1 ? 'class' : 'classes'} scheduled
              </Text>
            </View>

            {/* Period Cards */}
            {currentDayPeriods.map((period: any, i: number) => (
              <View
                key={i}
                style={[
                  styles.periodCard,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
                ]}
              >
                <View style={[styles.periodAccent, { backgroundColor: DAY_COLORS[i % DAY_COLORS.length] }]} />
                <View style={styles.periodContent}>
                  <View style={styles.periodHeader}>
                    <View style={styles.periodLeft}>
                      <Text style={[styles.periodSubject, { color: theme.colors.text }]}>
                        {period.subject || 'Subject'}
                      </Text>
                      <View style={styles.periodTimeRow}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.textTertiary} />
                        <Text style={[styles.periodTime, { color: theme.colors.textSecondary }]}>
                          {period.startTime} - {period.endTime}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.periodDetails}>
                    {period.class && (
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="google-classroom" size={16} color={theme.colors.textTertiary} />
                        <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                          {period.class}
                        </Text>
                      </View>
                    )}
                    {period.room && (
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="door" size={16} color={theme.colors.textTertiary} />
                        <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                          Room {period.room}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', flex: 1, marginLeft: 12 },
  placeholder: { width: 32 },
  scrollContent: { paddingBottom: 20 },
  dayScroll: { marginTop: 16 },
  dayScrollContent: { paddingHorizontal: 16, gap: 10 },
  dayBtn: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 90,
  },
  dayLabel: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  dayDot: { width: 6, height: 6, borderRadius: 3 },
  selectedDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  selectedDayText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryText: { fontSize: 14, fontWeight: '500', marginLeft: 8 },
  periodCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  periodAccent: { width: 4 },
  periodContent: { flex: 1, padding: 16 },
  periodHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  periodLeft: { flex: 1 },
  periodSubject: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  periodTimeRow: { flexDirection: 'row', alignItems: 'center' },
  periodTime: { fontSize: 13, marginLeft: 6 },
  periodDetails: { gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 13, marginLeft: 8 },
  emptyCard: {
    marginHorizontal: 16,
    marginTop: 40,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center' },
});

export default TeacherTimetableScreen;
