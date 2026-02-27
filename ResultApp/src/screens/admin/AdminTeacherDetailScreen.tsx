import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  StatusBar, StyleSheet, ActivityIndicator, RefreshControl, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const AdminTeacherDetailScreen = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { teacherId } = route.params || {};
  const [teacher, setTeacher] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTeacher = async () => {
    try {
      const res = await apiService.getTeacherById(teacherId);
      setTeacher(res?.teacher || res?.data || res);
    } catch (e: any) {
      if (__DEV__) console.log('Teacher detail err:', e.message);
      Alert.alert('Error', 'Failed to load teacher details');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (teacherId) fetchTeacher(); }, [teacherId]);

  const handleRate = () => {
    if (Platform.OS === 'ios' && Alert.prompt) {
      Alert.prompt('Rate Teacher', 'Enter rating (1-5)', async (text: string) => {
        const rating = Number(text);
        if (rating >= 1 && rating <= 5) {
          try {
            await apiService.rateTeacher(teacherId, { rating });
            fetchTeacher();
            Alert.alert('Done', 'Rating submitted');
          } catch (e: any) {
            Alert.alert('Error', 'Failed to rate');
          }
        } else {
          Alert.alert('Invalid', 'Rating must be 1-5');
        }
      });
    } else {
      // For Android, show a simple alert
      Alert.alert('Rating', 'Rating feature coming soon for Android');
    }
  };

  const handleDelete = () => {
    Alert.alert('Deactivate Teacher', `Deactivate ${teacher?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate', style: 'destructive', onPress: async () => {
          try {
            await apiService.deleteTeacher(teacherId);
            Alert.alert('Done', 'Teacher deactivated');
            navigation.goBack();
          } catch (e: any) { Alert.alert('Error', e.response?.data?.message || 'Failed'); }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!teacher) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Teacher Detail</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={[{ color: theme.colors.textSecondary, fontSize: 16 }]}>Teacher not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const COLORS = ['#0D9488', '#6366F1', '#F59E0B', '#EF4444', '#10B981'];
  const avatarColor = COLORS[(teacher.name?.charCodeAt(0) || 0) % COLORS.length];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Teacher Detail</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AdminEditTeacher', { teacher })} style={[styles.editBtn, { backgroundColor: theme.colors.primaryLight }]}>
          <MaterialCommunityIcons name="pencil" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTeacher(); }} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>
              {teacher.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
            </Text>
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>{teacher.name}</Text>
          <Text style={[styles.email, { color: theme.colors.textSecondary }]}>{teacher.email}</Text>
          <View style={[styles.statusRow]}>
            <View style={[styles.statusBadge, { backgroundColor: teacher.isActive !== false ? '#10B98120' : '#EF444420' }]}>
              <View style={[styles.statusDot, { backgroundColor: teacher.isActive !== false ? '#10B981' : '#EF4444' }]} />
              <Text style={{ color: teacher.isActive !== false ? '#10B981' : '#EF4444', fontSize: 12, fontWeight: '700' }}>
                {teacher.isActive !== false ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Information</Text>
        {[
          { icon: 'badge-account', label: 'Employee ID', value: teacher.employeeId },
          { icon: 'phone', label: 'Phone', value: teacher.phone || 'N/A' },
          { icon: 'school', label: 'Class Teacher', value: teacher.classTeacher || 'N/A' },
          { icon: 'counter', label: 'Results Uploaded', value: String(teacher.totalResultsUploaded || 0) },
          { icon: 'star', label: 'Rating', value: teacher.rating ? `${teacher.rating}/5` : 'Not rated' },
          { icon: 'calendar-check', label: 'Joined', value: teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : 'N/A' },
        ].map((item, idx) => (
          <View key={idx} style={[styles.infoRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <MaterialCommunityIcons name={item.icon} size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.textTertiary }]}>{item.label}</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{item.value}</Text>
            </View>
          </View>
        ))}

        {/* Subjects */}
        {teacher.subjects?.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Subjects</Text>
            <View style={styles.tagsRow}>
              {teacher.subjects.map((s: string, i: number) => (
                <View key={i} style={[styles.tag, { backgroundColor: theme.colors.primaryLight }]}>
                  <MaterialCommunityIcons name="book" size={14} color={theme.colors.primary} />
                  <Text style={[styles.tagText, { color: theme.colors.primary }]}>{s}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Assigned Classes */}
        {teacher.assignedClasses?.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Assigned Classes</Text>
            <View style={styles.tagsRow}>
              {teacher.assignedClasses.map((c: string, i: number) => (
                <View key={i} style={[styles.tag, { backgroundColor: theme.colors.accentLight }]}>
                  <MaterialCommunityIcons name="google-classroom" size={14} color={theme.colors.accent} />
                  <Text style={[styles.tagText, { color: theme.colors.accent }]}>Class {c}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Actions */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}
            onPress={() => navigation.navigate('AdminEditTeacher', { teacher })}
          >
            <MaterialCommunityIcons name="pencil-outline" size={24} color={theme.colors.info} />
            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}
            onPress={handleRate}
          >
            <MaterialCommunityIcons name="star-outline" size={24} color={theme.colors.warning} />
            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Rate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}
            onPress={handleDelete}
          >
            <MaterialCommunityIcons name="account-off" size={24} color={theme.colors.error} />
            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Deactivate</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  editBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  profileCard: { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: 'center', marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 26, fontWeight: '900' },
  name: { fontSize: 20, fontWeight: '800', marginTop: 14 },
  email: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  statusRow: { marginTop: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 6 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '700', marginTop: 1 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  tagText: { fontSize: 13, fontWeight: '600' },
  actionGrid: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'center' },
  actionLabel: { fontSize: 12, fontWeight: '600', marginTop: 6 },
});

export default AdminTeacherDetailScreen;
