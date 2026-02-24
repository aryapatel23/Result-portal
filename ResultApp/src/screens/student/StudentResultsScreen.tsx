import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import Loading from '../../components/Loading';
import { Result } from '../../types';

const StudentResultsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'current' | 'previous'>('all');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await apiService.getStudentResults(user?.grNumber || '');
      setResults(response.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load results');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchResults();
  };

  const getFilteredResults = () => {
    // You can implement filtering logic based on academic year
    return results;
  };

  if (isLoading) {
    return <Loading />;
  }

  const filteredResults = getFilteredResults();

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
          <Text className="text-white text-2xl font-bold">All Results</Text>
          <Text className="text-blue-100 text-sm mt-1">
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6 mt-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Filter Tabs */}
          <View className="flex-row mb-6">
            <TouchableOpacity
              onPress={() => setFilter('all')}
              className={`flex-1 mr-2 py-3 rounded-xl ${
                filter === 'all'
                  ? 'bg-blue-600'
                  : 'bg-white border border-gray-300'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  filter === 'all' ? 'text-white' : 'text-gray-700'
                }`}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilter('current')}
              className={`flex-1 mx-1 py-3 rounded-xl ${
                filter === 'current'
                  ? 'bg-blue-600'
                  : 'bg-white border border-gray-300'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  filter === 'current' ? 'text-white' : 'text-gray-700'
                }`}
              >
                Current
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilter('previous')}
              className={`flex-1 ml-2 py-3 rounded-xl ${
                filter === 'previous'
                  ? 'bg-blue-600'
                  : 'bg-white border border-gray-300'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  filter === 'previous' ? 'text-white' : 'text-gray-700'
                }`}
              >
                Previous
              </Text>
            </TouchableOpacity>
          </View>

          {/* Results List */}
          {filteredResults.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center border border-gray-200">
              <Text className="text-6xl mb-3">📚</Text>
              <Text className="text-gray-900 font-semibold text-lg mb-2">
                No Results Found
              </Text>
              <Text className="text-gray-500 text-sm text-center">
                Your exam results will appear here once they are published by your teachers
              </Text>
            </View>
          ) : (
            filteredResults.map((result) => (
              <TouchableOpacity
                key={result._id}
                onPress={() => navigation.navigate('ResultDetail', { resultId: result._id })}
                className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-200 active:bg-gray-50"
              >
                {/* Header */}
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 mr-4">
                    <Text className="text-gray-900 font-bold text-lg">
                      {result.examType}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      {result.term} • {result.academicYear}
                    </Text>
                    <Text className="text-gray-600 text-xs mt-1">
                      {new Date(result.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View className="items-center">
                    <View className="bg-blue-100 px-4 py-2 rounded-xl">
                      <Text className="text-blue-700 font-bold text-lg">
                        {result.percentage.toFixed(1)}%
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-xs mt-1">
                      Grade: {result.grade}
                    </Text>
                  </View>
                </View>

                {/* Stats */}
                <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                  <View>
                    <Text className="text-gray-500 text-xs">Total Marks</Text>
                    <Text className="text-gray-900 font-semibold mt-1">
                      {result.obtainedMarks} / {result.totalMarks}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-gray-500 text-xs">Subjects</Text>
                    <Text className="text-gray-900 font-semibold mt-1">
                      {result.subjects.length}
                    </Text>
                  </View>
                  {result.rank && (
                    <View>
                      <Text className="text-gray-500 text-xs">Rank</Text>
                      <Text className="text-gray-900 font-semibold mt-1">
                        #{result.rank}
                      </Text>
                    </View>
                  )}
                  <Text className="text-blue-600 font-semibold">
                    View →
                  </Text>
                </View>

                {result.remarks && (
                  <View className="mt-3 pt-3 border-t border-gray-100">
                    <Text className="text-gray-500 text-xs mb-1">Remarks:</Text>
                    <Text className="text-gray-700 text-sm italic">
                      "{result.remarks}"
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}

          <View className="pb-8" />
        </ScrollView>
      </View>
    </>
  );
};

export default StudentResultsScreen;
