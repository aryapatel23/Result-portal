import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

type Role = 'student' | 'teacher' | 'admin';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ROLE_CONFIG = {
  student: { icon: 'school-outline', label: 'Student' },
  teacher: { icon: 'human-male-board', label: 'Teacher' },
  admin: { icon: 'shield-account-outline', label: 'Admin' },
};

const LoginScreen = () => {
  const { login } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const [role, setRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [grNumber, setGrNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2010, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (role === 'student') {
        if (!grNumber.trim()) {
          Alert.alert('Missing Information', 'Please enter your GR Number.');
          setLoading(false);
          return;
        }
        const year = dateOfBirth.getFullYear();
        const month = String(dateOfBirth.getMonth() + 1).padStart(2, '0');
        const day = String(dateOfBirth.getDate()).padStart(2, '0');
        const dobString = `${year}-${month}-${day}`;

        await login({
          role: 'student',
          grNumber: grNumber.trim(),
          dateOfBirth: dobString,
        });
      } else {
        if (!email.trim() || !password.trim()) {
          Alert.alert('Missing Information', 'Please enter both Email and Password.');
          setLoading(false);
          return;
        }
        await login({
          role,
          email: email.trim(),
          password,
        });
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      const errorMsg = error.message || 'Please check your credentials and try again.';
      setTimeout(() => {
        Alert.alert('Authentication Failed', errorMsg);
      }, 300);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'dismissed') return;
    if (selectedDate) setDateOfBirth(selectedDate);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Theme Toggle */}
          <TouchableOpacity
            style={[styles.themeToggle, { backgroundColor: theme.colors.card }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isDark ? 'weather-sunny' : 'weather-night'}
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>

          {/* Brand Header */}
          <View style={styles.header}>
            <View style={[styles.logoOuter, { backgroundColor: theme.colors.primaryLight }]}>
              <View style={[styles.logoInner, { backgroundColor: theme.colors.primary }]}>
                <MaterialCommunityIcons name="school" size={36} color="#FFFFFF" />
              </View>
            </View>
            <Text style={[styles.brandTitle, { color: theme.colors.text }]}>
              Result Portal
            </Text>
            <Text style={[styles.brandSubtitle, { color: theme.colors.textTertiary }]}>
              Sign in to continue your journey
            </Text>
          </View>

          {/* Role Selector */}
          <View style={[styles.roleRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {(['student', 'teacher', 'admin'] as Role[]).map((r) => {
              const isActive = role === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.roleChip,
                    isActive && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => setRole(r)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={ROLE_CONFIG[r].icon}
                    size={18}
                    color={isActive ? '#FFFFFF' : theme.colors.textTertiary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.roleLabel,
                      { color: isActive ? '#FFFFFF' : theme.colors.textSecondary },
                      isActive && styles.roleLabelActive,
                    ]}
                  >
                    {ROLE_CONFIG[r].label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
            {role === 'student' ? (
              <>
                {/* GR Number */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                    GR Number
                  </Text>
                  <View style={[styles.inputWrap, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
                    <MaterialCommunityIcons name="card-account-details-outline" size={20} color={theme.colors.textTertiary} />
                    <TextInput
                      style={[styles.input, { color: theme.colors.text }]}
                      placeholder="e.g. 2023001"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={grNumber}
                      onChangeText={setGrNumber}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Date of Birth */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                    Date of Birth
                  </Text>
                  <TouchableOpacity
                    style={[styles.inputWrap, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="calendar-month-outline" size={20} color={theme.colors.textTertiary} />
                    <Text style={[styles.inputText, { color: theme.colors.text }]}>
                      {dateOfBirth.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={18} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={dateOfBirth}
                      mode="date"
                      display="default"
                      onChange={onDateChange}
                      maximumDate={new Date()}
                    />
                  )}
                </View>
              </>
            ) : (
              <>
                {/* Email */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                    Email Address
                  </Text>
                  <View style={[styles.inputWrap, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
                    <MaterialCommunityIcons name="email-outline" size={20} color={theme.colors.textTertiary} />
                    <TextInput
                      style={[styles.input, { color: theme.colors.text }]}
                      placeholder="name@school.com"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                    Password
                  </Text>
                  <View style={[styles.inputWrap, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color={theme.colors.textTertiary} />
                    <TextInput
                      style={[styles.input, { color: theme.colors.text }]}
                      placeholder="Enter password"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MaterialCommunityIcons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color={theme.colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.forgotRow}>
                  <Text style={[styles.forgotText, { color: theme.colors.primary }]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginBtn,
                { backgroundColor: theme.colors.primary },
                loading && { opacity: 0.6 },
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.loginBtnContent}>
                  <Text style={styles.loginBtnText}>Sign In</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
              Need help?{' '}
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                Contact Support
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SCREEN_WIDTH > 400 ? 28 : 20,
    paddingVertical: 24,
  },
  themeToggle: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoOuter: {
    width: 88,
    height: 88,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoInner: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 15,
    fontWeight: '400',
  },
  roleRow: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  roleLabelActive: {
    fontWeight: '700',
  },
  formCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  inputText: {
    flex: 1,
    fontSize: 15,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -6,
  },
  forgotText: {
    fontWeight: '600',
    fontSize: 13,
  },
  loginBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  loginBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 13,
  },
});

export default LoginScreen;
