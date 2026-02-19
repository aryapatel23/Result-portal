import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, LogOut, BookOpen, Users, TrendingUp, FileText,
  Upload, Edit, Trash2, Award, Calendar, UserPlus, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';

// Utility function to format standard display consistently
const formatStandard = (standard) => {
  if (!standard) return 'N/A';
  const stdStr = String(standard).trim();

  // Check if it's Balvatika
  if (stdStr.toLowerCase().includes('balvatika') || stdStr.toLowerCase().includes('bal')) {
    return 'Balvatika';
  }

  // Extract number from various formats (9, Grade-9, STD-9, Standard 9, etc.)
  const match = stdStr.match(/\d+/);
  if (match) {
    return `STD-${match[0]}`;
  }

  // If no number found, return as is
  return stdStr;
};

import { useDispatch, useSelector } from 'react-redux';
import { fetchResults, deleteResult } from '../redux/slices/resultSlice';
import { logoutUser } from '../redux/slices/authSlice';

// ... other imports ...

// Utility function remains same ...

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Select from Redux
  const { results: reduxResults } = useSelector((state) => state.results);
  // We can use redux results as 'results' variable for compatibility with existing code
  const results = reduxResults;

  const [teacher, setTeacher] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  // const [results, setResults] = useState([]); // Removed local results state
  const [students, setStudents] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [attendance, setAttendance] = useState({ records: [], stats: null });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token || user.role !== 'teacher') {
      toast.error('Please login first');
      navigate('/');
      return;
    }

    setTeacher(user);
    fetchDashboardData(token);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    // Keep local loading for dashboard (teacher info/stats)
    // Redux handles its own loading state for results
    setLoading(true);
    try {
      // Fetch Dashboard Stats & Teacher Info (Static)
      const dashboardRes = await axios.get('/teacher/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });

      setDashboard(dashboardRes.data);

      // Fetch Results via Redux
      // We await it here so we can process uniqueStudents immediately after
      await dispatch(fetchResults({ role: 'teacher' })).unwrap();

      // Fetch timetable (don't fail if timetable doesn't exist)
      try {
        const timetableRes = await axios.get('/timetable/teacher/timetable?academicYear=2024-25', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000
        });

        if (timetableRes.data.timetable) {
          setTimetable(timetableRes.data.timetable);
        }
      } catch (timetableError) {
        console.log('No timetable found or error fetching timetable:', timetableError.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Server might be slow. Please try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async (token) => {
    setAttendanceLoading(true);
    try {
      const response = await axios.get('/teacher-attendance/my-history', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });
      
      setAttendance({
        records: response.data.attendance || [],
        stats: response.data.stats || null
      });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance history');
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Process unique students when reduxResults change
  useEffect(() => {
    if (reduxResults.length > 0) {
      const uniqueStudents = [];
      const seen = new Set();

      reduxResults.forEach(result => {
        if (!seen.has(result.grNumber)) {
          seen.add(result.grNumber);
          uniqueStudents.push({
            name: result.studentName,
            grNumber: result.grNumber,
            standard: result.standard,
            resultCount: reduxResults.filter(r => r.grNumber === result.grNumber).length,
            lastUpdated: result.createdAt
          });
        }
      });
      setStudents(uniqueStudents);
    }
  }, [reduxResults]);

  // Fetch attendance when attendance tab is activated
  useEffect(() => {
    if (activeTab === 'attendance' && attendance.records.length === 0) {
      const token = localStorage.getItem('token');
      if (token) {
        fetchAttendanceHistory(token);
      }
    }
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      // Dispatch Redux logout action to clear state
      await dispatch(logoutUser()).unwrap();
      
      // Clear all localStorage
      localStorage.clear();
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Navigate to home page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if Redux fails, clear localStorage and navigate
      localStorage.clear();
      toast.success('Logged out successfully');
      navigate('/', { replace: true });
    }
  };

  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;

    try {
      await dispatch(deleteResult(resultId)).unwrap();
      toast.success('Result deleted successfully');
      // No need to manually update state, Redux handles it
    } catch (error) {
      console.error('Error deleting result:', error);
      toast.error(error || 'Failed to delete result');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-8 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 rounded-full p-2 md:p-3">
                <User className="h-8 w-8 md:h-10 md:w-10 text-indigo-600" />
              </div>
              <div>
                {/* <h1 className="text-xl md:text-2xl font-bold text-gray-900">{teacher?.name}</h1>
                <p className="text-xs md:text-sm text-gray-600">ID: {teacher?.employeeId}</p> */}
                <h1 className="text-2xl font-bold text-gray-900">{teacher?.name}</h1>
                <p className="text-sm text-gray-600">Employee ID: {teacher?.employeeId}</p>
                {dashboard?.teacher?.classTeacher && (
                  <p className="text-sm font-semibold text-indigo-600 mt-1">
                    Class Teacher: {dashboard.teacher.classTeacher}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Subjects: {dashboard?.teacher?.subjects?.join(', ') || 'Loading...'}
                </p>
                {dashboard?.teacher?.assignedClasses?.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Teaching in: {dashboard.teacher.assignedClasses.join(', ')}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-sm font-medium text-gray-600 uppercase tracking-wider">Students</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1">
                  {dashboard?.statistics?.totalStudents || 0}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-2 hidden sm:block">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-sm font-medium text-gray-600 uppercase tracking-wider">Classes</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1">
                  {dashboard?.statistics?.classesTaught || 0}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-2 hidden sm:block">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-sm font-medium text-gray-600 uppercase tracking-wider">Avg %</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1">
                  {dashboard?.statistics?.averagePercentage || 0}%
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-2 hidden sm:block">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-sm font-medium text-gray-600 uppercase tracking-wider">Results</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1">
                  {results.length}
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-2 hidden sm:block">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-sm font-medium text-gray-600 uppercase tracking-wider">Leaves</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1">
                  {dashboard?.statistics?.leavesTaken || 0}<span className="text-lg text-gray-500 font-normal">/{dashboard?.statistics?.yearlyLeaveLimit || 12}</span>
                </p>
              </div>
              <div className="bg-red-100 rounded-full p-2 hidden sm:block">
                <Calendar className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 px-2 sm:px-0">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            <button
              onClick={() => navigate('/teacher/mark-attendance')}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-red-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all group"
            >
              <div className="bg-red-100 rounded-full p-4 group-hover:bg-red-200 transition-colors">
                <Clock className="h-8 w-8 text-red-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">Mark Attendance</p>
              <p className="text-xs text-gray-500 mt-1">Check-in today</p>
            </button>

            <button
              onClick={() => navigate('/teacher/upload-result')}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <div className="bg-indigo-100 rounded-full p-4 group-hover:bg-indigo-200 transition-colors">
                <Upload className="h-8 w-8 text-indigo-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">Upload Result</p>
              <p className="text-xs text-gray-500 mt-1">Add single result</p>
            </button>

            <button
              onClick={() => navigate('/teacher/bulk-upload-results')}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
            >
              <div className="bg-purple-100 rounded-full p-4 group-hover:bg-purple-200 transition-colors">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">Bulk Results Upload</p>
              <p className="text-xs text-gray-500 mt-1">Upload via Excel</p>
            </button>

            <button
              onClick={() => navigate('/teacher/register-student')}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="bg-blue-100 rounded-full p-4 group-hover:bg-blue-200 transition-colors">
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">Register Student</p>
              <p className="text-xs text-gray-500 mt-1">Add single student</p>
            </button>

            <button
              onClick={() => navigate('/teacher/bulk-upload-students')}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <div className="bg-green-100 rounded-full p-4 group-hover:bg-green-200 transition-colors">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">Bulk Student Upload</p>
              <p className="text-xs text-gray-500 mt-1">Register via Excel</p>
            </button>

            <button
              onClick={() => navigate('/teacher/manage-students')}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-teal-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all group"
            >
              <div className="bg-teal-100 rounded-full p-4 group-hover:bg-teal-200 transition-colors">
                <Users className="h-8 w-8 text-teal-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">Manage Students</p>
              <p className="text-xs text-gray-500 mt-1">View, edit, delete</p>
            </button>

            <button
              onClick={() => setActiveTab('results')}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-cyan-300 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all group"
            >
              <div className="bg-cyan-100 rounded-full p-4 group-hover:bg-cyan-200 transition-colors">
                <FileText className="h-8 w-8 text-cyan-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">My Results</p>
              <p className="text-xs text-gray-500 mt-1">Results I uploaded</p>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <nav className="flex -mb-px min-w-max">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'results'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Results
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'students'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab('timetable')}
                className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'timetable'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Timetable
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'attendance'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                My Attendance
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Results</h3>
                {dashboard?.recentResults?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboard.recentResults.map((result) => (
                      <div key={result._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-medium text-gray-900">{result.studentName}</p>
                          <p className="text-sm text-gray-500">
                            {result.grNumber} • {formatStandard(result.standard)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(result.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No recent results</p>
                  </div>
                )}
              </div>
            )}

            {/* My Results Tab */}
            {activeTab === 'results' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">All Results</h3>
                  <button
                    onClick={() => navigate('/teacher/upload-result')}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New
                  </button>
                </div>

                {results.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">No results uploaded yet</p>
                    <p className="text-sm text-gray-500 mb-4">Start by uploading your first student result</p>
                    <button
                      onClick={() => navigate('/teacher/upload-result')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Upload Result
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            GR Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Class
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Term
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subjects
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Uploaded
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.map((result) => {
                          const totalMarks = result.subjects?.reduce((sum, sub) => sum + (sub.marks || 0), 0) || 0;
                          const totalMax = result.subjects?.reduce((sum, sub) => sum + (sub.maxMarks || 100), 0) || 100;
                          const percentage = ((totalMarks / totalMax) * 100).toFixed(1);
                          const isPass = percentage >= 33;

                          return (
                            <tr key={result._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{result.studentName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {result.grNumber}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatStandard(result.standard)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {result.term || 'Term-1'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {result.subjects?.length || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${isPass
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                                  }`}>
                                  {percentage}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(result.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => navigate(`/teacher/edit-result/${result._id}`)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4 inline" />
                                </button>
                                <button
                                  onClick={() => handleDeleteResult(result._id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 inline" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* My Students Tab */}
            {activeTab === 'students' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">My Students</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Classes: {dashboard?.teacher?.assignedClasses?.join(', ') || 'None'}
                    </p>
                  </div>
                </div>

                {students.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">No students yet</p>
                    <p className="text-sm text-gray-500">Upload results to see your students here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map((student) => (
                      <div
                        key={student.grNumber}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="bg-indigo-100 rounded-full p-2">
                            <User className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{student.name}</h4>
                            <p className="text-sm text-gray-500">{student.grNumber}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Class:</span>
                            <span className="font-medium text-gray-900">{formatStandard(student.standard)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Results:</span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">
                              {student.resultCount}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Last Updated:</span>
                            <span className="text-gray-500 text-xs">
                              {new Date(student.lastUpdated).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Timetable Tab */}
            {activeTab === 'timetable' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Timetable</h3>
                {timetable && timetable.schedule ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">Day</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">Schedule</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                          <tr key={day} className="hover:bg-gray-50">
                            <td className="px-4 py-4 font-semibold text-gray-900 border align-top">{day}</td>
                            <td className="px-4 py-4 border">
                              {timetable.schedule[day] && timetable.schedule[day].length > 0 ? (
                                <div className="space-y-2">
                                  {timetable.schedule[day].map((period, idx) => (
                                    <div key={idx} className="flex items-center space-x-3 bg-indigo-50 rounded-lg p-3">
                                      <div className="flex items-center space-x-2 text-sm">
                                        <Clock className="h-4 w-4 text-indigo-600" />
                                        <span className="font-medium text-indigo-900">{period.timeSlot}</span>
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-semibold text-gray-900">{period.subject}</span>
                                        <span className="text-gray-600"> - {period.class}</span>
                                        {period.room && <span className="text-gray-500"> (Room: {period.room})</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No classes scheduled</p>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">No Timetable Yet</p>
                    <p className="text-sm text-gray-500 mb-4">Your timetable will be available once the admin creates it</p>
                    <div className="mt-4 space-y-2">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Assigned Classes:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {dashboard?.teacher?.assignedClasses?.map((cls, idx) => (
                            <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                              {cls}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Subjects:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {dashboard?.teacher?.subjects?.map((subject, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">My Attendance History</h3>
                
                {attendanceLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading attendance...</p>
                  </div>
                ) : attendance.stats ? (
                  <div>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                      <div className="bg-white border-2 border-green-200 rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Present</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                              {attendance.stats.present || 0}
                            </p>
                          </div>
                          <div className="bg-green-100 rounded-full p-3">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border-2 border-red-200 rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Absent</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">
                              {attendance.stats.absent || 0}
                            </p>
                          </div>
                          <div className="bg-red-100 rounded-full p-3">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border-2 border-yellow-200 rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Half-Day</p>
                            <p className="text-2xl font-bold text-yellow-600 mt-1">
                              {attendance.stats.halfDay || 0}
                            </p>
                          </div>
                          <div className="bg-yellow-100 rounded-full p-3">
                            <Clock className="h-6 w-6 text-yellow-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Leaves</p>
                            <p className="text-2xl font-bold text-gray-600 mt-1">
                              {attendance.stats.leaves || 0}
                              <span className="text-sm text-gray-400 font-normal">/{attendance.stats.yearlyLeaveLimit || 12}</span>
                            </p>
                          </div>
                          <div className="bg-gray-100 rounded-full p-3">
                            <Calendar className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border-2 border-indigo-200 rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Percentage</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">
                              {attendance.stats.percentage || 0}%
                            </p>
                          </div>
                          <div className="bg-indigo-100 rounded-full p-3">
                            <TrendingUp className="h-6 w-6 text-indigo-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Records Table */}
                    {attendance.records.length > 0 ? (
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Remarks
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {attendance.records.map((record, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(record.date).toLocaleDateString('en-IN', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      record.status === 'Present'
                                        ? 'bg-green-100 text-green-800'
                                        : record.status === 'Absent'
                                        ? 'bg-red-100 text-red-800'
                                        : record.status === 'Half-Day'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {record.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {record.time || '-'}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600">
                                    {record.remarks || (record.autoMarked ? 'Auto-marked' : '-')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium mb-2">No Attendance Records</p>
                        <p className="text-sm text-gray-500">Your attendance records will appear here</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">No Attendance Data</p>
                    <p className="text-sm text-gray-500">Start marking your attendance to see your history</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

