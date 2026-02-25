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
import { useTheme } from '../../context/ThemeContext';

const StudentTimetableScreen = ({ navigation }: any) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[s.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.colors.text }]}>Timetable</Text>
        <View style={s.spacer} />
      </View>

      <ScrollView style={s.flex} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Placeholder */}
        <View style={[s.emptyCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
          <View style={[s.iconWrap, { backgroundColor: theme.colors.warningLight }]}>
            <MaterialCommunityIcons name="clock-outline" size={40} color={theme.colors.warning} />
          </View>
          <Text style={[s.emptyTitle, { color: theme.colors.text }]}>Class Timetable</Text>
          <Text style={[s.emptySub, { color: theme.colors.textTertiary }]}>
            Your class schedule will appear here once available.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
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
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 40,
    alignItems: 'center',
  },
  iconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 20 },
});

export default StudentTimetableScreen;
