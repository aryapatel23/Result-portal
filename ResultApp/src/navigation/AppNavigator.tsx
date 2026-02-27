import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Loading from '../components/Loading';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';

// Student Screens
import StudentDashboard from '../screens/student/StudentDashboard';
import StudentResultsScreen from '../screens/student/StudentResultsScreen';
import StudentAnalyticsScreen from '../screens/student/StudentAnalyticsScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import ResultDetailScreen from '../screens/student/ResultDetailScreen';
import StudentAttendanceScreen from '../screens/student/StudentAttendanceScreen';
import StudentTimetableScreen from '../screens/student/StudentTimetableScreen';

// Teacher Screens
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import TeacherStudentsScreen from '../screens/teacher/TeacherStudentsScreen';
import TeacherProfileScreen from '../screens/teacher/TeacherProfileScreen';
import TeacherTimetableScreen from '../screens/teacher/TeacherTimetableScreen';
import TeacherUploadResultScreen from '../screens/teacher/TeacherUploadResultScreen';
import TeacherResultsScreen from '../screens/teacher/TeacherResultsScreen';
import TeacherAttendanceScreen from '../screens/teacher/TeacherAttendanceScreen';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminStudentsScreen from '../screens/admin/AdminStudentsScreen';
import AdminTeachersScreen from '../screens/admin/AdminTeachersScreen';
import AdminCreateStudentScreen from '../screens/admin/AdminCreateStudentScreen';
import AdminCreateTeacherScreen from '../screens/admin/AdminCreateTeacherScreen';
import AdminResultsScreen from '../screens/admin/AdminResultsScreen';
import AdminUploadResultScreen from '../screens/admin/AdminUploadResultScreen';
import AdminAttendanceScreen from '../screens/admin/AdminAttendanceScreen';
import AdminHolidaysScreen from '../screens/admin/AdminHolidaysScreen';
import AdminTimetableScreenNew from '../screens/admin/AdminTimetableScreenNew';
import AdminPromoteStudentsScreen from '../screens/admin/AdminPromoteStudentsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AdminTeacherDetailScreen from '../screens/admin/AdminTeacherDetailScreen';
import AdminEditTeacherScreen from '../screens/admin/AdminEditTeacherScreen';
import AdminEditStudentScreen from '../screens/admin/AdminEditStudentScreen';
import AdminResultDetailScreen from '../screens/admin/AdminResultDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Aliases for teacher screens
const TeacherTimetable = TeacherTimetableScreen;
const TeacherProfile = TeacherProfileScreen;
const TeacherUploadResult = TeacherUploadResultScreen;
const TeacherResults = TeacherResultsScreen;
const TeacherAttendance = TeacherAttendanceScreen;

const TAB_ICONS: Record<string, { focused: string; default: string }> = {
  Home: { focused: 'home', default: 'home-outline' },
  Results: { focused: 'file-document', default: 'file-document-outline' },
  Analytics: { focused: 'chart-bar', default: 'chart-bar' },
  Profile: { focused: 'account-circle', default: 'account-circle-outline' },
  Students: { focused: 'account-group', default: 'account-group-outline' },
  Teachers: { focused: 'human-male-board', default: 'human-male-board' },
  Attendance: { focused: 'calendar-check', default: 'calendar-check-outline' },
  Settings: { focused: 'cog', default: 'cog-outline' },
};

const tabBarScreenOptions = (theme: any) => ({
  headerShown: false,
  tabBarActiveTintColor: theme.colors.primary,
  tabBarInactiveTintColor: theme.colors.textTertiary,
  tabBarStyle: {
    backgroundColor: theme.colors.tabBar,
    borderTopColor: theme.colors.tabBarBorder,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '600' as const,
    marginTop: 2,
  },
});

const renderTabIcon = (theme: any) => ({ route }: any) => ({
  tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => {
    const icons = TAB_ICONS[route.name] || TAB_ICONS.Home;
    return (
      <View style={focused ? [styles.activeTab, { backgroundColor: theme.colors.primaryLight }] : undefined}>
        <MaterialCommunityIcons
          name={focused ? icons.focused : icons.default}
          size={focused ? 24 : 22}
          color={color}
        />
      </View>
    );
  },
});

