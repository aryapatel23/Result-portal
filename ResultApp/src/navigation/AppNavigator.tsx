import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';

// Student Screens
import StudentDashboard from '../screens/student/StudentDashboard';
import StudentResultsScreen from '../screens/student/StudentResultsScreen';
import ResultDetailScreen from '../screens/student/ResultDetailScreen';
import StudentAttendanceScreen from '../screens/student/StudentAttendanceScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import StudentTimetableScreen from '../screens/student/StudentTimetableScreen';

// Teacher Screens
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import TeacherStudentsScreen from '../screens/teacher/TeacherStudentsScreen';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminStudentsScreen from '../screens/admin/AdminStudentsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!user ? (
          // Auth Stack
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user.role === 'student' ? (
          // Student Stack
          <>
            <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
            <Stack.Screen name="StudentResults" component={StudentResultsScreen} />
            <Stack.Screen name="ResultDetail" component={ResultDetailScreen} />
            <Stack.Screen name="StudentAttendance" component={StudentAttendanceScreen} />
            <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
            <Stack.Screen name="StudentTimetable" component={StudentTimetableScreen} />
          </>
        ) : user.role === 'teacher' ? (
          // Teacher Stack
          <>
            <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
            <Stack.Screen name="TeacherStudents" component={TeacherStudentsScreen} />
            {/* Add more teacher screens here */}
          </>
        ) : user.role === 'admin' ? (
          // Admin Stack
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="AdminStudents" component={AdminStudentsScreen} />
            {/* Add more admin screens here */}
          </>
        ) : (
          // Fallback
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
