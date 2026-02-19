import React, { Suspense } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './redux/store';

// Core Components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

// Main Routes
import ViewResult from './components/ViewResult';
import UploadResult from './components/UploadResult';
import Home from './components/Home';
import AdminResultView from './components/AdminResultView';
import Activities from './components/Activities';
import EditResult from './components/EditResult';

// Student Components
import StudentRegister from './components/StudentRegister';
import StudentLogin from './components/StudentLogin';
import StudentDashboard from './components/StudentDashboard';
import StudentResultDetail from './components/StudentResultDetail';
import BulkStudentUpload from './components/BulkStudentUpload';
import RegisterStudent from './components/RegisterStudent';
import PromoteStudents from './components/PromoteStudents';

// Teacher Components
import TeacherDashboard from './components/TeacherDashboard';
import TeacherEditResult from './components/TeacherEditResult';
import BulkResultUpload from './components/BulkResultUpload';
import ManageStudents from './components/ManageStudents';
import TeacherMarkAttendance from './components/TeacherMarkAttendance';

// Admin Components
import AdminDashboard from './components/AdminDashboard';
import AdminCreateTeacher from './components/AdminCreateTeacher';
import AdminCreateStudent from './components/AdminCreateStudent';
import AdminTeacherDetail from './components/AdminTeacherDetail';
import AdminEditTeacher from './components/AdminEditTeacher';
import TeacherTimetable from './components/TeacherTimetable';
import AdminAttendanceView from './components/AdminAttendanceView';
import AdminHolidaysView from './components/AdminHolidaysView';

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <LoadingSpinner size="xl" text="Loading..." />
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen bg-gray-50">
            {/* Enhanced Toaster with custom styling */}
            <Toaster 
              position="top-right" 
              reverseOrder={false}
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
            
            <Navbar />
            
            <main>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/activities" element={<Activities />} />

                  <Route path="/student/register" element={<StudentRegister />} />
                  <Route path="/student/login" element={<StudentLogin />} />
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/result/:resultId" element={<StudentResultDetail />} />
                  <Route path="/student/view" element={<ViewResult />} />

                  {/* Teacher Routes */}
                  <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                  <Route path="/teacher/mark-attendance" element={<TeacherMarkAttendance />} />
                  <Route path="/teacher/upload-result" element={<UploadResult />} />
                  <Route path="/teacher/edit-result/:id" element={<TeacherEditResult />} />
                  <Route path="/teacher/bulk-upload-students" element={<BulkStudentUpload />} />
                  <Route path="/teacher/register-student" element={<RegisterStudent />} />
                  <Route path="/teacher/bulk-upload-results" element={<BulkResultUpload />} />
                  <Route path="/teacher/manage-students" element={<ManageStudents />} />
                  <Route path="/teacher/view-result" element={<AdminResultView />} />

                  {/* Admin Routes */}
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/attendance" element={<AdminAttendanceView />} />
                  <Route path="/admin/holidays" element={<AdminHolidaysView />} />
                  <Route path="/admin/create-teacher" element={<AdminCreateTeacher />} />
                  <Route path="/admin/create-student" element={<AdminCreateStudent />} />
                  <Route path="/admin/bulk-upload-students" element={<BulkStudentUpload />} />
                  <Route path="/admin/register-student" element={<RegisterStudent />} />
                  <Route path="/admin/promote-students" element={<PromoteStudents />} />
                  <Route path="/admin/teacher/:teacherId" element={<AdminTeacherDetail />} />
                  <Route path="/admin/edit-teacher/:teacherId" element={<AdminEditTeacher />} />
                  <Route path="/admin/teacher/:teacherId/timetable" element={<TeacherTimetable />} />
                  <Route path="/admin/upload" element={<UploadResult />} />
                  <Route path="/admin/results" element={<AdminResultView />} />
                  <Route path="/admin/edit-result/:id" element={<EditResult />} />
                  <Route path="/admin/bulk-upload-results" element={<BulkResultUpload />} />
                  <Route path="/admin/manage-students" element={<ManageStudents />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </BrowserRouter>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
