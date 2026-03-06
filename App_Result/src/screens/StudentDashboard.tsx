/**
 * Student Dashboard Screen
 * 
 * Modern, engaging learning interface inspired by education apps
 * Features: Featured classes, timeline view, day selector, last lessons
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';

const { width } = Dimensions.get('window');

interface Period {
  _id: string;
  timeSlot: string;
  subject: string;
  class: string;
  room?: string;
  startTime?: string;
  endTime?: string;
}

interface ClassItem {
  id: string;
  periodNumber: number;
  subject: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
  room?: string;
  completed: boolean;
  isLive: boolean;
  isUpcoming: boolean;
}

interface LastLesson {
  subject: string;
  time: string;
  date: string;
  timeRange: string;
  icon: string;
  color: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SUBJECT_COLORS: { [key: string]: string } = {
  'Math': '#f59e0b',
  'Mathematics': '#f59e0b',
  'Physics': '#6366f1',
  'Chemistry': '#ec4899',
  'Biology': '#10b981',
  'History': '#ef4444',
  'Geography': '#14b8a6',
  'English': '#8b5cf6',
  'Hindi': '#f97316',
  'Computer': '#06b6d4',
  'Science': '#10b981',
};

const StudentDashboard: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [todayClasses, setTodayClasses] = useState<ClassItem[]>([]);
  const [nextClass, setNextClass] = useState<ClassItem | null>(null);
  const [lastLessons, setLastLessons] = useState<LastLesson[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [selectedDay]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCurrentDay = () => {
    return FULL_DAYS[selectedDay];
  };

  const getSubjectColor = (subject: string): string => {
    return SUBJECT_COLORS[subject] || '#6b7280';
  };

  const getSubjectIcon = (subject: string): string => {
    const iconMap: { [key: string]: string } = {
      'Math': 'calculator',
      'Mathematics': 'calculator',
      'Physics': 'flask',
      'Chemistry': 'beaker',
      'Biology': 'leaf',
      'History': 'book',
      'Geography': 'earth',
      'English': 'chatbubbles',
      'Hindi': 'language',
      'Computer': 'desktop',
      'Science': 'science',
    };
    return iconMap[subject] || 'book-outline';
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const isClassCompleted = (endTime: string): boolean => {
    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const endMinutes = parseTimeToMinutes(endTime);
      return currentMinutes > endMinutes;
    } catch {
      return false;
    }
  };

  const isClassLive = (startTime: string, endTime: string): boolean => {
    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = parseTimeToMinutes(startTime);
      const endMinutes = parseTimeToMinutes(endTime);
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } catch {
      return false;
    }
  };

  const isClassUpcoming = (startTime: string): boolean => {
    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = parseTimeToMinutes(startTime);
      const minutesUntil = startMinutes - currentMinutes;
      return minutesUntil > 0 && minutesUntil <= 120; // Next 2 hours
    } catch {
      return false;
    }
  };

  const getTimeUntilClass = (startTime: string): string => {
    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = parseTimeToMinutes(startTime);
      const minutesUntil = startMinutes - currentMinutes;
      
      if (minutesUntil <= 0) return 'Now';
      if (minutesUntil < 60) return `in ${minutesUntil} min`;
      
      const hours = Math.floor(minutesUntil / 60);
      const mins = minutesUntil % 60;
      return mins > 0 ? `in ${hours}h ${mins}m` : `in ${hours}h`;
    } catch {
      return '';
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(API_ENDPOINTS.TIMETABLE.STUDENT);
      
      if (res.data && res.data.timetable) {
        const currentDay = getCurrentDay();
        const schedule = res.data.timetable.schedule;
        const daySchedule = schedule[currentDay] || [];
        
        // Transform to ClassItem format
        const classes: ClassItem[] = daySchedule.map((period: Period, index: number) => {
          const [startTime, endTime] = period.timeSlot.split('-').map(t => t.trim());
          
          return {
            id: period._id || `${index}`,
            periodNumber: index + 1,
            subject: period.subject,
            timeSlot: period.timeSlot,
            startTime,
            endTime,
            room: period.room || period.class,
            completed: isClassCompleted(endTime),
            isLive: isClassLive(startTime, endTime),
            isUpcoming: isClassUpcoming(startTime),
          };
        });
        
        setTodayClasses(classes);
        
        // Find next upcoming class
        const upcoming = classes.find(c => !c.completed && !c.isLive);
        setNextClass(upcoming || null);
        
        // Generate last lessons (mock data - can be replaced with API call)
        const recentSubjects = classes.filter(c => c.completed).slice(0, 5);
        const lessons: LastLesson[] = recentSubjects.map(cls => ({
          subject: cls.subject,
          time: cls.startTime,
          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          timeRange: cls.timeSlot,
          icon: getSubjectIcon(cls.subject),
          color: getSubjectColor(cls.subject),
        }));
        setLastLessons(lessons);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading your classes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background} 
      />
      
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }>
        
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity style={styles.menuButton}>
            <Icon name="menu" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarHeaderContainer}>
            <View style={[styles.avatarHeader, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.avatarHeaderText}>
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Today Class</Text>

        {/* Featured Next Class Card */}
        {nextClass && (
          <TouchableOpacity 
            style={[styles.featuredCard, {
              backgroundColor: theme.isDark ? theme.colors.card : '#d4f4dd',
            }]}
            activeOpacity={0.9}>
            <View style={styles.featuredCardLeft}>
              <View style={styles.liveTag}>
                <Text style={styles.liveTagText}>
                  {nextClass.isUpcoming ? getTimeUntilClass(nextClass.startTime) : 'Live now'}
                </Text>
              </View>
              <Text style={[styles.featuredTitle, { color: theme.isDark ? theme.colors.text : '#1f2937' }]}>
                {nextClass.subject}
              </Text>
              <View style={styles.featuredMeta}>
                <Text style={[styles.featuredMetaText, { color: theme.isDark ? theme.colors.textSecondary : '#6b7280' }]}>
                  Period {nextClass.periodNumber} ({nextClass.timeSlot})
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={styles.progressBarFill} />
                <Text style={styles.progressText}>Step {nextClass.periodNumber}/{todayClasses.length}</Text>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <Icon name="play" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.featuredIllustration}>
              <View style={[styles.illustrationCircle, { backgroundColor: theme.isDark ? theme.colors.primary + '40' : '#86efac' }]}>
                <Icon name={getSubjectIcon(nextClass.subject)} size={48} color={theme.isDark ? theme.colors.primary : '#10b981'} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Class Schedule Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Class Schedule</Text>
          <View style={styles.sectionHeaderRight}>
            <Text style={[styles.sectionMonth, { color: theme.colors.textSecondary }]}>
              {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </Text>
            <Icon name="chevron-down" size={18} color={theme.colors.textSecondary} />
          </View>
        </View>

        {/* Day Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.daySelector}
          contentContainerStyle={styles.daySelectorContent}>
          {DAYS.map((day, index) => {
            const isSelected = index === selectedDay;
            const dayNumber = new Date();
            dayNumber.setDate(dayNumber.getDate() - dayNumber.getDay() + index);
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayItem,
                  isSelected && {
                    backgroundColor: theme.isDark ? theme.colors.text : '#1f2937',
                  }
                ]}
                onPress={() => setSelectedDay(index)}>
                <Text style={[
                  styles.dayName,
                  { color: isSelected ? (theme.isDark ? theme.colors.background : '#fff') : theme.colors.textSecondary }
                ]}>
                  {day}
                </Text>
                <Text style={[
                  styles.dayNumber,
                  { color: isSelected ? (theme.isDark ? theme.colors.background : '#fff') : theme.colors.text }
                ]}>
                  {dayNumber.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Timeline */}
        <View style={styles.timeline}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Timeline</Text>
            <TouchableOpacity>
              <Icon name="ellipsis-horizontal" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {todayClasses.length > 0 ? (
            todayClasses.map((cls, index) => (
              <View key={cls.id} style={styles.timelineItem}>
                <Text style={[styles.timelineTime, { color: theme.colors.textSecondary }]}>
                  {cls.startTime}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.timelineCard,
                    {
                      backgroundColor: cls.isLive 
                        ? (theme.isDark ? theme.colors.primary : getSubjectColor(cls.subject) + '30')
                        : theme.colors.card,
                      borderLeftWidth: 4,
                      borderLeftColor: getSubjectColor(cls.subject),
                    }
                  ]}
                  activeOpacity={0.7}>
                  <View style={styles.timelineCardLeft}>
                    <View style={[styles.timelineIcon, { backgroundColor: getSubjectColor(cls.subject) + '20' }]}>
                      <Icon name={getSubjectIcon(cls.subject)} size={18} color={getSubjectColor(cls.subject)} />
                    </View>
                    <View>
                      <Text style={[styles.timelineSubject, { 
                        color: cls.isLive ? (theme.isDark ? '#fff' : theme.colors.text) : theme.colors.text 
                      }]}>
                        {cls.subject}
                      </Text>
                      <Text style={[styles.timelineTime, { 
                        color: cls.isLive ? (theme.isDark ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary) : theme.colors.textSecondary,
                        fontSize: 12 
                      }]}>
                        {cls.timeSlot}
                      </Text>
                    </View>
                  </View>
                  <Icon 
                    name={cls.completed ? 'checkmark-circle' : 'chevron-forward'} 
                    size={22} 
                    color={cls.completed ? '#10b981' : theme.colors.textTertiary} 
                  />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyTimeline}>
              <Icon name="calendar-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No classes scheduled for {DAYS[selectedDay]}
              </Text>
            </View>
          )}
        </View>

        {/* Last Lessons Section */}
        {lastLessons.length > 0 && (
          <View style={styles.lastLessonsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Last Lessons</Text>
              <TouchableOpacity>
                <Icon name="ellipsis-horizontal" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {lastLessons.map((lesson, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.lessonCard, { backgroundColor: theme.colors.card }]}
                activeOpacity={0.7}>
                <View style={[styles.lessonIcon, { backgroundColor: lesson.color + '20' }]}>
                  <Icon name={lesson.icon} size={24} color={lesson.color} />
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonSubject, { color: theme.colors.text }]}>
                    {lesson.subject}
                  </Text>
                  <View style={styles.lessonMeta}>
                    <View style={styles.lessonMetaItem}>
                      <Icon name="calendar-outline" size={12} color={theme.colors.textSecondary} />
                      <Text style={[styles.lessonMetaText, { color: theme.colors.textSecondary }]}>
                        {lesson.date}
                      </Text>
                    </View>
                    <View style={styles.lessonMetaItem}>
                      <Icon name="time-outline" size={12} color={theme.colors.textSecondary} />
                      <Text style={[styles.lessonMetaText, { color: theme.colors.textSecondary }]}>
                        {lesson.timeRange}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.lessonAvatars}>
                  {[1, 2, 3].map((i) => (
                    <View 
                      key={i}
                      style={[
                        styles.miniAvatar, 
                        { 
                          backgroundColor: theme.colors.primary,
                          marginLeft: i > 1 ? -8 : 0,
                        }
                      ]}>
                      <Text style={styles.miniAvatarText}>S{i}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};
//             </TouchableOpacity>
//           </View>
//         )}

//       </ScrollView>
//     </SafeAreaView>
//   );
// };

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
    fontSize: 15,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  avatarHeaderContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarHeader: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarHeaderText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  // Featured Card
  featuredCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 200,
  },
  featuredCardLeft: {
    flex: 1,
    justifyContent: 'space-between',
  },
  liveTag: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  liveTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  featuredMeta: {
    marginBottom: 16,
  },
  featuredMetaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressBar: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  progressBarFill: {
    height: 4,
    width: '60%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  featuredIllustration: {
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionMonth: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Day Selector
  daySelector: {
    marginBottom: 20,
  },
  daySelectorContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  dayItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    minWidth: 54,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  // Timeline
  timeline: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  timelineItem: {
    marginBottom: 12,
  },
  timelineTime: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  timelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  timelineIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineSubject: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  emptyTimeline: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  // Last Lessons
  lastLessonsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonSubject: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  lessonMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonMetaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lessonAvatars: {
    flexDirection: 'row',
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  miniAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
});

export default StudentDashboard;
