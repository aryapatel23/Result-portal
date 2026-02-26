import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

interface Student {
  _id: string;
  name: string;
  grNumber: string;
  standard: string;
  dateOfBirth: string;
  fatherName?: string;
  motherName?: string;
  contactNumber?: string;
  email?: string;
}

const TeacherManageStudentsScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create student form
  const [newStudent, setNewStudent] = useState({
    name: '',
    grNumber: '',
    standard: '',
    dateOfBirth: '',
    fatherName: '',
    motherName: '',
    contactNumber: '',
    email: '',
  });

  const fetchStudents = async () => {
    try {
      const res = await apiService.getTeacherStudents();
      const studentsList = res?.students || [];
      setStudents(studentsList);
      setFilteredStudents(studentsList);
    } catch (err: any) {
      if (__DEV__) console.log('Error fetching students:', err.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = students;

    // Filter by class
    if (selectedClass !== 'All') {
      filtered = filtered.filter(s => s.standard === selectedClass);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.name.toLowerCase().includes(query) ||
          s.grNumber.toLowerCase().includes(query)
      );
    }

    setFilteredStudents(filtered);
  }, [searchQuery, selectedClass, students]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const handleCreateStudent = async () => {
    // Validate
    if (!newStudent.name.trim()) {
      Alert.alert('Error', 'Please enter student name');
      return;
    }
    if (!newStudent.grNumber.trim()) {
      Alert.alert('Error', 'Please enter GR number');
      return;
    }
    if (!newStudent.standard.trim()) {
      Alert.alert('Error', 'Please select standard');
      return;
    }
    if (!newStudent.dateOfBirth.trim()) {
      Alert.alert('Error', 'Please enter date of birth (YYYY-MM-DD)');
      return;
    }

    try {
      setIsLoading(true);
      await apiService.createStudent({
        ...newStudent,
        role: 'student',
        password: newStudent.grNumber, // Default password is GR number
      });
      Alert.alert('Success', 'Student created successfully!');
      setShowCreateModal(false);
      setNewStudent({
        name: '',
        grNumber: '',
        standard: '',
        dateOfBirth: '',
        fatherName: '',
        motherName: '',
        contactNumber: '',
        email: '',
      });
      fetchStudents();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create student';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const assignedClasses = user?.assignedClasses || [];
  const classFilters = ['All', ...assignedClasses];

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>
          Loading students...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Manage Students</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addBtn}>
          <MaterialCommunityIcons name="plus" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={theme.colors.textTertiary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text, backgroundColor: theme.colors.card }]}
          placeholder="Search by name or GR number..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Class Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {classFilters.map((cls, idx) => {
          const isSelected = selectedClass === cls;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
                },
              ]}
              onPress={() => setSelectedClass(cls)}
            >
              <Text style={[styles.filterText, { color: isSelected ? '#FFF' : theme.colors.text }]}>
                {cls}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Students List */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredStudents.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.card }]}>
            <MaterialCommunityIcons name="account-off" size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Students Found</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textTertiary }]}>
              {searchQuery ? 'Try a different search' : 'No students in selected class'}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.countRow}>
              <MaterialCommunityIcons name="account-group" size={18} color={theme.colors.primary} />
              <Text style={[styles.countText, { color: theme.colors.primary }]}>
                {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
              </Text>
            </View>

            {filteredStudents.map((student, idx) => (
              <TouchableOpacity
                key={student._id || idx}
                style={[styles.studentCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                activeOpacity={0.7}
              >
                <View style={styles.studentRow}>
                  <View style={[styles.avatar, { backgroundColor: `${theme.colors.primary}20` }]}>
                    <MaterialCommunityIcons name="account" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={[styles.studentName, { color: theme.colors.text }]}>{student.name}</Text>
                    <View style={styles.metaRow}>
                      <MaterialCommunityIcons name="card-account-details" size={14} color={theme.colors.textSecondary} />
                      <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                        {student.grNumber}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.classBadge, { backgroundColor: `${theme.colors.accent}20` }]}>
                    <Text style={[styles.classText, { color: theme.colors.accent }]}>
                      {student.standard}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* Create Student Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Create Student</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Full Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
                  placeholder="Enter student name"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={newStudent.name}
                  onChangeText={(text) => setNewStudent({ ...newStudent, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>GR Number *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
                  placeholder="Enter GR number"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={newStudent.grNumber}
                  onChangeText={(text) => setNewStudent({ ...newStudent, grNumber: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Standard *</Text>
                <View style={styles.classChips}>
                  {assignedClasses.map((cls, idx) => {
                    const isSelected = newStudent.standard === cls;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.classChip,
                          {
                            backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
                            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                          },
                        ]}
                        onPress={() => setNewStudent({ ...newStudent, standard: cls })}
                      >
                        <Text style={[styles.classChipText, { color: isSelected ? '#FFF' : theme.colors.text }]}>
                          {cls}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Date of Birth * (YYYY-MM-DD)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
                  placeholder="2010-01-15"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={newStudent.dateOfBirth}
                  onChangeText={(text) => setNewStudent({ ...newStudent, dateOfBirth: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Father's Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
                  placeholder="Optional"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={newStudent.fatherName}
                  onChangeText={(text) => setNewStudent({ ...newStudent, fatherName: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Mother's Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
                  placeholder="Optional"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={newStudent.motherName}
                  onChangeText={(text) => setNewStudent({ ...newStudent, motherName: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Contact Number</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
                  placeholder="Optional"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={newStudent.contactNumber}
                  keyboardType="phone-pad"
                  onChangeText={(text) => setNewStudent({ ...newStudent, contactNumber: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
                  placeholder="Optional"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={newStudent.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={(text) => setNewStudent({ ...newStudent, email: text })}
                />
              </View>

              <TouchableOpacity
                style={[styles.createBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleCreateStudent}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                    <Text style={styles.createBtnText}>Create Student</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  addBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  filterScroll: { marginTop: 12 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: { fontSize: 14, fontWeight: '600' },
  scrollContent: { padding: 16 },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptyDesc: { fontSize: 14, marginTop: 6, textAlign: 'center' },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  countText: { fontSize: 14, fontWeight: '600' },
  studentCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  studentRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentInfo: { flex: 1, marginLeft: 12 },
  studentName: { fontSize: 16, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontSize: 12 },
  classBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  classText: { fontSize: 12, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalScroll: { padding: 16 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  classChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  classChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  classChipText: { fontSize: 14, fontWeight: '600' },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  createBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default TeacherManageStudentsScreen;
