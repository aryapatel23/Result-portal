import React, { useState, useEffect , useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Image as ImageIcon,
  AlertCircle,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import * as XLSX from 'xlsx';
import AttendanceSettingsModal from './AttendanceSettingsModal';

const AdminAttendanceView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [todaySummary, setTodaySummary] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const [viewingImage, setViewingImage] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(null);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [manualAttendance, setManualAttendance] = useState({
    teacherId: '',
    status: 'Present',
    date: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  useEffect(() => {
    fetchTodaySummary();
    fetchAttendance();
    fetchTeachers();
  }, [selectedDate, statusFilter]);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch only active teachers for attendance marking
      const response = await axios.get('/admin/teachers?activeOnly=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchTodaySummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/admin/attendance/today-summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodaySummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast.error('Failed to fetch attendance summary');
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { date: selectedDate };
      if (statusFilter) params.status = statusFilter;

      const response = await axios.get('/admin/attendance/all', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setAttendance(response.data.attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = attendance.map((record, index) => ({
      'No.': index + 1,
      'Employee ID': record.employeeId,
      'Teacher Name': record.teacherName,
      'Status': record.status,
      'Location': record.location?.address || 'N/A',
      'Marked By': record.markedBy,
      'Remarks': record.remarks || 'N/A',
      'Date': new Date(record.date).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `Teacher_Attendance_${selectedDate}.xlsx`);
    toast.success('Excel file downloaded successfully');
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/admin/attendance/update/${id}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Attendance updated successfully');
      fetchAttendance();
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  const handleManualMarkSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/admin/attendance/mark',
        manualAttendance,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Attendance marked successfully');
      setShowMarkModal(false);
      fetchAttendance();
      fetchTodaySummary();
      setManualAttendance({
        teacherId: '',
        status: 'Present',
        date: new Date().toISOString().split('T')[0],
        remarks: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/admin/attendance/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Attendance deleted successfully');
      fetchAttendance();
      fetchTodaySummary();
    } catch (error) {
      toast.error('Failed to delete attendance');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800 border-green-300';
      case 'Absent': return 'bg-red-100 text-red-800 border-red-300';
      case 'Half-Day': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Leave': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Not Marked': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Merge pending teachers if viewing today
  const displayedAttendance = useMemo(() => {
    let records = [...attendance];
    const todayStr = new Date().toISOString().split('T')[0];

    if (selectedDate === todayStr && todaySummary?.absentTeachers) {
      // Get existing teacher IDs to avoid duplicates
      const existingTeacherIds = new Set(records.map(r => r.teacherId?.toString()));
      
      // Only add teachers that are not already in the records
      const pendingRecords = todaySummary.absentTeachers
        .filter(t => !existingTeacherIds.has(t._id?.toString()))
        .map(t => ({
          _id: `pending-${t._id}`,
          teacherId: t._id,
          teacherName: t.name,
          employeeId: t.employeeId,
          status: 'Not Marked',
          date: new Date().toISOString(),
          location: { address: 'Pending' },
          markedBy: '-',
          isPending: true
        }));
      records = [...records, ...pendingRecords];
    }
    return records;
  }, [attendance, todaySummary, selectedDate]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Attendance</h1>
            <p className="text-gray-600 mt-1">Manage and monitor teacher attendance</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black font-semibold transition"
            >
              <Settings className="h-5 w-5 mr-2" />
              Automation Settings
            </button>
            <button
              onClick={() => setShowMarkModal(true)}
              className="flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 font-semibold transition"
            >
              <Edit className="h-5 w-5 mr-2" />
              Mark Manual Attendance
            </button>
          </div>
        </div>

        {/* Today's Summary Cards */}
        {todaySummary && selectedDate === new Date().toISOString().split('T')[0] && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] md:text-sm text-gray-600 uppercase tracking-wider">Total</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-900">{todaySummary.total}</p>
                </div>
                <Users className="h-6 w-6 md:h-10 md:w-10 text-gray-400 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] md:text-sm text-gray-600 uppercase tracking-wider">Present</p>
                  <p className="text-xl md:text-3xl font-bold text-green-600">{todaySummary.present}</p>
                </div>
                <CheckCircle className="h-6 w-6 md:h-10 md:w-10 text-green-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] md:text-sm text-gray-600 uppercase tracking-wider">Absent</p>
                  <p className="text-xl md:text-3xl font-bold text-red-600">{todaySummary.absent}</p>
                </div>
                <XCircle className="h-6 w-6 md:h-10 md:w-10 text-red-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] md:text-sm text-gray-600 uppercase tracking-wider">Not Marked</p>
                  <p className="text-xl md:text-3xl font-bold text-orange-600">{todaySummary.notMarked}</p>
                </div>
                <AlertCircle className="h-6 w-6 md:h-10 md:w-10 text-orange-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] md:text-sm text-gray-600 uppercase tracking-wider">Half Day</p>
                  <p className="text-xl md:text-3xl font-bold text-yellow-600">{todaySummary.halfDay}</p>
                </div>
                <Clock className="h-6 w-6 md:h-10 md:w-10 text-yellow-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] md:text-sm text-gray-600 uppercase tracking-wider">Leave</p>
                  <p className="text-xl md:text-3xl font-bold text-blue-600">{todaySummary.leave}</p>
                </div>
                <Calendar className="h-6 w-6 md:h-10 md:w-10 text-blue-600 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="h-4 w-4 inline mr-1" />
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half-Day">Half-Day</option>
                <option value="Leave">On Leave</option>
                <option value="Not Marked">Not Marked</option>
              </select>
            </div>

            <div className="flex items-end sm:col-span-2 md:col-span-1">
              <button
                onClick={handleExportExcel}
                disabled={attendance.length === 0}
                className={`w-full px-4 py-2 rounded-lg font-semibold flex items-center justify-center transition shadow-sm ${attendance.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
              >
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Teacher Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading attendance...</span>
                      </div>
                    </td>
                  </tr>
                ) : displayedAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No attendance records found for this date</p>
                    </td>
                  </tr>
                ) : (
                  displayedAttendance.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.employeeId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.teacherName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          {!record.isPending && (
                            <>
                              <button
                                onClick={() => setViewingDetails(record)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {record.faceImage && (
                                <button
                                  onClick={() => setViewingImage(record.faceImage)}
                                  className="text-purple-600 hover:text-purple-900"
                                  title="View Photo"
                                >
                                  <ImageIcon className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(record._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {record.isPending && (
                            <button
                              onClick={() => {
                                setManualAttendance(prev => ({
                                  ...prev,
                                  teacherId: record.teacherId,
                                  status: 'Present'
                                }));
                                setShowMarkModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center"
                              title="Mark Attendance"
                            >
                              <Edit className="h-4 w-4 mr-1" /> Mark
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Details Modal */}
        {viewingDetails && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setViewingDetails(null)}
          >
            <div 
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Attendance Details</h3>
                  <button
                    onClick={() => setViewingDetails(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Employee ID</p>
                      <p className="font-semibold text-gray-900">{viewingDetails.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Teacher Name</p>
                      <p className="font-semibold text-gray-900">{viewingDetails.teacherName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(viewingDetails.status)}`}>
                        {viewingDetails.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(viewingDetails.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Marked By</p>
                      <p className="font-semibold text-gray-900 capitalize">{viewingDetails.markedBy}</p>
                    </div>
                  </div>

                  {viewingDetails.location && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Location
                      </p>
                      <p className="font-semibold text-gray-900">{viewingDetails.location.address}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Coordinates: {viewingDetails.location.latitude}, {viewingDetails.location.longitude}
                      </p>
                    </div>
                  )}

                  {viewingDetails.remarks && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Remarks</p>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{viewingDetails.remarks}</p>
                    </div>
                  )}

                  {viewingDetails.faceImage && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Face Verification Photo</p>
                      <img
                        src={viewingDetails.faceImage}
                        alt="Face verification"
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Image Modal */}
        {viewingImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setViewingImage(null)}
          >
            <div 
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setViewingImage(null)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
              >
                <XCircle className="h-6 w-6" />
              </button>
              <img
                src={viewingImage}
                alt="Face verification"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Manual Mark Modal - Clean White Theme */}
        {showMarkModal && (
          <div 
            className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={() => setShowMarkModal(false)}
          >
            <div 
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 transform transition-all animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-900 p-2 rounded-lg">
                      <Edit className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Mark Attendance</h3>
                      <p className="text-gray-500 text-xs mt-0.5">Record teacher attendance manually</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMarkModal(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleManualMarkSubmit} className="p-6 space-y-4">
                {/* Teacher Selection */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    <Users className="h-3.5 w-3.5 mr-1.5 text-gray-900" />
                    Teacher
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={manualAttendance.teacherId}
                      onChange={(e) => setManualAttendance({ ...manualAttendance, teacherId: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all appearance-none bg-white text-gray-900 text-sm font-medium cursor-pointer hover:border-gray-400"
                    >
                      <option value="" className="text-gray-500">Select teacher...</option>
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} • {teacher.employeeId}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-900" />
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={manualAttendance.date}
                    onChange={(e) => setManualAttendance({ ...manualAttendance, date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all text-sm font-medium"
                  />
                </div>

                {/* Status Selection - Visual Cards */}
                <div className="space-y-2">
                  <label className="flex items-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-gray-900" />
                    Attendance Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Present */}
                    <label className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      manualAttendance.status === 'Present' 
                        ? 'border-green-500 bg-green-50 shadow-md' 
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}>
                      <input
                        type="radio"
                        name="status"
                        value="Present"
                        checked={manualAttendance.status === 'Present'}
                        onChange={(e) => setManualAttendance({ ...manualAttendance, status: e.target.value })}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-2 w-full">
                        <div className={`p-1.5 rounded-lg ${
                          manualAttendance.status === 'Present' ? 'bg-green-500' : 'bg-gray-200'
                        }`}>
                          <CheckCircle className={`h-4 w-4 ${
                            manualAttendance.status === 'Present' ? 'text-white' : 'text-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${
                            manualAttendance.status === 'Present' ? 'text-green-700' : 'text-gray-700'
                          }`}>Present</p>
                          <p className="text-xs text-gray-500">Full day</p>
                        </div>
                      </div>
                    </label>

                    {/* Absent */}
                    <label className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      manualAttendance.status === 'Absent' 
                        ? 'border-red-500 bg-red-50 shadow-md' 
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}>
                      <input
                        type="radio"
                        name="status"
                        value="Absent"
                        checked={manualAttendance.status === 'Absent'}
                        onChange={(e) => setManualAttendance({ ...manualAttendance, status: e.target.value })}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-2 w-full">
                        <div className={`p-1.5 rounded-lg ${
                          manualAttendance.status === 'Absent' ? 'bg-red-500' : 'bg-gray-200'
                        }`}>
                          <XCircle className={`h-4 w-4 ${
                            manualAttendance.status === 'Absent' ? 'text-white' : 'text-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${
                            manualAttendance.status === 'Absent' ? 'text-red-700' : 'text-gray-700'
                          }`}>Absent</p>
                          <p className="text-xs text-gray-500">Not present</p>
                        </div>
                      </div>
                    </label>

                    {/* Half-Day */}
                    <label className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      manualAttendance.status === 'Half-Day' 
                        ? 'border-yellow-500 bg-yellow-50 shadow-md' 
                        : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                    }`}>
                      <input
                        type="radio"
                        name="status"
                        value="Half-Day"
                        checked={manualAttendance.status === 'Half-Day'}
                        onChange={(e) => setManualAttendance({ ...manualAttendance, status: e.target.value })}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-2 w-full">
                        <div className={`p-1.5 rounded-lg ${
                          manualAttendance.status === 'Half-Day' ? 'bg-yellow-500' : 'bg-gray-200'
                        }`}>
                          <Clock className={`h-4 w-4 ${
                            manualAttendance.status === 'Half-Day' ? 'text-white' : 'text-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${
                            manualAttendance.status === 'Half-Day' ? 'text-yellow-700' : 'text-gray-700'
                          }`}>Half-Day</p>
                          <p className="text-xs text-gray-500">Partial</p>
                        </div>
                      </div>
                    </label>

                    {/* Leave */}
                    <label className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      manualAttendance.status === 'Leave' 
                        ? 'border-gray-500 bg-gray-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="status"
                        value="Leave"
                        checked={manualAttendance.status === 'Leave'}
                        onChange={(e) => setManualAttendance({ ...manualAttendance, status: e.target.value })}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-2 w-full">
                        <div className={`p-1.5 rounded-lg ${
                          manualAttendance.status === 'Leave' ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <Calendar className={`h-4 w-4 ${
                            manualAttendance.status === 'Leave' ? 'text-white' : 'text-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${
                            manualAttendance.status === 'Leave' ? 'text-gray-700' : 'text-gray-700'
                          }`}>On Leave</p>
                          <p className="text-xs text-gray-500">Approved</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    <Edit className="h-3.5 w-3.5 mr-1.5 text-gray-900" />
                    Remarks <span className="text-gray-400 font-normal normal-case ml-1">(Optional)</span>
                  </label>
                  <textarea
                    value={manualAttendance.remarks}
                    onChange={(e) => setManualAttendance({ ...manualAttendance, remarks: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all resize-none text-sm"
                    placeholder="Reason for manual entry..."
                    rows="2"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowMarkModal(false)}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all text-sm flex items-center justify-center"
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!manualAttendance.teacherId}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all text-sm flex items-center justify-center ${
                      manualAttendance.teacherId
                        ? 'bg-gray-900 text-white hover:bg-black shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Save Attendance
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Attendance Settings Modal */}
        <AttendanceSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      </div>
    </div>
  );
};

export default AdminAttendanceView;
