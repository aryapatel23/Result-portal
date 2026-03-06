import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';

// UI Utility Constants (Tailwind-like)
import { useTheme } from '../context/ThemeContext';

const COLORS = {
    primary: '#4f46e5',
    primaryLight: '#eff6ff',
    gray50: '#f9fafb',
    gray100: '#f1f5f9',
    gray400: '#9ca3af',
    gray500: '#64748b', // Darker gray for placeholders
    gray600: '#4b5563',
    gray900: '#111827',
    white: '#ffffff',
    danger: '#ef4444',
};

const CLASSES = ['Balvatika', ...Array.from({ length: 12 }, (_, i) => `STD ${i + 1}`)];
const PRIMARY_CLASSES = ['Balvatika', ...Array.from({ length: 8 }, (_, i) => `${i + 1}`)];

const AdminCreateTeacher: React.FC = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        employeeId: '',
        email: '',
        password: '',
        confirmPassword: '',
        subjects: '',
        classTeacher: '',
        assignedClasses: [] as string[],
        phone: '',
    });

    const [showClassModal, setShowClassModal] = useState(false);

    const handleChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleClassSelection = (className: string) => {
        setFormData(prev => {
            const isSelected = prev.assignedClasses.includes(className);
            if (isSelected) {
                return { ...prev, assignedClasses: prev.assignedClasses.filter(c => c !== className) };
            } else {
                return { ...prev, assignedClasses: [...prev.assignedClasses, className] };
            }
        });
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.employeeId || !formData.email || !formData.password || !formData.subjects) {
            Alert.alert('Required Fields', 'Please fill in all mandatory fields.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match!');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                employeeId: formData.employeeId,
                email: formData.email,
                password: formData.password,
                subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s),
                classTeacher: formData.classTeacher || null,
                assignedClasses: formData.assignedClasses,
                phone: formData.phone,
            };

            const response = await apiClient.post(API_ENDPOINTS.ADMIN.TEACHERS, payload);

            Alert.alert(
                'Success',
                `Teacher created successfully!${response.data.emailSent ? '\nWelcome email sent to ' + formData.email : ''}`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create teacher');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label: string, name: string, placeholder: string, keyboardType: any = 'default', secure: boolean = false) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType={keyboardType}
                secureTextEntry={secure}
                autoCapitalize={name === 'email' ? 'none' : 'words'}
                value={(formData as any)[name]}
                onChangeText={(text) => handleChange(name, text)}
            />
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Icon name="chevron-back" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Creation</Text>
                <TouchableOpacity style={styles.iconButton} onPress={handleSubmit} disabled={loading}>
                    <Icon name="checkmark-done" size={28} color={loading ? theme.colors.textTertiary : theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Welcome Banner */}
                    <View style={{ marginBottom: 32 }}>
                        <View style={styles.badge}>
                            <Icon name="shield-checkmark" size={14} color={theme.colors.surface} />
                            <Text style={styles.badgeText}>Admin Authorized</Text>
                        </View>
                        <Text style={styles.titleText}>Create Teacher</Text>
                        <Text style={styles.subtitleText}>Setup official credentials for a new staff member</Text>
                    </View>

                    {/* Identity Section */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Icon name="person-circle-outline" size={22} color={theme.colors.primary} />
                            <Text style={styles.cardTitle}>Identity Details</Text>
                        </View>

                        {renderInput('Full Name *', 'name', 'e.g. Jonathan Doe')}
                        {renderInput('Employee ID *', 'employeeId', 'e.g. EMP-2024-001')}

                        <View style={styles.divider} />

                        <View style={styles.cardHeader}>
                            <Icon name="mail-unread-outline" size={22} color={COLORS.primary} />
                            <Text style={styles.cardTitle}>Contact & Access</Text>
                        </View>

                        {renderInput('Email Address *', 'email', 'teacher@portal.com', 'email-address')}
                        {renderInput('Mobile Number', 'phone', '+91 00000 00000', 'phone-pad')}

                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            <View style={{ flex: 1 }}>{renderInput('Password *', 'password', '••••••••', 'default', true)}</View>
                            <View style={{ flex: 1 }}>{renderInput('Confirm *', 'confirmPassword', '••••••••', 'default', true)}</View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.cardHeader}>
                            <Icon name="school-outline" size={22} color={theme.colors.primary} />
                            <Text style={styles.cardTitle}>Academic Role</Text>
                        </View>

                        {renderInput('Subjects Handle *', 'subjects', 'e.g. Physics, Chemistry')}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Class Teacher Of (Primary)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                                <TouchableOpacity
                                    style={[styles.chip, !formData.classTeacher && styles.activeChip]}
                                    onPress={() => handleChange('classTeacher', '')}
                                >
                                    <Text style={[styles.chipText, !formData.classTeacher && styles.activeChipText]}>None</Text>
                                </TouchableOpacity>
                                {PRIMARY_CLASSES.map(cls => (
                                    <TouchableOpacity
                                        key={cls}
                                        style={[styles.chip, formData.classTeacher === cls && styles.activeChip]}
                                        onPress={() => handleChange('classTeacher', cls)}
                                    >
                                        <Text style={[styles.chipText, formData.classTeacher === cls && styles.activeChipText]}>
                                            {cls === 'Balvatika' ? 'Balvatika' : `STD ${cls}`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Assigned Classes *</Text>
                            <TouchableOpacity style={styles.selectTrigger} onPress={() => setShowClassModal(true)}>
                                <Text style={[styles.selectText, formData.assignedClasses.length === 0 && { color: theme.colors.textSecondary }]}>
                                    {formData.assignedClasses.length > 0
                                        ? `${formData.assignedClasses.length} Classes Selected`
                                        : 'Select multiple classes...'}
                                </Text>
                                <Icon name="layers-outline" size={20} color={theme.colors.primary} />
                            </TouchableOpacity>

                            {formData.assignedClasses.length > 0 && (
                                <View style={styles.tagGrid}>
                                    {formData.assignedClasses.map(cls => (
                                        <View key={cls} style={styles.tag}>
                                            <Text style={styles.tagText}>{cls}</Text>
                                            <TouchableOpacity onPress={() => toggleClassSelection(cls)}>
                                                <Icon name="close" size={14} color={theme.colors.primary} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.btnPrimary, loading && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.surface} />
                        ) : (
                            <>
                                <Text style={styles.btnText}>Create Account</Text>
                                <Icon name="checkmark-circle" size={22} color={theme.colors.surface} />
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 60 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Selection Modal */}
            <Modal visible={showClassModal} animationType="slide" transparent={true} onRequestClose={() => setShowClassModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Classes</Text>
                            <TouchableOpacity onPress={() => setShowClassModal(false)}>
                                <Icon name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalSubtitle}>Authorize access to specific standards.</Text>

                        <ScrollView contentContainerStyle={styles.grid}>
                            {CLASSES.map(cls => {
                                const selected = formData.assignedClasses.includes(cls);
                                return (
                                    <TouchableOpacity
                                        key={cls}
                                        style={[styles.gridItem, selected && styles.gridItemActive]}
                                        onPress={() => toggleClassSelection(cls)}
                                    >
                                        <Icon name={selected ? "checkbox" : "square-outline"} size={20} color={selected ? theme.colors.primary : theme.colors.textTertiary} />
                                        <Text style={[styles.gridText, selected && styles.gridTextActive]}>{cls}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <TouchableOpacity style={styles.btnConfirm} onPress={() => setShowClassModal(false)}>
                            <Text style={styles.btnConfirmText}>Confirm Selection</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        height: 60,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.gray900,
    },
    iconButton: {
        padding: 8,
    },
    scrollContent: {
        padding: 24,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 8,
        gap: 6,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    titleText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.gray900,
    },
    subtitleText: {
        fontSize: 15,
        color: COLORS.gray500,
        marginTop: 4,
        lineHeight: 22,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 4,
        borderWidth: 1,
        borderColor: COLORS.gray100,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.gray900,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.gray500,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: COLORS.gray50,
        borderWidth: 1.5,
        borderColor: COLORS.gray100,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 54,
        fontSize: 15,
        color: COLORS.gray900,
    },
    divider: {
        height: 1.5,
        backgroundColor: COLORS.gray100,
        marginVertical: 24,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: COLORS.gray100,
        marginRight: 10,
        borderWidth: 1.5,
        borderColor: COLORS.gray100,
    },
    activeChip: {
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.gray500,
    },
    activeChipText: {
        color: COLORS.primary,
    },
    selectTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.gray50,
        borderWidth: 1.5,
        borderColor: COLORS.gray100,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 54,
    },
    selectText: {
        fontSize: 15,
        color: COLORS.gray900,
    },
    tagGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 16,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.primary,
    },
    btnPrimary: {
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        gap: 10,
        elevation: 8,
    },
    btnText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 32,
        maxHeight: '82%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.gray900,
    },
    modalSubtitle: {
        fontSize: 14,
        color: COLORS.gray500,
        marginBottom: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    gridItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
        padding: 16,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1.5,
        borderColor: COLORS.gray100,
    },
    gridItemActive: {
        borderColor: COLORS.primary,
        backgroundColor: '#f5f3ff',
    },
    gridText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.gray600,
    },
    gridTextActive: {
        color: COLORS.primary,
    },
    btnConfirm: {
        backgroundColor: COLORS.gray900,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    btnConfirmText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AdminCreateTeacher;
