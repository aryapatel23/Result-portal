import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';
import { Student } from '../../types';

const TeacherStudentsScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { standard } = route?.params || {};
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>(standard || 'all');

  const fetchStudents = useCallback(async () => {
    try {
      const response = await apiService.getTeacherStudents();
      setStudents(response.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    let filtered = students;

    if (selectedClass !== 'all') {
      filtered = filtered.filter(s => s.standard === selectedClass);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.name.toLowerCase().includes(query) ||
          s.grNumber.toLowerCase().includes(query),
      );
    }

    setFilteredStudents(filtered);
  }, [students, searchQuery, selectedClass]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const getUniqueClasses = () => {
    const classes = [...new Set(students.map(s => s.standard))].sort();
    return ['all', ...classes];
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const AVATAR_COLORS = [
    '#0D9488', '#6366F1', '#F59E0B', '#EF4444', '#10B981',
    '#3B82F6', '#8B5CF6', '#EC4899',
  ];

  const getAvatarColor = (name: string) =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  if (isLoading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="loading" size={32} color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>
          Loading students...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.borderLight }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Students</Text>
        <View style={[styles.countBadge, { backgroundColor: theme.colors.primaryLight }]}>
          <Text style={[styles.countText, { color: theme.colors.primary }]}>
            {filteredStudents.length}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
          ]}
        >
          <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search by name or GR number..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color={theme.colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Class Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {getUniqueClasses().map(cls => {
          const isActive = selectedClass === cls;
          return (
            <TouchableOpacity
              key={cls}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.card,
                  borderColor: isActive ? theme.colors.primary : theme.colors.borderLight,
                },
              ]}
              onPress={() => setSelectedClass(cls)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isActive ? '#FFFFFF' : theme.colors.textSecondary },
                ]}
              >
                {cls === 'all' ? 'All Classes' : cls}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Students List */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredStudents.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons
              name="account-search-outline"
              size={56}
              color={theme.colors.textTertiary}
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>
              No Students Found
            </Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textTertiary }]}>
              {searchQuery ? 'Try a different search term' : 'No students in this class'}
            </Text>
          </View>
        ) : (
          filteredStudents.map((student, idx) => (
            <View
              key={student._id || idx}
              style={[
                styles.studentCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
              ]}
            >
              <View style={[styles.studentAvatar, { backgroundColor: getAvatarColor(student.name) }]}>
                <Text style={styles.avatarText}>{getInitials(student.name)}</Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, { color: theme.colors.text }]}>
                  {student.name}
                </Text>
                <View style={styles.studentMeta}>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons
                      name="card-account-details-outline"
                      size={12}
                      color={theme.colors.textTertiary}
                    />
                    <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                      {student.grNumber}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons
                      name="school-outline"
                      size={12}
                      color={theme.colors.textTertiary}
                    />
                    <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                      {student.standard}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: student.isActive
                      ? theme.colors.successLight
                      : theme.colors.errorLight,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: student.isActive
                        ? theme.colors.success
                        : theme.colors.error,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: student.isActive
                        ? theme.colors.success
                        : theme.colors.error,
                    },
                  ]}
                >
                  {student.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: '500' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800' },
  countBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: 13, fontWeight: '700' },

  searchWrap: { paddingHorizontal: 20, paddingTop: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', padding: 0 },

  filterRow: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: '600' },

  listContent: { paddingHorizontal: 20 },

  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  studentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  studentMeta: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '500' },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },

  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptyDesc: { fontSize: 13, fontWeight: '500', marginTop: 6 },
});

export default TeacherStudentsScreen;
