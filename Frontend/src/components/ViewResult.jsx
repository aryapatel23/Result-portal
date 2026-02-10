import React, { useState } from 'react';
import { Search, FileText, Award, User, BookOpen, Calendar, Hash, LogIn, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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

const ViewResult = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useState({ grNumber: '', dateOfBirth: '' });
  const [result, setResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });
  };

  const downloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      const response = await axios.get(`/pdf/latest-result/${result.grNumber}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `LatestResult_${result.grNumber}_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchParams.grNumber.trim()) return toast.error('GR Number is required');
    if (!searchParams.dateOfBirth) return toast.error('Date of Birth is required');

    setIsSearching(true);
    setSearched(true);

    try {
      const response = await axios.get(`/student/latest-result`, {
        params: {
          grNumber: searchParams.grNumber,
          dateOfBirth: searchParams.dateOfBirth
        }
      });

      if (response.data) {
        setResult(response.data);
        toast.success('Latest result found!');
      }
    } catch (error) {
      setResult(null);
      toast.error(error.response?.data?.message || 'No results found. Please check your GR Number and Date of Birth.');
      console.error(error);
    }

    setIsSearching(false);
  };

  const getGrade = (percentage) => {
    if (percentage >= 80) return { grade: 'A', color: 'bg-green-100 text-green-800' };
    if (percentage >= 65) return { grade: 'B', color: 'bg-blue-100 text-blue-800' };
    if (percentage >= 50) return { grade: 'C', color: 'bg-yellow-100 text-yellow-800' };
    if (percentage >= 35) return { grade: 'D', color: 'bg-orange-100 text-orange-800' };
    return { grade: 'F', color: 'bg-red-100 text-red-800' };
  };

  const getStatusColor = (marks, maxMarks) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateTotalMarks = (subjects) => {
    return subjects.reduce((sum, sub) => sum + sub.marks, 0);
  };

  const calculateTotalMaxMarks = (subjects) => {
    return subjects.reduce((sum, sub) => sum + sub.maxMarks, 0);
  };

  const calculatePercentage = (subjects) => {
    const total = calculateTotalMarks(subjects);
    const maxTotal = calculateTotalMaxMarks(subjects);
    return ((total / maxTotal) * 100).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center flex-wrap gap-2">
            <FileText className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-gray-900" />
            <span>Latest Result Portal</span>
          </h1>
          <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">
            Enter your GR Number and Date of Birth to view your latest result.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div>
                <label htmlFor="grNumber" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  <Hash className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  GR Number *
                </label>
                <input
                  type="text"
                  id="grNumber"
                  name="grNumber"
                  value={searchParams.grNumber}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                  placeholder="Enter your GR number"
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={searchParams.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <Link 
                to="/student/login"
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 flex items-center"
              >
                <LogIn className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Login for full access
              </Link>
              <button
                type="submit"
                disabled={isSearching}
                className={`flex items-center px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-md bg-gray-900 text-white font-medium w-full sm:w-auto justify-center ${
                  isSearching ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'
                }`}
              >
                {isSearching ? (
                  <>
                    <svg className="animate-spin mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" /> View Latest Result
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Result Display */}
        {searched && (
          <>
            {result ? (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
                {/* Badge - Latest Result */}
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Latest Result
                  </span>
                  <button
                    onClick={downloadPDF}
                    disabled={downloadingPDF}
                    className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-full sm:w-auto justify-center"
                  >
                    {downloadingPDF ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>

                {/* Student Info Header */}
                <div className="border-b border-gray-200 pb-4 sm:pb-6 mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 sm:gap-0">
                    <div className="flex-1">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center mb-3">
                        <User className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                        <span className="break-words">{result.studentName}</span>
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">GR Number:</span> {result.grNumber}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Standard:</span> {formatStandard(result.standard)}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Exam Type:</span> {result.term}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Date:</span> {new Date(result.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center mt-4 sm:mt-0">
                      <div className="bg-gray-100 rounded-full p-3 sm:p-4 mb-2">
                        <Award className="h-8 w-8 sm:h-10 sm:w-10 text-gray-900" />
                      </div>
                      <span className={`text-xl sm:text-2xl font-bold px-3 sm:px-4 py-1 rounded-md ${getGrade(calculatePercentage(result.subjects)).color}`}>
                        {getGrade(calculatePercentage(result.subjects)).grade}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subject-wise Performance Table */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <BookOpen className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                    Subject-wise Performance
                  </h3>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full border border-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-700 uppercase border-b border-gray-200">
                                Subject
                              </th>
                              <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-700 uppercase border-b border-gray-200 whitespace-nowrap">
                                Marks
                              </th>
                              <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-700 uppercase border-b border-gray-200 whitespace-nowrap">
                                Max
                              </th>
                              <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-700 uppercase border-b border-gray-200">
                                %
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                        {result.subjects.map((subject, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                              {subject.name}
                            </td>
                            <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center font-semibold ${getStatusColor(subject.marks, subject.maxMarks)}`}>
                              {subject.marks}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center text-gray-600">
                              {subject.maxMarks}
                            </td>
                            <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center font-semibold ${getStatusColor(subject.marks, subject.maxMarks)}`}>
                              {((subject.marks / subject.maxMarks) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-bold">
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">Total</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center text-gray-900">
                            {calculateTotalMarks(result.subjects)}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center text-gray-900">
                            {calculateTotalMaxMarks(result.subjects)}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center text-gray-900">
                            {calculatePercentage(result.subjects)}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                {result.remarks && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Remarks:</h4>
                    <p className="text-gray-700 text-xs sm:text-sm">{result.remarks}</p>
                  </div>
                )}

                {/* Upload Info */}
                {result.uploadedBy && (
                  <div className="text-xs sm:text-sm text-gray-500 border-t border-gray-200 pt-3 sm:pt-4">
                    <p>Uploaded by: {result.uploadedBy.name} (ID: {result.uploadedBy.employeeId})</p>
                  </div>
                )}

                {/* Login Link */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <p className="text-gray-700 mb-2 text-xs sm:text-sm">Want to see all your results and detailed statistics?</p>
                  <Link 
                    to="/student/login"
                    className="inline-flex items-center px-4 py-2 text-sm sm:text-base bg-gray-900 text-white rounded-md hover:bg-gray-800 font-medium"
                  >
                    <LogIn className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Login to Student Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8 text-center">
                <div className="inline-block p-3 sm:p-4 rounded-full bg-yellow-50 border border-yellow-200 mb-3 sm:mb-4">
                  <Search className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                  Please verify your GR Number and Date of Birth and try again.
                </p>
                <Link 
                  to="/student/login"
                  className="text-gray-900 hover:text-gray-700 underline text-xs sm:text-sm"
                >
                  Or try logging in to your dashboard
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewResult;
