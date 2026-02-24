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
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';

const LoginScreen = () => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login({ identifier, password, role: selectedRole });
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const getRolePlaceholder = () => {
    switch (selectedRole) {
      case 'student':
        return 'GR Number';
      case 'teacher':
        return 'Email or Employee ID';
      case 'admin':
        return 'Email';
      default:
        return 'Email or ID';
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Student Result Portal</Text>
            <Text style={styles.subtitle}>Access your academic information</Text>
          </View>

          {/* Role Selection */}
          <View style={styles.content}>
            <Text style={styles.sectionLabel}>Select Your Role</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                onPress={() => setSelectedRole('student')}
                style={[
                  styles.roleButton,
                  styles.roleButtonLeft,
                  selectedRole === 'student' && styles.roleButtonActive
                ]}
              >
                <Text style={[
                  styles.roleText,
                  selectedRole === 'student' && styles.roleTextActive
                ]}>
                  Student
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedRole('teacher')}
                style={[
                  styles.roleButton,
                  styles.roleButtonMiddle,
                  selectedRole === 'teacher' && styles.roleButtonActive
                ]}
              >
                <Text style={[
                  styles.roleText,
                  selectedRole === 'teacher' && styles.roleTextActive
                ]}>
                  Teacher
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedRole('admin')}
                style={[
                  styles.roleButton,
                  styles.roleButtonRight,
                  selectedRole === 'admin' && styles.roleButtonActive
                ]}
              >
                <Text style={[
                  styles.roleText,
                  selectedRole === 'admin' && styles.roleTextActive
                ]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Sign In</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{getRolePlaceholder()}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Enter your ${getRolePlaceholder()}`}
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Info Section */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>📱 Quick Access</Text>
              <Text style={styles.infoText}>
                {selectedRole === 'student' && 'View your results, attendance, and academic progress'}
                {selectedRole === 'teacher' && 'Manage students, upload results, and mark attendance'}
                {selectedRole === 'admin' && 'Full system access and management'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#1d4ed8',
    paddingTop: 64,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#bfdbfe',
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 24,
    marginTop: 32,
    paddingBottom: 32,
  },
  sectionLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  roleButtonLeft: {
    marginRight: 8,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  roleButtonMiddle: {
    marginHorizontal: 4,
    borderRadius: 12,
  },
  roleButtonRight: {
    marginLeft: 8,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  roleButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  roleText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#374151',
  },
  roleTextActive: {
    color: '#ffffff',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#111827',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    marginTop: 32,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoTitle: {
    color: '#1e3a8a',
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: '#1e40af',
    fontSize: 14,
  },
});

export default LoginScreen;
