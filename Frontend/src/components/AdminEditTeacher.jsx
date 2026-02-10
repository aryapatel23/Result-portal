import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Briefcase, Mail, Lock, Phone, BookOpen, Users, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react';

const AdminEditTeacher = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null); // Store original teacher data
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    password: '',
    subjects: '',
    classTeacher: '',
    assignedClasses: [],
    phone: '',
    isActive: true,
  });
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [updating, setUpdating] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchTeacherData();
  }, [teacherId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowClassDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTeacherData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/admin/teachers/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const teacher = response.data.teacher;
      setTeacher(teacher); // Store original teacher data
      setFormData({
        name: teacher.name || '',
        employeeId: teacher.employeeId || '',
        email: teacher.email || '',
        password: '',
        subjects: teacher.subjects?.join(', ') || '',
        classTeacher: teacher.classTeacher || '',
        assignedClasses: teacher.assignedClasses || [],
        phone: teacher.phone || '',
        isActive: teacher.isActive !== false,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teacher:', error);
      toast.error('Failed to load teacher data');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const token = localStorage.getItem('token');
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s),
        classTeacher: formData.classTeacher.trim() || null,
        assignedClasses: formData.assignedClasses,
        phone: formData.phone,
        isActive: formData.isActive,
      };

      // Only include password if it's been filled
      if (formData.password) {
        updateData.password = formData.password;
      }

      await axios.put(`/admin/teachers/${teacherId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const emailOrPasswordChanged = formData.email !== teacher.email || formData.password;
      toast.success(
        emailOrPasswordChanged 
          ? 'Teacher updated successfully! 📧 Notification email sent.' 
          : 'Teacher updated successfully!',
        { duration: 5000 }
      );
      navigate(`/admin/teacher/${teacherId}`);
    } catch (error) {
      console.error('Error updating teacher:', error);
      toast.error(error.response?.data?.message || 'Failed to update teacher');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teacher data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/admin/teacher/${teacherId}`)}
          className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teacher Details
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-100 rounded-full p-3">
              <Briefcase className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit Teacher</h2>
              <p className="text-gray-600">Update teacher information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID *
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  disabled
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Employee ID cannot be changed</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Password (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password (leave blank to keep current)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter new password or leave blank"
                />
              </div>
            </div>

            {/* Teaching Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjects (comma-separated) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Mathematics, Physics, Chemistry"
                />
              </div>
            </div>

            {/* Class Teacher */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Teacher Of (Primary Class)
              </label>
              <select
                name="classTeacher"
                value={formData.classTeacher}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">None - Not a class teacher</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={`STD ${i + 1}`}>
                    STD {i + 1}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">The ONE class this teacher is class teacher of (can upload results)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Classes *
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowClassDropdown(!showClassDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-left bg-white flex items-center justify-between hover:border-indigo-400 transition-colors"
                >
                  <span className="text-gray-700">
                    {formData.assignedClasses.length > 0 ? `${formData.assignedClasses.length} classes selected` : 'Select classes'}
                  </span>
                  <Users className="h-5 w-5 text-gray-400" />
                </button>
                {showClassDropdown && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {[...Array(12)].map((_, i) => {
                      const className = `STD ${i + 1}`;
                      const isSelected = formData.assignedClasses.includes(className);
                      return (
                        <label
                          key={i}
                          className="flex items-center px-3 py-2 hover:bg-indigo-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  assignedClasses: [...formData.assignedClasses, className]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  assignedClasses: formData.assignedClasses.filter(c => c !== className)
                                });
                              }
                            }}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{className}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              {formData.assignedClasses.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.assignedClasses.map((cls) => (
                    <span
                      key={cls}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {cls}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            assignedClasses: formData.assignedClasses.filter(c => c !== cls)
                          });
                        }}
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-1 text-sm text-gray-500">All classes where teacher teaches (should include class teacher class)</p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
              <div>
                <label className="text-sm font-medium text-gray-700">Teacher Status</label>
                <p className="text-xs text-gray-500">Enable or disable teacher access</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                  formData.isActive ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    formData.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(`/admin/teacher/${teacherId}`)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Teacher'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEditTeacher;
