import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Briefcase,
  Mail,
  Phone,
  BookOpen,
  Users,
  FileText,
  TrendingUp,
  Award,
  Star,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';

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

const AdminTeacherDetail = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);

  useEffect(() => {
    fetchTeacherDetails();
  }, [teacherId]);

  const fetchTeacherDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/admin/teachers/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeacherData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teacher details:', error);
      toast.error('Failed to load teacher details');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teacher details...</p>
        </div>
      </div>
    );
  }

  if (!teacherData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Teacher not found</p>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mt-4 text-gray-900 hover:text-gray-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { teacher, overallStatistics, recentResults } = teacherData;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center text-gray-700 hover:text-gray-900 mb-6 font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        {/* Teacher Info Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-gray-100 rounded-full p-6 border border-gray-200">
                <Briefcase className="h-16 w-16 text-gray-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{teacher.name}</h1>
                <div className="mt-2 space-y-1">
                  <p className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {teacher.email}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Employee ID: {teacher.employeeId}
                  </p>
                  <div className="flex items-center mt-2">
                    {teacher.isActive ? (
                      <span className="flex items-center px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-medium">
                        <XCircle className="h-4 w-4 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/admin/edit-teacher/${teacherId}`)}
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 font-medium shadow-sm"
              >
                Edit Details
              </button>
              <button
                onClick={() => navigate(`/admin/teacher/${teacherId}/timetable`)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium shadow-sm"
              >
                Timetable
              </button>
            </div>
          </div>

          {/* Subjects and Classes */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm mb-2 font-medium">Subjects</p>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects?.map((subject, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
            {teacher.classTeacher && (
              <div>
                <p className="text-gray-500 text-sm mb-2 font-medium">📚 Class Teacher Of</p>
                <span className="px-4 py-2 bg-yellow-50 text-yellow-800 border-2 border-yellow-300 rounded-full text-sm font-semibold">
                  {teacher.classTeacher}
                </span>
              </div>
            )}
            <div>
              <p className="text-gray-500 text-sm mb-2 font-medium">Teaching Classes</p>
              <div className="flex flex-wrap gap-2">
                {teacher.assignedClasses?.map((cls, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {overallStatistics.totalStudents}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-full p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Classes Taught</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {overallStatistics.classesTaught}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-full p-3">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Class Average</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {overallStatistics.overallAverage}%
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pass Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {overallStatistics.passPercentage}%
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-full p-3">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Graph */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pass/Fail Visual - Enhanced */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Pass vs Fail Rate</h3>
              <div className="bg-white rounded-lg p-6">
                {/* Chart Area */}
                <div className="relative" style={{ height: '260px' }}>
                  {/* Y-axis labels and grid */}
                  <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-right pr-2">
                    {[100, 75, 50, 25, 0].map((value) => (
                      <span key={value} className="text-xs text-gray-500">
                        {value}%
                      </span>
                    ))}
                  </div>
                  
                  {/* Grid lines */}
                  <div className="absolute left-10 right-0 top-0 bottom-0 flex flex-col justify-between">
                    {[100, 75, 50, 25, 0].map((value) => (
                      <div key={value} className="border-t border-gray-200"></div>
                    ))}
                  </div>

                  {/* Bars */}
                  <div className="absolute left-14 right-0 top-0 bottom-0 flex items-end justify-center gap-12">
                    {/* Pass Bar */}
                    <div className="relative group" style={{ width: '120px', height: '100%' }}>
                      {/* Background track */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gray-100 border border-gray-200 rounded-t-lg" style={{ height: '100%' }}></div>
                      
                      {/* Colored fill bar */}
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-lg transition-all duration-500 cursor-pointer"
                        style={{
                          height: `calc(${Math.max(parseFloat(overallStatistics.passPercentage) || 0, 2)}%)`
                        }}
                      >
                        {/* Percentage label */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {overallStatistics.passPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Fail Bar */}
                    <div className="relative group" style={{ width: '120px', height: '100%' }}>
                      {/* Background track */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gray-100 border border-gray-200 rounded-t-lg" style={{ height: '100%' }}></div>
                      
                      {/* Colored fill bar */}
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-red-500 rounded-t-lg transition-all duration-500 cursor-pointer"
                        style={{
                          height: `calc(${Math.max(100 - parseFloat(overallStatistics.passPercentage) || 0, 2)}%)`
                        }}
                      >
                        {/* Percentage label */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {(100 - parseFloat(overallStatistics.passPercentage)).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend Below */}
                <div className="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                      <p className="text-sm font-medium text-gray-700">Pass</p>
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      {overallStatistics.passPercentage}%
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                      <p className="text-sm font-medium text-gray-700">Fail</p>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      {(100 - parseFloat(overallStatistics.passPercentage)).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Classes Taught */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Classes Distribution</h3>
              <div className="space-y-3">
                {overallStatistics.classes?.map((cls, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="w-32 text-sm font-medium text-gray-700">{cls}</div>
                    <div className="flex-1 bg-gray-100 border border-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-gray-700 h-full flex items-center justify-end px-2 text-white text-xs font-medium transition-all duration-500"
                        style={{ width: `${Math.random() * 40 + 60}%` }}
                      >
                        {Math.floor(Math.random() * 20 + 10)} students
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Results */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Results Uploaded</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    GR Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Standard
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Term
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Uploaded Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentResults && recentResults.length > 0 ? (
                  recentResults.map((result) => (
                    <tr key={result._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {result.grNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatStandard(result.standard)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {result.term || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(result.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No results uploaded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTeacherDetail;
