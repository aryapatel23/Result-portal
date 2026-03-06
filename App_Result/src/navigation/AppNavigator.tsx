/**
 * App Navigator
 * Main navigation structure with bottom tabs
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import StudentDashboard from '../screens/StudentDashboard';
import ProfileScreen from '../screens/ProfileScreen';
import ResultsScreen from '../screens/ResultsScreen';
import TimetableScreen from '../screens/TimetableScreen';
import StudentProgressScreen from '../screens/StudentProgressScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/AdminDashboard';
import AdminResultsScreen from '../screens/AdminResultsScreen';
import AdminManageTimetableScreen from '../screens/AdminManageTimetableScreen';
import AdminAttendanceScreen from '../screens/AdminAttendanceScreen';
import AdminHolidaysScreen from '../screens/AdminHolidaysScreen';
import AdminStaffScreen from '../screens/AdminStaffScreen';
import AdminTeacherDetailScreen from '../screens/AdminTeacherDetailScreen';
import AdminCreateTeacherScreen from '../screens/AdminCreateTeacher';
import AdminCreateStudentScreen from '../screens/AdminCreateStudent';
import AdminUploadResultScreen from '../screens/AdminUploadResult';

// Teacher Screens
import TeacherDashboardScreen from '../screens/TeacherDashboard';
import TeacherAttendanceScreen from '../screens/TeacherAttendanceScreen';
import TeacherTimetableScreen from '../screens/TeacherTimetableScreen';
import TeacherMyResultsScreen from '../screens/TeacherMyResultsScreen';
import TeacherStudentsScreen from '../screens/TeacherStudentsScreen';
import AdminUploadResult from '../screens/AdminUploadResult';
import TeacherProfileScreen from '../screens/ProfileScreen';
import { useTheme } from '../context/ThemeContext';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ---------- Tab Options ----------

const CommonTabOptions = () => {
  const { theme } = useTheme();
  return {
    tabBarActiveTintColor: theme.colors.primary,
   tabBarInactiveTintColor: theme.colors.textTertiary,
    headerShown: false,
    tabBarStyle: {
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.border,
      borderTopWidth: 1,
      paddingBottom: 8,
      paddingTop: 8,
      height: 65,
      elevation: 8,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600' as '600',
      marginTop: 4,
    },
    tabBarIconStyle: {
      marginTop: 4,
    },
  };
};

// ---------- Student Tabs ----------

const StudentTabs = () => {
  const tabOptions = CommonTabOptions();
  return (
  <Tab.Navigator screenOptions={tabOptions}>
    <Tab.Screen
      name="Dashboard"
      component={StudentDashboard}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size, focused }) =>
          <Icon name={focused ? "home" : "home-outline"} size={size} color={color} />
      }}
    />

    <Tab.Screen
      name="Progress"
      component={StudentProgressScreen}
      options={{
        tabBarIcon: ({ color, size, focused }) =>
          <Icon name={focused ? "stats-chart" : "stats-chart-outline"} size={size} color={color} />
      }}
    />

    <Tab.Screen
      name="Timetable"
      component={TimetableScreen}
      options={{
        tabBarIcon: ({ color, size, focused }) =>
          <Icon name={focused ? "calendar" : "calendar-outline"} size={size} color={color} />
      }}
    />

    <Tab.Screen
      name="Results"
      component={ResultsScreen}
      options={{
        tabBarIcon: ({ color, size, focused }) =>
          <Icon name={focused ? "document-text" : "document-text-outline"} size={size} color={color} />
      }}
    />

    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size, focused }) =>
          <Icon name={focused ? "person" : "person-outline"} size={size} color={color} />
      }}
    />
  </Tab.Navigator>
  );
};

// ---------- Admin Tabs ----------

const AdminTabs = () => {
  const tabOptions = CommonTabOptions();
  return (
  <Tab.Navigator screenOptions={tabOptions}>
    <Tab.Screen
      name="Dashboard"
      component={AdminDashboardScreen}
      options={{
        tabBarIcon: ({ color, size, focused }) =>
          <Icon name={focused ? "grid" : "grid-outline"} size={size} color={color} />
      }}
    />

    <Tab.Screen
      name="Staff"
      component={AdminStaffScreen}
      options={{
        tabBarIcon: ({ color, size, focused }) =>
          <Icon name={focused ? "people" : "people-outline"} size={size} color={color} />
      }}
    />

    <Tab.Screen
      name="Attendance"
      component={AdminAttendanceScreen}
      options={{
        tabBarIcon: ({ color, size, focused }) =>
          <Icon name={focused ? "calendar" : "calendar-outline"} size={size} color={color} />
      }}
    />

    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size, focused }) =>
          <Icon name={focused ? "person" : "person-outline"} size={size} color={color} />
      }}
    />
  </Tab.Navigator>
  );
};

// ---------- Teacher Tabs ----------

const TeacherTabs = () => {
  const tabOptions = CommonTabOptions();
  return (
  <Tab.Navigator screenOptions={tabOptions}>
    <Tab.Screen
      name="Dashboard"
      component={TeacherDashboardScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size, focused }) =>
          <Icon name={focused ? "home" : "home-outline"} size={size} color={color} />
      }}
    />

    <Tab.Screen
      name="Students"
      component={TeacherStudentsScreen}
      options={{
        tabBarIcon: ({ color, size, focused }) =>
          <Icon name={focused ? "people" : "people-outline"} size={size} color={color} />
      }}
    />

    <Tab.Screen
      name="Attendance"
      component={TeacherAttendanceScreen}
      options={{
        tabBarIcon: ({ color, size, focused }) =>
          <Icon name={focused ? "calendar" : "calendar-outline"} size={size} color={color} />
      }}
    />

    <Tab.Screen
      name="Timetable"
      component={TeacherTimetableScreen}
      options={{
        tabBarIcon: ({ color, size, focused }) =>
          <Icon name={focused ? "time" : "time-outline"} size={size} color={color} />
      }}
    />

    <Tab.Screen
      name="Profile"
      component={TeacherProfileScreen}
      options={{
        tabBarIcon: ({ color, size, focused }) =>
          <Icon name={focused ? "person" : "person-outline"} size={size} color={color} />
      }}
    />
  </Tab.Navigator>
  );
};

// ---------- Root Navigator ----------

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          {/* Main Tab Navigators */}
          {user.role === 'admin' ? (
            <Stack.Screen name="AdminTabs" component={AdminTabs} />
          ) : user.role === 'teacher' ? (
            <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
          ) : (
            <Stack.Screen name="StudentTabs" component={StudentTabs} />
          )}

          {/* Common / Secondary Screens (Accessible from Tabs) */}
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="Timetable" component={TimetableScreen} />

          {/* Admin Specific Screens */}
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="AdminStaff" component={AdminStaffScreen} />
          <Stack.Screen name="TeacherDetail" component={AdminTeacherDetailScreen} />
          <Stack.Screen name="AdminAttendance" component={AdminAttendanceScreen} />
          <Stack.Screen name="AdminHolidays" component={AdminHolidaysScreen} />
          <Stack.Screen name="AdminResults" component={AdminResultsScreen} />
          <Stack.Screen name="AdminTimetable" component={AdminManageTimetableScreen} />
          <Stack.Screen name="CreateTeacher" component={AdminCreateTeacherScreen} />
          <Stack.Screen name="CreateStudent" component={AdminCreateStudentScreen} />
          <Stack.Screen name="AdminUploadResult" component={AdminUploadResult} />
          
          {/* Teacher Specific Screens */}
          <Stack.Screen name="TeacherStudents" component={TeacherStudentsScreen} />
          <Stack.Screen name="MyResults" component={TeacherMyResultsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
