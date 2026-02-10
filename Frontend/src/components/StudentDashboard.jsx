import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, User, BookOpen, Award, LogOut, TrendingUp } from 'lucide-react';
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

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!user || !token || user.role !== 'student') {
      toast.error('Please login first');
      navigate('/student/login');
      return;
    }

    setStudent(user);
    fetchData(token);
  }, [navigate]);

  const fetchData = async (token) => {
    try {
      const [resultsRes, profileRes] = await Promise.all([
        axios.get('/student/results', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/student/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setResults(resultsRes.data);
      setStats(profileRes.data.statistics);
    } catch (error) {
      toast.error('Failed to fetch data');
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out successfully');
    navigate('/student/login');
  };

  const calculatePercentage = (result) => {
    const totalMarks = result.subjects.reduce((sum, sub) => sum + sub.marks, 0);
    const totalMax = result.subjects.reduce((sum, sub) => sum + sub.maxMarks, 0);
    return ((totalMarks / totalMax) * 100).toFixed(2);
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-500' };
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600' };
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-500' };
    if (percentage >= 50) return { grade: 'C', color: 'text-yellow-600' };
    if (percentage >= 35) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 border border-gray-200 p-3 rounded-full">
                <User className="h-12 w-12 text-gray-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{student?.name}</h1>
                <p className="text-gray-600">GR Number: {student?.grNumber}</p>
                <p className="text-gray-600">Class: {formatStandard(student?.standard)}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Exams</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalExamsTaken || 0}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-full p-3">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Average Percentage</p>
                <p className="text-3xl font-bold text-green-600">{stats?.averagePercentage || 0}%</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-full p-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Overall Grade</p>
                <p className={`text-3xl font-bold ${getGrade(stats?.averagePercentage || 0).color}`}>
                  {getGrade(stats?.averagePercentage || 0).grade}
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-full p-3">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <BookOpen className="mr-2 h-6 w-6 text-gray-700" />
            My Results
          </h2>

          {results.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No results found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => {
                const percentage = calculatePercentage(result);
                const gradeInfo = getGrade(percentage);
                
                return (
                  <div
                    key={result._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => navigate(`/student/result/${result._id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {result.term} - {result.academicYear}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${gradeInfo.color} bg-opacity-10`}>
                            Grade: {gradeInfo.grade}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Standard: {formatStandard(result.standard)}</p>
                          <p>Total Subjects: {result.subjects.length}</p>
                          <p>Uploaded by: {result.uploadedBy?.name || 'Admin'}</p>
                          <p>Date: {new Date(result.createdAt).toLocaleDateString()}</p>
                        </div>
                        {result.remarks && (
                          <p className="mt-2 text-sm italic text-gray-700">"{result.remarks}"</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900">{percentage}%</p>
                        <p className="text-sm text-gray-500">
                          {result.subjects.reduce((sum, sub) => sum + sub.marks, 0)}/
                          {result.subjects.reduce((sum, sub) => sum + sub.maxMarks, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
