import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, User, Calendar, GraduationCap, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import LoadingSpinner from './LoadingSpinner';

const StudentLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    grNumber: '',
    dateOfBirth: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role === 'student') {
      navigate('/student/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.grNumber || !formData.dateOfBirth) {
      return toast.error('Please fill all required fields');
    }

    setLoading(true);
    try {
      const response = await axios.post('/student/login', formData);
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('role', 'student');
      
      toast.success(`Welcome back, ${response.data.user.name || 'Student'}!`);
      setTimeout(() => navigate('/student/dashboard'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Back to Home Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8 transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 hover-lift">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-6 group">
              <GraduationCap className="h-12 w-12 text-green-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Student Login</h2>
            <p className="text-gray-600">Access your academic results and progress</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="form-label">
                GR Number *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="grNumber"
                  value={formData.grNumber}
                  onChange={handleChange}
                  className="form-input pl-10 focus:ring-green-500"
                  placeholder="Enter your GR number (e.g., GR001)"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">
                Date of Birth *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="form-input pl-10 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-green-700 hover:to-emerald-700'
              }`}
            >
              {loading ? (
                <LoadingSpinner size="sm" text="Logging in..." />
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Don't have your GR Number? Contact your teacher or school administration.
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <Link 
                  to="/teacher/login" 
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
                >
                  Teacher Login
                </Link>
                <span className="text-gray-400">|</span>
                <Link 
                  to="/admin/login" 
                  className="text-purple-600 hover:text-purple-800 transition-colors duration-300"
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-center">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-semibold text-green-800 mb-2">Need Help?</h3>
            <p className="text-green-700 text-sm">
              If you're having trouble logging in, please make sure you're using the correct GR Number and Date of Birth as provided by your school.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
