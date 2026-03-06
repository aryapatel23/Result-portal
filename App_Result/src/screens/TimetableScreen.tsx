/**
 * Timetable Screen
 * 
 * Professional weekly class timetable display
 * Displays schedule in a clean, organized format
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';



const { width } = Dimensions.get('window');

interface Period {
  periodNumber: number;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
  room?: string;
}

interface DaySchedule {
  day: string;
  periods: Period[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface BackendPeriod {
  _id: string;
  timeSlot: string;
  subject: string;
  class: string;
  room?: string;
  startTime?: string;
  endTime?: string;
  teacher?: string;
}

const TimetableScreen: React.FC = () => {
  const navigation = useNavigation();
  const [timetable, setTimetable] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!authLoading && user) {
      loadTimetable();
    }
  }, [authLoading, user]);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError("User profile not loaded");
        setLoading(false);
        return;
      }

      const endpoint = user.role === 'teacher'
        ? API_ENDPOINTS.TIMETABLE.TEACHER
        : API_ENDPOINTS.TIMETABLE.STUDENT;

      console.log('Fetching timetable from:', endpoint); // Debug log

      const res = await apiClient.get(endpoint);

      if (res.data && res.data.timetable) {
        const schedule = res.data.timetable.schedule;
        const formatted: DaySchedule[] = DAYS.map(day => ({
          day,
          periods: (schedule[day] || []).map((p: BackendPeriod, index: number) => ({
            periodNumber: index + 1,
            subject: p.subject,
            teacher: p.teacher || res.data.teacher?.name || 'Assigned Staff',
            startTime: p.startTime || (p.timeSlot ? p.timeSlot.split('-')[0].trim() : ''),
            endTime: p.endTime || (p.timeSlot ? p.timeSlot.split('-')[1]?.trim() : '') || '',
            room: p.class + (p.room ? ` • ${p.room}` : '')
          }))
        }));
        setTimetable(formatted);
      } else {
        setTimetable([]);
        if (!res.data.timetable) {
          // It might be empty but valid, or actually missing
          console.log("No timetable data found in response");
        }
      }
    } catch (err: any) {
      console.error('Error loading timetable:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load timetable';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTimetable();
    setRefreshing(false);
  };

  const getTimetableForDay = (day: string) => {
    return timetable.find(t => t.day === day);
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'Mathematics': '#ef4444',
      'Science': '#10b981',
      'English': '#3b82f6',
      'Hindi': '#f59e0b',
      'Social Science': '#8b5cf6',
      'Physical Education': '#06b6d4',
      'Computer Science': '#6366f1',
      'Art': '#ec4899',
      'Music': '#f97316',
      'Library': '#14b8a6',
    };

    // Return color or default
    for (const key in colors) {
      if (subject.includes(key)) {
        return colors[key];
      }
    }
    return '#6b7280';
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading timetable...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Icon name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Something went wrong</Text>
        <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} onPress={loadTimetable}>
          <Text style={[styles.retryButtonText, { color: '#fff' }]}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const selectedDaySchedule = getTimetableForDay(selectedDay);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.headerBackBtn, { backgroundColor: theme.colors.surface }]}>
              <Icon name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Icon name="calendar" size={24} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.text }]}>Class Timetable</Text>
          </View>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Weekly schedule for all classes
          </Text>
        </View>

        {/* Day Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.daySelector, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}
          contentContainerStyle={styles.daySelectorContent}>
          {DAYS.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                selectedDay === day && { 
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary 
                }
              ]}
              onPress={() => setSelectedDay(day)}>
              <Text style={[
                styles.dayButtonText,
                { color: theme.colors.textSecondary },
                selectedDay === day && { color: '#fff', fontWeight: '700' }
              ]}>
                {day.substring(0, 3)}
              </Text>
              <Text style={[
                styles.dayButtonFull,
                { color: theme.colors.textSecondary },
                selectedDay === day && { color: '#fff', fontWeight: '700' }
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Timetable Content */}
        <View style={styles.content}>
          {selectedDaySchedule && selectedDaySchedule.periods && selectedDaySchedule.periods.length > 0 ? (
            <>
              <View style={[styles.dayInfo, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.dayTitle, { color: theme.colors.text }]}>{selectedDay}</Text>
                <View style={[styles.periodCountBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Icon name="time-outline" size={16} color={theme.colors.primary} />
                  <Text style={[styles.periodCountText, { color: theme.colors.primary }]}>
                    {selectedDaySchedule.periods.length} Periods
                  </Text>
                </View>
              </View>

              {selectedDaySchedule.periods
                .sort((a, b) => a.periodNumber - b.periodNumber)
                .map((period, index) => {
                  const subjectColor = getSubjectColor(period.subject);

                  return (
                    <View key={index} style={[styles.periodCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                      <View style={[styles.periodMarker, { backgroundColor: subjectColor }]} />

                      <View style={styles.periodContent}>
                        <View style={styles.periodHeader}>
                          <View style={[styles.periodNumberBadge, { backgroundColor: `${subjectColor}20` }]}>
                            <Text style={[styles.periodNumberText, { color: subjectColor }]}>
                              P{period.periodNumber}
                            </Text>
                          </View>

                          <View style={styles.periodTime}>
                            <Icon name="time" size={16} color={theme.colors.textSecondary} />
                            <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                              {period.startTime} - {period.endTime}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.subjectName, { color: theme.colors.text }]}>{period.subject}</Text>

                        <View style={styles.periodDetails}>
                          <View style={styles.detailRow}>
                            <Icon name="person" size={16} color={theme.colors.textSecondary} />
                            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{period.teacher}</Text>
                          </View>
                          {period.room && (
                            <View style={styles.detailRow}>
                              <Icon name="location" size={16} color={theme.colors.textSecondary} />
                              <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{period.room}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="calendar-outline" size={64} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Classes Today</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Enjoy your day off or select another day from above
              </Text>
            </View>
          )}
        </View>

        {/* Legend */}
        <View style={[styles.legend, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.legendTitle, { color: theme.colors.text }]}>Subject Color Guide</Text>
          <View style={styles.legendGrid}>
            {[
              { name: 'Mathematics', color: '#ef4444' },
              { name: 'Science', color: '#10b981' },
              { name: 'English', color: '#3b82f6' },
              { name: 'Hindi', color: '#f59e0b' },
              { name: 'Social Science', color: '#8b5cf6' },
              { name: 'PE', color: '#06b6d4' },
              { name: 'Computer', color: '#6366f1' },
              { name: 'Arts', color: '#ec4899' },
            ].map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>{item.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerBackBtn: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  daySelector: {
    borderBottomWidth: 1,
  },
  daySelectorContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginHorizontal: 4,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
  },
  dayButtonText: {
    fontSize: 18,
    fontWeight: '600',
    display: width < 380 ? 'flex' : 'none',
  },
  dayButtonFull: {
    fontSize: 14,
    fontWeight: '600',
    display: width < 380 ? 'none' : 'flex',
  },
  content: {
    padding: 16,
  },
  dayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  periodCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  periodCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  periodCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
  },
  periodMarker: {
    width: 6,
  },
  periodContent: {
    flex: 1,
    padding: 16,
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodNumberBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  periodNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  periodTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  periodDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  legend: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '45%',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TimetableScreen;
