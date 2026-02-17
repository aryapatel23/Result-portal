import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  CalendarCheck,
  CalendarX,
  Repeat,
  AlertCircle,
  Check,
  X,
  Download,
  ArrowLeft,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import * as XLSX from 'xlsx';

const AdminHolidaysView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [holidays, setHolidays] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    description: '',
    isRecurring: false
  });

  // Helper function to format date for input (fixes timezone issue)
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('user');
    
    console.log('🔐 Authentication Check:');
    console.log('  Token exists:', !!token);
    console.log('  Role:', role);
    console.log('  User:', user);
    
    if (!token) {
      toast.error('Not authenticated. Please login as admin.');
      navigate('/admin/login');
      return;
    }
    
    if (role !== 'admin') {
      toast.error('Admin access required. Your role: ' + role);
      navigate('/admin/login');
      return;
    }
    
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching holidays, token exists:', !!token);
      
      const response = await axios.get('/admin/holidays');
      console.log('✅ Holidays fetched successfully:', response.data);
      setHolidays(response.data.holidays || []);
    } catch (error) {
      console.error('❌ Error fetching holidays:', error);
      console.error('Response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter holiday name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('💾 Submitting holiday, token exists:', !!token);
      console.log('📝 Form data:', formData);
      
      if (editingHoliday) {
        // Update existing holiday
        const response = await axios.put(`/admin/holidays/${editingHoliday._id}`, formData);
        console.log('✅ Holiday updated:', response.data);
        toast.success('Holiday updated successfully');
      } else {
        // Create new holiday
        const response = await axios.post('/admin/holidays', formData);
        console.log('✅ Holiday created:', response.data);
        toast.success('Holiday added successfully');
      }

      fetchHolidays();
      closeModal();
    } catch (error) {
      console.error('Error saving holiday:', error);
      toast.error(error.response?.data?.message || 'Failed to save holiday');
    }
  };

  const handleDelete = async (holidayId) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting holiday:', holidayId);
      await axios.delete(`/admin/holidays/${holidayId}`);
      console.log('✅ Holiday deleted successfully');
      toast.success('Holiday deleted successfully');
      fetchHolidays();
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast.error('Failed to delete holiday');
    }
  };

  const handleEdit = (holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      date: formatDateForInput(holiday.date),
      name: holiday.name,
      description: holiday.description || '',
      isRecurring: holiday.isRecurring || false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingHoliday(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      name: '',
      description: '',
      isRecurring: false
    });
  };

  const exportToExcel = () => {
    const data = holidays.map(h => ({
      Date: new Date(h.date).toLocaleDateString('en-US'),
      Name: h.name,
      Description: h.description || '',
      Type: h.isRecurring ? 'Annual' : 'One-time',
      Created: new Date(h.createdAt).toLocaleDateString('en-US')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Holidays');
    XLSX.writeFile(wb, `holidays_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Holidays exported successfully');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const isUpcoming = (dateString) => {
    const holidayDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate >= today;
  };

  const isPast = (dateString) => {
    const holidayDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate < today;
  };

  const upcomingHolidays = holidays.filter(h => isUpcoming(h.date) && !h.isRecurring);
  const recurringHolidays = holidays.filter(h => h.isRecurring);
  const pastHolidays = holidays.filter(h => isPast(h.date) && !h.isRecurring);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading holidays...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Holiday Management
              </h1>
              <p className="text-gray-600 text-lg">
                Manage public holidays for automated attendance system
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-green-600 border border-green-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all shadow-sm hover:shadow-md font-medium"
              >
                <Download className="w-5 h-5" />
                Export
              </button>
              <button
                onClick={fetchHolidays}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add Holiday
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Upcoming Holidays</p>
                <p className="text-4xl font-bold text-gray-900">
                  {upcomingHolidays.length}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Future scheduled holidays
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-2xl">
                <CalendarCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Annual Holidays</p>
                <p className="text-4xl font-bold text-gray-900">
                  {recurringHolidays.length}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Recurring every year
                </p>
              </div>
              <div className="bg-orange-100 p-4 rounded-2xl">
                <Repeat className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Past Holidays</p>
                <p className="text-4xl font-bold text-gray-900">
                  {pastHolidays.length}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Archived holidays
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-2xl">
                <CalendarX className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-xl flex-shrink-0">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-3 text-lg">
                Automated Attendance System
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span>Attendance marking runs automatically at <strong>8:00 PM IST</strong> every working day</span>
                </p>
                <p className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span><strong>Sundays</strong> are automatically skipped (weekly off)</span>
                </p>
                <p className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span><strong>Saturdays</strong> are working days - attendance will be marked</span>
                </p>
                <p className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span>Holidays added here will be <strong>automatically skipped</strong></span>
                </p>
                <p className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span>Teachers not marking attendance on working days will be marked as <strong>"Leave"</strong></span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Holidays */}
        {upcomingHolidays.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-2 rounded-lg">
                <CalendarCheck className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Upcoming Holidays
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingHolidays.map((holiday) => (
                <div
                  key={holiday._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                          {holiday.name}
                        </h3>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-semibold rounded-lg border border-green-200">
                          <Calendar className="w-4 h-4" />
                          {formatDate(holiday.date)}
                        </div>
                      </div>
                    </div>
                    {holiday.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {holiday.description}
                      </p>
                    )}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(holiday)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(holiday._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recurring/Annual Holidays */}
        {recurringHolidays.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Repeat className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Annual Holidays
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recurringHolidays.map((holiday) => (
                <div
                  key={holiday._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-orange-200 group"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full uppercase tracking-wide border border-orange-200">
                            Annual
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                          {holiday.name}
                        </h3>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 text-sm font-semibold rounded-lg border border-orange-200">
                          <Calendar className="w-4 h-4" />
                          {new Date(holiday.date).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'short'
                          })} (Every Year)
                        </div>
                      </div>
                    </div>
                    {holiday.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {holiday.description}
                      </p>
                    )}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(holiday)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(holiday._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Holidays */}
        {pastHolidays.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gray-100 p-2 rounded-lg">
                <CalendarX className="w-6 h-6 text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-500">
                Past Holidays
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pastHolidays.map((holiday) => (
                <div
                  key={holiday._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 opacity-60 hover:opacity-100"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-600 mb-3">
                          {holiday.name}
                        </h3>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg border border-gray-200">
                          <Calendar className="w-4 h-4" />
                          {formatDate(holiday.date)}
                        </div>
                      </div>
                    </div>
                    {holiday.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {holiday.description}
                      </p>
                    )}
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleDelete(holiday._id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {holidays.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border-2 border-dashed border-gray-200">
            <div className="bg-gray-50 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CalendarX className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Holidays Added Yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start managing your school's holiday calendar by adding your first public holiday. The automated attendance system will skip these dates.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Your First Holiday
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-2.5 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
                </h2>
              </div>
              <p className="text-sm text-gray-600 ml-12">
                {editingHoliday ? 'Update holiday information' : 'Create a new public holiday for the school'}
              </p>
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Date Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Name Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <AlertCircle className="w-4 h-4 text-indigo-600" />
                  Holiday Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Independence Day, Diwali"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Info className="w-4 h-4 text-gray-500" />
                  Description <span className="text-xs font-normal text-gray-500">(Optional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add details about the holiday (optional)..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Recurring Checkbox */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="w-5 h-5 mt-0.5 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  />
                  <label htmlFor="isRecurring" className="cursor-pointer flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Repeat className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-bold text-gray-900">
                        Annual Holiday (Repeats Every Year)
                      </span>
                    </div>
                    <span className="text-xs text-gray-600">
                      Check this for holidays like Independence Day, Republic Day, etc. that occur on the same date every year
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  {editingHoliday ? '✓ Update Holiday' : '+ Add Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHolidaysView;
