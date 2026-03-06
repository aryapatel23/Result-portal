import React, { useState, useEffect, useCallback } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// UI Utility Constants
const COLORS = {
    primary: '#4f46e5',
    primaryLight: '#eff6ff',
    success: '#10b981',
    danger: '#ef4444',
    bg: '#f8fafc',
    white: '#ffffff',
    gray50: '#f9fafb',
    gray100: '#f1f5f9',
    gray200: '#e2e8f0',
    gray400: '#9ca3af',
    gray500: '#64748b',
    gray600: '#4b5563',
    gray900: '#111827',
};

const STANDARDS = ['Balvatika', ...Array.from({ length: 12 }, (_, i) => `STD ${i + 1}`)];

const DEFAULT_SUBJECTS: any = {
    "STD 8": [
        { name: "Gujarati", marks: "", maxMarks: "200" },
        { name: "Maths", marks: "", maxMarks: "200" },
        { name: "Science", marks: "", maxMarks: "200" },
        { name: "Hindi", marks: "", maxMarks: "200" },
        { name: "English", marks: "", maxMarks: "200" },
        { name: "Social Science", marks: "", maxMarks: "200" },
        { name: "Sanskrit", marks: "", maxMarks: "200" },
        { name: "Personality Development", marks: "", maxMarks: "400" },
    ],
    // Add more defaults as needed
};

