import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Alert,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    Dimensions,
    PermissionsAndroid,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from '@react-native-community/geolocation';
import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import { calculateDistance, checkLocationAccess, getTimeRestrictions } from '../utils/locationUtils';
import { useTheme } from '../context/ThemeContext';

const SCHOOL_LAT = 22.81713251852115;
const SCHOOL_LON = 72.47335209589137;

const { width } = Dimensions.get('window');

const TeacherAttendanceScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    // State
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [todayStatus, setTodayStatus] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Location States
    const [location, setLocation] = useState<any>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('Present');
    const [remarks, setRemarks] = useState('');

    const MAX_RADIUS = 3; // km

    // Helper function to calculate time until 8 PM
    const getTimeUntil8PM = () => {
        const now = new Date();
        const target = new Date();
        target.setHours(20, 0, 0, 0); // 8 PM

        // If already past 8 PM today, show 0
        if (now >= target) {
            return { hours: 0, minutes: 0, isPast: true };
        }

        const diffMs = target.getTime() - now.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return { hours, minutes, isPast: false };
    };

    // Check if attendance was auto-marked by system
    const isAutoMarked = () => {
        return todayStatus && todayStatus.markedBy === 'admin' && todayStatus.status === 'Leave';
    };

    const fetchData = async () => {
        try {
            const [statusRes, historyRes] = await Promise.all([
                apiClient.get(`${API_ENDPOINTS.TEACHER.ATTENDANCE}/today`),
                apiClient.get(`${API_ENDPOINTS.TEACHER.ATTENDANCE}/my-history`)
            ]);
            setTodayStatus(statusRes.data.attendance);
            setHistory(historyRes.data.attendance || []);
            setStats(historyRes.data.stats);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: '📍 Location Permission Required',
                        message: 'This app needs your location to verify you are at school when marking attendance. Your location is only used during attendance marking.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'Allow',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn('Permission error:', err);
                return false;
            }
        }
        return true; // iOS handles permissions differently
    };

    const getCurrentLocation = async (retryCount = 0) => {
        setLoadingLocation(true);
        try {
            // Request permission first
            const hasPermission = await requestLocationPermission();
            
            if (!hasPermission) {
                Alert.alert(
                    '❌ Permission Denied',
                    'Location permission is required to mark attendance. Please enable it in your device settings.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Retry', onPress: () => getCurrentLocation(0) }
                    ]
                );
                setLoadingLocation(false);
                return;
            }

            // Determine options based on retry count
            const options = retryCount === 0 ? {
                enableHighAccuracy: true,
                timeout: 30000, // 30 seconds for first attempt
                maximumAge: 5000,
            } : {
                enableHighAccuracy: false, // Try with lower accuracy on retry
                timeout: 20000, // 20 seconds for retry
                maximumAge: 10000,
            };

            // Get real GPS location
            Geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    const dist = calculateDistance(
                        latitude,
                        longitude,
                        SCHOOL_LAT,
                        SCHOOL_LON
                    );

                    setLocation({ latitude, longitude, accuracy: accuracy || 10 });
                    setDistance(dist);
                    setLoadingLocation(false);
                    
                    // Show success message if it was a retry
                    if (retryCount > 0) {
                        Alert.alert('✅ Success', 'Location retrieved successfully!');
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setLoadingLocation(false);
                    
                    // Handle different error types
                    let errorTitle = '📍 Location Error';
                    let errorMessage = '';
                    let showRetry = true;
                    
                    switch (error.code) {
                        case 1: // PERMISSION_DENIED
                            errorTitle = '❌ Permission Denied';
                            errorMessage = 'Please enable location permission in your device settings to mark attendance.';
                            showRetry = true;
                            break;
                        case 2: // POSITION_UNAVAILABLE
                            errorTitle = '📡 GPS Unavailable';
                            errorMessage = 'Unable to determine your location. Please ensure GPS is enabled and you have a clear view of the sky.';
                            showRetry = true;
                            break;
                        case 3: // TIMEOUT
                            if (retryCount < 1) {
                                errorTitle = '⏱️ GPS Taking Longer';
                                errorMessage = 'GPS is taking longer than expected. Retrying with different settings...';
                                showRetry = false;
                                // Automatically retry with lower accuracy
                                Alert.alert(errorTitle, errorMessage, [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Retry', onPress: () => getCurrentLocation(retryCount + 1) }
                                ]);
                                return;
                            } else {
                                errorTitle = '⏱️ Location Timeout';
                                errorMessage = 'GPS signal is weak. Try:\n\n1. Move to an open area\n2. Enable High Accuracy GPS\n3. Restart your device\n4. Check if Location Services are ON';
                                showRetry = true;
                            }
                            break;
                        default:
                            errorMessage = `${error.message || 'Unknown error occurred'}\n\nPlease check your GPS settings and try again.`;
                            showRetry = true;
                    }
                    
                    Alert.alert(
                        errorTitle,
                        errorMessage,
                        showRetry ? [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Retry', onPress: () => getCurrentLocation(0) },
                        ] : [{ text: 'OK' }]
                    );
                },
                options
            );
        } catch (error) {
            console.error('Location permission error:', error);
            setLoadingLocation(false);
            Alert.alert('Location Error', 'Unable to detect location. Please check GPS settings.');
        }
    };

    useEffect(() => {
        fetchData();
        getCurrentLocation(0);
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleMarkAttendance = async () => {
        if (!checkLeaveLimit()) return;

        if (selectedStatus !== 'Leave' && (!distance || distance > MAX_RADIUS)) {
            Alert.alert('Out of Range', `You must be within ${MAX_RADIUS}km of the school. Current: ${distance?.toFixed(2) || 'Unknown'}km`);
            return;
        }

        try {
            setMarking(true);
            await apiClient.post(`${API_ENDPOINTS.TEACHER.ATTENDANCE}/mark`, {
                status: selectedStatus,
                location: { ...location, address: "School Campus" },
                remarks
            });
            Alert.alert('Success', 'Attendance recorded successfully.');
            fetchData();
        } catch (error: any) {
            Alert.alert('Failure', error.response?.data?.message || 'Technical error occurred');
        } finally {
            setMarking(false);
        }
    };

    const isVerified = selectedStatus === 'Leave' || (distance !== null && distance <= MAX_RADIUS);

    const checkLeaveLimit = () => {
        if (selectedStatus === 'Leave' && stats && stats.leavesTaken >= stats.yearlyLeaveLimit) {
            Alert.alert('Limit Exceeded', `You have used ${stats.leavesTaken}/${stats.yearlyLeaveLimit} leaves. You cannot apply for more.`);
            return false;
        }
        return true;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present': return '#10b981';
            case 'Absent': return '#ef4444';
            case 'Leave': return '#4f46e5';
            case 'Half-Day': return '#f59e0b';
            default: return '#6B7280';
        }
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
                    <Icon name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Attendance Portal</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>{currentTime.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</Text>
                </View>
                <TouchableOpacity style={styles.refreshBtn} onPress={fetchData}>
                    <Icon name="refresh" size={22} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Auto-Mark Warning Banner */}
                {!todayStatus && (() => {
                    const timeUntil = getTimeUntil8PM();
                    if (!timeUntil.isPast) {
                        return (
                            <View style={[styles.warningBanner, { backgroundColor: theme.isDark ? '#422006' : '#fef3c7' }]}>
                                <View style={styles.warningIconContainer}>
                                    <Icon name="time-outline" size={24} color="#f59e0b" />
                                </View>
                                <View style={styles.warningContent}>
                                    <Text style={[styles.warningTitle, { color: theme.isDark ? '#fbbf24' : '#92400e' }]}>
                                        Mark Before 8:00 PM
                                    </Text>
                                    <Text style={[styles.warningText, { color: theme.isDark ? '#fcd34d' : '#b45309' }]}>
                                        {timeUntil.hours > 0 
                                            ? `${timeUntil.hours}h ${timeUntil.minutes}m remaining`
                                            : `${timeUntil.minutes} minutes remaining`}
                                    </Text>
                                    <Text style={[styles.warningSubtext, { color: theme.isDark ? '#fde68a' : '#d97706' }]}>
                                        Attendance will be auto-marked as Leave after 8 PM
                                    </Text>
                                </View>
                            </View>
                        );
                    }
                })()}

                {/* Auto-Marked Info Banner */}
                {isAutoMarked() && (
                    <View style={[styles.infoBanner, { backgroundColor: theme.isDark ? '#312e81' : '#e0e7ff' }]}>
                        <View style={styles.infoIconContainer}>
                            <Icon name="information-circle" size={24} color="#6366f1" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoTitle, { color: theme.isDark ? '#c7d2fe' : '#3730a3' }]}>
                                Auto-Marked Leave
                            </Text>
                            <Text style={[styles.infoText, { color: theme.isDark ? '#e0e7ff' : '#4f46e5' }]}>
                                Your attendance was automatically marked as Leave because no entry was recorded by 8:00 PM.
                            </Text>
                        </View>
                    </View>
                )}

                {todayStatus ? (
                    <View style={[styles.statusSuccessCard, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.successIconBg}>
                            <Icon name="checkmark-circle" size={40} color={'#10b981'} />
                        </View>
                        <Text style={[styles.successTitle, { color: theme.colors.text }]}>Attendance Recorded</Text>
                        <View style={[styles.successBadge, { backgroundColor: getStatusColor(todayStatus.status) + '20' }]}>
                            <Text style={[styles.successBadgeText, { color: getStatusColor(todayStatus.status) }]}>{todayStatus.status}</Text>
                        </View>
                        <Text style={[styles.successTime, { color: theme.colors.textSecondary }]}>Logged at {todayStatus.checkInTime}</Text>
                        <View style={[styles.successDivider, { backgroundColor: theme.colors.border }]} />
                        <Text style={[styles.successNote, { color: '#10b981' }]}>Have a productive day at work!</Text>
                    </View>
                ) : (
                    <>
                        {/* Location Verification Hub */}
                        <View style={[styles.hubCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <View style={styles.hubHeader}>
                                <View style={styles.hubTitleRow}>
                                    <View style={[styles.hubIconBg, { backgroundColor: theme.colors.primary + '20' }]}>
                                        <Icon name="location" size={20} color={theme.colors.primary} />
                                    </View>
                                    <Text style={[styles.hubTitle, { color: theme.colors.text }]}>GPS Verification</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.locUpdateBtn}
                                    onPress={() => getCurrentLocation(0)}
                                    disabled={loadingLocation}
                                >
                                    {loadingLocation ? <ActivityIndicator size="small" color={theme.colors.primary} /> : <Icon name="sync" size={18} color={theme.colors.primary} />}
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.locIndicator, { backgroundColor: loadingLocation ? theme.colors.primary + '10' : isVerified ? '#10b981' + '10' : '#ef4444' + '10' }]}>
                                {loadingLocation ? (
                                    <ActivityIndicator size="small" color={theme.colors.primary} />
                                ) : (
                                    <Icon
                                        name={isVerified ? "checkmark-circle" : "alert-circle"}
                                        size={22}
                                        color={isVerified ? '#10b981' : '#ef4444'}
                                    />
                                )}
                                <View style={styles.locTextCol}>
                                    <Text style={[styles.locStatusText, { color: loadingLocation ? theme.colors.primary : isVerified ? '#10b981' : '#ef4444' }]}>
                                        {loadingLocation 
                                            ? 'Acquiring GPS signal...' 
                                            : distance !== null 
                                                ? `${distance.toFixed(2)}km from School` 
                                                : 'Tap sync to get location'}
                                    </Text>
                                    <Text style={[styles.locSubText, { color: theme.colors.textSecondary }]}>
                                        {loadingLocation 
                                            ? 'This may take 10-30 seconds' 
                                            : isVerified 
                                                ? 'You are within the permitted range' 
                                                : distance !== null
                                                    ? `Must be within ${MAX_RADIUS}km radius`
                                                    : 'Location required for Present/Absent status'}
                                    </Text>
                                </View>
                            </View>

                            {location && (
                                <View style={[styles.metaGrid, { borderTopColor: theme.colors.border }]}>
                                    <View style={styles.metaItem}>
                                        <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>Accuracy</Text>
                                        <Text style={[styles.metaValue, { color: theme.colors.text }]}>±{location.accuracy.toFixed(0)}m</Text>
                                    </View>
                                    <View style={[styles.metaSep, { backgroundColor: theme.colors.border }]} />
                                    <View style={styles.metaItem}>
                                        <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>Required</Text>
                                        <Text style={[styles.metaValue, { color: theme.colors.text }]}>&lt; {MAX_RADIUS}km</Text>
                                    </View>
                                </View>
                            )}

                            {/* GPS Tips */}
                            {!location && !loadingLocation && (
                                <View style={[styles.gpsTipsContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                                    <Icon name="information-circle-outline" size={16} color={theme.colors.textSecondary} />
                                    <Text style={[styles.gpsTipsText, { color: theme.colors.textSecondary }]}>
                                        For best results: Enable High Accuracy GPS, go outdoors, and allow 10-30 seconds
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Submission Form */}
                        <View style={[styles.formCard, { backgroundColor: theme.colors.card }]}>
                            <Text style={[styles.formLabel, { color: theme.colors.text }]}>How are you today?</Text>
                            <View style={styles.statusGrid}>
                                {['Present', 'Absent', 'Half-Day', 'Leave'].map((val) => (
                                    <TouchableOpacity
                                        key={val}
                                        onPress={() => setSelectedStatus(val)}
                                        style={[
                                            styles.statusOption,
                                            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                                            selectedStatus === val && { 
                                                backgroundColor: theme.colors.primary + '15',
                                                borderColor: theme.colors.primary 
                                            }
                                        ]}
                                    >
                                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(val) }]} />
                                        <Text style={[
                                            styles.statusText,
                                            { color: theme.colors.textSecondary },
                                            selectedStatus === val && { color: theme.colors.primary, fontWeight: '700' }
                                        ]}>{val}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.formLabel, { marginTop: 24, color: theme.colors.text }]}>Note (Optional)</Text>
                            <TextInput
                                style={[
                                    styles.noteInput,
                                    {
                                        backgroundColor: theme.colors.surface,
                                        borderColor: theme.colors.border,
                                        color: theme.colors.text
                                    }
                                ]}
                                placeholder="Add any remarks or reason for leave..."
                                multiline
                                numberOfLines={3}
                                value={remarks}
                                onChangeText={setRemarks}
                                placeholderTextColor={theme.colors.textTertiary}
                            />

                            {/* Verification Checklist */}
                            <View style={styles.checklist}>
                                <View style={styles.checkLine}>
                                    <Icon name="checkmark-circle" size={18} color={'#10b981'} />
                                    <Text style={styles.checkMsg}>Status: Selected "{selectedStatus}"</Text>
                                </View>
                                <View style={styles.checkLine}>
                                    <Icon
                                        name={isVerified ? "checkmark-circle" : "close-circle"}
                                        size={18}
                                        color={isVerified ? '#10b981' : '#D1D5DB'}
                                    />
                                    <Text style={[styles.checkMsg, !isVerified && { color: '#9CA3AF' }]}>
                                        GPS: {selectedStatus === 'Leave' ? 'Not Required' : isVerified ? 'Verified' : 'Out of Range'}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitBtn, (!isVerified || marking) && styles.submitBtnDisabled]}
                                disabled={!isVerified || marking}
                                onPress={handleMarkAttendance}
                            >
                                {marking ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.submitBtnText}>Confirm Attendance</Text>
                                        <Icon name="arrow-forward" size={20} color="#fff" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {/* Leave Stats Card */}
                {stats && (
                    <View style={styles.statsCard}>
                        <View style={styles.statsRow}>
                            <View>
                                <Text style={styles.statsLabel}>Yearly Leaves</Text>
                                <Text style={styles.statsValue}>
                                    {stats.leavesTaken}
                                    <Text style={styles.statsTotal}>/{stats.yearlyLeaveLimit}</Text>
                                </Text>
                            </View>
                            <View style={[styles.statsIcon, { backgroundColor: '#4f46e5' + '15' }]}>
                                <Icon name="calendar" size={24} color={'#4f46e5'} />
                            </View>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${Math.min((stats.leavesTaken / stats.yearlyLeaveLimit) * 100, 100)}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.statsFooter}>
                            {stats.yearlyLeaveLimit - stats.leavesTaken} leaves remaining
                        </Text>
                    </View>
                )}

                {/* Log History */}
                <View style={styles.logSection}>
                    <View style={styles.logHeader}>
                        <Text style={styles.logTitle}>Recent Activity</Text>
                        <TouchableOpacity><Text style={styles.logAll}>View History</Text></TouchableOpacity>
                    </View>

                    {history.length > 0 ? (
                        history.map((item, idx) => (
                            <View key={idx} style={[styles.logCard, { backgroundColor: theme.colors.card }]}>
                                <View style={[styles.logIndicator, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                                    <Icon name="calendar" size={18} color={getStatusColor(item.status)} />
                                </View>
                                <View style={styles.logInfo}>
                                    <Text style={[styles.logDate, { color: theme.colors.text }]}>{item.date}</Text>
                                    <View style={styles.logMeta}>
                                        <Text style={[styles.logTime, { color: theme.colors.textSecondary }]}>{item.checkInTime || '08:30 AM'}</Text>
                                        <View style={[styles.logDot, { backgroundColor: theme.colors.textTertiary }]} />
                                        <Text style={[styles.logStatus, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                                    </View>
                                </View>
                                <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyLogs}>
                            <Icon name="document-text-outline" size={32} color={theme.colors.textTertiary} />
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No recent logs found</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
        marginTop: 2,
    },
    refreshBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    // Warning Banner (Before 8 PM)
    warningBanner: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
    },
    warningIconContainer: {
        marginRight: 12,
        justifyContent: 'flex-start',
        paddingTop: 2,
    },
    warningContent: {
        flex: 1,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    warningText: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    warningSubtext: {
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 16,
    },
    // Info Banner (Auto-Marked)
    infoBanner: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#6366f1',
    },
    infoIconContainer: {
        marginRight: 12,
        justifyContent: 'flex-start',
        paddingTop: 2,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    infoText: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
    },
    statusSuccessCard: {
        backgroundColor: '#10b981' + '08',
        borderRadius: 32,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#10b981' + '20',
        marginBottom: 20,
    },
    successIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 12,
    },
    successBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        marginBottom: 8,
    },
    successBadgeText: {
        fontWeight: '900',
        fontSize: 14,
        textTransform: 'uppercase',
    },
    successTime: {
        fontSize: 15,
        color: '#4B5563',
        fontWeight: '600',
    },
    successDivider: {
        width: '40%',
        height: 2,
        backgroundColor: '#F3F4F6',
        marginVertical: 20,
        borderRadius: 1,
    },
    successNote: {
        fontSize: 13,
        color: '#10b981',
        fontWeight: '600',
    },
    hubCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },
    hubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    hubTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    hubIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hubTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    locUpdateBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    locIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 14,
        marginBottom: 16,
    },
    locTextCol: {
        flex: 1,
    },
    locStatusText: {
        fontSize: 15,
        fontWeight: '800',
    },
    locSubText: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 2,
        fontWeight: '500',
    },
    metaGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 14,
        borderRadius: 14,
    },
    metaItem: {
        flex: 1,
        alignItems: 'center',
    },
    metaLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    metaValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1F2937',
    },
    metaSep: {
        width: 1,
        height: 20,
        backgroundColor: '#E5E7EB',
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 12,
    },
    statusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    statusOption: {
        flex: 1,
        minWidth: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#F3F4F6',
        gap: 10,
    },
    statusOptionActive: {
        borderColor: '#4f46e5',
        backgroundColor: '#4f46e5' + '05',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4B5563',
    },
    statusTextActive: {
        color: '#4f46e5',
        fontWeight: '800',
    },
    noteInput: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        fontSize: 14,
        color: '#111827',
        height: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    checklist: {
        marginTop: 20,
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    checkLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    checkMsg: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    submitBtn: {
        marginTop: 24,
        height: 60,
        backgroundColor: '#4f46e5',
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        elevation: 4,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    submitBtnDisabled: {
        backgroundColor: '#D1D5DB',
        elevation: 0,
        shadowOpacity: 0,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    logSection: {
        marginTop: 10,
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    logTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    logAll: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4f46e5',
    },
    logCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F9FAFB',
    },
    logIndicator: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logInfo: {
        flex: 1,
        marginLeft: 14,
    },
    logDate: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    logMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    logTime: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    logDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 8,
    },
    logStatus: {
        fontSize: 12,
        fontWeight: '800',
    },
    emptyLogs: {
        alignItems: 'center',
        paddingVertical: 50,
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
    },
    emptyText: {
        fontSize: 13,
        color: '#9CA3AF',
        fontWeight: '600',
        marginTop: 10,
    },
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statsLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statsValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginTop: 4,
    },
    statsTotal: {
        fontSize: 16,
        color: '#9CA3AF',
        fontWeight: '600',
    },
    statsIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#4f46e5',
        borderRadius: 3,
    },
    statsFooter: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    gpsTipsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 1,
        gap: 8,
    },
    gpsTipsText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '500',
    },
});

export default TeacherAttendanceScreen;
