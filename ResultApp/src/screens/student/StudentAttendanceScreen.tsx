import React from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity } from 'react-native';

const StudentAttendanceScreen = ({ navigation }: any) => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <View className="flex-1 bg-gray-50">
        <View className="bg-blue-700 pt-12 pb-6 px-6 rounded-b-3xl">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
            <Text className="text-white text-base">← Back</Text>
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">My Attendance</Text>
          <Text className="text-blue-100 text-sm mt-1">View your attendance records</Text>
        </View>

        <ScrollView className="flex-1 px-6 mt-4">
          <View className="bg-white rounded-xl p-8 items-center border border-gray-200">
            <Text className="text-6xl mb-3">📅</Text>
            <Text className="text-gray-900 font-semibold text-lg mb-2">
              Attendance Records
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              Your attendance records will appear here
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default StudentAttendanceScreen;
