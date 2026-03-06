/**
 * Login Screen
 * 
 * Handles user authentication (Admin, Teacher, Student)
 * Best UI Version: Modern Header, Polished Inputs, Help Links
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Linking,
  ScrollView,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

type Role = 'student' | 'teacher' | 'admin';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const { theme } = useTheme();

  // State
  const [role, setRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  const [healthCheckStatus, setHealthCheckStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  // Staff Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Student Credentials
  const [grNumber, setGrNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        // Ping the root URL just to wake up the server
        // We use a short timeout here to not block UI
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        await fetch('https://result-portal-tkom.onrender.com', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        setHealthCheckStatus('ok');
      } catch (error) {
        console.error('Backend health check failed:', error);
        setHealthCheckStatus('error');
        Alert.alert(
          'Connection Issue',
          'Could not connect to the server. It might be waking up. Please try again in a moment.'
        );
      }
    };
    checkBackendHealth();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (role === 'student') {
        if (!grNumber.trim()) {
          Alert.alert('Missing Information', 'Please enter your GR Number.');
          setLoading(false);
          return;
        }

        // Format Date to YYYY-MM-DD
        const year = dateOfBirth.getFullYear();
        const month = String(dateOfBirth.getMonth() + 1).padStart(2, '0');
        const day = String(dateOfBirth.getDate()).padStart(2, '0');
        const dobString = `${year}-${month}-${day}`;

        await login({
          role: 'student',
          grNumber: grNumber.trim(),
          dateOfBirth: dobString
        });
      } else {
        // Teacher or Admin
        if (!email.trim() || !password.trim()) {
          Alert.alert('Missing Information', 'Please enter both Email and Password.');
          setLoading(false);
          return;
        }

        console.log('Sending login request:', { role, email: email.trim() });
        const result = await login({
          role,
          email: email.trim(),
          password
        });
        console.log('Login result:', result);
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      let errorMsg = error.message || 'Please check your credentials and try again.';

      // Check for network errors
      if (error.message === 'Network Error' || error.message.includes('timeout')) {
        errorMsg = 'Cannot connect to server. \n\nTIP: If using a real device via USB, run this in your terminal:\nadb reverse tcp:5000 tcp:5000';
      }

      // Wrap in setTimeout to prevent "Activity not attached" crash
      setTimeout(() => {
        Alert.alert('Authentication Failed', errorMsg);
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    // Android: close picker immediately
    setShowDatePicker(false);

    // If user clicked cancel (Android specific)
    if (event.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const openHelp = () => {
    // Wrap in setTimeout to prevent "Activity not attached" crash
    setTimeout(() => {
      Alert.alert(
        "Need Help?",
        "Please contact the school administration office for assistance with your login credentials.",
        [{ text: "OK" }]
      );
    }, 500);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: theme.isDark ? theme.colors.surface : '#eff6ff', borderColor: theme.isDark ? theme.colors.border : '#dbeafe', shadowColor: theme.colors.primary }]}>
              <Icon name="school" size={52} color={theme.colors.primary} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>School Portal</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Welcome back, please sign in.</Text>
          </View>

          {/* Role Selector */}
          <View style={[styles.roleContainer, { backgroundColor: theme.colors.surface }]}>
            {(['student', 'teacher', 'admin'] as Role[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleTab, role === r && [styles.roleTabActive, { backgroundColor: theme.isDark ? theme.colors.card : theme.colors.surface }]]}
                onPress={() => setRole(r)}
                activeOpacity={0.7}
              >
                <Text style={[styles.roleText, { color: theme.colors.textSecondary }, role === r && [styles.roleTextActive, { color: theme.colors.primary }]]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.formCard, { backgroundColor: theme.colors.card }]}>

            {role === 'student' ? (
              // --- STUDENT FORM ---
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Student GR Number</Text>
                  <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <Icon name="id-card-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
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

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Date of Birth</Text>
                  <TouchableOpacity
                    style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <Icon name="calendar-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <Text style={[styles.inputText, { color: theme.colors.text }]}>
                      {dateOfBirth.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                    <Icon name="chevron-down-outline" size={16} color={theme.colors.textSecondary} style={{ marginLeft: 'auto' }} />
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
              // --- STAFF FORM (Teacher/Admin) ---
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Email Address</Text>
                  <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <Icon name="mail-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
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

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
                  <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <Icon name="lock-closed-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
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
                      style={styles.eyeIcon}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Icon name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={openHelp}
                  style={styles.forgotPassword}
                >
                  <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>Forgot Password?</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={openHelp}>
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                Need help? <Text style={[styles.footerLink, { color: theme.colors.primary }]}>Contact Support</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SCREEN_WIDTH > 400 ? 32 : 20, // Responsive padding
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  roleContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    marginBottom: 24,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  roleTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  roleTextActive: {
    fontWeight: '700',
  },
  formCard: {
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontWeight: '600',
    fontSize: 14,
  },
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontWeight: '700',
  },
});

export default LoginScreen;
