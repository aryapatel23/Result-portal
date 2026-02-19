import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Award,
  UserPlus,
  ChevronRight,
  Star,
  BarChart3,
  Clock,
  Settings, // Added Settings Icon
  Calendar,
} from 'lucide-react';
import SystemSettingsModal from './SystemSettingsModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false); // Modal State
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalResults: 0,
    avgClassPercentage: 0,
    teachers: [],
  });
  const [resultsActivity, setResultsActivity] = useState([]);

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!user || !token || user.role !== 'admin') {
      toast.error('Please login as admin');
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch dashboard overview, teacher list, and results activity
      const [dashboardResponse, teachersResponse, resultsResponse] = await Promise.all([
        axios.get('/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/admin/teachers', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/admin/results-activity', {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      // Map the teachers data to include performance
      const teachersWithPerformance = teachersResponse.data.map(teacher => {
        const stats = dashboardResponse.data.allTeachers?.find(t => t.teacherId === teacher._id);
        return {
          ...teacher,
          performance: {
            totalResultsUploaded: stats?.resultsUploaded || 0,
            classAveragePercentage: stats?.classAverage || 0,
            adminRating: stats?.rating || 0,
          }
        };
      });

      setDashboardData({
        totalStudents: dashboardResponse.data.overview?.totalStudents || 0,
        totalTeachers: dashboardResponse.data.overview?.totalTeachers || 0,
        totalResults: dashboardResponse.data.overview?.totalResults || 0,
        avgClassPercentage: dashboardResponse.data.allTeachers?.reduce((sum, t) => sum + t.classAverage, 0) / (dashboardResponse.data.allTeachers?.length || 1) || 0,
        teachers: teachersWithPerformance,
      });
      setResultsActivity(resultsResponse.data.activity || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleCreateTeacher = () => {
    navigate('/admin/create-teacher');
  };

  const handleCreateStudent = () => {
    navigate('/admin/create-student');
  };

  const handleViewResults = () => {
    navigate('/admin/results');
  };

  const handleViewTeacher = (teacherId) => {
    navigate(`/admin/teacher/${teacherId}`);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage teachers, students, and monitor overall performance
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-sm font-medium text-gray-600 uppercase tracking-wider">Students</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">
                  {dashboardData.totalStudents}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-2 md:p-3 hidden sm:block">
                <Users className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-sm font-medium text-gray-600 uppercase tracking-wider">Teachers</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">
                  {dashboardData.totalTeachers}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-2 md:p-3 hidden sm:block">
                <Briefcase className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-sm font-medium text-gray-600 uppercase tracking-wider">Results</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">
                  {dashboardData.totalResults}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-2 md:p-3 hidden sm:block">
                <FileText className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-sm font-medium text-gray-600 uppercase tracking-wider">Avg %</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">
                  {dashboardData.avgClassPercentage?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-2 md:p-3 hidden sm:block">
                <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 px-2 sm:px-0">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            <button
              onClick={handleCreateTeacher}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <div className="bg-indigo-100 rounded-full p-4 group-hover:bg-indigo-200 transition-colors">
                <UserPlus className="h-8 w-8 text-indigo-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">Create Teacher</p>
            </button>

            <button
              onClick={handleCreateStudent}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <div className="bg-green-100 rounded-full p-4 group-hover:bg-green-200 transition-colors">
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">Create Student</p>
            </button>

            <button
              onClick={() => navigate('/admin/bulk-upload-students')}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
            >
              <div className="bg-orange-100 rounded-full p-4 group-hover:bg-orange-200 transition-colors">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">Bulk Upload</p>
            </button>

            <button
              onClick={() => navigate('/admin/upload')}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="bg-blue-100 rounded-full p-4 group-hover:bg-blue-200 transition-colors">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">Add Result</p>
            </button>

            <button
              onClick={handleViewResults}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
            >
              <div className="bg-purple-100 rounded-full p-4 group-hover:bg-purple-200 transition-colors">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">View Results</p>
            </button>

            <button
              onClick={() => navigate('/admin/promote-students')}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-teal-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all group"
            >
              <div className="bg-teal-100 rounded-full p-4 group-hover:bg-teal-200 transition-colors">
                <Award className="h-8 w-8 text-teal-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">Promote Students</p>
            </button>

            <button
              onClick={() => navigate('/admin/attendance')}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-red-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all group"
            >
              <div className="bg-red-100 rounded-full p-4 group-hover:bg-red-200 transition-colors">
                <Clock className="h-8 w-8 text-red-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">Teacher Attendance</p>
            </button>

            <button
              onClick={() => navigate('/admin/holidays')}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-pink-300 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-all group"
            >
              <div className="bg-pink-100 rounded-full p-4 group-hover:bg-pink-200 transition-colors">
                <Calendar className="h-8 w-8 text-pink-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">Holidays</p>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all group"
            >
              <div className="bg-gray-100 rounded-full p-4 group-hover:bg-gray-200 transition-colors">
                <Settings className="h-8 w-8 text-gray-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">System Settings</p>
            </button>
          </div>
        </div>

        {/* Results Upload Activity */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-6 w-6 mr-2 text-indigo-600" />
                Results Upload Activity
              </h2>
              <p className="text-sm text-gray-600 mt-1">Track which teachers uploaded results</p>
            </div>
            <button
              onClick={() => navigate('/admin/results')}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
            >
              View All Results
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {/* Upload Chart */}
          <div className="space-y-4">
            {resultsActivity.length > 0 ? (
              resultsActivity.map((activity, index) => {
                const maxUploads = Math.max(...resultsActivity.map(a => a.totalUploads));
                const percentage = (activity.totalUploads / maxUploads) * 100;

                return (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{activity.teacherName}</p>
                          <p className="text-xs text-gray-500">{activity.employeeId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-600">{activity.totalUploads}</p>
                        <p className="text-xs text-gray-500">results uploaded</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gray-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    {/* Recent Uploads Info */}
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Last upload: {activity.lastUploadDate ? new Date(activity.lastUploadDate).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {activity.standardsCount || 0} standards
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                          {activity.termsCount || 0} terms
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/teacher/${activity.teacherId}`)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No results uploaded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Teacher Performance Table */}
        <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">All Teachers</h2>
              <p className="text-sm text-gray-600 mt-1">Manage and monitor teacher performance</p>
            </div>
            <button
              onClick={handleCreateTeacher}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Teacher
            </button>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subjects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Results Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Average
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.teachers && dashboardData.teachers.length > 0 ? (
                  dashboardData.teachers.map((teacher) => (
                    <tr key={teacher._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {teacher.name}
                            </div>
                            <div className="text-sm text-gray-500">{teacher.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {teacher.employeeId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects?.slice(0, 2).map((subject, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                            >
                              {subject}
                            </span>
                          ))}
                          {teacher.subjects?.length > 2 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{teacher.subjects.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {teacher.performance?.totalResultsUploaded || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {teacher.performance?.classAveragePercentage?.toFixed(1) || 0}%
                          </span>
                          <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-900">
                            {teacher.performance?.adminRating || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewTeacher(teacher._id)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No teachers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* System Settings Modal */}
      <SystemSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
};

export default AdminDashboard;
