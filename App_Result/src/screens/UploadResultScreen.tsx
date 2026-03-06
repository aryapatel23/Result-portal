/**
 * Upload Result Screen
 * 
 * Redesigned to match the classic web aesthetic:
 * - Blue Header (Blue-600)
 * - Clean card-based form
 * - Verified student badges
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Modal,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

interface SubjectInput {
    name: string;
    marks: string;
    maxMarks: string;
}

const UploadResultScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

    // ... rest of the component state ...

    // Core data state
    const [loading, setLoading] = useState(false);
    const [teacherData, setTeacherData] = useState<any>(null);
    const [fetchingTeacher, setFetchingTeacher] = useState(true);

    // Form state
    const [grNumber, setGrNumber] = useState('');
    const [studentName, setStudentName] = useState('');
    const [standard, setStandard] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [term, setTerm] = useState('Term-1');
    const [academicYear, setAcademicYear] = useState('2024-25');
    const [subjects, setSubjects] = useState<SubjectInput[]>([
        { name: '', marks: '', maxMarks: '100' }
    ]);
    const [remarks, setRemarks] = useState('');

    // UI state
    const [checkingStudent, setCheckingStudent] = useState(false);
    const [isAutoFilled, setIsAutoFilled] = useState(false);
    const [showTermPicker, setShowTermPicker] = useState(false);
    const [showStandardPicker, setShowStandardPicker] = useState(false);

    useEffect(() => {
        fetchTeacherData();
    }, []);

    const fetchTeacherData = async () => {
        try {
            const res = await apiClient.get(API_ENDPOINTS.TEACHER.DASHBOARD);
            if (res.data && res.data.teacher) {
                setTeacherData(res.data.teacher);
            }
        } catch (error) {
            console.error('Error fetching teacher data:', error);
            Alert.alert('Error', 'Failed to fetch teacher profile.');
            navigation.goBack();
        } finally {
            setFetchingTeacher(false);
        }
    };

    // Debounced GR Search logic
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (grNumber.length >= 3) {
                handleGrSearch();
            }
        }, 800);
        return () => clearTimeout(timeoutId);
    }, [grNumber]);

    const handleGrSearch = async () => {
        if (!grNumber.trim()) return;

        setCheckingStudent(true);
        try {
            const res = await apiClient.get(API_ENDPOINTS.STUDENT.BY_GR(grNumber));
            if (res.data) {
                const student = res.data;
                setStudentName(student.name || '');
                setStandard(student.standard || '');
                if (student.dateOfBirth) {
                    setDateOfBirth(student.dateOfBirth.split('T')[0]);
                }
                setIsAutoFilled(true);
            }
        } catch (error) {
            console.error('Student fetch error:', error);
            setIsAutoFilled(false);
        } finally {
            setCheckingStudent(false);
        }
    };

    const addSubject = () => {
        setSubjects([...subjects, { name: '', marks: '', maxMarks: '100' }]);
    };

    const removeSubject = (index: number) => {
        if (subjects.length > 1) {
            const newSubjects = subjects.filter((_, i) => i !== index);
            setSubjects(newSubjects);
        }
    };

    const updateSubject = (index: number, field: keyof SubjectInput, value: string) => {
        const newSubjects = [...subjects];
        newSubjects[index] = { ...newSubjects[index], [field]: value };
        setSubjects(newSubjects);
    };

    const handleSubmit = async () => {
        if (!grNumber || !studentName || !standard || !term) {
            Alert.alert('Missing Fields', 'Please fill all required fields (*)');
            return;
        }

        const validSubjects = subjects.filter(s => s.name.trim() && s.marks.trim());
        if (validSubjects.length === 0) {
            Alert.alert('Invalid Subjects', 'Please add at least one subject with marks.');
            return;
        }

        const payload = {
            grNumber,
            studentName,
            standard,
            term,
            academicYear,
            remarks,
            subjects: validSubjects.map(s => ({
                name: s.name,
                marks: Number(s.marks),
                maxMarks: Number(s.maxMarks)
            }))
        };

        setLoading(true);
        try {
            await apiClient.post(API_ENDPOINTS.RESULTS.BASE, payload);
            Alert.alert('Success', 'Result uploaded successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Upload Failed', error.response?.data?.message || 'Failed to upload result.');
        } finally {
            setLoading(false);
        }
    };

    const availableStandards = React.useMemo(() => {
        if (!teacherData) return [];
        const classes = new Set<string>();
        if (teacherData.assignedClasses) teacherData.assignedClasses.forEach((c: string) => classes.add(c));
        if (teacherData.classTeacher) classes.add(teacherData.classTeacher);
        return Array.from(classes).filter(Boolean).sort();
    }, [teacherData]);

    if (fetchingTeacher) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

                {/* Classic Blue Header */}
                <View style={[styles.header, { paddingTop: insets.top > 0 ? 10 : 30 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Icon name="book" size={24} color="#fff" style={{ marginRight: 10 }} />
                    <Text style={styles.headerTitle}>Upload Student Result</Text>
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>

                        <Text style={styles.subtitle}>
                            Upload student results using the form below. You can add multiple subjects as needed.
                        </Text>

                        {/* Uploading As Card */}
                        <View style={styles.userInfoCard}>
                            <View style={styles.userInfoIcon}>
                                <Icon name="person" size={20} color="#2563eb" />
                            </View>
                            <View>
                                <Text style={styles.userInfoLabel}>Uploading as:</Text>
                                <Text style={styles.userInfoName}>{user?.name} {user?.employeeId ? `(${user?.employeeId})` : ''}</Text>
                                <Text style={styles.userInfoRole}>Role: {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}</Text>
                                {teacherData?.classTeacher && (
                                    <Text style={styles.userInfoSub}>📚 Class Teacher: <Text style={{ fontWeight: '700', color: '#1e40af' }}>{teacherData.classTeacher}</Text></Text>
                                )}
                            </View>
                        </View>

                        {/* Main Form Container */}
                        <View style={styles.formCard}>

                            {/* Student Section */}
                            <Text style={styles.sectionLabel}>STUDENT INFORMATION</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>GR Number *</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        value={grNumber}
                                        onChangeText={setGrNumber}
                                        placeholder="Enter GR Number"
                                        placeholderTextColor="#94a3b8"
                                    />
                                    {checkingStudent && (
                                        <View style={styles.loaderInside}>
                                            <ActivityIndicator size="small" color="#2563eb" />
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.hintText}>💡 Enter GR to auto-fill details</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Student Name *</Text>
                                <TextInput
                                    style={[styles.input, isAutoFilled && styles.verifiedInput]}
                                    value={studentName}
                                    onChangeText={setStudentName}
                                    placeholder="Enter Student Full Name"
                                    placeholderTextColor="#94a3b8"
                                />
                                {isAutoFilled && <Text style={styles.verifiedText}>✓ Auto-filled from student database</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Date of Birth *</Text>
                                <TextInput
                                    style={[styles.input, isAutoFilled && styles.verifiedInput]}
                                    value={dateOfBirth}
                                    editable={false}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Standard *</Text>
                                <TouchableOpacity style={[styles.picker, isAutoFilled && styles.verifiedInput]} onPress={() => setShowStandardPicker(true)}>
                                    <Text style={standard ? styles.pickerText : styles.pickerPlaceholder}>
                                        {standard || 'Select Standard'}
                                    </Text>
                                    <Icon name="chevron-down" size={16} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            {/* Exam Section */}
                            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>EXAM DETAILS</Text>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                    <Text style={styles.label}>Term *</Text>
                                    <TouchableOpacity style={styles.picker} onPress={() => setShowTermPicker(true)}>
                                        <Text style={styles.pickerText}>{term}</Text>
                                        <Icon name="chevron-down" size={16} color="#64748b" />
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Academic Year *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={academicYear}
                                        onChangeText={setAcademicYear}
                                        placeholder="2024-25"
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>
                            </View>

                            {/* Subjects List */}
                            <View style={styles.subjectHeader}>
                                <Text style={styles.sectionLabel}>SUBJECTS & MARKS *</Text>
                                <TouchableOpacity onPress={addSubject} style={styles.addBtn}>
                                    <Icon name="add" size={14} color="#2563eb" />
                                    <Text style={styles.addBtnText}>ADD SUBJECT</Text>
                                </TouchableOpacity>
                            </View>

                            {subjects.map((sub, index) => (
                                <View key={index} style={styles.subjectCard}>
                                    <View style={styles.subjectHeaderRow}>
                                        <Text style={styles.subjectIndex}>Subject {index + 1}</Text>
                                        <TouchableOpacity onPress={() => removeSubject(index)}>
                                            <Icon name="trash-outline" size={18} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                    <TextInput
                                        style={[styles.input, { marginBottom: 10, width: '100%' }]}
                                        value={sub.name}
                                        onChangeText={(t) => updateSubject(index, 'name', t)}
                                        placeholder="Enter Subject Name"
                                        placeholderTextColor="#94a3b8"
                                    />
                                    <View style={styles.row}>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <Text style={styles.miniLabel}>Marks Obtained</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={sub.marks}
                                                onChangeText={(t) => updateSubject(index, 'marks', t)}
                                                placeholder="00"
                                                keyboardType="numeric"
                                                placeholderTextColor="#94a3b8"
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.miniLabel}>Max Marks</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={sub.maxMarks}
                                                onChangeText={(t) => updateSubject(index, 'maxMarks', t)}
                                                placeholder="100"
                                                keyboardType="numeric"
                                                placeholderTextColor="#94a3b8"
                                            />
                                        </View>
                                    </View>
                                </View>
                            ))}

                            {/* Remarks */}
                            <View style={[styles.inputGroup, { marginTop: 20 }]}>
                                <Text style={styles.label}>Teacher Remarks (Optional)</Text>
                                <TextInput
                                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                    value={remarks}
                                    onChangeText={setRemarks}
                                    placeholder="Any additional feedback..."
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Icon name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={styles.submitBtnText}>UPLOAD RESULT</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                {/* Term Modal */}
                <Modal visible={showTermPicker} transparent animationType="fade">
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTermPicker(false)}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Term</Text>
                            {['Term-1', 'Term-2', 'Mid-term', 'Final'].map(t => (
                                <TouchableOpacity key={t} style={styles.modalItem} onPress={() => { setTerm(t); setShowTermPicker(false); }}>
                                    <Text style={styles.modalItemText}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Standard Modal */}
                <Modal visible={showStandardPicker} transparent animationType="fade">
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowStandardPicker(false)}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Standard</Text>
                            {availableStandards.length > 0 ? (
                                availableStandards.map(s => (
                                    <TouchableOpacity key={s} style={styles.modalItem} onPress={() => { setStandard(s); setShowStandardPicker(false); }}>
                                        <Text style={styles.modalItemText}>{s}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.modalEmpty}>No assigned classes found.</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </Modal>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    scroll: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    subtitle: {
        fontSize: 14,
        color: '#475569',
        marginBottom: 16,
    },
    userInfoCard: {
        backgroundColor: '#eef2ff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#c7d2fe',
        marginBottom: 20,
    },
    userInfoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e7ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userInfoLabel: {
        fontSize: 12,
        color: '#4f46e5',
        fontWeight: '600',
    },
    userInfoName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    userInfoRole: {
        fontSize: 12,
        color: '#64748b',
    },
    userInfoSub: {
        fontSize: 13,
        color: '#4f46e5',
        marginTop: 4,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2563eb',
        marginBottom: 12,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: '#1e293b',
    },
    inputWrapper: {
        position: 'relative',
    },
    loaderInside: {
        position: 'absolute',
        right: 12,
        top: 12,
    },
    hintText: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 4,
        fontStyle: 'italic',
    },
    verifiedInput: {
        backgroundColor: '#f0fdf4',
        borderColor: '#86efac',
    },
    verifiedText: {
        fontSize: 11,
        color: '#16a34a',
        fontWeight: '600',
        marginTop: 4,
    },
    picker: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerText: {
        fontSize: 15,
        color: '#1e293b',
    },
    pickerPlaceholder: {
        fontSize: 15,
        color: '#94a3b8',
    },
    row: {
        flexDirection: 'row',
    },
    subjectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#eff6ff',
        borderRadius: 6,
    },
    addBtnText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#2563eb',
        marginLeft: 4,
    },
    subjectCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    subjectHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    subjectIndex: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#64748b',
    },
    miniLabel: {
        fontSize: 11,
        color: '#64748b',
        marginBottom: 4,
        fontWeight: '600',
    },
    submitBtn: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 350,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1e293b',
    },
    modalItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalItemText: {
        fontSize: 16,
        color: '#334155',
    },
    modalEmpty: {
        textAlign: 'center',
        color: '#94a3b8',
        padding: 20,
    },
});

export default UploadResultScreen;
