import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import {
  Briefcase, Mail, Lock, Phone, BookOpen,
  Plus, Trash2, ArrowLeft, GraduationCap, ShieldCheck, User
} from 'lucide-react';
import { SCHOOL_STANDARDS, SCHOOL_SUBJECTS } from '../utils/schoolConstants';

const AdminEditTeacher = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [originalEmail, setOriginalEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('teacher');
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    password: '',
    classTeacher: '',
    phone: '',
    isActive: true,
  });
  const [teachingAssignments, setTeachingAssignments] = useState([
    { standard: '', subject: '' },
  ]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTeacherData();
  }, [teacherId]);

  const fetchTeacherData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/admin/teachers/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const teacher = response.data.teacher;
      setOriginalEmail(teacher.email || '');
      setSelectedRole(teacher.role || 'teacher');
      setFormData({
        name: teacher.name || '',
        employeeId: teacher.employeeId || '',
        email: teacher.email || '',
        password: '',
        classTeacher: teacher.classTeacher || '',
        phone: teacher.phone || '',
        isActive: teacher.isActive !== false,
      });

      // Load existing teachingAssignments; fall back to deriving from legacy arrays
      if (teacher.teachingAssignments && teacher.teachingAssignments.length > 0) {
        setTeachingAssignments(
          teacher.teachingAssignments.map((ta) => ({
            standard: ta.standard || '',
            subject: ta.subject || '',
          }))
        );
      } else if (teacher.assignedClasses && teacher.assignedClasses.length > 0) {
        // Legacy migration: show one empty assignment per assigned class so admin can fill in subject
        setTeachingAssignments(
          teacher.assignedClasses.map((cls) => ({ standard: cls, subject: '' }))
        );
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching teacher:', error);
      toast.error('Failed to load teacher data');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ── Teaching Assignment helpers ────────────────────────────── */
  const handleAssignmentChange = (index, field, value) => {
    setTeachingAssignments((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  };

  const handleAddAssignment = () => {
    setTeachingAssignments((prev) => [...prev, { standard: '', subject: '' }]);
  };

  const handleRemoveAssignment = (index) => {
    if (teachingAssignments.length === 1) {
      toast.error('At least one teaching assignment is required');
      return;
    }
    setTeachingAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    // Validate assignments only for teachers
    if (selectedRole === 'teacher') {
      const validAssignments = teachingAssignments.filter(
        (a) => a.standard.trim() && a.subject.trim()
      );
      const keys = validAssignments.map((a) => `${a.standard}::${a.subject.toLowerCase()}`);
      if (new Set(keys).size !== keys.length) {
        toast.error('Duplicate assignments found. Each standard-subject pair must be unique.');
        setUpdating(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        isActive: formData.isActive,
        role: selectedRole,
      };

      // Teacher-specific fields
      if (selectedRole === 'teacher') {
        const validAssignments = teachingAssignments.filter(
          (a) => a.standard.trim() && a.subject.trim()
        );
        updateData.classTeacher = formData.classTeacher.trim() || null;
        updateData.teachingAssignments = validAssignments;
        updateData.subjects = [];
        updateData.assignedClasses = [];
      } else {
        // Admin: clear teacher-specific fields
        updateData.classTeacher = null;
        updateData.teachingAssignments = [];
        updateData.assignedClasses = [];
        updateData.subjects = [];
      }

      if (formData.password) {
        updateData.password = formData.password;
      }

      await axios.put(`/admin/teachers/${teacherId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const emailOrPasswordChanged = formData.email !== originalEmail || formData.password;
      toast.success(
        emailOrPasswordChanged
          ? 'Teacher updated! 📧 Notification email sent.'
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

  const isAdmin = selectedRole === 'admin';

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
          {/* Header */}
          <div className="flex items-center mb-8">
            <div className={`rounded-full p-3 ${isAdmin ? 'bg-rose-100' : 'bg-indigo-100'}`}>
              {isAdmin
                ? <ShieldCheck className="h-8 w-8 text-rose-600" />
                : <Briefcase className="h-8 w-8 text-indigo-600" />
              }
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit Staff Account</h2>
              <p className="text-gray-600">Update staff information and {isAdmin ? 'admin access' : 'class-subject assignments'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Role Selector ───────────────────────────────────── */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Account Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[{ value: 'teacher', icon: GraduationCap, label: 'Teacher', desc: 'Manages results for assigned classes/subjects.' },
                  { value: 'admin', icon: ShieldCheck, label: 'Administrator', desc: 'Full system access — all teachers, students, results.' }]
                  .map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setSelectedRole(r.value)}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        selectedRole === r.value
                          ? r.value === 'admin' ? 'border-rose-500 bg-rose-50' : 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <r.icon className={`h-5 w-5 ${
                          selectedRole === r.value
                            ? r.value === 'admin' ? 'text-rose-600' : 'text-indigo-600'
                            : 'text-gray-500'
                        }`} />
                        <span className={`font-semibold text-sm ${
                          selectedRole === r.value
                            ? r.value === 'admin' ? 'text-rose-700' : 'text-indigo-700'
                            : 'text-gray-700'
                        }`}>{r.label}</span>
                        {selectedRole === r.value && (
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                            r.value === 'admin' ? 'bg-rose-200 text-rose-800' : 'bg-indigo-200 text-indigo-800'
                          }`}>Active</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{r.desc}</p>
                    </button>
                  ))}
              </div>
              {isAdmin && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-md">
                  <ShieldCheck className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-rose-700">
                    Promoting to <strong>Admin</strong> grants full system access and clears all teaching assignments.
                  </p>
                </div>
              )}
            </div>
            {/* ── Basic Information ─────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
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

            {/* ── Contact ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
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

            {/* ── Password ─────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password <span className="text-gray-400 text-xs">(leave blank to keep current)</span>
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

            {!isAdmin && (
              <>
                {/* ── Class Teacher ───────────────────────────────────── */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <GraduationCap className="inline h-4 w-4 mr-1 text-yellow-500" />
                    Class Teacher Of (Primary Class)
                  </label>
                  <select
                    name="classTeacher"
                    value={formData.classTeacher}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">None — Not a class teacher</option>
                    {SCHOOL_STANDARDS.map((std) => (
                      <option key={std} value={std}>{std}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    The ONE class this teacher is the class teacher of (manages all results for that class).
                  </p>
                </div>

                {/* ── Teaching Assignments ────────────────────────────── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800">
                        <BookOpen className="inline h-4 w-4 mr-1 text-indigo-500" />
                        Teaching Assignments <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Which subject does this teacher teach in each class?
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAssignment}
                      className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-100 text-sm font-medium transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Assignment
                    </button>
                  </div>

                  <div className="space-y-3">
                    {teachingAssignments.map((assignment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Standard</label>
                          <select
                            value={assignment.standard}
                            onChange={(e) => handleAssignmentChange(index, 'standard', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select Standard</option>
                            {SCHOOL_STANDARDS.map((std) => (
                              <option key={std} value={std}>{std}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Subject</label>
                          <input
                            type="text"
                            list={`subjects-list-${index}`}
                            value={assignment.subject}
                            onChange={(e) => handleAssignmentChange(index, 'subject', e.target.value)}
                            placeholder="e.g. Mathematics"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <datalist id={`subjects-list-${index}`}>
                            {SCHOOL_SUBJECTS.map((s) => (
                              <option key={s} value={s} />
                            ))}
                          </datalist>
                        </div>

                        <div className="pt-5">
                          <button
                            type="button"
                            onClick={() => handleRemoveAssignment(index)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove assignment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {teachingAssignments.filter((a) => a.standard && a.subject).length > 0 && (
                    <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                      <p className="text-xs font-medium text-indigo-700 mb-2">📋 Assignment Summary:</p>
                      <div className="flex flex-wrap gap-2">
                        {teachingAssignments
                          .filter((a) => a.standard && a.subject)
                          .map((a, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-white border border-indigo-200 text-indigo-800 rounded text-xs font-medium"
                            >
                              {a.standard} → {a.subject}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── Active Status ───────────────────────────────────── */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
              <div>
                <label className="text-sm font-medium text-gray-700">Account Status</label>
                <p className="text-xs text-gray-500">Enable or disable login access for this {isAdmin ? 'admin' : 'teacher'}</p>
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

            {/* ── Submit ─────────────────────────────────────────── */}
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
                className={`px-6 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                  isAdmin ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    {isAdmin
                      ? <ShieldCheck className="h-4 w-4 mr-2" />
                      : <Briefcase className="h-4 w-4 mr-2" />
                    }
                    Update {isAdmin ? 'Admin' : 'Teacher'}
                  </>
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
