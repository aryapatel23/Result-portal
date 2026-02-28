import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  StatusBar, TextInput, StyleSheet, ActivityIndicator, Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AdminTimetableScreenNew = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [timetable, setTimetable] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<any>(null);
  const [periodForm, setPeriodForm] = useState({ subject: '', class: '', startTime: '', endTime: '' });
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [viewMode, setViewMode] = useState<'list' | 'timetable'>('list');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await apiService.getAllTeachers();
      const list = Array.isArray(res) ? res : res?.data || [];
      setTeachers(list);
    } catch (e: any) {
      if (__DEV__) console.log('Teachers fetch err:', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectTeacher = async (t: any) => {
    setSelectedTeacher(t);
    setViewMode('timetable');
    setIsLoading(true);
    try {
      const res = await apiService.getAdminTeacherTimetable(t._id);
      // Backend returns: { timetable: { schedule: { Monday: [...], ... } }, teacher: {...} }
      const timetableData = res?.timetable || res?.data?.timetable || {};
      const schedule = timetableData?.schedule || res?.schedule || res?.data || {};
      const teacher = res?.teacher || {};
      
      // Store teacher info for dropdowns
      setTeacherInfo({
        subjects: teacher.subjects || t.subjects || [],
        assignedClasses: teacher.assignedClasses || t.assignedClasses || []
      });
      
      const normalized: any = {};
      DAYS.forEach(day => {
        if (schedule[day] && Array.isArray(schedule[day])) {
          normalized[day] = schedule[day].map((p: any) => {
            const startTime = p.startTime || '';
            const endTime = p.endTime || '';
            const timeSlot = p.timeSlot || (startTime && endTime ? `${startTime} - ${endTime}` : '');
            
            return {
              subject: p.subject || '',
              class: p.class || p.standard || '',
              startTime: startTime,
              endTime: endTime,
              timeSlot: timeSlot,
            };
          });
        } else {
          normalized[day] = [];
        }
      });
      setTimetable(normalized);
    } catch (e: any) {
      if (__DEV__) console.log('Timetable load err:', e.message);
      const empty: any = {};
      DAYS.forEach(d => { empty[d] = []; });
      setTimetable(empty);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditPeriod = (day: string, periodIdx: number) => {
    const period = timetable[day][periodIdx];
    setEditingPeriod({ day, periodIdx, isNew: false });
    setPeriodForm({ 
      subject: period.subject || '', 
      class: period.class || '',
      startTime: period.startTime || '',
      endTime: period.endTime || '',
    });
    setShowModal(true);
  };

  const openAddPeriod = (day: string) => {
    setEditingPeriod({ day, periodIdx: -1, isNew: true });
    setPeriodForm({ subject: '', class: '', startTime: '', endTime: '' });
    setShowModal(true);
  };

  const handleSavePeriod = () => {
    if (!editingPeriod) return;
    if (!periodForm.subject.trim()) {
      Alert.alert('Missing Subject', 'Please enter subject name');
      return;
    }
    if (!periodForm.class.trim()) {
      Alert.alert('Missing Class', 'Please select a class');
      return;
    }
    if (!periodForm.startTime.trim() || !periodForm.endTime.trim()) {
      Alert.alert('Missing Time', 'Please select start and end time');
      return;
    }
    
    const { day, periodIdx, isNew } = editingPeriod;
    
    // Create timeSlot in format "HH:MM - HH:MM"
    const timeSlot = `${periodForm.startTime} - ${periodForm.endTime}`;
    
    setTimetable((prev: any) => {
      const daySchedule = [...(prev[day] || [])];
      const periodData = {
        subject: periodForm.subject,
        class: periodForm.class,
        startTime: periodForm.startTime,
        endTime: periodForm.endTime,
        timeSlot: timeSlot,
      };
      
      if (isNew) {
        daySchedule.push(periodData);
      } else {
        daySchedule[periodIdx] = periodData;
      }
      return { ...prev, [day]: daySchedule };
    });
    setShowModal(false);
    setEditingPeriod(null);
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    }
    if (selectedTime) {
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setPeriodForm(p => ({ ...p, startTime: formattedTime }));
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
    }
    if (selectedTime) {
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setPeriodForm(p => ({ ...p, endTime: formattedTime }));
    }
  };

  const parseTimeToDate = (timeStr: string): Date => {
    const date = new Date();
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':');
      date.setHours(parseInt(hours) || 0);
      date.setMinutes(parseInt(minutes) || 0);
    }
    return date;
  };

  const handleDeletePeriod = (day: string, periodIdx: number) => {
    Alert.alert('Delete Period', 'Delete this period permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setTimetable((prev: any) => ({
            ...prev,
            [day]: prev[day].filter((_: any, i: number) => i !== periodIdx),
          }));
        },
      },
    ]);
  };

  const handleDeleteDay = (day: string) => {
    Alert.alert('Delete Day Schedule', `Delete entire ${day} schedule?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setTimetable((prev: any) => ({ ...prev, [day]: [] }));
        },
      },
    ]);
  };

  const handleDeleteEntireTimetable = () => {
    Alert.alert('Delete Entire Timetable', `Delete all timetable data for ${selectedTeacher?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiService.deleteAdminTeacherTimetable(selectedTeacher._id);
            Alert.alert('Success', 'Timetable deleted successfully');
            setViewMode('list');
            setSelectedTeacher(null);
            fetchTeachers();
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const handleSaveTimetable = async () => {
    if (!selectedTeacher) return;
    setSaving(true);
    try {
      await apiService.saveAdminTeacherTimetable(selectedTeacher._id, { schedule: timetable });
      Alert.alert('✅ Success', `Timetable saved for ${selectedTeacher.name}`);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to save timetable');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && viewMode === 'list') {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>
          Loading teachers...
        </Text>
      </View>
    );
  }

  // Teacher List View
  if (viewMode === 'list') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Manage Timetables</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
          <MaterialCommunityIcons name="calendar-clock" size={40} color="#FFF" />
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={styles.bannerTitle}>Teacher Timetables</Text>
            <Text style={styles.bannerDesc}>Select a teacher to manage their schedule</Text>
          </View>
        </View>

        {/* Teacher List */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Teachers ({teachers.length})
          </Text>
          
          {teachers.length === 0 ? (
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons name="account-group-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>No Teachers Found</Text>
              <Text style={[styles.emptyDesc, { color: theme.colors.textTertiary }]}>Create teachers first to manage timetables</Text>
            </View>
          ) : (
            teachers.map((teacher, idx) => (
              <TouchableOpacity
                key={teacher._id || idx}
                style={[styles.teacherCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}
                onPress={() => selectTeacher(teacher)}
              >
                <View style={[styles.teacherAvatar, { backgroundColor: theme.colors.primaryLight }]}>
                  <MaterialCommunityIcons name="account" size={28} color={theme.colors.primary} />
                </View>
                <View style={styles.teacherInfo}>
                  <Text style={[styles.teacherName, { color: theme.colors.text }]}>{teacher.name}</Text>
                  {teacher.employeeId && (
                    <Text style={[styles.teacherMeta, { color: theme.colors.textTertiary }]}>ID: {teacher.employeeId}</Text>
                  )}
                  {teacher.subjects && teacher.subjects.length > 0 && (
                    <Text style={[styles.teacherSubjects, { color: theme.colors.textSecondary }]}>
                      {teacher.subjects.slice(0, 3).join(', ')}
                      {teacher.subjects.length > 3 && ' +more'}
                    </Text>
                  )}
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Timetable View

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity 
          onPress={() => {
            setViewMode('list');
            setSelectedTeacher(null);
          }} 
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {selectedTeacher?.name}
        </Text>
        <TouchableOpacity
          onPress={handleDeleteEntireTimetable}
          style={styles.deleteAllBtn}
        >
          <MaterialCommunityIcons name="delete-outline" size={22} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      {/* Day Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayTabsScroll}
        contentContainerStyle={styles.dayTabs}
      >
        {DAYS.map(day => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayTab,
              {
                backgroundColor:
                  selectedDay === day ? theme.colors.primary : theme.colors.card,
                borderColor:
                  selectedDay === day ? theme.colors.primary : theme.colors.borderLight,
              },
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                styles.dayTabText,
                { color: selectedDay === day ? '#FFF' : theme.colors.text },
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Timetable for Selected Day */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Day Header with Delete */}
            <View style={styles.dayHeader}>
              <View
                style={[
                  styles.dayBanner,
                  { backgroundColor: theme.colors.primaryLight },
                ]}
              >
                <MaterialCommunityIcons
                  name="calendar-today"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={[styles.dayBannerText, { color: theme.colors.primary }]}>
                  {selectedDay} Schedule
                </Text>
              </View>
              {timetable[selectedDay]?.length > 0 && (
                <TouchableOpacity
                  style={[styles.deleteDayBtn, { backgroundColor: theme.colors.errorLight }]}
                  onPress={() => handleDeleteDay(selectedDay)}
                >
                  <MaterialCommunityIcons name="delete" size={16} color={theme.colors.error} />
                  <Text style={[styles.deleteDayText, { color: theme.colors.error }]}>Clear Day</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Periods */}
            {(timetable[selectedDay] || []).length === 0 ? (
              <View style={styles.emptyWrap}>
                <MaterialCommunityIcons name="calendar-blank-outline" size={48} color={theme.colors.textTertiary} />
                <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>No Periods Added</Text>
                <Text style={[styles.emptyDesc, { color: theme.colors.textTertiary }]}>Tap 'Add Period' to create schedule</Text>
              </View>
            ) : (
              (timetable[selectedDay] || []).map((period: any, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.periodCard,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.borderLight,
                    },
                  ]}
                >
                  <View style={styles.periodCardLeft}>
                    <View
                      style={[
                        styles.periodBadge,
                        { backgroundColor: theme.colors.primaryLight },
                      ]}
                    >
                      <Text style={[styles.periodBadgeText, { color: theme.colors.primary }]}>
                        Period {idx + 1}
                      </Text>
                    </View>
                    <View style={styles.periodInfo}>
                      <Text style={[styles.periodSubject, { color: theme.colors.text }]}>
                        {period.subject || 'No Subject'}
                      </Text>
                      <Text
                        style={[styles.periodClass, { color: theme.colors.textSecondary }]}
                      >
                        Class {period.class || 'Not assigned'}
                      </Text>
                      {(period.startTime || period.endTime) && (
                        <Text
                          style={[styles.periodTime, { color: theme.colors.textTertiary }]}
                        >
                          {period.startTime || '--:--'} - {period.endTime || '--:--'}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.periodActions}>
                    <TouchableOpacity
                      style={[
                        styles.periodActionBtn,
                        { backgroundColor: theme.colors.primaryLight },
                      ]}
                      onPress={() => openEditPeriod(selectedDay, idx)}
                    >
                      <MaterialCommunityIcons
                        name="pencil"
                        size={16}
                        color={theme.colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.periodActionBtn,
                        { backgroundColor: theme.colors.errorLight },
                      ]}
                      onPress={() => handleDeletePeriod(selectedDay, idx)}
                    >
                      <MaterialCommunityIcons
                        name="delete"
                        size={16}
                        color={theme.colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {/* Add Period Button */}
            <TouchableOpacity
              style={[styles.addPeriodBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => openAddPeriod(selectedDay)}
            >
              <MaterialCommunityIcons name="plus-circle" size={20} color="#FFF" />
              <Text style={styles.addPeriodText}>Add Period</Text>
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveTimetableBtn, { backgroundColor: theme.colors.success }]}
              onPress={handleSaveTimetable}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save" size={20} color="#FFF" />
                  <Text style={styles.saveTimetableText}>Save Timetable</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit/Add Period Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {editingPeriod?.isNew ? 'Add New Period' : `Edit Period ${editingPeriod?.periodIdx + 1}`}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalLabel, { color: theme.colors.textSecondary }]}>
              Subject *
            </Text>
            <TouchableOpacity
              style={[
                styles.modalInput,
                styles.pickerButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.borderLight,
                },
              ]}
              onPress={() => setShowSubjectPicker(true)}
            >
              <Text
                style={[
                  styles.pickerButtonText,
                  { color: periodForm.subject ? theme.colors.text : theme.colors.textTertiary },
                ]}
              >
                {periodForm.subject || 'Select subject'}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <Text style={[styles.modalLabel, { color: theme.colors.textSecondary }]}>
              Class
            </Text>
            <TouchableOpacity
              style={[
                styles.modalInput,
                styles.pickerButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.borderLight,
                },
              ]}
              onPress={() => setShowClassPicker(true)}
            >
              <Text
                style={[
                  styles.pickerButtonText,
                  { color: periodForm.class ? theme.colors.text : theme.colors.textTertiary },
                ]}
              >
                {periodForm.class || 'Select class'}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.modalRow}>
              <View style={styles.modalHalf}>
                <Text style={[styles.modalLabel, { color: theme.colors.textSecondary }]}>
                  Start Time
                </Text>
                <TouchableOpacity
                  style={[
                    styles.modalInput,
                    styles.pickerButton,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.borderLight,
                    },
                  ]}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      { color: periodForm.startTime ? theme.colors.text : theme.colors.textTertiary },
                    ]}
                  >
                    {periodForm.startTime || 'Select time'}
                  </Text>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.modalHalf}>
                <Text style={[styles.modalLabel, { color: theme.colors.textSecondary }]}>
                  End Time
                </Text>
                <TouchableOpacity
                  style={[
                    styles.modalInput,
                    styles.pickerButton,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.borderLight,
                    },
                  ]}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      { color: periodForm.endTime ? theme.colors.text : theme.colors.textTertiary },
                    ]}
                  >
                    {periodForm.endTime || 'Select time'}
                  </Text>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.modalSaveBtn, { backgroundColor: theme.colors.primary }]}
              onPress={handleSavePeriod}
            >
              <Text style={styles.modalSaveBtnText}>
                {editingPeriod?.isNew ? 'Add Period' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Subject Picker Modal */}
      <Modal visible={showSubjectPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerModal, { backgroundColor: theme.colors.background }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: theme.colors.text }]}>Select Subject</Text>
              <TouchableOpacity onPress={() => setShowSubjectPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              {(teacherInfo?.subjects || []).length === 0 ? (
                <Text style={[styles.emptyPickerText, { color: theme.colors.textSecondary }]}>
                  No subjects assigned to this teacher
                </Text>
              ) : (
                (teacherInfo?.subjects || []).map((subject: string, idx: number) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.pickerItem,
                      { borderBottomColor: theme.colors.border },
                      periodForm.subject === subject && { backgroundColor: theme.colors.primaryLight },
                    ]}
                    onPress={() => {
                      setPeriodForm(p => ({ ...p, subject }));
                      setShowSubjectPicker(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, { color: theme.colors.text }]}>
                      {subject}
                    </Text>
                    {periodForm.subject === subject && (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Class Picker Modal */}
      <Modal visible={showClassPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerModal, { backgroundColor: theme.colors.background }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: theme.colors.text }]}>Select Class</Text>
              <TouchableOpacity onPress={() => setShowClassPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              {(teacherInfo?.assignedClasses || []).length === 0 ? (
                <Text style={[styles.emptyPickerText, { color: theme.colors.textSecondary }]}>
                  No classes assigned to this teacher
                </Text>
              ) : (
                (teacherInfo?.assignedClasses || []).map((cls: string, idx: number) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.pickerItem,
                      { borderBottomColor: theme.colors.border },
                      periodForm.class === cls && { backgroundColor: theme.colors.primaryLight },
                    ]}
                    onPress={() => {
                      setPeriodForm(p => ({ ...p, class: cls }));
                      setShowClassPicker(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, { color: theme.colors.text }]}>
                      Class {cls}
                    </Text>
                    {periodForm.class === cls && (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Pickers */}
      {showStartTimePicker && (
        <DateTimePicker
          value={parseTimeToDate(periodForm.startTime)}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleStartTimeChange}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={parseTimeToDate(periodForm.endTime)}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleEndTimeChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, fontWeight: '500' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  deleteAllBtn: { padding: 4 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    gap: 14,
  },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 2 },
  bannerDesc: { fontSize: 13, fontWeight: '500', color: '#FFF', opacity: 0.9 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12, marginTop: 4 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptyDesc: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 14,
  },
  teacherAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teacherInfo: { flex: 1 },
  teacherName: { fontSize: 16, fontWeight: '700', marginBottom: 3 },
  teacherMeta: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  teacherSubjects: { fontSize: 12, fontWeight: '500' },
  dayTabsScroll: { maxHeight: 50, flexGrow: 0 },
  dayTabs: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  dayTabText: { fontSize: 13, fontWeight: '700' },
  content: { padding: 16 },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  dayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    flex: 1,
  },
  dayBannerText: { fontSize: 15, fontWeight: '800' },
  deleteDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  deleteDayText: { fontSize: 12, fontWeight: '700' },
  periodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  periodCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  periodBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  periodBadgeText: { fontSize: 11, fontWeight: '800' },
  periodInfo: { flex: 1 },
  periodSubject: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  periodClass: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
  periodTime: { fontSize: 11, fontWeight: '600' },
  periodActions: { flexDirection: 'row', gap: 8 },
  periodActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPeriodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  addPeriodText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  saveTimetableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 10,
  },
  saveTimetableText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  modalRow: { flexDirection: 'row', gap: 12 },
  modalHalf: { flex: 1 },
  modalSaveBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  modalSaveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  pickerModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  pickerList: {
    padding: 8,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
  },
  pickerItemText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyPickerText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 24,
  },
});

export default AdminTimetableScreenNew;
