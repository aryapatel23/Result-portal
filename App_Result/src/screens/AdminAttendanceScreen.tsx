import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StatusBar,
    RefreshControl,
    Dimensions,
    Modal,
    Image,
    Platform,
    Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface AttendanceRecord {
    _id: string;
    teacherId: string;
    teacherName: string;
    employeeId: string;
    status: 'Present' | 'Absent' | 'Half-Day' | 'Leave';
    date: string;
    markedBy: string;
    time?: string;
    location?: {
        address: string;
        latitude?: number;
        longitude?: number;
    };
    photoUrl?: string;
}

interface SummaryData {
    total: number;
    present: number;
    notMarked: number;
    halfDay: number;
    leave: number;
}

const AdminAttendanceScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [autoMarking, setAutoMarking] = useState(false);
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        statusBarSpacer: { height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: theme.colors.surface },

        // Navbar
        navBar: {
            height: 60,
            backgroundColor: theme.colors.surface,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border
        },
        navTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },

        // Header Content
        headerContainer: { backgroundColor: theme.colors.background },
        statsSection: { paddingHorizontal: 20, paddingBottom: 20 },
        hubSection: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 10 },
        sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 12 },
        actionsGrid: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 8,
        },
        actionCard: {
            flex: 1,
            alignItems: 'center',
            gap: 8,
        },
        actionIconContainer: {
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.card,
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        actionTitle: {
            fontSize: 10,
            fontWeight: '700',
            color: theme.colors.textSecondary,
            textAlign: 'center',
            textTransform: 'uppercase',
        },
        statsGrid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
        statCard: {
            flex: 1,
            minWidth: '45%',
            backgroundColor: theme.colors.card,
            padding: 16,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
        },
        statIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
        statValue: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
        statLabel: { fontSize: 11, fontWeight: '600', color: theme.colors.textSecondary, textTransform: 'uppercase' },

        // Filters
        filterSection: { paddingBottom: 16 },
        dateRow: { paddingHorizontal: 20, marginBottom: 16 },
        dateSelector: {
            flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card,
            paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
            borderWidth: 1, borderColor: theme.colors.border, gap: 10
        },
        dateText: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.colors.text },

        filterContent: { paddingHorizontal: 20, gap: 8 },
        filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
        filterChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
        filterChipText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
        filterChipTextActive: { color: theme.colors.surface },

        // List
        listContent: { paddingBottom: 100 },
        card: {
            backgroundColor: theme.colors.card,
            marginHorizontal: 20, marginBottom: 12,
            borderRadius: 16,
            padding: 16,
            shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 3, elevation: 2
        },
        cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
        userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.isDark ? theme.colors.primary + '20' : '#eff6ff', justifyContent: 'center', alignItems: 'center' },
        avatarText: { fontSize: 18, fontWeight: '700', color: theme.colors.primary },
        userName: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
        userId: { fontSize: 12, color: theme.colors.textSecondary },
        statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
        statusText: { fontSize: 11, fontWeight: '700' },

        cardFooter: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.background, alignItems: 'center', gap: 12 },
        footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        footerText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '500' },
        divider: { width: 1, height: 12, backgroundColor: theme.colors.border },

        // Loading & Empty
        loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
        emptyIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
        emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
        emptySub: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center' },

        // Modal
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
        modalContainer: { backgroundColor: theme.colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
        modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
        modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
        closeButton: { padding: 4 },

        detailProfile: { alignItems: 'center', marginBottom: 24 },
        largeAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.isDark ? theme.colors.primary + '20' : '#eff6ff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
        largeAvatarText: { fontSize: 32, fontWeight: '700', color: theme.colors.primary },
        detailName: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
        detailRole: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 12 },
        detailStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
        detailStatusText: { fontSize: 14, fontWeight: '700' },

        infoSection: { marginBottom: 24 },
        sectionHeader: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 12, letterSpacing: 0.5 },
        infoCard: { backgroundColor: theme.colors.background, borderRadius: 16, padding: 16 },
        infoRow: { flexDirection: 'row', alignItems: 'center' },
        separator: { height: 1, backgroundColor: theme.colors.border, marginVertical: 12 },
        infoLabel: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 },
        infoValue: { fontSize: 14, fontWeight: '600', color: theme.colors.text },

        photoContainer: { height: 200, borderRadius: 16, overflow: 'hidden', backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border },
        biometricPhoto: { width: '100%', height: '100%' },
        noPhotoBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        noPhotoText: { marginTop: 8, color: theme.colors.textSecondary, fontSize: 12 },

        dismissBtn: { backgroundColor: theme.colors.textSecondary, padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
        dismissBtnText: { color: theme.colors.surface, fontWeight: '700', fontSize: 16 }
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [summaryRes, attendanceRes] = await Promise.all([
                apiClient.get(API_ENDPOINTS.ADMIN.ATTENDANCE_SUMMARY),
                apiClient.get(API_ENDPOINTS.ADMIN.ATTENDANCE_ALL, {
                    params: { date: selectedDate, status: statusFilter || undefined }
                })
            ]);

            setSummary(summaryRes.data);
            setAttendance(attendanceRes.data.attendance || []);
            console.log('Attendance data loaded:', attendanceRes.data.attendance?.length || 0, 'records');
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            Alert.alert('Data Error', 'Failed to fetch attendance records. Please check your connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate, statusFilter]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const triggerAutoMarkLeaves = async () => {
        Alert.alert(
            'Auto-Mark Leaves',
            'This will automatically mark all teachers who have not submitted attendance today as "Leave". Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    style: 'destructive',
                    onPress: async () => {
                        setAutoMarking(true);
                        try {
                            const response = await apiClient.post(API_ENDPOINTS.ADMIN.ATTENDANCE_AUTO_MARK);
                            
                            Alert.alert(
                                'Success',
                                `Auto-marked ${response.data.markedCount} teacher(s) as Leave.\n\n` +
                                `Total Teachers: ${response.data.totalTeachers}\n` +
                                `Already Marked: ${response.data.skippedCount}`,
                                [{ text: 'OK', onPress: () => fetchData() }]
                            );
                        } catch (error: any) {
                            console.error('Auto-mark error:', error);
                            Alert.alert(
                                'Error',
                                error.response?.data?.message || 'Failed to auto-mark attendance. Please try again.'
                            );
                        } finally {
                            setAutoMarking(false);
                        }
                    }
                }
            ]
        );
    };

    const handleDateChange = (event: any, date?: Date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date.toISOString().split('T')[0]);
        }
    };

    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'Present': return { color: theme.colors.success, bg: '#dcfce7', icon: 'checkmark-circle' };
            case 'Absent': return { color: theme.colors.error, bg: '#fee2e2', icon: 'close-circle' };
            case 'Half-Day': return { color: theme.colors.warning, bg: '#fef3c7', icon: 'time' };
            case 'Leave': return { color: theme.colors.info, bg: '#dbeafe', icon: 'calendar' };
            default: return { color: theme.colors.textSecondary, bg: theme.colors.border, icon: 'help-circle' };
        }
    };

    const stats = [
        { label: 'Present', value: summary?.present || 0, color: theme.colors.success, icon: 'checkmark-circle' },
        { label: 'Absent', value: summary?.notMarked || 0, color: theme.colors.error, icon: 'close-circle' },
        { label: 'Half Day', value: summary?.halfDay || 0, color: theme.colors.warning, icon: 'partly-sunny' },
        { label: 'On Leave', value: summary?.leave || 0, color: theme.colors.info, icon: 'briefcase' },
    ];

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Stats Overview */}
            <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>Attendance Overview</Text>
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.statIconBox, { backgroundColor: `${stat.color}15` }]}>
                                <Icon name={stat.icon} size={22} color={stat.color} />
                            </View>
                            <View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filterSection}>
                <View style={styles.dateRow}>
                    <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
                        <Icon name="calendar" size={20} color={theme.colors.primary} />
                        <Text style={styles.dateText}>
                            {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Text>
                        <Icon name="chevron-down" size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                    {['', 'Present', 'Absent', 'Half-Day', 'Leave'].map((status) => {
                        const isActive = statusFilter === status;
                        const label = status || 'All Staff';
                        return (
                            <TouchableOpacity
                                key={status}
                                style={[styles.filterChip, isActive && styles.filterChipActive]}
                                onPress={() => setStatusFilter(status)}
                            >
                                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={new Date(selectedDate)}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}
        </View>
    );

    const renderItem = ({ item }: { item: AttendanceRecord }) => {
        const statusTheme = getStatusTheme(item.status);
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => setSelectedRecord(item)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{item.teacherName.charAt(0)}</Text>
                        </View>
                        <View>
                            <Text style={styles.userName}>{item.teacherName}</Text>
                            <Text style={styles.userId}>{item.employeeId}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusTheme.bg }]}>
                        <Text style={[styles.statusText, { color: statusTheme.color }]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                        <Icon name="time-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.footerText}>{item.time || '--:--'}</Text>
                    </View>
                    {item.location && (
                        <>
                            <View style={styles.divider} />
                            <View style={[styles.footerItem, { flex: 1 }]}>
                                <Icon name="location-outline" size={14} color={theme.colors.textSecondary} />
                                <Text style={styles.footerText} numberOfLines={1}>
                                    {item.location.address || 'Location Verified'}
                                </Text>
                            </View>
                        </>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.surface} translucent={Platform.OS === 'android'} />
            <View style={styles.statusBarSpacer} />

            {/* Header Title */}
            <View style={styles.navBar}>
                <Text style={styles.navTitle}>Daily Attendance</Text>
                <TouchableOpacity 
                    onPress={triggerAutoMarkLeaves} 
                    disabled={autoMarking}
                    style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        backgroundColor: theme.colors.error + '20', 
                        paddingHorizontal: 12, 
                        paddingVertical: 8, 
                        borderRadius: 8,
                        opacity: autoMarking ? 0.5 : 1
                    }}
                >
                    {autoMarking ? (
                        <ActivityIndicator size="small" color={theme.colors.error} />
                    ) : (
                        <>
                            <Icon name="calendar-outline" size={18} color={theme.colors.error} />
                            <Text style={{ color: theme.colors.error, fontWeight: '700', fontSize: 12, marginLeft: 6 }}>
                                Auto-Mark
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={attendance}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconBox}>
                                <Icon name="calendar-outline" size={32} color={theme.colors.textSecondary} />
                            </View>
                            <Text style={styles.emptyTitle}>No Attendance Records</Text>
                            <Text style={styles.emptySub}>No logs found for this date or filter.</Text>
                        </View>
                    }
                />
            )}

            {/* Detail Sheet Modal */}
            <Modal
                visible={!!selectedRecord}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedRecord(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Attendance Detail</Text>
                            <TouchableOpacity onPress={() => setSelectedRecord(null)} style={styles.closeButton}>
                                <Icon name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {selectedRecord && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Profile Section */}
                                <View style={styles.detailProfile}>
                                    <View style={styles.largeAvatar}>
                                        <Text style={styles.largeAvatarText}>{selectedRecord.teacherName.charAt(0)}</Text>
                                    </View>
                                    <Text style={styles.detailName}>{selectedRecord.teacherName}</Text>
                                    <Text style={styles.detailRole}>ID: {selectedRecord.employeeId}</Text>

                                    <View style={[styles.detailStatusBadge, { backgroundColor: getStatusTheme(selectedRecord.status).bg }]}>
                                        <Icon name={getStatusTheme(selectedRecord.status).icon} size={16} color={getStatusTheme(selectedRecord.status).color} />
                                        <Text style={[styles.detailStatusText, { color: getStatusTheme(selectedRecord.status).color }]}>
                                            {selectedRecord.status}
                                        </Text>
                                    </View>
                                </View>

                                {/* Info Cards */}
                                <View style={styles.infoSection}>
                                    <Text style={styles.sectionHeader}>VERIFICATION DATA</Text>

                                    <View style={styles.infoCard}>
                                        <View style={styles.infoRow}>
                                            <Icon name="time" size={20} color={theme.colors.primary} />
                                            <View style={{ marginLeft: 12 }}>
                                                <Text style={styles.infoLabel}>Time Marked</Text>
                                                <Text style={styles.infoValue}>{selectedRecord.time || 'N/A'}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.separator} />
                                        <View style={styles.infoRow}>
                                            <Icon name="location" size={20} color={theme.colors.error} />
                                            <View style={{ marginLeft: 12, flex: 1 }}>
                                                <Text style={styles.infoLabel}>Location</Text>
                                                <Text style={styles.infoValue}>{selectedRecord.location?.address || 'Geolocation not captured'}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {selectedRecord.photoUrl && (
                                        <>
                                            <Text style={styles.sectionHeader}>BIOMETRICS</Text>
                                            <View style={styles.photoContainer}>
                                                <Image source={{ uri: selectedRecord.photoUrl }} style={styles.biometricPhoto} />
                                            </View>
                                        </>
                                    )}
                                </View>
                            </ScrollView>
                        )}
                        <TouchableOpacity style={styles.dismissBtn} onPress={() => setSelectedRecord(null)}>
                            <Text style={styles.dismissBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default AdminAttendanceScreen;
