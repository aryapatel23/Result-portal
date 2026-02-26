import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Loading from '../components/Loading';
import PlaceholderScreen from '../components/PlaceholderScreen';

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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder wrappers for upcoming screens
const TeacherTimetable = TeacherTimetableScreen;
const TeacherProfile = TeacherProfileScreen;
const TeacherUploadResult = TeacherUploadResultScreen;
const TeacherResults = TeacherResultsScreen;
const TeacherAttendance = TeacherAttendanceScreen;
const AdminTeachers = (props: any) => (
  <PlaceholderScreen {...props} title="Teachers" icon="human-male-board" description="View and manage all teachers. Coming soon." />
);
const AdminCreateStudent = (props: any) => (
  <PlaceholderScreen {...props} title="Add Student" icon="account-plus-outline" description="Create a new student account. Coming soon." />
);
const AdminCreateTeacher = (props: any) => (
  <PlaceholderScreen {...props} title="Add Teacher" icon="account-tie-outline" description="Create a new teacher account. Coming soon." />
);
const AdminResults = (props: any) => (
  <PlaceholderScreen {...props} title="Results" icon="chart-box-outline" description="View and manage all results across the institution. Coming soon." />
);
const AdminAttendance = (props: any) => (
  <PlaceholderScreen {...props} title="Attendance" icon="calendar-check-outline" description="Track and manage attendance records. Coming soon." />
);
const AdminBulkOperations = (props: any) => (
  <PlaceholderScreen {...props} title="Bulk Operations" icon="upload-multiple" description="Bulk upload students, teachers, and results. Coming soon." />
);
const AdminSettings = (props: any) => (
  <PlaceholderScreen {...props} title="Settings" icon="cog-outline" description="Configure system settings and preferences. Coming soon." />
);
const AdminEditStudent = (props: any) => (
  <PlaceholderScreen {...props} title="Edit Student" icon="account-edit-outline" description="Edit student details. Coming soon." />
);

const TAB_ICONS: Record<string, { focused: string; default: string }> = {
  Home: { focused: 'home', default: 'home-outline' },
  Results: { focused: 'file-document', default: 'file-document-outline' },
  Analytics: { focused: 'chart-bar', default: 'chart-bar' },
  Profile: { focused: 'account-circle', default: 'account-circle-outline' },
  Students: { focused: 'account-group', default: 'account-group-outline' },
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

// Admin Bottom Tabs
const AdminTabs = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({ ...tabBarScreenOptions(theme), ...renderTabIcon(theme)({ route }) })}>
      <Tab.Screen name="Home" component={AdminDashboard} />
      <Tab.Screen name="Students" component={AdminStudentsScreen} />
      <Tab.Screen name="Profile" component={AdminSettings} />
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
            <Stack.Screen name="AdminTeachers" component={AdminTeachers} />
            <Stack.Screen name="AdminCreateStudent" component={AdminCreateStudent} />
            <Stack.Screen name="AdminCreateTeacher" component={AdminCreateTeacher} />
            <Stack.Screen name="AdminResults" component={AdminResults} />
            <Stack.Screen name="AdminAttendance" component={AdminAttendance} />
            <Stack.Screen name="AdminBulkOperations" component={AdminBulkOperations} />
            <Stack.Screen name="AdminSettings" component={AdminSettings} />
            <Stack.Screen name="AdminEditStudent" component={AdminEditStudent} />
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
