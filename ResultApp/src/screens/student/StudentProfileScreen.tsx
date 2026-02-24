import React from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const StudentProfileScreen = ({ navigation }: any) => {
  const { user } = useAuth();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <View className="flex-1 bg-gray-50">
        <View className="bg-blue-700 pt-12 pb-6 px-6 rounded-b-3xl">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
            <Text className="text-white text-base">← Back</Text>
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">My Profile</Text>
        </View>

        <ScrollView className="flex-1 px-6 mt-4">
          <View className="bg-white rounded-xl p-6 mb-4 shadow-sm border border-gray-200">
            <View className="items-center mb-6">
              <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-3">
                <Text className="text-blue-600 font-bold text-4xl">
                  {user?.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text className="text-gray-900 text-2xl font-bold">{user?.name}</Text>
              <Text className="text-gray-500 text-sm mt-1">{user?.standard}</Text>
            </View>

            <View className="space-y-3">
              <View className="py-3 border-b border-gray-100">
                <Text className="text-gray-500 text-xs mb-1">GR Number</Text>
                <Text className="text-gray-900 font-semibold">{user?.grNumber}</Text>
              </View>
              {user?.dateOfBirth && (
                <View className="py-3 border-b border-gray-100">
                  <Text className="text-gray-500 text-xs mb-1">Date of Birth</Text>
                  <Text className="text-gray-900 font-semibold">{user.dateOfBirth}</Text>
                </View>
              )}
              {user?.mobile && (
                <View className="py-3 border-b border-gray-100">
                  <Text className="text-gray-500 text-xs mb-1">Mobile</Text>
                  <Text className="text-gray-900 font-semibold">{user.mobile}</Text>
                </View>
              )}
              {user?.parentContact && (
                <View className="py-3">
                  <Text className="text-gray-500 text-xs mb-1">Parent Contact</Text>
                  <Text className="text-gray-900 font-semibold">{user.parentContact}</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default StudentProfileScreen;
