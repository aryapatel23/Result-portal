import React, { useState } from 'react';
import { UserPlus, Save, ArrowLeft, User, Hash, Calendar, GraduationCap, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../api/axios';

const RegisterStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    grNumber: '',
    name: '',
    dateOfBirth: '',
    standard: '',
    penNo: '',
    aadharNumber: '',
    childUID: '',
    mobile: '',
    email: '',
    parentContact: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.grNumber.trim()) {
      return toast.error('GR Number is required');
    }
    if (!formData.name.trim()) {
      return toast.error('Student Name is required');
    }
    if (!formData.dateOfBirth) {
      return toast.error('Date of Birth is required');
    }
    if (!formData.standard.trim()) {
      return toast.error('Standard is required');
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/bulk-students/register', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Student registered successfully!');
      
      // Reset form
      setFormData({
        grNumber: '',
        name: '',
        dateOfBirth: '',
        standard: '',
        penNo: '',
        aadharNumber: '',
        childUID: '',
        mobile: '',
        email: '',
        parentContact: ''
      });

      // Optionally navigate back to dashboard after a delay
      setTimeout(() => {
        navigate('/teacher/dashboard');
      }, 1500);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register student');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/teacher/dashboard');
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserPlus className="mr-3 h-8 w-8 text-gray-900" />
            Register New Student
          </h1>
          <p className="text-gray-600 mt-2">
            Add a new student to the system
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            {/* Required Fields Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-red-500 mr-2">*</span>
                Required Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GR Number */}
                <div>
                  <label htmlFor="grNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="inline h-4 w-4 mr-1" />
                    GR Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="grNumber"
                    name="grNumber"
                    value={formData.grNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="Enter GR number"
                    required
                  />
                </div>

                {/* Student Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    required
                  />
                </div>

                {/* Standard */}
                <div>
                  <label htmlFor="standard" className="block text-sm font-medium text-gray-700 mb-2">
                    <GraduationCap className="inline h-4 w-4 mr-1" />
                    Standard/Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="standard"
                    name="standard"
                    value={formData.standard}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    required
                  >
                    <option value="">Select Standard</option>
                    <option value="Balvatika">Balvatika</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Required Fields Section */}
            <div className="mb-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PEN No */}
                <div>
                  <label htmlFor="penNo" className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="inline h-4 w-4 mr-1" />
                    PEN No.
                  </label>
                  <input
                    type="text"
                    id="penNo"
                    name="penNo"
                    value={formData.penNo}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="Enter PEN number"
                  />
                </div>

                {/* Aadhar Number */}
                <div>
                  <label htmlFor="aadharNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="inline h-4 w-4 mr-1" />
                    Aadhar Number
                  </label>
                  <input
                    type="text"
                    id="aadharNumber"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="Enter 12-digit Aadhar"
                    maxLength="12"
                  />
                </div>

                {/* Child UID */}
                <div>
                  <label htmlFor="childUID" className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="inline h-4 w-4 mr-1" />
                    Child UID
                  </label>
                  <input
                    type="text"
                    id="childUID"
                    name="childUID"
                    value={formData.childUID}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="Enter Child UID"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="Enter mobile number"
                    maxLength="10"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="student@example.com"
                  />
                </div>

                {/* Parent Contact */}
                <div>
                  <label htmlFor="parentContact" className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Parent Contact Number
                  </label>
                  <input
                    type="tel"
                    id="parentContact"
                    name="parentContact"
                    value={formData.parentContact}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="Parent's mobile number"
                    maxLength="10"
                  />
                </div>
              </div>
            </div>

            {/* Information Note */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> The student will be able to login using their GR Number and Date of Birth. 
                Make sure the GR Number is unique and the Date of Birth is accurate.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
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
                    Registering...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Register Student
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Card */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Need to register multiple students?</h3>
          <p className="text-sm text-gray-600 mb-3">
            If you have many students to register, use our bulk upload feature to save time.
          </p>
          <button
            onClick={() => navigate('/teacher/bulk-upload-students')}
            className="text-gray-900 hover:text-gray-700 text-sm font-medium underline"
          >
            Go to Bulk Upload →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;
