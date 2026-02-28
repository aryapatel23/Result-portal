import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../../services/api';

const TeacherChangePasswordScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();
  const required = route?.params?.required || false;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const validateForm = (): boolean => {
    const newErrors = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!formData.oldPassword.trim()) {
      newErrors.oldPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !newErrors.oldPassword && !newErrors.newPassword && !newErrors.confirmPassword;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await apiService.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      // Clear the passwordResetRequired flag
      if (user && required) {
        const updatedUser = { ...user, passwordResetRequired: false };
        await updateUser(updatedUser);
      }

      Alert.alert('Success', 'Password changed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            if (required) {
              // Navigate to dashboard after required password change
              navigation.replace(user?.role === 'admin' ? 'AdminTabs' : 'TeacherTabs');
            } else {
              navigation.goBack();
            }
          },
        },
      ]);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to change password';
      Alert.alert('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        {!required && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        {required && <View style={styles.backBtn} />}
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {required ? 'Password Change Required' : 'Change Password'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Security Info */}
          <View style={[
            styles.infoCard, 
            { 
              backgroundColor: required ? `${theme.colors.error}15` : `${theme.colors.warning}15`, 
              borderColor: required ? theme.colors.error : theme.colors.warning 
            }
          ]}>
            <MaterialCommunityIcons 
              name={required ? "alert-circle-outline" : "shield-lock-outline"}
              size={22} 
              color={required ? theme.colors.error : theme.colors.warning} 
            />
            <Text style={[
              styles.infoText, 
              { color: required ? theme.colors.error : theme.colors.warning }
            ]}>
              {required 
                ? '🔐 You are using a temporary password. For your security, please set a new strong password now. You cannot access the app until you change it.'
                : 'Choose a strong password with at least 6 characters for better security'
              }
            </Text>
          </View>

          {/* Steps Banner when required */}
          {required && (
            <View style={[styles.stepsBanner, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.stepsTitle, { color: theme.colors.text }]}>📋 How it works:</Text>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.primaryLight }]}>
                  <Text style={[styles.stepNumberText, { color: theme.colors.primary }]}>1</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.colors.textSecondary }]}>Enter the temporary password from your email</Text>
              </View>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.primaryLight }]}>
                  <Text style={[styles.stepNumberText, { color: theme.colors.primary }]}>2</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.colors.textSecondary }]}>Create a new strong password</Text>
              </View>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.primaryLight }]}>
                  <Text style={[styles.stepNumberText, { color: theme.colors.primary }]}>3</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.colors.textSecondary }]}>Confirm your new password</Text>
              </View>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                <MaterialCommunityIcons name="lock" size={14} /> Current Password *
              </Text>
              <View style={styles.passwordInputWrap}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: errors.oldPassword ? theme.colors.error : theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="Enter current password"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={formData.oldPassword}
                  onChangeText={(text) => {
                    setFormData({ ...formData, oldPassword: text });
                    setErrors({ ...errors, oldPassword: '' });
                  }}
                  secureTextEntry={!showOldPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowOldPassword(!showOldPassword)}
                >
                  <MaterialCommunityIcons
                    name={showOldPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
              {errors.oldPassword ? (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.oldPassword}
                </Text>
              ) : null}
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                <MaterialCommunityIcons name="lock-plus" size={14} /> New Password *
              </Text>
              <View style={styles.passwordInputWrap}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: errors.newPassword ? theme.colors.error : theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="Enter new password"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={formData.newPassword}
                  onChangeText={(text) => {
                    setFormData({ ...formData, newPassword: text });
                    setErrors({ ...errors, newPassword: '' });
                  }}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <MaterialCommunityIcons
                    name={showNewPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
              {errors.newPassword ? (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.newPassword}
                </Text>
              ) : null}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                <MaterialCommunityIcons name="lock-check" size={14} /> Confirm New Password *
              </Text>
              <View style={styles.passwordInputWrap}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: errors.confirmPassword ? theme.colors.error : theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="Re-enter new password"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={formData.confirmPassword}
                  onChangeText={(text) => {
                    setFormData({ ...formData, confirmPassword: text });
                    setErrors({ ...errors, confirmPassword: '' });
                  }}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.confirmPassword}
                </Text>
              ) : null}
            </View>

            {/* Password Requirements */}
            <View style={[styles.requirementsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.requirementsTitle, { color: theme.colors.text }]}>
                Password Requirements:
              </Text>
              <View style={styles.requirement}>
                <MaterialCommunityIcons
                  name={formData.newPassword.length >= 6 ? 'check-circle' : 'circle-outline'}
                  size={16}
                  color={formData.newPassword.length >= 6 ? theme.colors.success : theme.colors.textTertiary}
                />
                <Text style={[styles.requirementText, { color: theme.colors.textSecondary }]}>
                  At least 6 characters
                </Text>
              </View>
              <View style={styles.requirement}>
                <MaterialCommunityIcons
                  name={formData.newPassword === formData.confirmPassword && formData.newPassword ? 'check-circle' : 'circle-outline'}
                  size={16}
                  color={
                    formData.newPassword === formData.confirmPassword && formData.newPassword
                      ? theme.colors.success
                      : theme.colors.textTertiary
                  }
                />
                <Text style={[styles.requirementText, { color: theme.colors.textSecondary }]}>
                  Passwords match
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: theme.colors.primary, opacity: isSubmitting ? 0.7 : 1 },
              ]}
              onPress={handleChangePassword}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="shield-check" size={20} color="#FFF" />
                  <Text style={styles.submitText}>Change Password</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  placeholder: { width: 32 },
  scrollContent: { padding: 16 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 24,
  },
  infoText: { fontSize: 13, flex: 1, fontWeight: '500', lineHeight: 18 },
  stepsBanner: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  form: {},
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  passwordInputWrap: { position: 'relative' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    paddingRight: 50,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 12,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  requirementsCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  requirementText: { fontSize: 13 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default TeacherChangePasswordScreen;
