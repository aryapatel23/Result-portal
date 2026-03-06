import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Alert,
    SafeAreaView,
    StatusBar,
    Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import { useTheme } from '../context/ThemeContext';

const AdminTeacherDetailScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const { teacherId } = route.params;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [teacher, setTeacher] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        employeeId: '',
        email: '',
        subjects: '',
    });

    const fetchTeacherDetail = async () => {
        try {
            const res = await apiClient.get(`${API_ENDPOINTS.ADMIN.TEACHERS}/${teacherId}`);
            const teacherData = res.data.teacher || res.data;
            setTeacher(teacherData);
            setFormData({
                name: teacherData.name,
                employeeId: teacherData.employeeId,
                email: teacherData.email,
                subjects: teacherData.subjects?.join(', ') || '',
            });
        } catch (error) {
            console.error('Error fetching teacher detail:', error);
            Alert.alert('Error', 'Failed to load teacher details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeacherDetail();
    }, [teacherId]);

    const handleToggleStatus = async () => {
        try {
            const newStatus = !teacher.isActive;
            await apiClient.put(API_ENDPOINTS.ADMIN.UPDATE_TEACHER(teacherId), {
                isActive: newStatus
            });
            setTeacher({ ...teacher, isActive: newStatus });
            Alert.alert('Success', `Teacher status marked as ${newStatus ? 'Active' : 'Inactive'}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const handleUpdate = async () => {
        setSaving(true);
        try {
            await apiClient.put(API_ENDPOINTS.ADMIN.UPDATE_TEACHER(teacherId), {
                ...formData,
                subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s)
            });
            setTeacher({ ...teacher, ...formData, subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s) });
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={'#2563eb'} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.surface} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={'#0f172a'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Teacher Profile</Text>
                <TouchableOpacity onPress={() => isEditing ? handleUpdate() : setIsEditing(true)}>
                    {saving ? (
                        <ActivityIndicator size="small" color={'#2563eb'} />
                    ) : (
                        <Text style={styles.editButtonText}>{isEditing ? 'Save' : 'Edit'}</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarTextLarge}>{teacher?.name?.charAt(0) || '?'}</Text>
                    </View>
                    <Text style={styles.profileName}>{teacher?.name || 'Loading...'}</Text>
                    <Text style={styles.profileRole}>ID: {teacher.employeeId}</Text>

                    <View style={[styles.statusToggleContainer, { backgroundColor: teacher.isActive ? '#dcfce7' : '#fee2e2' }]}>
                        <Text style={[styles.statusLabel, { color: teacher.isActive ? '#10b981' : '#ef4444' }]}>
                            Account Status: {teacher.isActive ? 'Active' : 'Inactive'}
                        </Text>
                        <Switch
                            value={teacher?.isActive}
                            onValueChange={handleToggleStatus}
                            trackColor={{ false: '#fca5a5', true: '#86efac' }}
                            thumbColor={teacher?.isActive ? '#10b981' : '#ef4444'}
                        />
                    </View>
                </View>

                {/* Information Sections */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.inputDisabled]}
                            value={formData.name}
                            onChangeText={(t) => setFormData({ ...formData, name: t })}
                            editable={isEditing}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Employee ID</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.inputDisabled]}
                            value={formData.employeeId}
                            onChangeText={(t) => setFormData({ ...formData, employeeId: t })}
                            editable={isEditing}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.inputDisabled]}
                            value={formData.email}
                            onChangeText={(t) => setFormData({ ...formData, email: t })}
                            editable={isEditing}
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Assigned Subjects (Comma separated)</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.inputDisabled]}
                            value={formData.subjects}
                            onChangeText={(t) => setFormData({ ...formData, subjects: t })}
                            editable={isEditing}
                            multiline
                        />
                    </View>
                </View>

                {/* Management Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Management Actions</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('AdminTimetable', { teacherId: teacherId, teacherName: teacher.name })}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
                                <Icon name="calendar" size={24} color={'#2563eb'} />
                            </View>
                            <Text style={styles.actionText}>Manage Timetable</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('AdminAttendance', { teacherId: teacherId })}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#ecfdf5' }]}>
                                <Icon name="time" size={24} color={'#10b981'} />
                            </View>
                            <Text style={styles.actionText}>View Attendance</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {isEditing && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                            setIsEditing(false);
                            setFormData({
                                name: teacher.name,
                                employeeId: teacher.employeeId,
                                email: teacher.email,
                                subjects: teacher.subjects?.join(', ') || '',
                            });
                        }}
                    >
                        <Text style={styles.cancelButtonText}>Cancel Changes</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
    editButtonText: { fontSize: 16, fontWeight: '700', color: theme.colors.primary },
    scrollContent: { paddingBottom: 40 },

    profileCard: {
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.isDark ? theme.colors.primary + '20' : '#dbeafe',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarTextLarge: { fontSize: 40, fontWeight: '800', color: theme.colors.primary },
    profileName: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
    profileRole: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },

    statusToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    statusLabel: { fontSize: 14, fontWeight: '700' },

    section: { padding: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.text, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },

    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 8 },
    input: {
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: '600',
    },
    inputDisabled: { backgroundColor: theme.colors.surface, color: theme.colors.textSecondary },

    actionsGrid: { flexDirection: 'row', gap: 12 },
    actionButton: {
        flex: 1,
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        elevation: 2,
    },
    actionIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    actionText: { fontSize: 12, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },

    cancelButton: { marginHorizontal: 20, marginTop: 10, padding: 16, alignItems: 'center' },
    cancelButtonText: { color: '#ef4444', fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AdminTeacherDetailScreen;
