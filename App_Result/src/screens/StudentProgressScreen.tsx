/**
 * Student Progress Screen
 * 
 * Displays class-wide student progress comparison
 * Shows all students with color-coded progress bars
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
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/axios.config';

interface StudentProgress {
  _id: string;
  name: string;
  grNumber: string;
  percentage: number;
  standard: string;
  latestResult?: any;
}

const StudentProgressScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStudentProgress();
  }, []);

  const loadStudentProgress = async () => {
    try {
      setLoading(true);
      
      // Fetch all students in same standard
      const studentsRes = await apiClient.get('/student-management', {
        params: {
          standard: user?.className || user?.rollNumber?.substring(0, 5),
          limit: 100,
        }
      });

      if (studentsRes.data && studentsRes.data.students) {
        const studentsList = studentsRes.data.students;
        
        // Calculate percentage for each student from their latest result
        const progressData = await Promise.all(
          studentsList.map(async (student: any) => {
            try {
              // Fetch latest result for this student
              const resultRes = await apiClient.get(`/student/gr/${student.grNumber}`);
              
              if (resultRes.data && resultRes.data.results && resultRes.data.results.length > 0) {
                const latestResult = resultRes.data.results[0];
                const totalMarks = latestResult.subjects.reduce((sum: number, sub: any) => sum + sub.marks, 0);
                const totalMax = latestResult.subjects.reduce((sum: number, sub: any) => sum + sub.maxMarks, 0);
                const percentage = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;
                
                return {
                  _id: student._id,
                  name: student.name,
                  grNumber: student.grNumber,
                  standard: student.standard,
                  percentage,
                  latestResult,
                };
              }
              
              return {
                _id: student._id,
                name: student.name,
                grNumber: student.grNumber,
                standard: student.standard,
                percentage: 0,
              };
            } catch (error) {
              return {
                _id: student._id,
                name: student.name,
                grNumber: student.grNumber,
                standard: student.standard,
                percentage: 0,
              };
            }
          })
        );
        
        // Sort by percentage descending
        progressData.sort((a, b) => b.percentage - a.percentage);
        setStudents(progressData);
      }
    } catch (error) {
      console.error('Error loading student progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudentProgress();
    setRefreshing(false);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return theme.colors.success; // Green
    if (percentage >= 40) return '#F59E0B'; // Yellow/Amber
    return theme.colors.error; // Red
  };

  const getProgressWidth = (percentage: number): number => {
    return Math.min(percentage, 100);
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
          Loading progress...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background} 
      />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Student progress
        </Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="options-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

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
        
        {/* Class Info */}
        <View style={styles.classInfoContainer}>
          <Text style={[styles.classInfo, { color: theme.colors.textSecondary }]}>
            {user?.className || 'Your Class'} • {students.length} Students
          </Text>
        </View>

        {/* Student List */}
        <View style={styles.studentsList}>
          {students.map((student, index) => (
            <View 
              key={student._id}
              style={[styles.studentCard, { backgroundColor: theme.colors.card }]}>
              {/* Student Avatar and Name */}
              <View style={styles.studentInfo}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '30' }]}>
                  <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                    {getInitials(student.name)}
                  </Text>
                </View>
                <View style={styles.studentDetails}>
                  <Text style={[styles.studentName, { color: theme.colors.text }]}>
                    {student.name}
                  </Text>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarBg, { backgroundColor: theme.colors.surface }]}>
                      <View 
                        style={[
                          styles.progressBarFill,
                          { 
                            width: `${getProgressWidth(student.percentage)}%`,
                            backgroundColor: getProgressColor(student.percentage),
                          }
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
              
              {/* Percentage */}
              <Text 
                style={[
                  styles.percentageText,
                  { color: getProgressColor(student.percentage) }
                ]}>
                {student.percentage}%
              </Text>
            </View>
          ))}

          {students.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="people-outline" size={64} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No student data available
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
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Class Info
  classInfoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  classInfo: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Students List
  studentsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  studentCard: {
    borderRadius: 12,
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
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
    minWidth: 45,
    textAlign: 'right',
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

export default StudentProgressScreen;
