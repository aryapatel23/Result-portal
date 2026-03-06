/**
 * Admin Dashboard Screen
 * 
 * Professional management overview for administrators
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
    Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface DashboardData {
    overview: {
        totalStudents: number;
        totalTeachers: number;
        totalResults: number;
    };
    recentResults: any[];
    topTeachers: any[];
}

const AdminDashboard: React.FC = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [showAllActions, setShowAllActions] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD);
            if (response.data) {
                setData(response.data);
            }
        } catch (error: any) {
            console.error('Error fetching admin dashboard data:', error);
            const msg = error.response?.data?.message || 'Failed to connect to server';
            Alert.alert('Dashboard Error', msg);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading Dashboard...</Text>
            </View>
        );
    }

    const mainStats = [
        { label: 'Teachers', value: data?.overview.totalTeachers?.toString() || '0', icon: 'briefcase', color: '#8b5cf6' },
        { label: 'Students', value: data?.overview.totalStudents?.toString() || '0', icon: 'people', color: theme.colors.primary },
        { label: 'Results', value: data?.overview.totalResults?.toString() || '0', icon: 'document-text', color: '#3b82f6' },
        { label: 'Attendance', value: '94%', icon: 'stats-chart', color: '#10b981' },
    ];


    const adminActions = [
        { title: 'New Teacher', icon: 'person-add', color: '#8b5cf6', route: 'CreateTeacher' },
        { title: 'New Student', icon: 'person', color: '#10b981', route: 'CreateStudent' },
        { title: 'Upload Result', icon: 'cloud-upload', color: '#ef4444', route: 'AdminUploadResult' },
        { title: 'Timetables', icon: 'time', color: '#f59e0b', route: 'AdminTimetable' },
        { title: 'Attendance', icon: 'calendar', color: '#3b82f6', route: 'AdminAttendance' },
        { title: 'Holidays', icon: 'calendar-outline', color: '#ec4899', route: 'AdminHolidays' },
        { title: 'View Results', icon: 'document-text', color: '#6366f1', route: 'AdminResults' },
    ];

    const displayedActions = showAllActions ? adminActions : adminActions.slice(0, 4);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.adminTag, { color: '#8b5cf6' }]}>Super Admin</Text>
                        <Text style={[styles.userName, { color: theme.colors.text }]}>{user?.name?.split(' ')[0] || 'Administrator'}</Text>
                    </View>
                    <TouchableOpacity style={[styles.settingsButton, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate('Profile' as never)}>
                        <Icon name="settings-outline" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>

                {/* System Overview */}
                <View style={styles.overviewSection}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>System Overview</Text>
                    <View style={styles.statsGrid}>
                        {mainStats.map((stat, index) => (
                            <View key={index} style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                                    <Icon name={stat.icon} size={20} color={stat.color} />
                                </View>
                                <Text style={[styles.statValue, { color: theme.colors.text }]}>{stat.value}</Text>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Administrative Core */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Administrative Core</Text>
                </View>
                <View style={styles.actionsGrid}>
                    {displayedActions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.actionCard}
                            onPress={() => navigation.navigate(action.route as never)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.card, borderColor: theme.isDark ? theme.colors.border : `${action.color}20` }]}>
                                <View style={[styles.actionIconBg, { backgroundColor: `${action.color}10` }]}>
                                    <Icon name={action.icon} size={24} color={action.color} />
                                </View>
                                <Text style={[styles.actionTitle, { color: theme.colors.text }]}>{action.title}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {adminActions.length > 4 && (
                    <TouchableOpacity
                        style={styles.moreButton}
                        onPress={() => setShowAllActions(!showAllActions)}
                    >
                        <Text style={styles.moreButtonText}>{showAllActions ? 'Show Less' : 'More'}</Text>
                        <Icon
                            name={showAllActions ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color="#8b5cf6"
                        />
                    </TouchableOpacity>
                )}

                {/* Recent Performance Chart (Placeholder) */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Academic Performance</Text>
                </View>
                <View style={[styles.chartPlaceholder, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <View style={styles.chartBarContainer}>
                        {[65, 80, 45, 90, 70, 85].map((h, i) => (
                            <View key={i} style={[styles.chartBar, { height: h, backgroundColor: i % 2 === 0 ? theme.colors.primary : '#8b5cf6' }]} />
                        ))}
                    </View>
                    <View style={styles.chartLabels}>
                        <Text style={[styles.chartLabel, { color: theme.colors.textTertiary }]}>Term 1</Text>
                        <Text style={[styles.chartLabel, { color: theme.colors.textTertiary }]}>Mid</Text>
                        <Text style={[styles.chartLabel, { color: theme.colors.textTertiary }]}>Term 2</Text>
                        <Text style={[styles.chartLabel, { color: theme.colors.textTertiary }]}>Final</Text>
                    </View>
                </View>

                {/* Recent Activity Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Activity</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile' as never)}>
                        <Text style={styles.seeAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {data?.recentResults && data.recentResults.length > 0 ? (
                    <View style={styles.activityList}>
                        {data.recentResults.map((result: any, index: number) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.activityItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                                onPress={() => navigation.navigate('Results', { result })}
                            >
                                <View style={[styles.activityIcon, { backgroundColor: theme.isDark ? theme.colors.card : '#eff6ff' }]}>
                                    <Icon name="document-text" size={18} color="#3b82f6" />
                                </View>
                                <View style={styles.activityInfo}>
                                    <Text style={[styles.activityTitle, { color: theme.colors.text }]}>Result Uploaded: {result.studentName}</Text>
                                    <Text style={[styles.activitySubtitle, { color: theme.colors.textSecondary }]}>By {result.uploadedBy?.name || 'Teacher'} • {result.standard}</Text>
                                </View>
                                <Text style={[styles.activityTime, { color: theme.colors.textTertiary }]}>{new Date(result.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={[styles.emptyActivity, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                        <Icon name="information-circle-outline" size={24} color={theme.colors.textTertiary} />
                        <Text style={[styles.emptyActivityText, { color: theme.colors.textTertiary }]}>No recent activity found</Text>
                    </View>
                )}

                {/* Recent System Alerts */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>System Alerts</Text>
                    <View style={styles.alertBadge}>
                        <Text style={styles.alertBadgeText}>2 New</Text>
                    </View>
                </View>
                <View style={[styles.alertCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <View style={[styles.alertIcon, { backgroundColor: theme.isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2' }]}>
                        <Icon name="warning" size={20} color="#ef4444" />
                    </View>
                    <View style={styles.alertContent}>
                        <Text style={[styles.alertTitle, { color: theme.colors.text }]}>Database Backup Delayed</Text>
                        <Text style={[styles.alertTime, { color: theme.colors.textSecondary }]}>Scheduled: 02:00 AM</Text>
                    </View>
                    <Icon name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: 16,
    },
    adminTag: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    settingsButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overviewSection: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: (width - 52) / 2,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 30,
        marginBottom: 16,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 12,
    },
    actionCard: {
        width: (width - 52) / 2,
    },
    actionIconContainer: {
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    actionIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    actionTitle: {
        flex: 1,
        fontSize: 13,
        fontWeight: '700',
    },
    moreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingVertical: 8,
        gap: 4,
    },
    moreButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8b5cf6',
    },
    chartPlaceholder: {
        marginHorizontal: 20,
        borderRadius: 24,
        padding: 24,
        height: 200,
        justifyContent: 'flex-end',
        borderWidth: 1,
    },
    chartBarContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 120,
        paddingHorizontal: 10,
    },
    chartBar: {
        width: 20,
        borderRadius: 10,
    },
    chartLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    chartLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
    alertBadge: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    alertBadgeText: {
        fontSize: 10,
        color: '#EF4444',
        fontWeight: 'bold',
    },
    alertCard: {
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 30,
    },
    alertIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContent: {
        flex: 1,
        marginLeft: 15,
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    alertTime: {
        fontSize: 12,
        marginTop: 2,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: '500',
    },
    activityList: {
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 10,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    activityIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityInfo: {
        flex: 1,
        marginLeft: 12,
    },
    activityTitle: {
        fontSize: 13,
        fontWeight: '600',
    },
    activitySubtitle: {
        fontSize: 11,
        marginTop: 1,
    },
    activityTime: {
        fontSize: 11,
        fontWeight: '500',
    },
    seeAllText: {
        fontSize: 13,
        color: '#8b5cf6',
        fontWeight: '600',
    },
    emptyActivity: {
        marginHorizontal: 20,
        padding: 20,
        alignItems: 'center',
        borderRadius: 16,
        borderStyle: 'dashed',
        borderWidth: 1,
    },
    emptyActivityText: {
        marginTop: 8,
        fontSize: 13,
    },
});

export default AdminDashboard;