// Student Bottom Tabs
const StudentTabs = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({ ...tabBarScreenOptions(theme), ...renderTabIcon(theme)({ route }) })}>
      <Tab.Screen name="Home" component={StudentDashboard} />
      <Tab.Screen name="Results" component={StudentResultsScreen} />
      <Tab.Screen name="Analytics" component={StudentAnalyticsScreen} />
      <Tab.Screen name="Profile" component={StudentProfileScreen} />
    </Tab.Navigator>
  );
};

// Teacher Bottom Tabs
const TeacherTabs = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({ ...tabBarScreenOptions(theme), ...renderTabIcon(theme)({ route }) })}>
      <Tab.Screen name="Home" component={TeacherDashboard} />
      <Tab.Screen name="Students" component={TeacherStudentsScreen} />
      <Tab.Screen name="Profile" component={TeacherProfile} />
    </Tab.Navigator>
  );
};

// Admin Bottom Tabs - 5 tabs
const AdminTabs = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({ ...tabBarScreenOptions(theme), ...renderTabIcon(theme)({ route }) })}>
      <Tab.Screen name="Home" component={AdminDashboard} />
      <Tab.Screen name="Students" component={AdminStudentsScreen} />
      <Tab.Screen name="Teachers" component={AdminTeachersScreen} />
      <Tab.Screen name="Attendance" component={AdminAttendanceScreen} />
      <Tab.Screen name="Settings" component={AdminSettingsScreen} />
    </Tab.Navigator>
  );
};

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
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user.role === 'student' ? (
          <>
            <Stack.Screen name="StudentTabs" component={StudentTabs} />
            <Stack.Screen name="ResultDetail" component={ResultDetailScreen} />
            <Stack.Screen name="StudentAttendance" component={StudentAttendanceScreen} />
            <Stack.Screen name="StudentTimetable" component={StudentTimetableScreen} />
            <Stack.Screen name="StudentResults" component={StudentResultsScreen} />
            <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
          </>
        ) : user.role === 'teacher' ? (
          <>
            <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
            <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
            <Stack.Screen name="TeacherStudents" component={TeacherStudentsScreen} />
            <Stack.Screen name="TeacherUploadResult" component={TeacherUploadResult} />
            <Stack.Screen name="TeacherResults" component={TeacherResults} />
            <Stack.Screen name="TeacherAttendance" component={TeacherAttendance} />
            <Stack.Screen name="TeacherTimetable" component={TeacherTimetable} />
            <Stack.Screen name="TeacherProfile" component={TeacherProfile} />
          </>
        ) : user.role === 'admin' ? (
          <>
            <Stack.Screen name="AdminTabs" component={AdminTabs} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="AdminStudents" component={AdminStudentsScreen} />
            <Stack.Screen name="AdminTeachers" component={AdminTeachersScreen} />
            <Stack.Screen name="AdminCreateStudent" component={AdminCreateStudentScreen} />
            <Stack.Screen name="AdminCreateTeacher" component={AdminCreateTeacherScreen} />
            <Stack.Screen name="AdminResults" component={AdminResultsScreen} />
            <Stack.Screen name="AdminUploadResult" component={AdminUploadResultScreen} />
            <Stack.Screen name="AdminAttendance" component={AdminAttendanceScreen} />
            <Stack.Screen name="AdminHolidays" component={AdminHolidaysScreen} />
            <Stack.Screen name="AdminTimetable" component={AdminTimetableScreenNew} />
            <Stack.Screen name="AdminPromoteStudents" component={AdminPromoteStudentsScreen} />
            <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
            <Stack.Screen name="AdminTeacherDetail" component={AdminTeacherDetailScreen} />
            <Stack.Screen name="AdminEditTeacher" component={AdminEditTeacherScreen} />
            <Stack.Screen name="AdminEditStudent" component={AdminEditStudentScreen} />
            <Stack.Screen name="AdminResultDetail" component={AdminResultDetailScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  activeTab: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
  },
});

export default AppNavigator;
