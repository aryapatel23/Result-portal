import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, CheckCircle, XCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const PromoteStudents = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [results, setResults] = useState(null);
  
  const [promotionData, setPromotionData] = useState({
    currentStandard: '',
    newStandard: '',
    promotionType: 'byStandard' // 'byStandard' or 'selective'
  });

  const standardOptions = [
    'Balvatika', '1', '2', '3', '4', '5', '6', '7', '8'
  ];

  const getNextStandard = (current) => {
    const index = standardOptions.indexOf(current);
    if (index !== -1 && index < standardOptions.length - 1) {
      return standardOptions[index + 1];
    }
    return 'Graduated';
  };

  useEffect(() => {
    if (promotionData.currentStandard) {
      setPromotionData(prev => ({
        ...prev,
        newStandard: getNextStandard(prev.currentStandard)
      }));
    }
  }, [promotionData.currentStandard]);

  const fetchStudentsByStandard = async () => {
    if (!promotionData.currentStandard) {
      toast.error('Please select a standard first');
      return;
    }

    setFetchingStudents(true);
    setStudents([]);
    setSelectedStudents([]);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching students for standard:', promotionData.currentStandard);
      
      const response = await axios.get(
        `/student-promotion/by-standard/${promotionData.currentStandard}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Response:', response.data);

      if (response.data.students && response.data.students.length > 0) {
        setStudents(response.data.students);
        setSelectedStudents(response.data.students.map(s => s._id)); // Select all by default
        toast.success(`Found ${response.data.total} students in Standard ${promotionData.currentStandard}`);
      } else {
        setStudents([]);
        setSelectedStudents([]);
        toast(`No students found in Standard ${promotionData.currentStandard}`, {
          icon: 'ℹ️',
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch students');
      setStudents([]);
      setSelectedStudents([]);
    } finally {
      setFetchingStudents(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s._id));
    }
  };

  const handleSelectStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handlePromote = async () => {
    if (promotionData.promotionType === 'byStandard') {
      if (!promotionData.currentStandard || !promotionData.newStandard) {
        toast.error('Please select current and new standards');
        return;
      }
    } else {
      if (selectedStudents.length === 0) {
        toast.error('Please select at least one student to promote');
        return;
      }
    }

    setLoading(true);
    setResults(null);

    try {
      const token = localStorage.getItem('token');
      const payload = promotionData.promotionType === 'byStandard'
        ? {
            currentStandard: promotionData.currentStandard,
            newStandard: promotionData.newStandard
          }
        : {
            studentIds: selectedStudents,
            newStandard: promotionData.newStandard
          };

      const response = await axios.post('/student-promotion/bulk', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResults(response.data.results);
      toast.success(`Successfully promoted ${response.data.results.successful.length} students!`);
      
      // Clear students list after successful promotion
      setStudents([]);
      setSelectedStudents([]);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to promote students');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="mr-3 h-8 w-8 text-gray-900" />
            Promote Students
          </h1>
          <p className="text-gray-600 mt-2">
            Move students to the next standard/class
          </p>
        </div>

        {/* Promotion Type Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Promotion Type</h3>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="promotionType"
                value="byStandard"
                checked={promotionData.promotionType === 'byStandard'}
                onChange={(e) => {
                  setPromotionData({ ...promotionData, promotionType: e.target.value });
                  setStudents([]);
                  setSelectedStudents([]);
                }}
                className="mr-2"
              />
              <span className="text-gray-700">Promote Entire Standard</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="promotionType"
                value="selective"
                checked={promotionData.promotionType === 'selective'}
                onChange={(e) => {
                  setPromotionData({ ...promotionData, promotionType: e.target.value });
                }}
                className="mr-2"
              />
              <span className="text-gray-700">Select Specific Students</span>
            </label>
          </div>
        </div>

        {/* Promotion Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Promotion Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Current Standard */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Standard <span className="text-red-500">*</span>
              </label>
              <select
                value={promotionData.currentStandard}
                onChange={(e) => setPromotionData({ ...promotionData, currentStandard: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
              >
                <option value="">Select Current Standard</option>
                {standardOptions.map(std => (
                  <option key={std} value={std}>{formatStandard(std)}</option>
                ))}
              </select>
            </div>

            {/* New Standard */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promote to Standard <span className="text-red-500">*</span>
              </label>
              <select
                value={promotionData.newStandard}
                onChange={(e) => setPromotionData({ ...promotionData, newStandard: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
              >
                <option value="">Select New Standard</option>
                {standardOptions.map(std => (
                  <option key={std} value={std}>{formatStandard(std)}</option>
                ))}
                <option value="Graduated">Graduated</option>
              </select>
            </div>
          </div>

          {/* Selective Promotion - Fetch Students */}
          {promotionData.promotionType === 'selective' && (
            <div className="mb-6">
              <button
                onClick={fetchStudentsByStandard}
                disabled={!promotionData.currentStandard || fetchingStudents}
                className={`px-6 py-2.5 rounded-md font-medium ${
                  !promotionData.currentStandard || fetchingStudents
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {fetchingStudents ? 'Loading...' : 'Load Students'}
              </button>
            </div>
          )}

          {/* Student Selection List */}
          {promotionData.promotionType === 'selective' && students.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900">
                  Select Students to Promote ({selectedStudents.length}/{students.length})
                </h4>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-gray-900 hover:text-gray-700 underline"
                >
                  {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === students.length}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">GR Number</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map(student => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student._id)}
                            onChange={() => handleSelectStudent(student._id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{student.grNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.email || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-700">
                <strong>Warning:</strong> This action will update the standard for {' '}
                {promotionData.promotionType === 'byStandard' 
                  ? `all students in Standard ${promotionData.currentStandard}` 
                  : `${selectedStudents.length} selected student(s)`}.
                This cannot be easily undone.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handlePromote}
              disabled={loading}
              className={`flex items-center px-6 py-2.5 rounded-md font-medium ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Promoting...
                </>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Promote Students
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Display */}
        {results && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Promotion Results</h3>
            
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Processed</p>
                <p className="text-2xl font-bold text-gray-900">{results.total}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 mb-1">Successfully Promoted</p>
                <p className="text-2xl font-bold text-green-600 flex items-center">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  {results.successful.length}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-600 flex items-center">
                  <XCircle className="h-6 w-6 mr-2" />
                  {results.failed.length}
                </p>
              </div>
            </div>

            {/* Success Details */}
            {results.successful.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Successfully Promoted ({results.successful.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">GR Number</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">From</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">To</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.successful.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">{item.grNumber}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{formatStandard(item.oldStandard)}</td>
                          <td className="px-4 py-2 text-sm text-green-600 font-semibold">{formatStandard(item.newStandard)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Error Details */}
            {results.failed.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Failed ({results.failed.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">GR Number</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Error</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.failed.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">{item.grNumber}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-red-600">{item.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoteStudents;
