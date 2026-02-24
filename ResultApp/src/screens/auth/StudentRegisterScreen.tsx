import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import apiService from '../../services/api';

const StudentRegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    grNumber: '',
    dateOfBirth: '',
    standard: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    parentContact: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (
      !formData.name.trim() ||
      !formData.grNumber.trim() ||
      !formData.password.trim() ||
      !formData.standard.trim()
    ) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.registerStudent({
        name: formData.name,
        grNumber: formData.grNumber,
        dateOfBirth: formData.dateOfBirth,
        standard: formData.standard,
        password: formData.password,
        mobile: formData.mobile,
        parentContact: formData.parentContact,
      });

      Alert.alert(
        'Success',
        'Registration successful! You can now login.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-gray-50"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="bg-blue-700 pt-16 pb-6 px-6 rounded-b-3xl">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mb-4"
            >
              <Text className="text-white text-base">← Back</Text>
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold">
              Student Registration
            </Text>
            <Text className="text-blue-100 text-sm mt-1">
              Create your student account
            </Text>
          </View>

          {/* Form */}
          <View className="px-6 mt-6">
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <View className="mb-4">
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  Full Name *
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  GR Number *
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="Enter your GR number"
                  value={formData.grNumber}
                  onChangeText={(text) => setFormData({ ...formData, grNumber: text })}
                  autoCapitalize="characters"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  Standard/Class *
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="e.g., STD 10, STD 12"
                  value={formData.standard}
                  onChangeText={(text) => setFormData({ ...formData, standard: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  Date of Birth
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="DD/MM/YYYY"
                  value={formData.dateOfBirth}
                  onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  Mobile Number
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="Your mobile number"
                  value={formData.mobile}
                  onChangeText={(text) => setFormData({ ...formData, mobile: text })}
                  keyboardType="phone-pad"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  Parent Contact
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="Parent/Guardian contact"
                  value={formData.parentContact}
                  onChangeText={(text) => setFormData({ ...formData, parentContact: text })}
                  keyboardType="phone-pad"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  Password *
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View className="mb-6">
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  Confirm Password *
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                onPress={handleRegister}
                disabled={isLoading}
                className={`rounded-xl py-4 ${isLoading ? 'bg-gray-400' : 'bg-blue-600 active:bg-blue-700'}`}
              >
                <Text className="text-white text-center font-bold text-base">
                  {isLoading ? 'Registering...' : 'Register'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-4 mb-8">
              <Text className="text-gray-500 text-xs text-center">
                * Required fields
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default StudentRegisterScreen;
