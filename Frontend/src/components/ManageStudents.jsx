import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Users,
  GraduationCap,
  TrendingUp,
  Mail,
  Download,
  X,
  Calendar,
  Phone,
  Hash,
  CheckSquare,
  Square,
  Trash,
  Filter,
  FileSpreadsheet,
  UserRoundCheck,
  AlertCircle,
  Save,
  User
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

const ManageStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [standardFilter, setStandardFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [viewingStudent, setViewingStudent] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, search, standardFilter, sortBy, sortOrder]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/student-management/stats/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/student-management', {
        params: { page, search, standard: standardFilter, limit: 20, sortBy, sortOrder },
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.students);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Fetch students error:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student._id);
    setEditForm({
      name: student.name,
      email: student.email || '',
      dob: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : (student.dob ? student.dob.split('T')[0] : ''),
      standard: student.standard,
      parentContact: student.parentContact || ''
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const validateEditForm = () => {
    const errors = {};
    
    if (!editForm.name || editForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!editForm.standard || editForm.standard.trim().length === 0) {
      errors.standard = 'Standard is required';
    }
    
    if (editForm.parentContact && !/^[0-9]{10}$/.test(editForm.parentContact.replace(/[-\s]/g, ''))) {
      errors.parentContact = 'Invalid phone number (10 digits required)';
    }
    
    return errors;
  };

  const handleSaveEdit = async () => {
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/student-management/${editingStudent}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Student updated successfully!');
      setShowEditModal(false);
      setEditingStudent(null);
      setEditForm({});
      setEditErrors({});
      fetchStudents();
      fetchStats();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update student');
    }
  };

  const handleDelete = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}? This will also delete all their results.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/student-management/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Student deleted successfully!');
      fetchStudents();
      fetchStats();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0) {
      toast.error('Please select students to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedStudents.size} students? This will also delete all their results.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/student-management/bulk-delete', {
        studentIds: Array.from(selectedStudents)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Successfully deleted ${selectedStudents.size} students!`);
      setSelectedStudents(new Set());
      fetchStudents();
      fetchStats();
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete students');
    }
  };

  const handleViewResults = (student) => {
    // Store student info in localStorage for the results page
    localStorage.setItem('viewingStudentInfo', JSON.stringify({
      grNumber: student.grNumber,
      name: student.name,
      standard: student.standard
    }));
    navigate(`/admin/results?grNumber=${student.grNumber}`);
  };

  const handleViewDetails = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/student-management/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setViewingStudent(response.data);
    } catch (error) {
      console.error('View details error:', error);
      toast.error('Failed to load student details');
    }
  };

  const toggleSelectStudent = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map(s => s._id)));
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/student-management/export', {
        params: { search, standard: standardFilter },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Students_Export_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Student list exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export student list');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
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
              <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
              <p className="text-gray-600 mt-1">Comprehensive student management system</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export to Excel
                </>
              )}
            </button>

            {selectedStudents.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash className="w-4 h-4" />
                Delete Selected ({selectedStudents.size})
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Students</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">New (30 days)</p>
                  <p className="text-2xl font-bold text-green-700">{stats.recentRegistrations}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Mail className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">With Email</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.studentsWithEmail}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-600 font-medium">Standards</p>
                  <p className="text-2xl font-bold text-orange-700">{stats.byStandard.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search & Filters
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showFilters ? 'Hide' : 'Show'} Advanced Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, GR number, or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={standardFilter}
              onChange={(e) => {
                setStandardFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">All Standards</option>
              {stats?.byStandard.map((item) => (
                <option key={item._id} value={item._id}>
                  {item._id} ({item.count} students)
                </option>
              ))}
            </select>

            {showFilters && (
              <>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="grNumber">Sort by GR Number</option>
                  <option value="standard">Sort by Standard</option>
                  <option value="createdAt">Sort by Registration Date</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </>
            )}
          </div>

          {(search || standardFilter) && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {search && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                  Search: {search}
                  <button onClick={() => setSearch('')} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {standardFilter && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                  Standard: {standardFilter}
                  <button onClick={() => setStandardFilter('')} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Students Table */}
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase hover:text-gray-800"
                    >
                      {selectedStudents.size === students.length && students.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">GR Number</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Standard</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Parent Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Results</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student._id} className={`hover:bg-gray-50 ${selectedStudents.has(student._id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleSelectStudent(student._id)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          {selectedStudents.has(student._id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {student.grNumber}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(student._id)}
                          className="text-sm text-gray-900 hover:text-blue-600 font-medium transition-colors"
                        >
                          {student.name}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{formatStandard(student.standard)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{student.email || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{student.parentContact || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewResults(student)}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          {student.resultCount} results
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(student._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Student"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student._id, student.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t-2 border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} students
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                  {page} / {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
                  className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit Student Modal */}
        {showEditModal && (
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <div 
              className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b-2 border-gray-200/50 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Edit Student</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <UserRoundCheck className="w-4 h-4" />
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className={`w-full px-4 py-2.5 border-2 ${editErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                      placeholder="Enter student name"
                    />
                    {editErrors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {editErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className={`w-full px-4 py-2.5 border-2 ${editErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                      placeholder="student@example.com"
                    />
                    {editErrors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {editErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={editForm.dob}
                      onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Standard */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <GraduationCap className="w-4 h-4" />
                      Standard <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editForm.standard}
                      onChange={(e) => setEditForm({ ...editForm, standard: e.target.value })}
                      className={`w-full px-4 py-2.5 border-2 ${editErrors.standard ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    >
                      <option value="">Select Standard</option>
                      <option value="Balvatika">Balvatika</option>
                      <option value="1">STD-1</option>
                      <option value="2">STD-2</option>
                      <option value="3">STD-3</option>
                      <option value="4">STD-4</option>
                      <option value="5">STD-5</option>
                      <option value="6">STD-6</option>
                      <option value="7">STD-7</option>
                      <option value="8">STD-8</option>
                    </select>
                    {editErrors.standard && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {editErrors.standard}
                      </p>
                    )}
                  </div>

                  {/* Parent Contact */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4" />
                      Parent Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.parentContact}
                      onChange={(e) => setEditForm({ ...editForm, parentContact: e.target.value })}
                      className={`w-full px-4 py-2.5 border-2 ${editErrors.parentContact ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                      placeholder="10-digit mobile number"
                    />
                    {editErrors.parentContact && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {editErrors.parentContact}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t-2 border-gray-200">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(editingStudent)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Details Modal */}
        {viewingStudent && (
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setViewingStudent(null)}
          >
            <div 
              className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b-2 border-gray-200/50 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
                <button
                  onClick={() => setViewingStudent(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                {/* Student Info */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Hash className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">GR Number</p>
                        <p className="text-lg font-semibold text-gray-900">{viewingStudent.student.grNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="text-lg font-semibold text-gray-900">{viewingStudent.student.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <GraduationCap className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Standard</p>
                        <p className="text-lg font-semibold text-gray-900">{formatStandard(viewingStudent.student.standard)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-lg font-semibold text-gray-900">{viewingStudent.student.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Date of Birth</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {viewingStudent.student.dateOfBirth ? new Date(viewingStudent.student.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : (viewingStudent.student.dob ? new Date(viewingStudent.student.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not provided')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Parent Contact</p>
                        <p className="text-lg font-semibold text-gray-900">{viewingStudent.student.parentContact || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results List */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5" />
                    Results ({viewingStudent.results.length})
                  </h3>
                  
                  {viewingStudent.results.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No results found for this student</p>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {viewingStudent.results.map((result) => (
                        <div key={result._id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{result.term || 'Term-1'}</h4>
                              <p className="text-sm text-gray-600">{formatStandard(result.standard)} - {result.academicYear || '2024-25'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {new Date(result.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                              <button
                                onClick={() => {
                                  setViewingStudent(null);
                                  const role = localStorage.getItem('role');
                                  const editPath = role === 'teacher' ? `/teacher/edit-result/${result._id}` : `/admin/edit-result/${result._id}`;
                                  navigate(editPath);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Result"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {result.subjects && result.subjects.map((subject, idx) => (
                              <div key={idx} className="bg-gray-50 rounded px-3 py-2">
                                <p className="text-xs text-gray-600">{subject.name}</p>
                                <p className="font-semibold text-gray-900">
                                  {subject.marks}/{subject.maxMarks}
                                </p>
                              </div>
                            ))}
                          </div>
                          {result.remarks && (
                            <p className="mt-3 text-sm text-gray-600 italic">
                              <strong>Remarks:</strong> {result.remarks}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      handleEdit(viewingStudent.student);
                      setViewingStudent(null);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Student
                  </button>
                  <button
                    onClick={() => {
                      handleViewResults(viewingStudent.student.grNumber);
                      setViewingStudent(null);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View All Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStudents;
