import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import Loading from '../../components/Loading';

const TeacherDashboard = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>({ totalStudents: 0, totalResults: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiService.getTeacherDashboard();
      setDashboardData(response.data || { totalStudents: 0, totalResults: 0 });
    } catch (error: any) {
      // Silently fail - dashboard will show zeros
      console.log('Dashboard load error:', error.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerSubtitle}>Welcome,</Text>
              <Text style={styles.headerTitle}>
                {user?.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerInfoLabel}>Employee ID</Text>
            <Text style={styles.headerInfoValue}>{user?.employeeId}</Text>
            {user?.classTeacher && (
              <Text style={styles.headerInfoExtra}>
                Class Teacher: {user.classTeacher}
              </Text>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCardSmall}>
              <Text style={styles.statLabel}>Total Students</Text>
              <Text style={styles.statValueSmall}>
                {dashboardData?.totalStudents || 0}
              </Text>
            </View>
            <View style={[styles.statCardSmall, styles.statCardCenter]}>
              <Text style={styles.statLabel}>Classes</Text>
              <Text style={styles.statValueSmall}>
                {user?.assignedClasses?.length || 0}
              </Text>
            </View>
            <View style={styles.statCardSmall}>
              <Text style={styles.statLabel}>Results</Text>
              <Text style={styles.statValueSmall}>
                {dashboardData?.totalResults || 0}
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity
                onPress={() => navigation.navigate('TeacherStudents')}
                style={[styles.actionCard, styles.actionCardBlue, styles.actionCardLeft]}
              >
                <Text style={styles.actionIcon}>👥</Text>
                <Text style={styles.actionTitle}>My Students</Text>
                <Text style={styles.actionSubtitle}>
                  View & manage students
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('TeacherUploadResult')}
                style={[styles.actionCard, styles.actionCardGreen]}
              >
                <Text style={styles.actionIcon}>📝</Text>
                <Text style={styles.actionTitle}>Upload Result</Text>
                <Text style={styles.actionSubtitleGreen}>
                  Add new result
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('TeacherResults')}
                style={[styles.actionCard, styles.actionCardPurple, styles.actionCardLeft]}
              >
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.actionTitle}>View Results</Text>
                <Text style={styles.actionSubtitlePurple}>
                  All uploaded results
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('TeacherAttendance')}
                style={[styles.actionCard, styles.actionCardOrange]}
              >
                <Text style={styles.actionIcon}>✓</Text>
                <Text style={styles.actionTitle}>Attendance</Text>
                <Text style={styles.actionSubtitleOrange}>
                  Mark attendance
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('TeacherTimetable')}
                style={[styles.actionCard, styles.actionCardIndigo, styles.actionCardLeft]}
              >
                <Text style={styles.actionIcon}>🕐</Text>
                <Text style={styles.actionTitle}>Timetable</Text>
                <Text style={styles.actionSubtitleIndigo}>
                  View schedule
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('TeacherProfile')}
                style={[styles.actionCard, styles.actionCardPink]}
              >
                <Text style={styles.actionIcon}>👤</Text>
                <Text style={styles.actionTitle}>Profile</Text>
                <Text style={styles.actionSubtitlePink}>
                  Manage profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Assigned Classes */}
          {user?.assignedClasses && user.assignedClasses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Assigned Classes
              </Text>
              <View style={styles.classesCard}>
                {user.assignedClasses.map((className, index) => (
                  <View
                    key={index}
                    style={[
                      styles.classRow,
                      index !== user.assignedClasses!.length - 1 && styles.classRowBorder
                    ]}
                  >
                    <View style={styles.classIconContainer}>
                      <Text style={styles.classIconText}>
                        {className.split(' ')[1]?.charAt(0) || className.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.classInfo}>
                      <Text style={styles.className}>{className}</Text>
                      {user.classTeacher === className && (
                        <Text style={styles.classTeacherBadge}>Class Teacher</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('TeacherStudents', { standard: className })}
                      style={styles.classViewButton}
                    >
                      <Text style={styles.classViewButtonText}>View</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Subjects */}
          {user?.subjects && user.subjects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Teaching Subjects
              </Text>
              <View style={styles.subjectsContainer}>
                {user.subjects.map((subject, index) => (
                  <View
                    key={index}
                    style={styles.subjectBadge}
                  >
                    <Text style={styles.subjectText}>{subject}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#1d4ed8',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerSubtitle: {
    color: '#bfdbfe',
    fontSize: 14,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  headerInfo: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  headerInfoLabel: {
    color: '#bfdbfe',
    fontSize: 12,
    marginBottom: 4,
  },
  headerInfoValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerInfoExtra: {
    color: '#bfdbfe',
    fontSize: 12,
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCardSmall: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statCardCenter: {
    marginHorizontal: 8,
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  statValueSmall: {
    color: '#111827',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionCardLeft: {
    marginRight: '4%',
  },
  actionCardBlue: {
    backgroundColor: '#2563eb',
  },
  actionCardGreen: {
    backgroundColor: '#16a34a',
  },
  actionCardPurple: {
    backgroundColor: '#9333ea',
  },
  actionCardOrange: {
    backgroundColor: '#ea580c',
  },
  actionCardIndigo: {
    backgroundColor: '#4f46e5',
  },
  actionCardPink: {
    backgroundColor: '#db2777',
  },
  actionIcon: {
    color: '#ffffff',
    fontSize: 36,
    marginBottom: 8,
  },
  actionTitle: {
    color: '#ffffff',
    fontWeight: '600',
  },
  actionSubtitle: {
    color: '#bfdbfe',
    fontSize: 12,
    marginTop: 4,
  },
  actionSubtitleGreen: {
    color: '#bbf7d0',
    fontSize: 12,
    marginTop: 4,
  },
  actionSubtitlePurple: {
    color: '#e9d5ff',
    fontSize: 12,
    marginTop: 4,
  },
  actionSubtitleOrange: {
    color: '#fed7aa',
    fontSize: 12,
    marginTop: 4,
  },
  actionSubtitleIndigo: {
    color: '#c7d2fe',
    fontSize: 12,
    marginTop: 4,
  },
  actionSubtitlePink: {
    color: '#fbcfe8',
    fontSize: 12,
    marginTop: 4,
  },
  classesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  classRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  classIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#dbeafe',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  classIconText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    color: '#111827',
    fontWeight: '600',
  },
  classTeacherBadge: {
    color: '#2563eb',
    fontSize: 12,
    marginTop: 4,
  },
  classViewButton: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  classViewButtonText: {
    color: '#1d4ed8',
    fontWeight: '600',
    fontSize: 14,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subjectBadge: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  subjectText: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  bottomPadding: {
    paddingBottom: 32,
  },
});

export default TeacherDashboard;
