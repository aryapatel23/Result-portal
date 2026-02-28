import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  StatusBar, StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const AdminProfileScreen = ({ navigation }: any) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    {
      section: 'Settings',
      items: [
        {
          icon: 'cog',
          label: 'System Configuration',
          color: theme.colors.primary,
          onPress: () => navigation.navigate('AdminSettings'),
        },
        {
          icon: 'school',
          label: 'School Information',
          color: '#10B981',
          onPress: () => navigation.navigate('AdminSettings'),
        },
        {
          icon: 'clipboard-check',
          label: 'Attendance Settings',
          color: '#F59E0B',
          onPress: () => navigation.navigate('AdminSettings'),
        },
      ],
    },
    {
      section: 'Appearance',
      items: [
        {
          icon: theme.isDark ? 'white-balance-sunny' : 'moon-waning-crescent',
          label: theme.isDark ? 'Light Mode' : 'Dark Mode',
          color: '#8B5CF6',
          onPress: toggleTheme,
          showToggle: true,
          value: theme.isDark,
        },
        {
          icon: 'bell',
          label: 'Notifications',
          color: '#EF4444',
          onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon'),
        },
      ],
    },
    {
      section: 'Account',
      items: [
        {
          icon: 'account-edit',
          label: 'Edit Profile',
          color: '#3B82F6',
          onPress: () => Alert.alert('Coming Soon', 'Profile editing will be available soon'),
        },
        {
          icon: 'lock-reset',
          label: 'Change Password',
          color: '#EC4899',
          onPress: () => navigation.navigate('TeacherChangePassword'),
        },
        {
          icon: 'shield-account',
          label: 'Privacy & Security',
          color: '#6366F1',
          onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon'),
        },
      ],
    },
    {
      section: 'About',
      items: [
        {
          icon: 'information',
          label: 'App Version',
          color: '#6B7280',
          subtitle: '1.0.0',
          onPress: () => {},
        },
        {
          icon: 'help-circle',
          label: 'Help & Support',
          color: '#14B8A6',
          onPress: () => Alert.alert('Help', 'Contact support@school.com for assistance'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              {getInitials(user?.name || 'Admin')}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{user?.name || 'Administrator'}</Text>
            <Text style={styles.headerEmail}>{user?.email || 'admin@school.com'}</Text>
            <View style={[styles.roleBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <MaterialCommunityIcons name="shield-star" size={14} color="#FFF" />
              <Text style={styles.roleText}>
                {user?.role?.toUpperCase() || 'ADMIN'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <MaterialCommunityIcons name="account-group" size={24} color={theme.colors.primary} />
            </View>
            <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>Total Users</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>-</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            <View style={[styles.statIcon, { backgroundColor: '#10B981' + '20' }]}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
            </View>
            <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>Active</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>-</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              {section.section}
            </Text>
            <View style={[styles.menuCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
              {section.items.map((item, itemIdx) => (
                <React.Fragment key={itemIdx}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuLeft}>
                      <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                        <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                      </View>
                      <View style={styles.menuLabelWrap}>
                        <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
                          {item.label}
                        </Text>
                        {(item as any).subtitle && (
                          <Text style={[styles.menuSubtitle, { color: theme.colors.textTertiary }]}>
                            {(item as any).subtitle}
                          </Text>
                        )}
                      </View>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={theme.colors.textTertiary}
                    />
                  </TouchableOpacity>
                  {itemIdx < section.items.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: theme.colors.borderLight }]} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.colors.errorLight }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="logout" size={20} color={theme.colors.error} />
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '900',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 4,
  },
  headerEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  menuCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabelWrap: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 72,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AdminProfileScreen;
