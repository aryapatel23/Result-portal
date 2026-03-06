/**
 * Teacher Detail Screen
 * 
 * Shows full information about a teacher, including contact info,
 * academic details, and performance stats.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Alert,
    Dimensions,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';

const { width } = Dimensions.get('window');

const TeacherDetailScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { user: currentUser } = useAuth();
    const { theme } = useTheme();
    const { teacherId } = route.params;

    const [loading, setLoading] = useState(true);
    const [teacherData, setTeacherData] = useState<any>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [form, setForm] = useState({
        name: '',
        email: '',
        employeeId: '',
        phone: '',
        subjects: '',
        assignedClasses: '',
    });

    const isAdmin = currentUser?.role === 'admin';

    const fetchTeacherDetails = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`${API_ENDPOINTS.ADMIN.TEACHERS}/${teacherId}`);
            setTeacherData(res.data);

            // Sync form
            setForm({
                name: res.data.teacher.name || '',
                email: res.data.teacher.email || '',
                employeeId: res.data.teacher.employeeId || '',
                phone: res.data.teacher.phone || '',
                subjects: (res.data.teacher.subjects || []).join(', '),
                assignedClasses: (res.data.teacher.assignedClasses || []).join(', '),
            });
        } catch (error) {
            console.error('Error fetching teacher details:', error);
            Alert.alert('Error', 'Failed to load teacher information');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeacherDetails();
    }, [teacherId]);

    const handleUpdate = async () => {
        if (!form.name.trim() || !form.email.trim()) {
            Alert.alert('Error', 'Name and Email are required');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                ...form,
                subjects: form.subjects.split(',').map(s => s.trim()).filter(s => s !== ''),
                assignedClasses: form.assignedClasses.split(',').map(c => c.trim()).filter(c => c !== ''),
            };

            await apiClient.put(`${API_ENDPOINTS.ADMIN.TEACHERS}/${teacherId}`, payload);
            Alert.alert('Success', 'Teacher details updated successfully');
            setEditModalVisible(false);
            fetchTeacherDetails();
        } catch (error: any) {
            console.error('Update teacher error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update teacher');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={'#3b82f6'} />
                <Text style={styles.loadingText}>Loading Profile...</Text>
            </View>
        );
    }

    const teacher = teacherData?.teacher;
    const stats = teacherData?.overallStatistics;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.surface} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={'#0f172a'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Staff Profile</Text>
                {isAdmin && (
                    <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.editIconBtn}>
                        <Icon name="create-outline" size={22} color={'#3b82f6'} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{teacher?.name?.charAt(0)}</Text>
                    </View>
                    <Text style={styles.teacherName}>{teacher?.name}</Text>
                    <Text style={styles.teacherRole}>Professional Educator • {teacher?.employeeId}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: teacher?.isActive ? '#dcfce7' : '#fee2e2' }]}>
                        <Text style={[styles.statusText, { color: teacher?.isActive ? '#166534' : '#991b1b' }]}>
                            {teacher?.isActive ? 'Active Staff' : 'Inactive'}
                        </Text>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats?.overallAverage}%</Text>
                        <Text style={styles.statLabel}>Avg performance</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: '#10b981' }]}>{stats?.passPercentage}%</Text>
                        <Text style={styles.statLabel}>Pass Rate</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: '#8b5cf6' }]}>{stats?.totalStudents}</Text>
                        <Text style={styles.statLabel}>Total Students</Text>
                    </View>
                </View>

                {/* Info Sections */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Details</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Icon name="mail-outline" size={20} color={'#64748b'} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Email Address</Text>
                                <Text style={styles.infoValue}>{teacher?.email}</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Icon name="call-outline" size={20} color={'#64748b'} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Phone Number</Text>
                                <Text style={styles.infoValue}>{teacher?.phone || 'Not provided'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Academic Responsibility</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Icon name="book-outline" size={20} color={'#64748b'} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Subjects Taught</Text>
                                <Text style={styles.infoValue}>{(teacher?.subjects || []).join(', ') || 'N/A'}</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Icon name="business-outline" size={20} color={'#64748b'} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Assigned Classes</Text>
                                <Text style={styles.infoValue}>{(teacher?.assignedClasses || []).join(', ') || 'N/A'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                {isAdmin && (
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.primaryAction, { backgroundColor: '#3b82f6' }]}
                            onPress={() => navigation.navigate('AdminManageTimetable', {
                                teacherId: teacher._id,
                                teacherName: teacher.name
                            })}
                        >
                            <View style={styles.actionIconBox}>
                                <Icon name="calendar" size={20} color="#fff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.primaryActionText}>Academic Schedule</Text>
                                <Text style={styles.actionSubtext}>Manage weekly timetable</Text>
                            </View>
                            <Icon name="chevron-forward" size={20} color="#fff" style={{ opacity: 0.6 }} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryAction}
                            onPress={() => Alert.alert('History', 'Performance analytics feature coming soon.')}
                        >
                            <Icon name="analytics" size={20} color={'#3b82f6'} />
                            <Text style={styles.secondaryActionText}>Full Analytics</Text>
                        </TouchableOpacity>

                        <View style={styles.statusDivider} />
                        <Text style={styles.sectionTitle}>Account Access</Text>
                        <TouchableOpacity
                            style={[styles.statusAction, { backgroundColor: teacher?.isActive !== false ? '#fee2e2' : '#dcfce7' }]}
                            onPress={() => {
                                const newStatus = !(teacher?.isActive !== false);
                                Alert.alert(
                                    newStatus ? 'Activate Account' : 'Deactivate Account',
                                    `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${teacher.name}'s account?`,
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: newStatus ? 'Activate' : 'Deactivate',
                                            style: newStatus ? 'default' : 'destructive',
                                            onPress: async () => {
                                                try {
                                                    setSaving(true);
                                                    await apiClient.put(`${API_ENDPOINTS.ADMIN.TEACHERS}/${teacherId}`, { isActive: newStatus });
                                                    Alert.alert('Success', `Teacher account ${newStatus ? 'activated' : 'deactivated'} successfully`);
                                                    fetchTeacherDetails();
                                                } catch (err) {
                                                    Alert.alert('Error', 'Failed to update account status');
                                                } finally {
                                                    setSaving(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                        >
                            <Icon
                                name={teacher?.isActive !== false ? "lock-closed-outline" : "lock-open-outline"}
                                size={20}
                                color={teacher?.isActive !== false ? '#ef4444' : '#10b981'}
                            />
                            <Text style={[styles.statusActionText, { color: teacher?.isActive !== false ? '#ef4444' : '#10b981' }]}>
                                {teacher?.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Edit Modal */}
            <Modal visible={editModalVisible} transparent animationType="slide">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Staff Member</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Icon name="close" size={24} color={'#0f172a'} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={form.name}
                                onChangeText={(t) => setForm({ ...form, name: t })}
                            />

                            <Text style={styles.inputLabel}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                value={form.email}
                                onChangeText={(t) => setForm({ ...form, email: t })}
                                keyboardType="email-address"
                            />

                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                value={form.phone}
                                onChangeText={(t) => setForm({ ...form, phone: t })}
                                keyboardType="phone-pad"
                            />

                            <Text style={styles.inputLabel}>Employee ID</Text>
                            <TextInput
                                style={styles.input}
                                value={form.employeeId}
                                onChangeText={(t) => setForm({ ...form, employeeId: t })}
                            />

                            <Text style={styles.inputLabel}>Subjects (comma separated)</Text>
                            <TextInput
                                style={styles.input}
                                value={form.subjects}
                                onChangeText={(t) => setForm({ ...form, subjects: t })}
                            />

                            <Text style={styles.inputLabel}>Assigned Classes (comma separated)</Text>
                            <TextInput
                                style={styles.input}
                                value={form.assignedClasses}
                                onChangeText={(t) => setForm({ ...form, assignedClasses: t })}
                            />
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.saveButton, saving && { opacity: 0.7 }]}
                            onPress={handleUpdate}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    editIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#ffffff',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 35,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    teacherName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    teacherRole: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    statCard: {
        width: (width - 60) / 3,
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    statLabel: {
        fontSize: 10,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 4,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoTextContainer: {
        marginLeft: 16,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
    },
    actionsContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    primaryAction: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        elevation: 4,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    actionIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    primaryActionText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    actionSubtext: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: 2,
    },
    secondaryAction: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#3b82f6',
        gap: 8,
    },
    secondaryActionText: {
        color: '#3b82f6',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 16,
    },
    statusAction: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginTop: 8,
    },
    statusActionText: {
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#64748b',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    modalForm: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 14,
        fontSize: 15,
        color: '#0f172a',
    },
    saveButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default TeacherDetailScreen;
