import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    TextInput,
    Alert,
    Modal,
    Dimensions,
    Platform,
    FlatList,
    StatusBar,
    KeyboardAvoidingView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiClient from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Period {
    _id?: string;
    timeSlot: string;
    startTime?: string;
    endTime?: string;
    subject: string;
    class: string;
    room?: string;
}

const AdminManageTimetableScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const params = route.params || {};
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    
    // State
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(params.teacherId || null);
    const [selectedTeacherName, setSelectedTeacherName] = useState<string>(params.teacherName || '');
    const [loading, setLoading] = useState(false);
    const [teachersLoading, setTeachersLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [schedule, setSchedule] = useState<any>({
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: []
    });

    // Data State
    const [teacherDetails, setTeacherDetails] = useState<any>(null);
    const [teacherList, setTeacherList] = useState<any[]>([]);

    // Modals & Forms
    const [modalVisible, setModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [form, setForm] = useState<Period>({ timeSlot: '', subject: '', class: '', room: '' });
    
    // Pickers
    const [showStartTime, setShowStartTime] = useState(false);
    const [showEndTime, setShowEndTime] = useState(false);
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [showTeacherPicker, setShowTeacherPicker] = useState(!params.teacherId);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [showSubjectPicker, setShowSubjectPicker] = useState(false);
    const [showClassPicker, setShowClassPicker] = useState(false);
    const [isManualSubject, setIsManualSubject] = useState(false);
    const [isManualClass, setIsManualClass] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (selectedTeacherId) {
            fetchTimetable(selectedTeacherId);
        } else {
            fetchTeacherList();
        }
    }, [selectedTeacherId]);

    // --- API Handlers ---

    const fetchTeacherList = async () => {
        try {
            setTeachersLoading(true);
            const res = await apiClient.get(API_ENDPOINTS.ADMIN.TEACHERS_LIST);
            setTeacherList(res.data);
            if (!selectedTeacherId) setShowTeacherPicker(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to load teachers list');
            navigation.goBack();
        } finally {
            setTeachersLoading(false);
        }
    };

    const fetchTimetable = async (tid: string) => {
        setLoading(true);
        try {
            const res = await apiClient.get(API_ENDPOINTS.TIMETABLE.ADMIN(tid));
            if (res.data) {
                if (res.data.timetable) setSchedule(res.data.timetable.schedule);
                if (res.data.teacher) {
                    setTeacherDetails(res.data.teacher);
                    if (!selectedTeacherName) setSelectedTeacherName(res.data.teacher.name);
                }
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Failed to load timetable data";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedTeacherId) {
            Alert.alert("Error", "Please select a teacher first.");
            setShowTeacherPicker(true);
            return;
        }
        try {
            setSaving(true);
            await apiClient.post(API_ENDPOINTS.TIMETABLE.ADMIN(selectedTeacherId), {
                schedule,
                academicYear: '2024-25'
            });
            Alert.alert('Success', 'Timetable saved successfully');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to save timetable';
            Alert.alert('Error', msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (type: 'day' | 'all') => {
        if (!selectedTeacherId) return;
        Alert.alert(
            type === 'day' ? `Clear ${selectedDay}?` : 'Delete Entire Timetable?',
            type === 'day' 
                ? `Remove all classes for ${selectedDay}?` 
                : `Permanently delete all schedule data for ${selectedTeacherName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsDeleting(true);
                            if (type === 'day') {
                                await apiClient.post(API_ENDPOINTS.TIMETABLE.ADMIN(selectedTeacherId), {
                                    schedule: { [selectedDay]: [] }
                                });
                                setSchedule((prev: any) => ({ ...prev, [selectedDay]: [] }));
                                Alert.alert('Success', `Schedule for ${selectedDay} cleared.`);
                            } else {
                                await apiClient.delete(API_ENDPOINTS.TIMETABLE.ADMIN(selectedTeacherId));
                                setSchedule({ Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [] });
                                Alert.alert('Success', 'Entire timetable deleted.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete data.');
                        } finally {
                            setIsDeleting(false);
                            setShowDeleteModal(false);
                        }
                    }
                }
            ]
        );
    };

    // --- Helpers ---

    const getSubjectColor = (subject: string) => {
        const colors: any = {
            'Mathematics': '#3b82f6', 'Maths': '#3b82f6',
            'English': '#8b5cf6', 'Science': '#10b981',
            'History': '#f59e0b', 'Geography': '#06b6d4',
            'Physics': '#ef4444', 'Chemistry': '#ec4899', 'Biology': '#22c55e',
        };
        if (colors[subject]) return colors[subject];
        let hash = 0;
        for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 70%, 45%)`;
    };

    const commitSave = () => {
        const newSchedule = { ...schedule };
        if (!newSchedule[selectedDay]) newSchedule[selectedDay] = [];

        if (editingIndex !== null) {
            newSchedule[selectedDay][editingIndex] = form;
        } else {
            newSchedule[selectedDay].push(form);
        }
        // Sort
        newSchedule[selectedDay].sort((a: Period, b: Period) => {
            const ta = a.startTime || a.timeSlot.split('-')[0].trim();
            const tb = b.startTime || b.timeSlot.split('-')[0].trim();
            return ta.localeCompare(tb);
        });
        setSchedule(newSchedule);
        setModalVisible(false);
    };

    const checkOverlaps = (newPeriod: Period, currentIndex: number | null) => {
        // Logic remains same... simplified for brevity in thought but kept in code
        // ... (existing logic)
        // For this rewrite I'll include the logic inline to be safe
        const dayPeriods = schedule[selectedDay];
        const newStart = newPeriod.startTime || newPeriod.timeSlot.split('-')[0].trim();
        const newEnd = newPeriod.endTime || newPeriod.timeSlot.split('-')[1]?.trim();
        if (!newStart || !newEnd) return false;
        
        const parseTime = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };
        const ns = parseTime(newStart);
        const ne = parseTime(newEnd);

        for (let i = 0; i < dayPeriods.length; i++) {
            if (currentIndex !== null && i === currentIndex) continue;
            const p = dayPeriods[i];
            const ps = parseTime(p.startTime || p.timeSlot.split('-')[0].trim());
            const pe = parseTime(p.endTime || p.timeSlot.split('-')[1]?.trim());
            if ((ns >= ps && ns < pe) || (ne > ps && ne <= pe) || (ns <= ps && ne >= pe)) return true;
        }
        return false;
    };

    const savePeriod = () => {
        if (!form.timeSlot || !form.subject || !form.class) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }
        if (checkOverlaps(form, editingIndex)) {
            Alert.alert('Time Conflict', 'Overwrite overlapping period?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Save', onPress: () => commitSave() }
            ]);
        } else {
            commitSave();
        }
    };

    const openModal = (index: number | null = null) => {
        if (index !== null) {
            const period = schedule[selectedDay][index];
            setForm(period);
            setEditingIndex(index);
            // Time parsing logic...
             if (period.timeSlot) {
                const parts = period.timeSlot.split('-');
                if (parts.length === 2) {
                    const sTime = new Date();
                    const [sH, sM] = parts[0].trim().split(':');
                    sTime.setHours(parseInt(sH) || 8, parseInt(sM) || 0);
                    const eTime = new Date();
                    const [eH, eM] = parts[1].trim().split(':');
                    eTime.setHours(parseInt(eH) || 9, parseInt(eM) || 0);
                    setStartTime(sTime);
                    setEndTime(eTime);
                }
            }
        } else {
            setForm({ timeSlot: '', subject: '', class: '', room: '' });
            setEditingIndex(null);
            const s = new Date(); s.setHours(8, 0, 0, 0); 
            const e = new Date(); e.setHours(9, 0, 0, 0);
            setStartTime(s); setEndTime(e);
        }
        setModalVisible(true);
    };

    const updateTimeSlot = (s: Date, e: Date) => {
        const format = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const slot = `${format(s)} - ${format(e)}`;
        setForm(prev => ({ ...prev, timeSlot: slot, startTime: format(s), endTime: format(e) }));
    };

    // --- UI Components ---

    const renderHeader = () => (
        <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                <Icon name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
                <Text style={[styles.headerOverline, { color: theme.colors.textTertiary }]}>MANAGE TIMETABLE</Text>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
                    {selectedTeacherName || 'Select Teacher'}
                </Text>
            </View>

            <View style={styles.headerActions}>
                {selectedTeacherId && (
                    <>
                        <TouchableOpacity style={[styles.iconButton, { marginRight: 8 }]} onPress={() => setShowDeleteModal(true)}>
                            <Icon name="trash-outline" size={22} color={theme.colors.error} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.saveButton, { backgroundColor: theme.colors.primary }, saving && { opacity: 0.7 }]} 
                            onPress={handleSave} 
                            disabled={saving}
                        >
                            {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );

    const renderDayStrip = () => (
        <View style={styles.dayStripContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayStripContent}>
                {DAYS.map(day => {
                    const isActive = selectedDay === day;
                    return (
                        <TouchableOpacity 
                            key={day} 
                            style={[styles.dayChip, isActive && styles.dayChipActive]} 
                            onPress={() => setSelectedDay(day)}
                        >
                            <Text style={[styles.dayChipText, isActive && styles.dayChipTextActive]}>
                                {day.substring(0, 3)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );

    const renderContent = () => (
        <View style={styles.contentContainer}>
            <View style={styles.dayHeader}>
                <View>
                    <Text style={styles.dayHeaderTitle}>{selectedDay}</Text>
                    <Text style={styles.dayHeaderSubtitle}>{schedule[selectedDay].length} Classes</Text>
                </View>
                <View style={styles.dayActions}>
                     <TouchableOpacity style={styles.secondaryActionBtn} onPress={() => setShowCopyModal(true)}>
                        <Icon name="copy-outline" size={18} color={'#2563eb'} />
                        <Text style={styles.secondaryActionText}>Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.primaryActionBtn} onPress={() => openModal()}>
                        <Icon name="add" size={20} color="#fff" />
                        <Text style={styles.primaryActionText}>Add Class</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {schedule[selectedDay].length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconContainer}>
                         <Icon name="school-outline" size={48} color={'#64748b'} />
                    </View>
                    <Text style={styles.emptyTitle}>No classes scheduled</Text>
                    <Text style={styles.emptySubtitle}>Tap "Add Class" to start building the schedule.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                    {schedule[selectedDay].map((period: Period, index: number) => {
                        const color = getSubjectColor(period.subject);
                        return (
                            <View key={index} style={styles.card}>
                                <View style={[styles.cardAccent, { backgroundColor: color }]} />
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.timeContainer}>
                                            <Icon name="time-outline" size={14} color={'#64748b'} />
                                            <Text style={styles.timeText}>{period.timeSlot}</Text>
                                        </View>
                                        {period.room && (
                                            <View style={styles.roomBadge}>
                                                <Text style={styles.roomText}>Rm {period.room}</Text>
                                            </View>
                                        )}
                                    </View>
                                    
                                    <Text style={styles.subjectText}>{period.subject}</Text>
                                    <Text style={styles.classText}>Class: {period.class}</Text>
                                </View>
                                
                                <View style={styles.cardActions}>
                                    <TouchableOpacity style={styles.actionIcon} onPress={() => openModal(index)}>
                                        <Icon name="pencil" size={18} color={'#475569'} />
                                    </TouchableOpacity>
                                    <View style={styles.divider} />
                                    <TouchableOpacity style={styles.actionIcon} onPress={() => {
                                        Alert.alert('Delete', 'Remove period?', [
                                            { text: 'Cancel' },
                                            { text: 'Delete', style: 'destructive', onPress: () => {
                                                const ns = { ...schedule };
                                                ns[selectedDay].splice(index, 1);
                                                setSchedule(ns);
                                            }}
                                        ]);
                                    }}>
                                        <Icon name="trash-outline" size={18} color={'#ef4444'} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary}/></View>;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.surface} translucent />
            <View style={[styles.statusBarSpacer, { backgroundColor: theme.colors.surface }]} />
            {renderHeader()}
            {renderDayStrip()}
            {renderContent()}

            {/* Modals area - simplified for brevity, mostly same structure but better styles */}
             <Modal visible={modalVisible} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingIndex !== null ? 'Edit Class' : 'New Class'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={24} color={'#64748b'} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView>
                            <Text style={styles.label}>Time Duration</Text>
                            <View style={styles.row}>
                                <TouchableOpacity style={styles.timeInput} onPress={() => setShowStartTime(true)}>
                                    <Text style={styles.inputValue}>{startTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})}</Text>
                                </TouchableOpacity>
                                <Icon name="arrow-forward" size={16} color={'#64748b'} />
                                <TouchableOpacity style={styles.timeInput} onPress={() => setShowEndTime(true)}>
                                    <Text style={styles.inputValue}>{endTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})}</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Subject</Text>
                            {!isManualSubject ? (
                                <TouchableOpacity style={styles.selectInput} onPress={() => setShowSubjectPicker(true)}>
                                    <Text style={form.subject ? styles.inputValue : styles.placeholder}>{form.subject || 'Select Subject'}</Text>
                                    <Icon name="chevron-down" size={20} color={'#64748b'} />
                                </TouchableOpacity>
                            ) : (
                                <TextInput style={styles.textInput} value={form.subject} onChangeText={t => setForm({...form, subject: t})} placeholder="Enter Subject" />
                            )}
                            <TouchableOpacity onPress={() => setIsManualSubject(!isManualSubject)}>
                                <Text style={styles.linkText}>{isManualSubject ? 'Select from list' : 'Type manually'}</Text>
                            </TouchableOpacity>

                            <Text style={styles.label}>Class</Text>
                             {!isManualClass ? (
                                <TouchableOpacity style={styles.selectInput} onPress={() => setShowClassPicker(true)}>
                                    <Text style={form.class ? styles.inputValue : styles.placeholder}>{form.class || 'Select Class'}</Text>
                                    <Icon name="chevron-down" size={20} color={'#64748b'} />
                                </TouchableOpacity>
                            ) : (
                                <TextInput style={styles.textInput} value={form.class} onChangeText={t => setForm({...form, class: t})} placeholder="Enter Class" />
                            )}
                             <TouchableOpacity onPress={() => setIsManualClass(!isManualClass)}>
                                <Text style={styles.linkText}>{isManualClass ? 'Select from list' : 'Type manually'}</Text>
                            </TouchableOpacity>

                            <Text style={styles.label}>Room (Optional)</Text>
                            <TextInput style={styles.textInput} value={form.room} onChangeText={t => setForm({...form, room: t})} placeholder="e.g. 101" />
                        
                             {/* Date pickers logic */}
                            {showStartTime && <DateTimePicker value={startTime} mode="time" is24Hour onChange={(e, d) => { setShowStartTime(false); if(d) { setStartTime(d); updateTimeSlot(d, endTime); } }} />}
                            {showEndTime && <DateTimePicker value={endTime} mode="time" is24Hour onChange={(e, d) => { setShowEndTime(false); if(d) { setEndTime(d); updateTimeSlot(startTime, d); } }} />}
                        </ScrollView>

                        <TouchableOpacity style={styles.submitBtn} onPress={savePeriod}>
                            <Text style={styles.submitBtnText}>Save Class</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

             {/* Pickers (Subject/Class) Reuse similar styles */}
             <Modal visible={showSubjectPicker} transparent animationType="fade">
                  <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowSubjectPicker(false)}>
                      <View style={styles.pickerDialog}>
                          <Text style={styles.pickerTitle}>Subjects</Text>
                          <ScrollView style={{maxHeight: 300}}>
                              {teacherDetails?.subjects?.map((s: string, i: number) => (
                                  <TouchableOpacity key={i} style={styles.pickerRow} onPress={() => {setForm({...form, subject: s}); setShowSubjectPicker(false);}}>
                                      <Text style={styles.pickerText}>{s}</Text>
                                  </TouchableOpacity>
                              ))}
                          </ScrollView>
                      </View>
                  </TouchableOpacity>
             </Modal>
             <Modal visible={showClassPicker} transparent animationType="fade">
                  <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowClassPicker(false)}>
                      <View style={styles.pickerDialog}>
                          <Text style={styles.pickerTitle}>Classes</Text>
                          <ScrollView style={{maxHeight: 300}}>
                              {teacherDetails?.assignedClasses?.map((c: string, i: number) => (
                                  <TouchableOpacity key={i} style={styles.pickerRow} onPress={() => {setForm({...form, class: c}); setShowClassPicker(false);}}>
                                      <Text style={styles.pickerText}>{c}</Text>
                                  </TouchableOpacity>
                              ))}
                          </ScrollView>
                      </View>
                  </TouchableOpacity>
             </Modal>

              {/* Copy Modal */}
            <Modal visible={showCopyModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.dialogCard}>
                        <Text style={styles.dialogTitle}>Copy Schedule</Text>
                        <Text style={styles.dialogDesc}>Copy {selectedDay}'s schedule from:</Text>
                        {DAYS.filter(d => d !== selectedDay).map(d => (
                            <TouchableOpacity key={d} style={styles.pickerRow} onPress={() => {
                                const ns = {...schedule};
                                ns[selectedDay] = [...schedule[d]];
                                setSchedule(ns);
                                setShowCopyModal(false);
                            }}>
                                <Text style={styles.pickerText}>{d}</Text>
                                <Text style={styles.metaText}>{schedule[d].length} classes</Text>
                            </TouchableOpacity>
                        ))}
                         <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCopyModal(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Delete Modal */}
             <Modal visible={showDeleteModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.dialogCard}>
                        <Text style={styles.dialogTitle}>Delete Options</Text>
                        <TouchableOpacity style={styles.deleteOption} onPress={() => {setShowDeleteModal(false); setTimeout(() => handleDelete('day'), 300);}}>
                            <View style={[styles.iconBox, {backgroundColor: '#fee2e2'}]}><Icon name="calendar" size={20} color={'#ef4444'}/></View>
                            <View style={{flex: 1}}><Text style={styles.deleteOptionTitle}>Clear {selectedDay}</Text><Text style={styles.deleteOptionDesc}>Remove classes for this day</Text></View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteOption} onPress={() => {setShowDeleteModal(false); setTimeout(() => handleDelete('all'), 300);}}>
                             <View style={[styles.iconBox, {backgroundColor: '#fee2e2'}]}><Icon name="trash" size={20} color={'#ef4444'}/></View>
                             <View style={{flex: 1}}><Text style={styles.deleteOptionTitle}>Delete All</Text><Text style={styles.deleteOptionDesc}>Clear entire timetable</Text></View>
                        </TouchableOpacity>
                         <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDeleteModal(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
             {/* Teacher Picker */}
             <Modal visible={showTeacherPicker && !selectedTeacherId} transparent animationType="slide">
                <View style={styles.fullScreenModal}>
                    <SafeAreaView style={{flex: 1}}>
                        <View style={styles.header}>
                             <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="close" size={24} color={'#0f172a'}/></TouchableOpacity>
                             <Text style={styles.headerTitle}>Select Teacher</Text>
                             <View style={{width: 24}}/>
                        </View>
                        <FlatList 
                            data={teacherList}
                            keyExtractor={item => item._id}
                            renderItem={({item}) => (
                                <TouchableOpacity style={styles.teacherRow} onPress={() => {setSelectedTeacherId(item._id); setSelectedTeacherName(item.name); setShowTeacherPicker(false);}}>
                                    <View style={styles.avatar}><Text style={styles.avatarText}>{item.name[0]}</Text></View>
                                    <View><Text style={styles.teacherName}>{item.name}</Text><Text style={styles.teacherId}>{item.employeeId}</Text></View>
                                </TouchableOpacity>
                            )}
                        />
                    </SafeAreaView>
                </View>
             </Modal>
        </View>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: { flex: 1 },
    statusBarSpacer: { height: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    // Header
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
    headerContent: { flex: 1, paddingHorizontal: 12 },
    headerOverline: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    iconButton: { padding: 4 },
    saveButton: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    saveButtonText: { color: theme.colors.surface, fontWeight: '600', fontSize: 13 },

    // Day Strip
    dayStripContainer: { backgroundColor: theme.colors.surface, paddingVertical: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, zIndex: 1 },
    dayStripContent: { paddingHorizontal: 16, gap: 8 },
    dayChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border },
    dayChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    dayChipText: { color: theme.colors.textSecondary, fontWeight: '600', fontSize: 13 },
    dayChipTextActive: { color: theme.colors.surface },

    // Content
    contentContainer: { flex: 1, padding: 16 },
    dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    dayHeaderTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
    dayHeaderSubtitle: { fontSize: 13, color: theme.colors.textSecondary },
    dayActions: { flexDirection: 'row', gap: 10 },
    primaryActionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.text, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
    primaryActionText: { color: theme.colors.surface, fontWeight: '600', fontSize: 13 },
    secondaryActionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.isDark ? theme.colors.primary + '20' : '#eef2ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
    secondaryActionText: { color: theme.colors.primary, fontWeight: '600', fontSize: 13 },

    // Cards
    card: { flexDirection: 'row', backgroundColor: theme.colors.card, borderRadius: 12, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    cardAccent: { width: 4 },
    cardContent: { flex: 1, padding: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    timeContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timeText: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
    roomBadge: { backgroundColor: theme.colors.background, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    roomText: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: '600' },
    subjectText: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
    classText: { fontSize: 13, color: theme.colors.textSecondary },
    
    cardActions: { justifyContent: 'space-between', padding: 8, borderLeftWidth: 1, borderLeftColor: theme.colors.border, alignItems: 'center' },
    actionIcon: { padding: 8 },
    divider: { height: 1, width: 20, backgroundColor: theme.colors.border },

    // Empty
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', maxWidth: 250 },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: theme.colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
    label: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    timeInput: { flex: 1, backgroundColor: theme.colors.background, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
    selectInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.background, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border },
    textInput: {  backgroundColor: theme.colors.background, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, fontSize: 16, color: theme.colors.text },
    inputValue: { fontSize: 16, color: theme.colors.text, fontWeight: '500' },
    placeholder: { fontSize: 16, color: theme.colors.textSecondary },
    linkText: { color: theme.colors.primary, fontWeight: '600', marginTop: 6, marginBottom: 20, textAlign: 'right', fontSize: 12 },
    submitBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 12 },
    submitBtnText: { color: theme.colors.surface, fontWeight: '700', fontSize: 16 },

    // Dialogs
    dialogCard: { backgroundColor: theme.colors.card, borderRadius: 20, padding: 24, margin: 24, alignSelf: 'center', width: '85%' },
    dialogTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 8 },
    dialogDesc: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 16 },
    pickerDialog: { backgroundColor: theme.colors.card, borderRadius: 16, margin: 24, padding: 16, maxHeight: '60%' },
    pickerRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, flexDirection: 'row', justifyContent: 'space-between' },
    pickerText: { fontSize: 16, color: theme.colors.text },
    pickerTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    metaText: { fontSize: 12, color: theme.colors.textSecondary },
    cancelBtn: { marginTop: 16, alignItems: 'center' },
    cancelBtnText: { color: theme.colors.textSecondary, fontWeight: '600' },
    
    // Delete
    deleteOption: { flexDirection: 'row', padding: 12, alignItems: 'center', marginBottom: 8, backgroundColor: theme.colors.background, borderRadius: 12 },
    deleteOptionTitle: { fontSize: 15, fontWeight: '600', color: '#ef4444' },
    deleteOptionDesc: { fontSize: 12, color: theme.colors.textSecondary },
    iconBox: { padding: 8, borderRadius: 8, marginRight: 12 },

    // Teacher Picker
    fullScreenModal: { flex: 1, backgroundColor: theme.colors.background },
    teacherRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, alignItems: 'center' },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.isDark ? theme.colors.primary + '20' : '#dbeafe', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: theme.colors.primary, fontSize: 18, fontWeight: '700' },
    teacherName: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
    teacherId: { fontSize: 12, color: theme.colors.textSecondary }
});

export default AdminManageTimetableScreen;
