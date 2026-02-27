import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert,
  StatusBar, TextInput, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const AdminTeachersScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await apiService.getAllTeachers();
      const list = Array.isArray(res) ? res : res?.data || [];
      setTeachers(list);
    } catch (err: any) {
      if (__DEV__) console.log('Teachers error:', err.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  useEffect(() => {
    let list = teachers;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.name?.toLowerCase().includes(q) ||
        t.employeeId?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q)
      );
    }
    // Sort: active teachers first, then inactive
    list.sort((a, b) => {
      const aActive = a.isActive !== false ? 1 : 0;
      const bActive = b.isActive !== false ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return (a.name || '').localeCompare(b.name || '');
    });
    setFiltered(list);
  }, [teachers, search]);

  const handleToggleActive = (teacher: any) => {
    const isActive = teacher.isActive !== false;
    const action = isActive ? 'Deactivate' : 'Activate';
    Alert.alert(
      `${action} Teacher`,
      `${action} ${teacher.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          style: isActive ? 'destructive' : 'default',
          onPress: async () => {
            try {
              if (isActive) {
                await apiService.deleteTeacher(teacher._id);
              } else {
                await apiService.updateTeacher(teacher._id, { isActive: true });
              }
              fetchTeachers();
              Alert.alert('Done', `Teacher ${action.toLowerCase()}d`);
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.message || 'Failed');
            }
          },
        },
      ],
    );
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const COLORS = ['#0D9488', '#6366F1', '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'];
  const getColor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];

  if (isLoading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>Loading teachers...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>All Teachers</Text>
        <View style={[styles.countBadge, { backgroundColor: theme.colors.primaryLight }]}>
          <Text style={[styles.countText, { color: theme.colors.primary }]}>{filtered.length}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search by name, ID or email..."
            placeholderTextColor={theme.colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Add Teacher FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.accent }]}
        onPress={() => navigation.navigate('AdminCreateTeacher')}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTeachers(); }} />}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="account-search-outline" size={56} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>No Teachers Found</Text>
          </View>
        ) : (
          filtered.map((t, idx) => (
            <View key={t._id || idx} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
              <View style={styles.cardTop}>
                <View style={[styles.avatar, { backgroundColor: getColor(t.name || 'T') }]}>
                  <Text style={styles.avatarText}>{getInitials(t.name || 'T')}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={[styles.name, { color: theme.colors.text }]}>{t.name}</Text>
                  <View style={styles.metaRow}>
                    <MaterialCommunityIcons name="badge-account" size={12} color={theme.colors.textTertiary} />
                    <Text style={[styles.meta, { color: theme.colors.textTertiary }]}>{t.employeeId}</Text>
                    <Text style={[styles.meta, { color: theme.colors.textTertiary }]}>•</Text>
                    <Text style={[styles.meta, { color: theme.colors.textTertiary }]}>{t.email}</Text>
                  </View>
                  {(t.subjects?.length > 0) && (
                    <View style={styles.subjectsRow}>
                      {t.subjects.slice(0, 3).map((s: string, i: number) => (
                        <View key={i} style={[styles.subjectTag, { backgroundColor: theme.colors.primaryLight }]}>
                          <Text style={[styles.subjectText, { color: theme.colors.primary }]}>{s}</Text>
                        </View>
                      ))}
                      {t.subjects.length > 3 && <Text style={[styles.moreText, { color: theme.colors.textTertiary }]}>+{t.subjects.length - 3}</Text>}
                    </View>
                  )}
                </View>
                <View style={[styles.statusDot, { backgroundColor: t.isActive !== false ? theme.colors.success : theme.colors.error }]} />
              </View>

              {/* Stats row */}
              <View style={[styles.statsRow, { borderTopColor: theme.colors.borderLight }]}>
                <View style={styles.stat}>
                  <Text style={[styles.statVal, { color: theme.colors.text }]}>{t.totalResultsUploaded || 0}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>Results</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statVal, { color: theme.colors.text }]}>{t.assignedClasses?.length || 0}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>Classes</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statVal, { color: theme.colors.text }]}>{t.classTeacher || '-'}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>Class Teacher</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={[styles.actionsRow, { borderTopColor: theme.colors.borderLight }]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.primaryLight }]}
                  onPress={() => navigation.navigate('AdminTeacherDetail', { teacherId: t._id })}
                >
                  <MaterialCommunityIcons name="eye-outline" size={16} color={theme.colors.primary} />
                  <Text style={[styles.actionText, { color: theme.colors.primary }]}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.warningLight }]}
                  onPress={() => navigation.navigate('AdminEditTeacher', { teacher: t })}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={16} color={theme.colors.warning} />
                  <Text style={[styles.actionText, { color: theme.colors.warning }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor:
                        t.isActive !== false
                          ? theme.colors.errorLight
                          : theme.colors.successLight,
                    },
                  ]}
                  onPress={() => handleToggleActive(t)}
                >
                  <MaterialCommunityIcons
                    name={t.isActive !== false ? 'account-off-outline' : 'account-check-outline'}
                    size={16}
                    color={t.isActive !== false ? theme.colors.error : theme.colors.success}
                  />
                  <Text
                    style={[
                      styles.actionText,
                      {
                        color:
                          t.isActive !== false ? theme.colors.error : theme.colors.success,
                      },
                    ]}
                  >
                    {t.isActive !== false ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  countBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: 13, fontWeight: '700' },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 46, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', padding: 0 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, zIndex: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4 },
  listContent: { padding: 16 },
  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', padding: 14 },
  avatar: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  meta: { fontSize: 11, fontWeight: '500' },
  subjectsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  subjectTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  subjectText: { fontSize: 10, fontWeight: '600' },
  moreText: { fontSize: 10, fontWeight: '600', alignSelf: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, paddingVertical: 10, paddingHorizontal: 14 },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 15, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '500', marginTop: 2 },
  actionsRow: { flexDirection: 'row', borderTopWidth: 1, gap: 8, padding: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 10, gap: 4 },
  actionText: { fontSize: 12, fontWeight: '600' },
});

export default AdminTeachersScreen;
