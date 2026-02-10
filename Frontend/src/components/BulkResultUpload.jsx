import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Upload, Download, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

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

const BulkResultUpload = () => {
  const navigate = useNavigate();
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
        setResults(null);
      } else {
        toast.error('Please upload only Excel files (.xlsx or .xls)');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };

  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/bulk-results/template', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'result_upload_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Template downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error.response?.data?.message || 'Failed to download template');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/bulk-results/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setResults(response.data);
      
      const successCount = response.data?.success?.length || 0;
      const errorCount = response.data?.errors?.length || 0;
      
      if (errorCount > 0) {
        toast.error(`Uploaded with ${errorCount} errors. ${successCount} successful.`);
      } else {
        toast.success(`Successfully uploaded ${successCount} results!`);
      }
      
      setFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload results');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Bulk Result Upload</h1>
              <p className="text-gray-600 mt-1">Upload multiple student results via Excel file</p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Template
          </button>
        </div>

        {/* Upload Section */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-8 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {file ? file.name : 'Drag & drop Excel file here'}
            </h3>
            <p className="text-gray-500 mb-4">or</p>
            <label className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
              Browse Files
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
            </label>
            <p className="text-sm text-gray-500 mt-4">Supports .xlsx and .xls files (max 10MB)</p>
          </div>

          {file && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Results
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Successfully Uploaded</p>
                    <p className="text-3xl font-bold text-green-700">{results.success?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-red-600 font-medium">Failed</p>
                    <p className="text-3xl font-bold text-red-700">{results.errors?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <Upload className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Processed</p>
                    <p className="text-3xl font-bold text-blue-700">
                      {results.total || ((results.success?.length || 0) + (results.errors?.length || 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Table */}
            {results.success && results.success.length > 0 && (
              <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-green-50 px-6 py-4 border-b-2 border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Successfully Uploaded Results
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Row</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">GR Number</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Standard</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Term</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subjects</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {results.success.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">{item.row}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.grNumber}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.studentName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{formatStandard(item.standard)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.term || 'Term-1'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.subjects || 0} subjects</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Error Table */}
            {results.errors && results.errors.length > 0 && (
              <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-red-50 px-6 py-4 border-b-2 border-red-200">
                  <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Failed to Upload
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Row</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">GR Number</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {results.errors.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">{item.row}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.grNumber || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.studentName || '-'}</td>
                          <td className="px-6 py-4 text-sm text-red-600">{item.error}</td>
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

export default BulkResultUpload;
