import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const StudentAttendanceScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[s.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.colors.text }]}>Attendance</Text>
        <View style={s.spacer} />
      </View>

      <ScrollView style={s.flex} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Student Info */}
        <View style={[s.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={[s.avatarWrap, { backgroundColor: theme.colors.primaryLight }]}>
            <MaterialCommunityIcons name="account" size={28} color={theme.colors.primary} />
          </View>
          <View style={s.infoText}>
            <Text style={[s.infoName, { color: theme.colors.text }]}>{user?.name || 'Student'}</Text>
            <Text style={[s.infoSub, { color: theme.colors.textTertiary }]}>
              {user?.standard || 'N/A'} • GR: {user?.grNumber || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Coming Soon Card */}
        <View style={[s.emptyCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={[s.iconWrap, { backgroundColor: theme.colors.infoLight }]}>
            <MaterialCommunityIcons name="calendar-check" size={48} color={theme.colors.info} />
          </View>
          <Text style={[s.emptyTitle, { color: theme.colors.text }]}>Attendance Tracking</Text>
          <Text style={[s.emptySub, { color: theme.colors.textTertiary }]}>
            Student attendance tracking is coming soon. Your attendance records will appear here once your school enables this feature.
          </Text>
          <View style={[s.featureRow, { backgroundColor: theme.colors.primaryLight }]}>
            <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.primary} />
            <Text style={[s.featureText, { color: theme.colors.primary }]}>Daily attendance overview</Text>
          </View>
          <View style={[s.featureRow, { backgroundColor: theme.colors.successLight }]}>
            <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.success} />
            <Text style={[s.featureText, { color: theme.colors.success }]}>Monthly stats & calendar</Text>
          </View>
          <View style={[s.featureRow, { backgroundColor: theme.colors.accentLight }]}>
            <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.accent} />
            <Text style={[s.featureText, { color: theme.colors.accent }]}>Attendance percentage</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { marginRight: 14 },
  headerTitle: { fontSize: 20, fontWeight: '800', flex: 1, letterSpacing: -0.3 },
  spacer: { width: 36 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  avatarWrap: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  infoText: { flex: 1 },
  infoName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  infoSub: { fontSize: 13, fontWeight: '500' },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  iconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  emptySub: { fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    width: '100%',
    marginBottom: 8,
  },
  featureText: { fontSize: 13, fontWeight: '600' },
});

export default StudentAttendanceScreen;
