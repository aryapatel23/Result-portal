import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const PROFILE_FIELDS = [
  { key: 'grNumber', label: 'GR Number', icon: 'card-account-details-outline' },
  { key: 'dateOfBirth', label: 'Date of Birth', icon: 'calendar-outline', format: (v: string) => {
    try { return new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return v; }
  }},
  { key: 'standard', label: 'Class / Standard', icon: 'school-outline' },
  { key: 'mobile', label: 'Mobile', icon: 'phone-outline' },
  { key: 'parentContact', label: 'Parent Contact', icon: 'account-supervisor-outline' },
  { key: 'email', label: 'Email', icon: 'email-outline' },
  { key: 'penNo', label: 'PEN Number', icon: 'identifier' },
  { key: 'aadharNumber', label: 'Aadhar Number', icon: 'card-account-details' },
  { key: 'childUID', label: 'Child UID', icon: 'badge-account-outline' },
] as const;

const StudentProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await apiService.getMyProfile();
      setProfile(data);
    } catch (e: any) {
      console.log('Profile error:', e.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchProfile(); };

  // Merge auth user data + profile API data
  const userData = { ...user, ...profile };

  const initials = userData?.name
    ? userData.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[s.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[s.headerTitle, { color: theme.colors.text }]}>Profile</Text>
        <TouchableOpacity
          style={[s.themeBtn, { backgroundColor: theme.colors.card }]}
          onPress={toggleTheme}
        >
          <MaterialCommunityIcons
            name={theme.isDark ? 'white-balance-sunny' : 'moon-waning-crescent'}
            size={18}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={s.flex} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Avatar Card */}
        <View style={[s.avatarCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={[s.avatarOuter, { backgroundColor: theme.colors.primaryLight }]}>
            <View style={[s.avatarInner, { backgroundColor: theme.colors.primary }]}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={[s.userName, { color: theme.colors.text }]}>{userData?.name}</Text>
          <Text style={[s.userSub, { color: theme.colors.textTertiary }]}>
            {userData?.standard} • GR: {userData?.grNumber}
          </Text>
          <View style={[s.roleBadge, { backgroundColor: theme.colors.primaryLight }]}>
            <MaterialCommunityIcons name="school" size={14} color={theme.colors.primary} />
            <Text style={[s.roleText, { color: theme.colors.primary }]}>Student</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={[s.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={s.infoHeader}>
            <MaterialCommunityIcons name="account-details" size={20} color={theme.colors.accent} />
            <Text style={[s.infoHeaderText, { color: theme.colors.text }]}>Personal Information</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ paddingVertical: 20 }} />
          ) : (
            PROFILE_FIELDS.map((field, idx) => {
              const rawValue = (userData as any)?.[field.key];
              if (!rawValue) return null;
              const value = 'format' in field && field.format ? field.format(rawValue) : rawValue;
              return (
                <View
                  key={field.key}
                  style={[
                    s.fieldRow,
                    idx < PROFILE_FIELDS.length - 1 && { borderBottomColor: theme.colors.borderLight, borderBottomWidth: 1 },
                  ]}
                >
                  <View style={[s.fieldIcon, { backgroundColor: theme.colors.primaryLight }]}>
                    <MaterialCommunityIcons name={field.icon} size={18} color={theme.colors.primary} />
                  </View>
                  <View style={s.fieldInfo}>
                    <Text style={[s.fieldLabel, { color: theme.colors.textTertiary }]}>{field.label}</Text>
                    <Text style={[s.fieldValue, { color: theme.colors.text }]}>{value}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Actions */}
        <View style={[s.actionsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <TouchableOpacity style={[s.actionRow, { borderBottomColor: theme.colors.borderLight }]} onPress={() => navigation.navigate('StudentAttendance')}>
            <View style={[s.actionIcon, { backgroundColor: theme.colors.infoLight }]}>
              <MaterialCommunityIcons name="calendar-check" size={18} color={theme.colors.info} />
            </View>
            <Text style={[s.actionText, { color: theme.colors.text }]}>My Attendance</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[s.actionRow, { borderBottomColor: theme.colors.borderLight }]} onPress={() => navigation.navigate('StudentTimetable')}>
            <View style={[s.actionIcon, { backgroundColor: theme.colors.warningLight }]}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={theme.colors.warning} />
            </View>
            <Text style={[s.actionText, { color: theme.colors.text }]}>Class Timetable</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={s.actionRow} onPress={() => navigation.navigate('StudentResults')}>
            <View style={[s.actionIcon, { backgroundColor: theme.colors.successLight }]}>
              <MaterialCommunityIcons name="file-document-outline" size={18} color={theme.colors.success} />
            </View>
            <Text style={[s.actionText, { color: theme.colors.text }]}>My Results</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[s.logoutBtn, { backgroundColor: theme.colors.errorLight, borderColor: theme.colors.error }]}
          onPress={logout}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="logout" size={20} color={theme.colors.error} />
          <Text style={[s.logoutText, { color: theme.colors.error }]}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  themeBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  avatarCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  avatarOuter: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  avatarInner: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  userName: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  userSub: { fontSize: 13, fontWeight: '500', marginBottom: 10 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  roleText: { fontSize: 12, fontWeight: '700' },

  infoCard: { borderRadius: 18, borderWidth: 1, padding: 18, marginBottom: 14 },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  infoHeaderText: { fontSize: 16, fontWeight: '700' },

  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  fieldIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  fieldInfo: { flex: 1 },
  fieldLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  fieldValue: { fontSize: 14, fontWeight: '600' },

  actionsCard: { borderRadius: 18, borderWidth: 1, marginBottom: 14, overflow: 'hidden' },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  actionIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionText: { flex: 1, fontSize: 14, fontWeight: '600' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginBottom: 14,
  },
  logoutText: { fontSize: 15, fontWeight: '700' },
});

export default StudentProfileScreen;
