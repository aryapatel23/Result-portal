import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import apiService from '../../services/api';
import Loading from '../../components/Loading';
import { Result } from '../../types';

const ResultDetailScreen = ({ route, navigation }: any) => {
  const { resultId } = route.params;
  const [result, setResult] = useState<Result | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResultDetail();
  }, []);

  const fetchResultDetail = async () => {
    try {
      const response = await apiService.getResultById(resultId);
      setResult(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load result details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !result) {
    return <Loading />;
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-700';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-700';
      case 'C+':
      case 'C':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-blue-700 pt-12 pb-6 px-6 rounded-b-3xl">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mb-4"
          >
            <Text className="text-white text-base">← Back</Text>
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Result Details</Text>
          <Text className="text-blue-100 text-sm mt-1">{result.examType}</Text>
        </View>

        <ScrollView className="flex-1 px-6 mt-4" showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-200">
            <View className="items-center mb-4">
              <Text className="text-gray-600 text-sm mb-2">Overall Performance</Text>
              <Text className="text-blue-600 text-5xl font-bold">
                {result.percentage.toFixed(1)}%
              </Text>
              <View className={`mt-3 px-6 py-2 rounded-full ${getGradeColor(result.grade)}`}>
                <Text className="font-bold text-lg">Grade {result.grade}</Text>
              </View>
            </View>

            <View className="flex-row justify-around pt-4 border-t border-gray-200">
              <View className="items-center">
                <Text className="text-gray-500 text-xs mb-1">Obtained</Text>
                <Text className="text-gray-900 text-xl font-bold">
                  {result.obtainedMarks}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-gray-500 text-xs mb-1">Total</Text>
                <Text className="text-gray-900 text-xl font-bold">
                  {result.totalMarks}
                </Text>
              </View>
              {result.rank && (
                <View className="items-center">
                  <Text className="text-gray-500 text-xs mb-1">Rank</Text>
                  <Text className="text-gray-900 text-xl font-bold">
                    #{result.rank}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Exam Info */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-200">
            <Text className="text-gray-900 font-bold text-lg mb-4">
              Exam Information
            </Text>
            <View className="space-y-3">
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">Exam Type</Text>
                <Text className="text-gray-900 font-semibold">{result.examType}</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">Term</Text>
                <Text className="text-gray-900 font-semibold">{result.term}</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">Academic Year</Text>
                <Text className="text-gray-900 font-semibold">{result.academicYear}</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Published On</Text>
                <Text className="text-gray-900 font-semibold">
                  {new Date(result.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Subject-wise Performance */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-200">
            <Text className="text-gray-900 font-bold text-lg mb-4">
              Subject-wise Performance
            </Text>
            {result.subjects.map((subject, index) => (
              <View
                key={index}
                className="mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-gray-900 font-semibold text-base flex-1">
                    {subject.name}
                  </Text>
                  <View className={`px-3 py-1 rounded-lg ${getGradeColor(subject.grade)}`}>
                    <Text className="font-bold text-sm">{subject.grade}</Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600 text-sm">
                    {subject.obtainedMarks} / {subject.totalMarks}
                  </Text>
                  <Text className="text-blue-600 font-semibold">
                    {((subject.obtainedMarks / subject.totalMarks) * 100).toFixed(1)}%
                  </Text>
                </View>
                {/* Progress Bar */}
                <View className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${(subject.obtainedMarks / subject.totalMarks) * 100}%`,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Remarks */}
          {result.remarks && (
            <View className="bg-blue-50 rounded-xl p-5 mb-4 border border-blue-200">
              <Text className="text-blue-900 font-bold text-base mb-2">
                📝 Teacher's Remarks
              </Text>
              <Text className="text-blue-800 text-sm leading-5">
                "{result.remarks}"
              </Text>
            </View>
          )}

          {/* Attendance if available */}
          {result.attendance !== undefined && (
            <View className="bg-green-50 rounded-xl p-5 mb-4 border border-green-200">
              <Text className="text-green-900 font-bold text-base mb-2">
                📅 Attendance
              </Text>
              <Text className="text-green-800 text-3xl font-bold">
                {result.attendance}%
              </Text>
            </View>
          )}

          <View className="pb-8" />
        </ScrollView>
      </View>
    </>
  );
};

export default ResultDetailScreen;
