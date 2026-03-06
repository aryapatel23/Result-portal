/**
 * Teacher Dashboard Screen
 * 
 * Professional dashboard for teachers - Modern & Clean Design
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
    StatusBar,
    Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Period {
  _id: string;
  timeSlot: string;
  subject: string;
  class: string;
  room?: string;
  startTime?: string;
  endTime?: string;
}

interface TodayClass {
  periodNumber: number;
  subject: string;
  timeSlot: string;
  class: string;
  room?: string;
  completed: boolean;
  isLive: boolean;
}

interface TeacherStats {
  totalStudents: number;
  totalClasses: number;
  todayClasses: number;
  attendanceRate: number;
}

interface RecentUpload {
  _id: string;
  studentName: string;
  grNumber: string;
  standard: string;
  percentage?: number;
  totalMarks?: number;
  obtainedMarks?: number;
  createdAt: string;
}

const TeacherDashboard: React.FC = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
    const [stats, setStats] = useState<TeacherStats>({
      totalStudents: 0,
      totalClasses: 0,
      todayClasses: 0,
      attendanceRate: 0,
    });
    const [selectedTab, setSelectedTab] = useState<'today' | 'week'>('today');
    const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
    const [attendanceStatus, setAttendanceStatus] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        loadDashboardData();
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    // Helper function to calculate time until 8 PM
    const getTimeUntil8PM = () => {
        const now = new Date();
        const target = new Date();
        target.setHours(20, 0, 0, 0); // 8 PM

        if (now >= target) {
            return { hours: 0, minutes: 0, isPast: true };
        }

        const diffMs = target.getTime() - now.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return { hours, minutes, isPast: false };
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getCurrentDay = () => {
        return DAYS[new Date().getDay()];
    };

    const isClassCompleted = (timeSlot: string) => {
        try {
            const endTime = timeSlot.split('-')[1]?.trim();
            if (!endTime) return false;
            
            const [hours, minutes] = endTime.split(':').map(Number);
            const classEndTime = new Date();
            classEndTime.setHours(hours, minutes, 0);
            
            return new Date() > classEndTime;
        } catch {
            return false;
        }
    };

    const isClassLive = (timeSlot: string) => {
        try {
            const times = timeSlot.split('-').map(t => t.trim());
            if (times.length !== 2) return false;
            
            const [startHours, startMinutes] = times[0].split(':').map(Number);
            const [endHours, endMinutes] = times[1].split(':').map(Number);
            
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const startTimeMinutes = startHours * 60 + startMinutes;
            const endTimeMinutes = endHours * 60 + endMinutes;
            
            return currentMinutes >= startTimeMinutes && currentMinutes < endTimeMinutes;
        } catch {
            return false;
        }
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load timetable
            const timetableRes = await apiClient.get(API_ENDPOINTS.TIMETABLE.TEACHER);
            
            if (timetableRes.data && timetableRes.data.timetable) {
                const currentDay = getCurrentDay();
                const schedule = timetableRes.data.timetable.schedule;
                const daySchedule = schedule[currentDay] || [];
                
                const classes: TodayClass[] = daySchedule.map((period: Period, index: number) => ({
                    periodNumber: index + 1,
                    subject: period.subject,
                    timeSlot: period.timeSlot,
                    class: period.class,
                    room: period.room || 'Main Hall',
                    completed: isClassCompleted(period.timeSlot),
                    isLive: isClassLive(period.timeSlot),
                }));
                
                setTodayClasses(classes);

                // Calculate stats
                const completedCount = classes.filter(c => c.completed).length;
                const totalClassesCount = Object.values(schedule).reduce((sum: number, day: any) => sum + (day?.length || 0), 0);
                
                setStats({
                    totalStudents: 150, // Can be fetched from API
                    totalClasses: totalClassesCount,
                    todayClasses: classes.length,
                    attendanceRate: 94,
                });
            }

            // Load teacher dashboard data
            try {
                const dashboardRes = await apiClient.get(API_ENDPOINTS.TEACHER.DASHBOARD);
                if (dashboardRes.data?.statistics) {
                    setStats(prev => ({
                        ...prev,
                        totalStudents: dashboardRes.data.statistics.totalStudents || prev.totalStudents,
                        totalClasses: dashboardRes.data.statistics.classesTaught || prev.totalClasses,
                    }));
                }
                // Load recent uploads
                if (dashboardRes.data?.recentResults) {
                    setRecentUploads(dashboardRes.data.recentResults.slice(0, 5));
                }
            } catch (error) {
                console.log('Dashboard API not available, using defaults');
            }

            // Load attendance status
            try {
                const attendanceRes = await apiClient.get(`${API_ENDPOINTS.TEACHER.ATTENDANCE}/today`);
                setAttendanceStatus(attendanceRes.data.attendance);
            } catch (error) {
                console.log('Attendance status not available');
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
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading...</Text>
            </View>
        );
    }

    const completedCount = todayClasses.filter(c => c.completed).length;
    const liveClass = todayClasses.find(c => c.isLive);

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
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                
                {/* Header with Greeting */}
                <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
                    <View style={styles.greetingContainer}>
                        <View style={styles.avatarContainer}>
                            <View style={[styles.avatar, { 
                                backgroundColor: theme.colors.primary,
                                shadowColor: theme.colors.primary,
                                shadowOffset: { width: 0, height: 3 },
                                shadowOpacity: 0.3,
                                shadowRadius: 6,
                                elevation: 4,
                            }]}>
                                <Text style={styles.avatarText}>
                                    {user?.name?.charAt(0).toUpperCase() || 'T'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.greetingTextContainer}>
                            <Text style={[styles.greetingText, { color: theme.colors.textSecondary }]}>
                                {getGreeting()}
                            </Text>
                            <Text style={[styles.userName, { color: theme.colors.text }]} numberOfLines={1}>
                                {user?.name || 'Teacher'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={[styles.notificationButton, { 
                            backgroundColor: theme.colors.surface,
                            borderWidth: 1,
                            borderColor: theme.isDark ? theme.colors.border : 'transparent'
                        }]}
                        onPress={() => {}}>
                        <Icon name="notifications-outline" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Attendance Warning Banner */}
                {!attendanceStatus && (() => {
                    const timeUntil = getTimeUntil8PM();
                    if (!timeUntil.isPast) {
                        return (
                            <TouchableOpacity 
                                style={[styles.attendanceWarningBanner, { 
                                    backgroundColor: theme.isDark ? '#422006' : '#fef3c7',
                                    borderLeftColor: '#f59e0b'
                                }]}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('TeacherAttendance')}>
                                <View style={styles.warningIconBg}>
                                    <Icon name="time-outline" size={24} color="#f59e0b" />
                                </View>
                                <View style={styles.warningTextContainer}>
                                    <Text style={[styles.warningTitle, { color: theme.isDark ? '#fbbf24' : '#92400e' }]}>
                                        Mark Attendance Today
                                    </Text>
                                    <Text style={[styles.warningSubtitle, { color: theme.isDark ? '#fcd34d' : '#b45309' }]}>
                                        {timeUntil.hours > 0 
                                            ? `${timeUntil.hours}h ${timeUntil.minutes}m left`
                                            : `${timeUntil.minutes} min left`} • Auto-marked as Leave after 8 PM
                                    </Text>
                                </View>
                                <Icon name="chevron-forward" size={20} color={theme.isDark ? '#fbbf24' : '#f59e0b'} />
                            </TouchableOpacity>
                        );
                    }
                })()}

                {/* Classes Today Card */}
                <View style={[styles.classesTodayCard, { 
                    backgroundColor: theme.isDark ? theme.colors.card : '#f0fdf4',
                    borderLeftWidth: 4,
                    borderLeftColor: theme.colors.primary
                }]}>
                    <View style={[styles.classIconContainer, { 
                        backgroundColor: theme.isDark ? theme.colors.primary : '#10b981'
                    }]}>
                        <Icon name="book-outline" size={32} color="#fff" />
                    </View>
                    <View style={styles.classesTextContainer}>
                        <Text style={[styles.classesTitle, { color: theme.colors.text }]}>
                            You've got {todayClasses.length} {todayClasses.length === 1 ? 'class' : 'classes'} today
                        </Text>
                        <Text style={[styles.classesSubtitle, { color: theme.colors.textSecondary }]}>
                            {liveClass ? '🔴 Class in session' : completedCount > 0 ? `${completedCount} completed` : 'Ready to teach!'}
                        </Text>
                    </View>
                    <View style={styles.progressIndicators}>
                        {todayClasses.slice(0, 6).map((cls, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.progressDot,
                                    cls.completed
                                        ? { backgroundColor: theme.colors.success }
                                        : cls.isLive
                                        ? { backgroundColor: theme.colors.error }
                                        : { backgroundColor: theme.colors.textTertiary, opacity: 0.3 }
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                    <View style={[styles.statBox, { 
                        backgroundColor: theme.isDark ? theme.colors.card : '#fef3c7',
                        borderLeftWidth: 3,
                        borderLeftColor: '#f59e0b'
                    }]}>
                        <Icon name="people-outline" size={20} color="#f59e0b" style={{ marginBottom: 8 }} />
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.totalStudents}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Students</Text>
                    </View>
                    <View style={[styles.statBox, { 
                        backgroundColor: theme.isDark ? theme.colors.card : '#e0e7ff',
                        borderLeftWidth: 3,
                        borderLeftColor: '#6366f1'
                    }]}>
                        <Icon name="book-outline" size={20} color="#6366f1" style={{ marginBottom: 8 }} />
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.totalClasses}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Classes</Text>
                    </View>
                    <View style={[styles.statBox, { 
                        backgroundColor: theme.isDark ? theme.colors.card : '#fce7f3',
                        borderLeftWidth: 3,
                        borderLeftColor: '#ec4899'
                    }]}>
                        <Icon name="checkmark-circle-outline" size={20} color="#ec4899" style={{ marginBottom: 8 }} />
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.attendanceRate}%</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Attendance</Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={[styles.tabsContainer, { backgroundColor: theme.colors.surface }]}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            selectedTab === 'today' && {
                                backgroundColor: theme.colors.primary,
                                shadowColor: theme.colors.primary,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 3,
                            }
                        ]}
                        onPress={() => setSelectedTab('today')}>
                        <Text
                            style={[
                                styles.tabText,
                                selectedTab === 'today'
                                    ? { color: '#fff', fontWeight: '700' }
                                    : { color: theme.colors.textSecondary }
                            ]}>
                            Today's Classes
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            selectedTab === 'week' && {
                                backgroundColor: theme.colors.primary,
                                shadowColor: theme.colors.primary,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 3,
                            }
                        ]}
                        onPress={() => setSelectedTab('week')}>
                        <Text
                            style={[
                                styles.tabText,
                                selectedTab === 'week'
                                    ? { color: '#fff', fontWeight: '700' }
                                    : { color: theme.colors.textSecondary }
                            ]}>
                            Full Week
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Class Cards */}
                {selectedTab === 'today' && (
                    <View style={styles.classCardsContainer}>
                        {todayClasses.length > 0 ? (
                            todayClasses.map((cls, index) => (
                                <View
                                    key={index}
                                    style={[{
                                        padding: 16,
                                        borderRadius: 16,
                                        marginBottom: 16,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 3 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: 4,
                                        backgroundColor: cls.isLive 
                                            ? (theme.isDark ? theme.colors.primary : '#10b981')
                                            : theme.colors.card,
                                        borderWidth: cls.isLive ? 0 : 1,
                                        borderColor: theme.isDark ? theme.colors.border : '#f3f4f6',
                                    }]}>
                                    <View style={styles.classCardHeader}>
                                        <View style={[styles.classTimeIcon, { 
                                            backgroundColor: cls.isLive 
                                                ? 'rgba(255,255,255,0.25)' 
                                                : (theme.isDark ? theme.colors.surface : theme.colors.primary + '15')
                                        }]}>
                                            <Icon 
                                                name="time-outline" 
                                                size={24} 
                                                color={cls.isLive ? '#fff' : theme.colors.primary} 
                                            />
                                        </View>
                                        <View style={styles.classCardTitleContainer}>
                                            <Text style={[styles.classCardTitle, { 
                                                color: cls.isLive ? '#fff' : theme.colors.text 
                                            }]}>
                                                Period {cls.periodNumber} • {cls.room}
                                            </Text>
                                            <Text style={[styles.classCardTime, { 
                                                color: cls.isLive ? 'rgba(255,255,255,0.9)' : theme.colors.textSecondary 
                                            }]}>
                                                {cls.timeSlot}
                                            </Text>
                                        </View>
                                        {cls.isLive && (
                                            <View style={styles.liveBadge}>
                                                <View style={styles.liveDot} />
                                                <Text style={styles.liveText}>LIVE</Text>
                                            </View>
                                        )}
                                        {cls.completed && !cls.isLive && (
                                            <View style={[styles.completedBadge, { backgroundColor: '#10b981' }]}>
                                                <Icon name="checkmark" size={16} color="#fff" />
                                            </View>
                                        )}
                                    </View>
                                    
                                    <View style={styles.classCardContent}>
                                        <View style={[
                                            styles.subjectBadge, 
                                            { backgroundColor: cls.isLive 
                                                ? 'rgba(255,255,255,0.25)' 
                                                : (theme.isDark ? theme.colors.surface : '#f3f4f6') 
                                            }
                                        ]}>
                                            <Icon 
                                                name="book" 
                                                size={16} 
                                                color={cls.isLive ? '#fff' : (theme.isDark ? '#10b981' : theme.colors.primary)} 
                                            />
                                            <Text style={[
                                                styles.subjectText, 
                                                { color: cls.isLive ? '#fff' : (theme.isDark ? '#10b981' : theme.colors.primary) }
                                            ]}>
                                                {cls.subject}
                                            </Text>
                                        </View>
                                        <View style={[
                                            styles.classBadge, 
                                            { backgroundColor: cls.isLive 
                                                ? 'rgba(255,255,255,0.25)' 
                                                : (theme.isDark ? theme.colors.surface : '#f3f4f6') 
                                            }
                                        ]}>
                                            <Icon 
                                                name="people" 
                                                size={16} 
                                                color={cls.isLive ? '#fff' : theme.colors.textSecondary} 
                                            />
                                            <Text style={[
                                                styles.classText, 
                                                { color: cls.isLive ? '#fff' : theme.colors.textSecondary }
                                            ]}>
                                                {cls.class}
                                            </Text>
                                        </View>
                                    </View>

                                    {cls.isLive && (
                                        <TouchableOpacity
                                            style={styles.attendanceButton}
                                            onPress={() => navigation.navigate('Attendance')}>
                                            <Icon name="clipboard-outline" size={16} color="#fff" />
                                            <Text style={styles.attendanceButtonText}>Mark Attendance</Text>
                                            <Icon name="chevron-forward" size={16} color="#fff" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Icon name="calendar-outline" size={64} color={theme.colors.textTertiary} />
                                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                    No classes scheduled for today
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {selectedTab === 'week' && (
                    <View style={styles.weekContainer}>
                        <TouchableOpacity
                            style={[styles.viewTimetableButton, { 
                                backgroundColor: theme.colors.card,
                                borderWidth: 1,
                                borderColor: theme.isDark ? theme.colors.border : '#e5e7eb'
                            }]}
                            onPress={() => navigation.navigate('Timetable')}>
                            <View style={[styles.timetableIconBg, { 
                                backgroundColor: theme.isDark ? '#6366f1' + '25' : '#e0e7ff'
                            }]}>
                                <Icon name="calendar" size={28} color="#6366f1" />
                            </View>
                            <View style={styles.timetableButtonContent}>
                                <Text style={[styles.timetableButtonTitle, { color: theme.colors.text }]}>
                                    View Full Timetable
                                </Text>
                                <Text style={[styles.timetableButtonSubtitle, { color: theme.colors.textSecondary }]}>
                                    Check your complete weekly schedule
                                </Text>
                            </View>
                            <Icon name="chevron-forward" size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Recent Uploads Section */}
                {recentUploads.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Uploads</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('MyResults')}>
                                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.uploadsContainer}>
                            {recentUploads.map((upload, index) => {
                                const percentage = upload.percentage || 
                                    (upload.obtainedMarks && upload.totalMarks 
                                        ? Math.round((upload.obtainedMarks / upload.totalMarks) * 100) 
                                        : null);
                                const performanceColor = percentage !== null
                                    ? (percentage >= 75 ? '#10b981' : 
                                       percentage >= 50 ? '#f59e0b' : '#ef4444')
                                    : '#6b7280';
                                
                                return (
                                    <TouchableOpacity
                                        key={upload._id || index}
                                        style={[styles.uploadCard, { backgroundColor: theme.colors.card }]}
                                        activeOpacity={0.7}>
                                        <View style={styles.uploadCardLeft}>
                                            <View style={[
                                                styles.uploadAvatar,
                                                { backgroundColor: theme.isDark ? theme.colors.surface : performanceColor + '15' }
                                            ]}>
                                                <Icon 
                                                    name="person" 
                                                    size={20} 
                                                    color={theme.isDark ? theme.colors.textSecondary : performanceColor} 
                                                />
                                            </View>
                                            <View style={styles.uploadInfo}>
                                                <Text style={[styles.uploadStudentName, { color: theme.colors.text }]} numberOfLines={1}>
                                                    {upload.studentName}
                                                </Text>
                                                <View style={styles.uploadMetaRow}>
                                                    <Text style={[styles.uploadMeta, { color: theme.colors.textSecondary }]}>
                                                        {upload.grNumber}
                                                    </Text>
                                                    <View style={[styles.uploadDot, { backgroundColor: theme.colors.textTertiary }]} />
                                                    <Text style={[styles.uploadMeta, { color: theme.colors.textSecondary }]}>
                                                        {upload.standard}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={styles.uploadCardRight}>
                                            {percentage !== null && (
                                                <View style={[
                                                    styles.percentageBadge,
                                                    { backgroundColor: theme.isDark ? performanceColor + '25' : performanceColor + '15' }
                                                ]}>
                                                    <Text style={[styles.percentageText, { color: performanceColor }]}>
                                                        {percentage}%
                                                    </Text>
                                                </View>
                                            )}
                                            <Text style={[styles.uploadDate, { color: theme.colors.textTertiary }]}>
                                                {new Date(upload.createdAt).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </>
                )}

                {/* Quick Actions */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
                </View>
                
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
                        onPress={() => navigation.navigate('Students')}>
                        <View style={[styles.actionIconBg, { backgroundColor: theme.isDark ? '#10b981' + '25' : '#10b981' + '20' }]}>
                            <Icon name="people" size={24} color="#10b981" />
                        </View>
                        <Text style={[styles.actionText, { color: theme.colors.text }]}>My Students</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
                        onPress={() => navigation.navigate('Attendance')}>
                        <View style={[styles.actionIconBg, { backgroundColor: theme.isDark ? '#f59e0b' + '25' : '#f59e0b' + '20' }]}>
                            <Icon name="checkmark-done" size={24} color="#f59e0b" />
                        </View>
                        <Text style={[styles.actionText, { color: theme.colors.text }]}>Attendance</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
                        onPress={() => navigation.navigate('AdminUploadResult')}>
                        <View style={[styles.actionIconBg, { backgroundColor: theme.isDark ? '#8b5cf6' + '25' : '#8b5cf6' + '20' }]}>
                            <Icon name="cloud-upload" size={24} color="#8b5cf6" />
                        </View>
                        <Text style={[styles.actionText, { color: theme.colors.text }]}>Upload Result</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
                        onPress={() => navigation.navigate('Timetable')}>
                        <View style={[styles.actionIconBg, { backgroundColor: theme.isDark ? '#ec4899' + '25' : '#ec4899' + '20' }]}>
                            <Icon name="calendar" size={24} color="#ec4899" />
                        </View>
                        <Text style={[styles.actionText, { color: theme.colors.text }]}>Timetable</Text>
                    </TouchableOpacity>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    greetingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    greetingTextContainer: {
        flex: 1,
    },
    greetingText: {
        fontSize: 14,
        marginBottom: 2,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Attendance Warning Banner
    attendanceWarningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    warningIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    warningTextContainer: {
        flex: 1,
    },
    warningTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    warningSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 16,
    },
    classesTodayCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    classIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    classesTextContainer: {
        flex: 1,
    },
    classesTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    classesSubtitle: {
        fontSize: 13,
    },
    progressIndicators: {
        flexDirection: 'row',
        gap: 6,
        marginLeft: 12,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 24,
        gap: 12,
    },
    statBox: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    tabsContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        padding: 4,
        gap: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    classCardsContainer: {
        paddingHorizontal: 20,
    },
    classCard: {
        padding: 16,
        borderRadius: 14,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    liveClassCard: {
        shadowColor: '#4ECDC4',
        shadowOpacity: 0.3,
        elevation: 6,
    },
    classCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    classTimeIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    classCardTitleContainer: {
        flex: 1,
    },
    classCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    classCardTime: {
        fontSize: 13,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ef4444',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        gap: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fff',
    },
    liveText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    completedBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    classCardContent: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    subjectBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    subjectText: {
        fontSize: 13,
        fontWeight: '600',
    },
    classBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    classText: {
        fontSize: 13,
    },
    attendanceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 12,
        marginTop: 4,
        gap: 8,
    },
    attendanceButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 15,
    },
    weekContainer: {
        paddingHorizontal: 20,
    },
    viewTimetableButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    timetableIconBg: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    timetableButtonContent: {
        flex: 1,
        marginLeft: 16,
    },
    timetableButtonTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    timetableButtonSubtitle: {
        fontSize: 13,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
    },
    uploadsContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
        gap: 12,
    },
    uploadCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    uploadCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    uploadAvatar: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    uploadInfo: {
        flex: 1,
    },
    uploadStudentName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    uploadMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    uploadMeta: {
        fontSize: 12,
        fontWeight: '500',
    },
    uploadDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
    },
    uploadCardRight: {
        alignItems: 'flex-end',
        gap: 6,
    },
    percentageBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    percentageText: {
        fontSize: 14,
        fontWeight: '700',
    },
    uploadDate: {
        fontSize: 11,
        fontWeight: '500',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 24,
    },
    actionButton: {
        width: '48%',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 2,
    },
    actionIconBg: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default TeacherDashboard;
