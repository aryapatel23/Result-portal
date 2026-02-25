import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

interface PlaceholderScreenProps {
  title: string;
  icon: string;
  description?: string;
}

const PlaceholderScreen = ({
  navigation,
  route,
  title,
  icon,
  description,
}: any & PlaceholderScreenProps) => {
  const { theme } = useTheme();
  const screenTitle = title || route?.params?.title || route?.name || 'Coming Soon';
  const screenIcon = icon || route?.params?.icon || 'hammer-wrench';
  const screenDesc =
    description ||
    route?.params?.description ||
    'This feature is under development and will be available soon.';

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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{screenTitle}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryLight }]}>
          <MaterialCommunityIcons name={screenIcon} size={48} color={theme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Coming Soon</Text>
        <Text style={[styles.desc, { color: theme.colors.textTertiary }]}>{screenDesc}</Text>
        <TouchableOpacity
          style={[styles.goBackBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={18} color="#FFF" />
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
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
  placeholder: { width: 36 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 10 },
  desc: { fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  goBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
  },
  goBackText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default PlaceholderScreen;
