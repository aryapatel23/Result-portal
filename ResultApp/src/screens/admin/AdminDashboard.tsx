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

const AdminDashboard = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>({ 
    totalStudents: 0, 
    totalTeachers: 0, 
    totalResults: 0, 
    totalClasses: 0 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiService.getAdminDashboard();
      setDashboardData(response.data || {
        totalStudents: 0,
        totalTeachers: 0,
        totalResults: 0,
        totalClasses: 0
      });
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
              <Text style={styles.headerSubtitle}>Admin Portal</Text>
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
            <Text style={styles.headerInfoLabel}>System Overview</Text>
            <Text style={styles.headerInfoValue}>Full Access Control</Text>
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
          {/* Statistics Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              System Statistics
            </Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.statCardLeft]}>
                <Text style={styles.statLabel}>Total Students</Text>
                <Text style={styles.statValue}>
                  {dashboardData?.totalStudents || 0}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Teachers</Text>
                <Text style={styles.statValue}>
                  {dashboardData?.totalTeachers || 0}
                </Text>
              </View>
              <View style={[styles.statCard, styles.statCardLeft]}>
                <Text style={styles.statLabel}>Total Results</Text>
                <Text style={styles.statValue}>
                  {dashboardData?.totalResults || 0}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Active Classes</Text>
                <Text style={styles.statValue}>
                  {dashboardData?.totalClasses || 0}
                </Text>
              </View>
            </View>
          </View>

          {/* Management Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              User Management
            </Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity
                onPress={() => navigation.navigate('AdminStudents')}
                style={[styles.actionCard, styles.actionCardBlue, styles.actionCardLeft]}
              >
                <Text style={styles.actionIcon}>👨‍🎓</Text>
                <Text style={styles.actionTitle}>Students</Text>
                <Text style={styles.actionSubtitle}>
                  Manage all students
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('AdminTeachers')}
                style={[styles.actionCard, styles.actionCardGreen]}
              >
                <Text style={styles.actionIcon}>👨‍🏫</Text>
                <Text style={styles.actionTitle}>Teachers</Text>
                <Text style={styles.actionSubtitleGreen}>
                  Manage all teachers
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('AdminCreateStudent')}
                style={[styles.actionCard, styles.actionCardPurple, styles.actionCardLeft]}
              >
                <Text style={styles.actionIcon}>➕👨‍🎓</Text>
                <Text style={styles.actionTitle}>Add Student</Text>
                <Text style={styles.actionSubtitlePurple}>
                  Create new student
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('AdminCreateTeacher')}
                style={[styles.actionCard, styles.actionCardOrange]}
              >
                <Text style={styles.actionIcon}>➕👨‍🏫</Text>
                <Text style={styles.actionTitle}>Add Teacher</Text>
                <Text style={styles.actionSubtitleOrange}>
                  Create new teacher
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* System Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              System Management
            </Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity
                onPress={() => navigation.navigate('AdminResults')}
                style={[styles.actionCard, styles.actionCardIndigo, styles.actionCardLeft]}
              >
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.actionTitle}>All Results</Text>
                <Text style={styles.actionSubtitleIndigo}>
                  View all results
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('AdminAttendance')}
                style={[styles.actionCard, styles.actionCardPink]}
              >
                <Text style={styles.actionIcon}>📅</Text>
                <Text style={styles.actionTitle}>Attendance</Text>
                <Text style={styles.actionSubtitlePink}>
                  View attendance records
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('AdminBulkOperations')}
                style={[styles.actionCard, styles.actionCardTeal, styles.actionCardLeft]}
              >
                <Text style={styles.actionIcon}>📤</Text>
                <Text style={styles.actionTitle}>Bulk Upload</Text>
                <Text style={styles.actionSubtitleTeal}>
                  Upload in bulk
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('AdminSettings')}
                style={[styles.actionCard, styles.actionCardGray]}
              >
                <Text style={styles.actionIcon}>⚙️</Text>
                <Text style={styles.actionTitle}>Settings</Text>
                <Text style={styles.actionSubtitleGrayLight}>
                  System configuration
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Recent Activity
            </Text>
            <View style={styles.activityCard}>
              <View style={styles.activityEmpty}>
                <Text style={styles.activityIcon}>📋</Text>
                <Text style={styles.activityText}>
                  Activity logs will appear here
                </Text>
              </View>
            </View>
          </View>

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
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  scrollContent: {
    paddingBottom: 32,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statCardLeft: {
    marginRight: '4%',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#111827',
    fontSize: 30,
    fontWeight: 'bold',
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
  actionCardTeal: {
    backgroundColor: '#0d9488',
  },
  actionCardGray: {
    backgroundColor: '#374151',
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
  actionSubtitleTeal: {
    color: '#99f6e4',
    fontSize: 12,
    marginTop: 4,
  },
  actionSubtitleGrayLight: {
    color: '#d1d5db',
    fontSize: 12,
    marginTop: 4,
  },
  activityCard: {
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
  activityEmpty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  activityIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  activityText: {
    color: '#6b7280',
    fontSize: 14,
  },
  bottomPadding: {
    paddingBottom: 32,
  },
});

export default AdminDashboard;
