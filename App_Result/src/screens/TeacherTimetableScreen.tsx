/**
 * Teacher Timetable Screen
 * 
 * Professional, high-fidelity weekly schedule for teachers.
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
    Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Period {
    _id: string;
    timeSlot: string;
    subject: string;
    class: string;
    room?: string;
}

const TeacherTimetableScreen: React.FC = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() - 1] || 'Monday');
    const [schedule, setSchedule] = useState<Record<string, Period[]>>({});

    const fetchTimetable = async () => {
        try {
            const res = await apiClient.get(API_ENDPOINTS.TIMETABLE.TEACHER);
            if (res.data && res.data.timetable) {
                setSchedule(res.data.timetable.schedule || {});
            }
        } catch (error) {
            console.error('Error fetching teacher timetable:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTimetable();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTimetable();
    };

    const getSubjectColor = (subject: string) => {
        const colors: Record<string, string> = {
            'Mathematics': '#3b82f6',
            'Science': '#10b981',
            'English': '#8b5cf6',
            'Gujarati': '#f59e0b',
            'History': '#ef4444',
            'Geography': '#06b6d4',
            'Computer': '#6366f1',
        };
        const sub = subject.trim();
        return colors[sub] || theme.colors.textTertiary;
    };

    const currentDaySchedule = schedule[selectedDay] || [];

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]} edges={['top']}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.surface} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Academic Schedule</Text>
                    <Text style={styles.headerSub} numberOfLines={1}>{user?.name} • Faculty</Text>
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                    <Icon name="calendar-outline" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.dayStrip}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayStripContent}>
                    {DAYS.map(day => {
                        const isActive = selectedDay === day;
                        return (
                            <TouchableOpacity
                                key={day}
                                style={[styles.dayChip, isActive && styles.dayChipActive]}
                                onPress={() => setSelectedDay(day)}
                            >
                                <Text style={[styles.dayText, isActive && styles.dayTextActive]}>
                                    {day.substring(0, 3)}
                                </Text>
                                {isActive && <View style={styles.activeDot} />}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.summaryCard}>
                    <View>
                        <Text style={styles.selectedDayFull}>{selectedDay}</Text>
                        <Text style={styles.sessionCount}>{currentDaySchedule.length} Sessions Scheduled</Text>
                    </View>
                    <View style={styles.progressCircle}>
                        <Icon name="time-outline" size={20} color={theme.colors.primary} />
                    </View>
                </View>

                {currentDaySchedule.length > 0 ? (
                    currentDaySchedule.map((period, idx) => {
                        const color = getSubjectColor(period.subject);
                        return (
                            <View key={idx} style={styles.periodRow}>
                                <View style={styles.timelineSection}>
                                    <Text style={styles.timeLabel}>{period.timeSlot.split('-')[0].trim()}</Text>
                                    <View style={[styles.timelineNode, { borderColor: color }]} />
                                    <View style={[styles.timelineLink, { backgroundColor: theme.colors.border }]} />
                                </View>

                                <View style={[styles.scheduleCard, { borderLeftColor: color }]}>
                                    <View style={styles.cardMain}>
                                        <View style={styles.cardInfo}>
                                            <Text style={styles.periodSubject}>{period.subject}</Text>
                                            <View style={styles.metaRow}>
                                                <View style={styles.metaLabel}>
                                                    <Icon name="people-outline" size={14} color={theme.colors.textTertiary} />
                                                    <Text style={styles.metaText}>{period.class}</Text>
                                                </View>
                                                <View style={styles.metaLabel}>
                                                    <Icon name="location-outline" size={14} color={theme.colors.textTertiary} />
                                                    <Text style={styles.metaText}>Room {period.room || 'TBD'}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            style={[styles.attendBtn, { backgroundColor: color + '10' }]}
                                            onPress={() => navigation.navigate('Attendance' as never)}
                                        >
                                            <Icon name="checkmark-done" size={20} color={color} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <Icon name="school-outline" size={40} color={theme.colors.disabled} />
                        </View>
                        <Text style={styles.emptyText}>No Classes Assigned</Text>
                        <Text style={styles.emptyHint}>Enjoy your free time or prepare for next session.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
    },
    headerSub: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
        marginTop: 2,
    },
    moreBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayStrip: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dayStripContent: {
        paddingHorizontal: 20,
        gap: 12,
    },
    dayChip: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    dayChipActive: {
        backgroundColor: '#4f46e5',
    },
    dayText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6B7280',
    },
    dayTextActive: {
        color: '#fff',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 8,
    },
    scrollContent: {
        padding: 20,
    },
    summaryCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 24,
        borderRadius: 24,
        marginBottom: 32,
    },
    selectedDayFull: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111827',
    },
    sessionCount: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
        marginTop: 4,
    },
    progressCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    periodRow: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    timelineSection: {
        width: 45,
        alignItems: 'center',
        paddingTop: 4,
    },
    timeLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#111827',
    },
    timelineNode: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 3,
        backgroundColor: '#fff',
        marginVertical: 12,
    },
    timelineLink: {
        width: 2,
        flex: 1,
        borderRadius: 1,
    },
    scheduleCard: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        marginLeft: 16,
        borderRadius: 20,
        borderLeftWidth: 4,
        padding: 16,
    },
    cardMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    periodSubject: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 12,
    },
    metaLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    attendBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },
    emptyHint: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
        lineHeight: 20,
    },
});

export default TeacherTimetableScreen;
