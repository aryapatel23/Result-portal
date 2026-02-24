import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  TextInput,
} from 'react-native';
import apiService from '../../services/api';
import Loading from '../../components/Loading';
import { Student } from '../../types';

const AdminStudentsScreen = ({ navigation }: any) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery, selectedClass]);

  const fetchStudents = async () => {
    try {
      const response = await apiService.getAllStudents();
      setStudents(response.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (selectedClass !== 'all') {
      filtered = filtered.filter((s) => s.standard === selectedClass);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.grNumber.toLowerCase().includes(query) ||
          s.standard.toLowerCase().includes(query)
      );
    }

    setFilteredStudents(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const getUniqueClasses = () => {
    const classes = Array.from(new Set(students.map((s) => s.standard)));
    return ['all', ...classes.sort()];
  };

  const handleDeleteStudent = (studentId: string, studentName: string) => {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to delete ${studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteStudent(studentId);
              Alert.alert('Success', 'Student deleted successfully');
              fetchStudents();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete student');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-blue-700 pt-12 pb-6 px-6 rounded-b-3xl">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
            <Text className="text-white text-base">← Back</Text>
          </TouchableOpacity>
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold">All Students</Text>
              <Text className="text-blue-100 text-sm mt-1">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('AdminCreateStudent')}
              className="bg-blue-800 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">+ Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-6 mt-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Bar */}
          <View className="mb-4">
            <TextInput
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
              placeholder="Search students..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Class Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {getUniqueClasses().map((cls) => (
              <TouchableOpacity
                key={cls}
                onPress={() => setSelectedClass(cls)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  selectedClass === cls
                    ? 'bg-blue-600'
                    : 'bg-white border border-gray-300'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    selectedClass === cls ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {cls === 'all' ? 'All Classes' : cls}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Students List */}
          {filteredStudents.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center border border-gray-200">
              <Text className="text-6xl mb-3">👨‍🎓</Text>
              <Text className="text-gray-900 font-semibold text-lg mb-2">
                No Students Found
              </Text>
              <Text className="text-gray-500 text-sm text-center">
                {searchQuery ? 'Try different search terms' : 'Add students to get started'}
              </Text>
            </View>
          ) : (
            filteredStudents.map((student) => (
              <View
                key={student._id}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-200"
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-blue-600 font-bold text-lg">
                      {student.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold text-base">
                      {student.name}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      GR: {student.grNumber} • {student.standard}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${
                      student.isActive ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        student.isActive ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {student.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row mt-3 pt-3 border-t border-gray-100">
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('AdminEditStudent', { studentId: student._id })
                    }
                    className="flex-1 bg-blue-100 py-2 rounded-lg mr-2"
                  >
                    <Text className="text-blue-700 font-semibold text-center">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteStudent(student._id, student.name)}
                    className="flex-1 bg-red-100 py-2 rounded-lg ml-2"
                  >
                    <Text className="text-red-700 font-semibold text-center">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <View className="pb-8" />
        </ScrollView>
      </View>
    </>
  );
};

export default AdminStudentsScreen;
