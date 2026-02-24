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
import { Result } from '../../types';

const StudentDashboard = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboard, studentResults] = await Promise.all([
        apiService.getStudentDashboard(),
        apiService.getStudentResults(user?.grNumber || ''),
      ]);

      setDashboardData(dashboard.data);
      setResults(studentResults.data || []);
    } catch (error: any) {
      // Silently fail - dashboard will show zeros/empty
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
              <Text style={styles.headerSubtitle}>Welcome back,</Text>
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
            <Text style={styles.headerInfoLabel}>GR Number</Text>
            <Text style={styles.headerInfoValue}>{user?.grNumber}</Text>
            <Text style={styles.headerInfoExtra}>Class: {user?.standard}</Text>
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
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Results</Text>
              <Text style={styles.statValue}>
                {results.length}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Average %</Text>
              <Text style={styles.statValue}>
                {results.length > 0
                  ? (results.reduce((acc, r) => acc + r.percentage, 0) / results.length).toFixed(1)
                  : '0'}
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
                onPress={() => navigation.navigate('StudentResults')}
                style={[styles.actionCard, styles.actionCardBlue, styles.actionCardLeft]}
              >
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.actionTitle}>View Results</Text>
                <Text style={styles.actionSubtitle}>
                  Check all your results
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('StudentAttendance')}
                style={[styles.actionCard, styles.actionCardGreen]}
              >
                <Text style={styles.actionIcon}>📅</Text>
                <Text style={styles.actionTitle}>Attendance</Text>
                <Text style={styles.actionSubtitleGreen}>
                  View your attendance
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('StudentProfile')}
                style={[styles.actionCard, styles.actionCardPurple, styles.actionCardLeft]}
              >
                <Text style={styles.actionIcon}>👤</Text>
                <Text style={styles.actionTitle}>Profile</Text>
                <Text style={styles.actionSubtitlePurple}>
                  Manage your profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('StudentTimetable')}
                style={[styles.actionCard, styles.actionCardOrange]}
              >
                <Text style={styles.actionIcon}>🕐</Text>
                <Text style={styles.actionTitle}>Timetable</Text>
                <Text style={styles.actionSubtitleOrange}>
                  View class schedule
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Results */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Recent Results
              </Text>
              {results.length > 0 && (
                <TouchableOpacity onPress={() => navigation.navigate('StudentResults')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              )}
            </View>

            {results.length === 0 ? (
              <View style={styles.emptyResultsCard}>
                <Text style={styles.emptyIcon}>📚</Text>
                <Text style={styles.emptyTitle}>
                  No Results Yet
                </Text>
                <Text style={styles.emptyText}>
                  Your results will appear here once published
                </Text>
              </View>
            ) : (
              results.slice(0, 3).map((result) => (
                <TouchableOpacity
                  key={result._id}
                  onPress={() => navigation.navigate('ResultDetail', { resultId: result._id })}
                  style={styles.resultCard}
                >
                  <View style={styles.resultCardTop}>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultTitle}>
                        {result.examType}
                      </Text>
                      <Text style={styles.resultSubtitle}>
                        {result.term} • {result.academicYear}
                      </Text>
                    </View>
                    <View style={styles.percentageBadge}>
                      <Text style={styles.percentageText}>
                        {result.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.resultCardBottom}>
                    <Text style={styles.gradeText}>
                      Grade: <Text style={styles.gradeValue}>{result.grade}</Text>
                    </Text>
                    <Text style={styles.viewDetailsText}>
                      View Details →
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
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
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    color: '#2563eb',
    fontWeight: '600',
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
  emptyResultsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#111827',
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
  resultCard: {
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
  resultCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultSubtitle: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
  percentageBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentageText: {
    color: '#1d4ed8',
    fontWeight: 'bold',
  },
  resultCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  gradeText: {
    color: '#4b5563',
    fontSize: 14,
  },
  gradeValue: {
    fontWeight: '600',
    color: '#111827',
  },
  viewDetailsText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomPadding: {
    paddingBottom: 32,
  },
});

export default StudentDashboard;
