import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, User, Calendar, BookOpen, Award, TrendingUp, Download } from 'lucide-react';
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

const StudentResultDetail = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchResultDetail();
  }, [resultId]);

  const fetchResultDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/student/results/${resultId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data);
    } catch (error) {
      toast.error('Failed to load result details');
      if (error.response?.status === 401) {
        navigate('/student/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    if (!result) return { totalMarks: 0, totalMax: 0, percentage: 0 };
    const totalMarks = result.subjects.reduce((sum, sub) => sum + sub.marks, 0);
    const totalMax = result.subjects.reduce((sum, sub) => sum + sub.maxMarks, 0);
    const percentage = ((totalMarks / totalMax) * 100).toFixed(2);
    return { totalMarks, totalMax, percentage };
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' };
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (percentage >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (percentage >= 35) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const getSubjectStatus = (marks, maxMarks) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 35) return { status: 'Pass', color: 'text-green-600' };
    return { status: 'Fail', color: 'text-red-600' };
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/pdf/result/${resultId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Result_${result.grNumber}_${result.term}_${result.academicYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading result...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Result not found</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="mt-4 text-gray-900 hover:text-gray-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { totalMarks, totalMax, percentage } = calculateTotals();
  const gradeInfo = getGrade(percentage);

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center text-gray-700 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>

        {/* Student Info Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 border border-gray-200 p-3 rounded-full">
                <User className="h-12 w-12 text-gray-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{result.studentName}</h1>
                <div className="mt-1 space-y-1 text-sm text-gray-600">
                  <p className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    GR Number: {result.grNumber}
                  </p>
                  <p className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Standard: {formatStandard(result.standard)}
                  </p>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {result.term} - {result.academicYear}
                  </p>
                </div>
              </div>
            </div>

            {/* Grade Badge */}
            <div className={`${gradeInfo.bg} ${gradeInfo.border} border-2 rounded-lg p-4 text-center`}>
              <p className="text-sm text-gray-600 font-medium">Overall Grade</p>
              <p className={`text-4xl font-bold ${gradeInfo.color} mt-1`}>{gradeInfo.grade}</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500 font-medium">Total Marks</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalMarks}/{totalMax}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 font-medium">Percentage</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{percentage}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 font-medium">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{result.subjects.length}</p>
            </div>
          </div>
        </div>

        {/* Subjects Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <BookOpen className="mr-2 h-6 w-6 text-gray-700" />
              Subject-wise Performance
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marks Obtained
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maximum Marks
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.subjects.map((subject, index) => {
                  const subjectPercentage = ((subject.marks / subject.maxMarks) * 100).toFixed(2);
                  const status = getSubjectStatus(subject.marks, subject.maxMarks);
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-gray-900">{subject.marks}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-600">{subject.maxMarks}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-gray-900">{subjectPercentage}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`text-sm font-medium ${status.color}`}>
                          {status.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Remarks */}
        {result.remarks && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <Award className="h-5 w-5 mr-2 text-blue-600" />
              Teacher's Remarks
            </h3>
            <p className="text-gray-700 italic">"{result.remarks}"</p>
          </div>
        )}

        {/* Uploaded By */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Uploaded by:</span> {result.uploadedBy?.name || 'Admin'}
              {result.uploadedBy?.employeeId && <span className="ml-2">({result.uploadedBy.employeeId})</span>}
            </p>
            <p>
              <span className="font-medium">Upload Date:</span> {new Date(result.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResultDetail;
