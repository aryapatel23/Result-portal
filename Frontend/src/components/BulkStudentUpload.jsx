import React, { useState } from 'react';
import { Upload, Download, Users, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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

const BulkStudentUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        setFile(droppedFile);
      } else {
        toast.error('Please upload only Excel files (.xlsx, .xls)');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
      } else {
        toast.error('Please upload only Excel files (.xlsx, .xls)');
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/bulk-students/template', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_upload_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error('Error downloading template');
      console.error(error);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/bulk-students/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setResults(response.data.results);
      
      if (response.data.results.failed === 0) {
        toast.success(`Successfully registered ${response.data.results.successful} students!`);
      } else {
        toast.success(`Registered ${response.data.results.successful} students. ${response.data.results.failed} failed.`);
      }
      
      setFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading file');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="mr-3 h-8 w-8 text-gray-900" />
            Bulk Student Registration
          </h1>
          <p className="text-gray-600 mt-2">
            Upload an Excel file to register multiple students at once
          </p>
        </div>

        {/* Instructions Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
            How to Upload Students
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Download the Excel template by clicking the button below</li>
            <li>Fill in student details (GR Number, Name, Date of Birth, Standard)</li>
            <li>Date format should be DD/MM/YYYY (e.g., 15/08/2010)</li>
            <li>Email and Parent Contact are optional</li>
            <li>Upload the completed Excel file</li>
          </ol>
        </div>

        {/* Download Template Button */}
        <div className="mb-6">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Excel Template
          </button>
        </div>

        {/* Upload Area */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2 text-gray-700" />
            Upload Excel File
          </h3>

          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 ${dragActive ? 'text-gray-900' : 'text-gray-400'}`} />
            
            {file ? (
              <div>
                <p className="text-gray-900 font-medium mb-2">{file.name}</p>
                <p className="text-sm text-gray-600 mb-4">
                  Size: {(file.size / 1024).toFixed(2)} KB
                </p>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-600 hover:text-red-700 text-sm underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 mb-2">
                  Drag and drop your Excel file here, or
                </p>
                <label className="cursor-pointer">
                  <span className="text-gray-900 underline hover:text-gray-700 font-medium">
                    browse files
                  </span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Only .xlsx and .xls files (Max 5MB)
                </p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          {file && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                  uploading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Students
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Results Display */}
        {results && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Results</h3>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{results.total}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 mb-1">Successfully Registered</p>
                <p className="text-2xl font-bold text-green-600 flex items-center">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  {results.successful}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-600 flex items-center">
                  <XCircle className="h-6 w-6 mr-2" />
                  {results.failed}
                </p>
              </div>
            </div>

            {/* Success Details */}
            {results.successDetails && results.successDetails.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Successfully Registered ({results.successDetails.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Row</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">GR Number</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Standard</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.successDetails.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-600">{item.row}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">{item.grNumber}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatStandard(item.standard)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Error Details */}
            {results.errorDetails && results.errorDetails.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Failed Records ({results.errorDetails.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Row</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">GR Number</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Error</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.errorDetails.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-600">{item.row}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">{item.grNumber}</td>
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

export default BulkStudentUpload;
