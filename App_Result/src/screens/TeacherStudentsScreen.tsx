/**
 * Teacher Students Screen
 * 
 * View and manage students taught by the teacher
 * Shows all students from assigned classes with performance metrics
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/axios.config';

interface Student {
  _id: string;
  name: string;
  grNumber: string;
  standard: string;
  email?: string;
  phone?: string;
  percentage?: number;
  latestResult?: any;
  resultCount?: number;
}

const TeacherStudentsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [assignedClasses, setAssignedClasses] = useState<string[]>(['All']);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, selectedClass, students]);

  const loadStudents = async () => {
    try {
      setLoading(true);

      // Fetch teacher data to get assigned classes
      const teacherRes = await apiClient.get('/teacher/dashboard');
      const classes = teacherRes.data?.teacher?.assignedClasses || [];
      setAssignedClasses(['All', ...classes]);

      // Fetch all students from assigned classes
      const studentsPromises = classes.map((className: string) => 
        apiClient.get('/student-management', {
          params: {
            standard: className,
            limit: 100,
          }
        }).catch(() => ({ data: { students: [] } }))
      );

      const results = await Promise.all(studentsPromises);
      let allStudents: Student[] = [];

      for (const res of results) {
        if (res.data && res.data.students) {
          allStudents = [...allStudents, ...res.data.students];
        }
      }

      // Calculate percentage for each student
      const studentsWithPerformance = await Promise.all(
        allStudents.map(async (student: any) => {
          try {
            const resultRes = await apiClient.get(`/student/gr/${student.grNumber}`);
            
            if (resultRes.data && resultRes.data.results && resultRes.data.results.length > 0) {
              const latestResult = resultRes.data.results[0];
              const totalMarks = latestResult.subjects.reduce((sum: number, sub: any) => sum + sub.marks, 0);
              const totalMax = latestResult.subjects.reduce((sum: number, sub: any) => sum + sub.maxMarks, 0);
              const percentage = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;
              
              return {
                ...student,
                percentage,
                latestResult,
                resultCount: resultRes.data.results.length,
              };
            }
            
            return {
              ...student,
              percentage: 0,
              resultCount: 0,
            };
          } catch {
            return {
              ...student,
              percentage: 0,
              resultCount: 0,
            };
          }
        })
      );

      setStudents(studentsWithPerformance);
      setFilteredStudents(studentsWithPerformance);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Filter by class
    if (selectedClass !== 'All') {
      filtered = filtered.filter(s => s.standard === selectedClass);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.grNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 70) return theme.colors.success;
    if (percentage >= 40) return '#F59E0B';
    return theme.colors.error;
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading students...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.surface} 
      />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            My Students
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {filteredStudents.length} students
          </Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
          <Icon name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search by name or GR number..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Class Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}>
        {assignedClasses.map((className, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.chip,
              selectedClass === className 
                ? { backgroundColor: theme.colors.primary }
                : { backgroundColor: theme.colors.surface }
            ]}
            onPress={() => setSelectedClass(className)}>
            <Text
              style={[
                styles.chipText,
                selectedClass === className
                  ? { color: '#fff', fontWeight: '600' }
                  : { color: theme.colors.text }
              ]}>
              {className}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Students List */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }>
        
        <View style={styles.studentsList}>
          {filteredStudents.map((student, index) => (
            <TouchableOpacity
              key={student._id}
              style={[styles.studentCard, { backgroundColor: theme.colors.card }]}
              activeOpacity={0.7}>
              {/* Student Info */}
              <View style={styles.studentMain}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                    {getInitials(student.name)}
                  </Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={[styles.studentName, { color: theme.colors.text }]}>
                    {student.name}
                  </Text>
                  <View style={styles.studentMeta}>
                    <Text style={[styles.grNumber, { color: theme.colors.textSecondary }]}>
                      {student.grNumber}
                    </Text>
                    <View style={[styles.metaDot, { backgroundColor: theme.colors.border }]} />
                    <Text style={[styles.className, { color: theme.colors.textSecondary }]}>
                      {student.standard}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Performance Badge */}
              {student.percentage !== undefined && student.percentage > 0 ? (
                <View style={styles.performanceContainer}>
                  <View style={[styles.performanceBadge, { backgroundColor: getPerformanceColor(student.percentage) + '20' }]}>
                    <Icon 
                      name="stats-chart" 
                      size={14} 
                      color={getPerformanceColor(student.percentage)} 
                    />
                    <Text style={[styles.performanceText, { color: getPerformanceColor(student.percentage) }]}>
                      {student.percentage}%
                    </Text>
                  </View>
                  {student.resultCount !== undefined && student.resultCount > 0 && (
                    <Text style={[styles.resultCount, { color: theme.colors.textTertiary }]}>
                      {student.resultCount} {student.resultCount === 1 ? 'result' : 'results'}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={[styles.noDataBadge, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.noDataText, { color: theme.colors.textTertiary }]}>
                    No data
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {filteredStudents.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="person-outline" size={64} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {searchQuery ? 'No students found' : 'No students in your classes'}
              </Text>
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Search
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  // Chips
  chipsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 14,
  },
  // Students List
  studentsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  studentCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  studentMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  studentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  grNumber: {
    fontSize: 13,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  className: {
    fontSize: 13,
  },
  // Performance
  performanceContainer: {
    alignItems: 'flex-end',
  },
  performanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  performanceText: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultCount: {
    fontSize: 11,
    marginTop: 4,
  },
  noDataBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  noDataText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default TeacherStudentsScreen;
