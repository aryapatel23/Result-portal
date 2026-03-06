import React, { useState } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';

// UI Utility Constants
import { useTheme } from '../context/ThemeContext';

const COLORS = {
    primary: '#4f46e5',
    primaryLight: '#eff6ff',
    gray50: '#f9fafb',
    gray100: '#f1f5f9',
    gray400: '#9ca3af',
    gray500: '#64748b',
    gray600: '#4b5563',
    gray900: '#111827',
    white: '#ffffff',
    danger: '#ef4444',
};

const STANDARDS = [
    'Balvatika',
    '1', '2', '3', '4', '5', '6', '7', '8'
];

const AdminCreateStudent: React.FC = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStandardModal, setShowStandardModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        grNumber: '',
        dateOfBirth: new Date(),
        standard: '',
        email: '',
        phone: '',
    });

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            handleChange('dateOfBirth', selectedDate);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.grNumber || !formData.standard) {
            Alert.alert('Required Fields', 'Please fill in Name, GR Number, and Standard.');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
                dateOfBirth: formData.dateOfBirth.toISOString().split('T')[0], // YYYY-MM-DD
            };

            await apiClient.post(API_ENDPOINTS.ADMIN.CREATE_STUDENT, payload);

            Alert.alert(
                'Success',
                'Student account created successfully!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            console.error('Registration Error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to create student account');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label: string, name: string, placeholder: string, keyboardType: any = 'default', icon: string) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <Icon name={icon} size={20} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.gray500}
                    keyboardType={keyboardType}
                    autoCapitalize={name === 'email' ? 'none' : 'words'}
                    value={(formData as any)[name]}
                    onChangeText={(text) => handleChange(name, text)}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Icon name="chevron-back" size={28} color={COLORS.gray900} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Register Student</Text>
                <TouchableOpacity style={styles.iconButton} onPress={handleSubmit} disabled={loading}>
                    <Icon name="checkmark-done" size={28} color={loading ? COLORS.gray400 : COLORS.primary} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Banner */}
                    <View style={{ marginBottom: 32 }}>
                        <View style={styles.badge}>
                            <Icon name="person-add" size={14} color={COLORS.white} />
                            <Text style={styles.badgeText}>Admin Panel</Text>
                        </View>
                        <Text style={styles.titleText}>New Student</Text>
                        <Text style={styles.subtitleText}>Create a student profile for the result portal</Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Icon name="id-card-outline" size={22} color={COLORS.primary} />
                            <Text style={styles.cardTitle}>Basic Information</Text>
                        </View>

                        {renderInput('Full Name *', 'name', 'e.g. Rahul Sharma', 'default', 'person-outline')}
                        {renderInput('GR Number *', 'grNumber', 'e.g. GR2024001', 'default', 'finger-print-outline')}

                        {/* Date of Birth */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Date of Birth *</Text>
                            <TouchableOpacity
                                style={styles.inputWrapper}
                                onPress={() => setShowDatePicker(true)}
                                activeOpacity={0.7}
                            >
                                <Icon name="calendar-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                                <Text style={styles.inputText}>
                                    {formData.dateOfBirth.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Standard Selector */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Standard/Grade *</Text>
                            <TouchableOpacity
                                style={styles.inputWrapper}
                                onPress={() => setShowStandardModal(true)}
                                activeOpacity={0.7}
                            >
                                <Icon name="school-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                                <Text style={[styles.inputText, !formData.standard && { color: COLORS.gray500 }]}>
                                    {formData.standard ? `STD ${formData.standard}` : 'Select Standard'}
                                </Text>
                                <Icon name="chevron-down" size={18} color={COLORS.gray400} style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.cardHeader}>
                            <Icon name="call-outline" size={22} color={COLORS.primary} />
                            <Text style={styles.cardTitle}>Contact Details (Optional)</Text>
                        </View>

                        {renderInput('Email Address', 'email', 'student@school.com', 'email-address', 'mail-outline')}
                        {renderInput('Parent Phone', 'phone', '+91 00000 00000', 'phone-pad', 'phone-portrait-outline')}

                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.btnPrimary, loading && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Text style={styles.btnText}>Register Student</Text>
                                <Icon name="arrow-forward" size={20} color={COLORS.white} />
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.noteBox}>
                        <Icon name="information-circle-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.noteText}>
                            Students will use their GR Number and Date of Birth to log into the portal.
                        </Text>
                    </View>

                    <View style={{ height: 60 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={formData.dateOfBirth}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                />
            )}

            {/* Standard Modal */}
            <Modal visible={showStandardModal} animationType="slide" transparent={true} onRequestClose={() => setShowStandardModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Standard</Text>
                            <TouchableOpacity onPress={() => setShowStandardModal(false)}>
                                <Icon name="close" size={24} color={COLORS.gray900} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={styles.standardList}>
                            {STANDARDS.map(std => (
                                <TouchableOpacity
                                    key={std}
                                    style={[styles.standardItem, formData.standard === std && styles.standardItemActive]}
                                    onPress={() => {
                                        handleChange('standard', std);
                                        setShowStandardModal(false);
                                    }}
                                >
                                    <Text style={[styles.standardText, formData.standard === std && styles.standardTextActive]}>
                                        {std === 'Balvatika' ? std : `STD ${std}`}
                                    </Text>
                                    {formData.standard === std && <Icon name="checkmark-circle" size={20} color={COLORS.primary} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
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
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
        borderWidth: 1.5,
        borderColor: COLORS.gray100,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 54,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: COLORS.gray900,
        height: '100%',
    },
    inputText: {
        fontSize: 15,
        color: COLORS.gray900,
    },
    divider: {
        height: 1.5,
        backgroundColor: COLORS.gray100,
        marginVertical: 24,
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
    noteBox: {
        flexDirection: 'row',
        backgroundColor: COLORS.primaryLight,
        padding: 16,
        borderRadius: 16,
        marginTop: 24,
        alignItems: 'center',
        gap: 12,
    },
    noteText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '600',
        lineHeight: 18,
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
        padding: 24,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.gray900,
    },
    standardList: {
        paddingBottom: 20,
    },
    standardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    standardItemActive: {
        borderBottomColor: COLORS.primary,
    },
    standardText: {
        fontSize: 16,
        color: COLORS.gray600,
        fontWeight: '600',
    },
    standardTextActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },
});

export default AdminCreateStudent;