const AdminUploadResult: React.FC<any> = ({ route }) => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { theme } = useTheme();
    const resultId = route?.params?.resultId;
    const isEditing = !!resultId;

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(isEditing);
    const [fetchingStudent, setFetchingStudent] = useState(false);
    const [showStandardModal, setShowStandardModal] = useState(false);
    const [isAutoFilled, setIsAutoFilled] = useState(false);

    const [formData, setFormData] = useState({
        studentName: '',
        grNumber: '',
        dateOfBirth: '',
        standard: '',
        term: 'Term-1',
        academicYear: '2024-25',
        subjects: [{ name: '', marks: '', maxMarks: '100' }],
        remarks: '',
    });

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Auto-fill student details by GR Number
    const fetchStudentDetails = async (gr: string) => {
        if (gr.length < 3) return;
        setFetchingStudent(true);
        try {
            const response = await apiClient.get(API_ENDPOINTS.STUDENT.BY_GR(gr));
            if (response.data.student) {
                const s = response.data.student;
                setFormData(prev => ({
                    ...prev,
                    studentName: s.name,
                    dateOfBirth: s.dateOfBirth?.split('T')[0] || '',
                    standard: s.standard || '',
                    subjects: DEFAULT_SUBJECTS[s.standard] || prev.subjects
                }));
                setIsAutoFilled(true);
            }
        } catch (error) {
            console.log('Student not found for auto-fill');
            setIsAutoFilled(false);
        } finally {
            setFetchingStudent(false);
        }
    };

    useEffect(() => {
        if (isEditing) {
            loadResultDetails();
        }
    }, [resultId]);

    const loadResultDetails = async () => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.RESULTS.BASE}/${resultId}`);
            const r = response.data;
            setFormData({
                studentName: r.studentName,
                grNumber: r.grNumber,
                dateOfBirth: r.dateOfBirth?.split('T')[0] || '',
                standard: r.standard,
                term: r.term || 'Term-1',
                academicYear: r.academicYear || '2024-25',
                subjects: r.subjects.map((s: any) => ({
                    name: s.subject,
                    marks: s.obtainedMarks.toString(),
                    maxMarks: s.totalMarks.toString()
                })),
                remarks: r.remarks || '',
            });
            setIsAutoFilled(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to load result details');
        } finally {
            setFetchingData(false);
        }
    };

    const handleGRChange = (text: string) => {
        handleChange('grNumber', text);
        if (text.length >= 3 && !isEditing) {
            fetchStudentDetails(text);
        }
    };

    const addSubject = () => {
        setFormData(prev => ({
            ...prev,
            subjects: [...prev.subjects, { name: '', marks: '', maxMarks: '100' }]
        }));
    };

    const removeSubject = (index: number) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.filter((_, i) => i !== index)
        }));
    };

    const updateSubject = (index: number, field: string, value: string) => {
        setFormData(prev => {
            const newSubjects = [...prev.subjects];
            newSubjects[index] = { ...newSubjects[index], [field]: value };
            return { ...prev, subjects: newSubjects };
        });
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.studentName || !formData.grNumber || !formData.standard) {
            Alert.alert('Required Fields', 'Check student name, GR, and Standard.');
            return;
        }

        // Subject validation
        for (const sub of formData.subjects) {
            if (!sub.name || !sub.marks) {
                Alert.alert('Subject Error', `Please fill marks for ${sub.name || 'all subjects'}`);
                return;
            }
            if (parseFloat(sub.marks) > parseFloat(sub.maxMarks)) {
                Alert.alert('Validation Error', `${sub.name} marks exceed maximum marks.`);
                return;
            }
        }

        setLoading(true);
        try {
            // Map subjects to the format backend expects
            const payload = {
                ...formData,
                subjects: formData.subjects.map(s => ({
                    subject: s.name,
                    obtainedMarks: parseFloat(s.marks),
                    totalMarks: parseFloat(s.maxMarks)
                }))
            };

            if (isEditing) {
                await apiClient.put(`${API_ENDPOINTS.RESULTS.BASE}/${resultId}`, payload);
            } else {
                await apiClient.post(API_ENDPOINTS.RESULTS.BASE, payload);
            }

            Alert.alert('Success', isEditing ? 'Result updated successfully' : 'Result uploaded successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to upload result');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.surface} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Icon name="chevron-back" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Upload Result</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary }]}>
                            <Icon name="shield-checkmark" size={14} color={theme.colors.surface} />
                            <Text style={[styles.roleBadgeText, { color: theme.colors.surface }]}>Official Upload</Text>
                        </View>
                        <Text style={[styles.titleText, { color: theme.colors.text }]}>Student Performance</Text>
                        <Text style={[styles.subtitleText, { color: theme.colors.textSecondary }]}>Enter student academic details to publish results</Text>
                    </View>

                    {/* Student Identity Card */}
                    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={styles.cardHeader}>
                            <Icon name="id-card-outline" size={20} color={theme.colors.primary} />
                            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Student Identity</Text>
                        </View>

                        <View style={styles.inputRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>GR Number *</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                                    <TextInput
                                        style={[styles.input, { color: theme.colors.text }]}
                                        placeholder="GR No."
                                        value={formData.grNumber}
                                        onChangeText={handleGRChange}
                                        autoCapitalize="characters"
                                        placeholderTextColor={theme.colors.placeholder}
                                    />
                                    {fetchingStudent && <ActivityIndicator size="small" color={theme.colors.primary} />}
                                </View>
                            </View>
                        </View>

                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Full Name *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }, isAutoFilled && { backgroundColor: theme.colors.success + '20', borderColor: theme.colors.success }]}
                            placeholder="Student Full Name"
                            value={formData.studentName}
                            onChangeText={(t) => handleChange('studentName', t)}
                            placeholderTextColor={theme.colors.placeholder}
                        />

                        <View style={styles.inputRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Standard *</Text>
                                <TouchableOpacity style={[styles.selector, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]} onPress={() => setShowStandardModal(true)}>
                                    <Text style={[styles.selectorText, { color: formData.standard ? theme.colors.text : theme.colors.placeholder }]}>
                                        {formData.standard || 'Select Standard'}
                                    </Text>
                                    <Icon name="chevron-down" size={18} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ width: 16 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Term *</Text>
                                <View style={[styles.selector, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                                    <Text style={[styles.selectorText, { color: theme.colors.text }]}>{formData.term}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Subjects Section */}
                    <View style={[styles.card, { marginTop: 20, backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={styles.cardHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <Icon name="book-outline" size={20} color={theme.colors.primary} />
                                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Academic Records</Text>
                            </View>
                            <TouchableOpacity onPress={addSubject} style={[styles.addBtn, { backgroundColor: theme.colors.primary + '20' }]}>
                                <Icon name="add-circle" size={20} color={theme.colors.primary} />
                                <Text style={[styles.addBtnText, { color: theme.colors.primary }]}>Add</Text>
                            </TouchableOpacity>
                        </View>

                        {formData.subjects.map((subject, index) => (
                            <View key={index} style={styles.subjectRow}>
                                <View style={{ flex: 2 }}>
                                    <TextInput
                                        style={[styles.subjectInput, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                                        placeholder="Subject"
                                        value={subject.name}
                                        onChangeText={(t) => updateSubject(index, 'name', t)}
                                        placeholderTextColor={theme.colors.placeholder}
                                    />
                                </View>
                                <View style={{ width: 8 }} />
                                <View style={{ flex: 1 }}>
                                    <TextInput
                                        style={[styles.subjectInput, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                                        placeholder="Marks"
                                        keyboardType="numeric"
                                        value={subject.marks}
                                        onChangeText={(t) => updateSubject(index, 'marks', t)}
                                        placeholderTextColor={theme.colors.placeholder}
                                    />
                                </View>
                                <View style={{ width: 4, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: theme.colors.textTertiary, fontSize: 12 }}>/</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <TextInput
                                        style={[styles.subjectInput, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                                        placeholder="Max"
                                        keyboardType="numeric"
                                        value={subject.maxMarks}
                                        onChangeText={(t) => updateSubject(index, 'maxMarks', t)}
                                        placeholderTextColor={theme.colors.placeholder}
                                    />
                                </View>
                                <TouchableOpacity onPress={() => removeSubject(index)} style={styles.removeBtn}>
                                    <Icon name="trash-outline" size={18} color={theme.colors.error} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    {/* Submit Section */}
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: theme.colors.primary }, loading && { opacity: 0.7 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.surface} />
                        ) : (
                            <>
                                <Text style={[styles.submitBtnText, { color: theme.colors.surface }]}>Publish Result</Text>
                                <Icon name="cloud-upload" size={20} color={theme.colors.surface} />
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Standard Modal */}
            <Modal visible={showStandardModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Standard</Text>
                            <TouchableOpacity onPress={() => setShowStandardModal(false)}>
                                <Icon name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 400 }}>
                            {STANDARDS.map((std) => (
                                <TouchableOpacity
                                    key={std}
                                    style={[styles.modalItem, { borderBottomColor: theme.colors.border }]}
                                    onPress={() => {
                                        handleChange('standard', std);
                                        // Auto-load subjects if available
                                        if (DEFAULT_SUBJECTS[std]) {
                                            handleChange('subjects', DEFAULT_SUBJECTS[std]);
                                        }
                                        setShowStandardModal(false);
                                    }}
                                >
                                    <Text style={[styles.modalItemText, { color: theme.colors.text }]}>{std}</Text>
                                    {formData.standard === std && <Icon name="checkmark-circle" size={20} color={theme.colors.success} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    iconBtn: { padding: 4 },
    scrollContent: { padding: 24 },
    welcomeSection: { marginBottom: 32 },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 8,
        gap: 6,
    },
    roleBadgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
    titleText: { fontSize: 28, fontWeight: 'bold' },
    subtitleText: { fontSize: 15, marginTop: 4, lineHeight: 22 },
    card: {
        borderRadius: 24,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        borderWidth: 1,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
    cardTitle: { fontSize: 16, fontWeight: '800' },
    label: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 54,
    },
    input: {
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 54,
        fontSize: 15,
        marginBottom: 16,
    },
    autoFillInput: {},
    inputRow: { flexDirection: 'row', marginBottom: 16 },
    selector: {
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectorText: { fontSize: 15, fontWeight: '600' },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    addBtnText: { fontWeight: '700', fontSize: 13 },
    subjectRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    subjectInput: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        fontSize: 14,
    },
    removeBtn: { padding: 8 },
    submitBtn: {
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        gap: 12,
        elevation: 8,
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    submitBtnText: { fontSize: 18, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    modalItem: { paddingVertical: 16, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalItemText: { fontSize: 16, fontWeight: '600' },
});

export default AdminUploadResult;
