import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, Eye, EyeOff, CheckCircle, Lock, AlertCircle, Mail, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';

const ResetPasswordComplete = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('resetPassword');

  const [formData, setFormData] = useState({
    email: emailFromUrl || '',
    tempPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showTemp, setShowTemp] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!emailFromUrl) {
      toast.error('Invalid password reset link');
      navigate('/');
    }
  }, [emailFromUrl, navigate]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.tempPassword.trim()) {
      newErrors.tempPassword = 'Temporary password from email is required';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.tempPassword && formData.newPassword && formData.tempPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from temporary password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await axios.post('/auth/complete-password-reset', {
        email: formData.email,
        tempPassword: formData.tempPassword,
        newPassword: formData.newPassword,
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', response.data.user.role);

        toast.success('Password reset successful! Redirecting to dashboard...');
        
        // Redirect based on role
        setTimeout(() => {
          const role = response.data.user.role;
          navigate(`/${role}/dashboard`, { replace: true });
        }, 1000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: '', color: '' };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 1) return { level: 1, text: 'Weak', color: 'bg-red-500' };
    if (strength <= 2) return { level: 2, text: 'Fair', color: 'bg-yellow-500' };
    if (strength <= 3) return { level: 3, text: 'Good', color: 'bg-blue-500' };
    return { level: 4, text: 'Strong', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength(formData.newPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6 border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Complete Password Reset</h1>
            <p className="text-white/80 text-sm">Set your new password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Check your email!</p>
                <p>Enter the temporary password from your email, then create a new secure password.</p>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-3.5 h-3.5 inline mr-1.5" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors({ ...errors, email: '' });
                }}
                placeholder="your.email@example.com"
                disabled
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'
                } text-gray-700 text-sm transition-all cursor-not-allowed`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.email}</p>}
            </div>

            {/* Temporary Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Lock className="w-3.5 h-3.5 inline mr-1.5" />
                Temporary Password from Email
              </label>
              <div className="relative">
                <input
                  type={showTemp ? 'text' : 'password'}
                  value={formData.tempPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, tempPassword: e.target.value });
                    setErrors({ ...errors, tempPassword: '' });
                  }}
                  placeholder="Enter the 6-character password from email"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                    errors.tempPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all font-mono tracking-wider`}
                />
                <button
                  type="button"
                  onClick={() => setShowTemp(!showTemp)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showTemp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.tempPassword && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.tempPassword}</p>}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <KeyRound className="w-3.5 h-3.5 inline mr-1.5" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, newPassword: e.target.value });
                    setErrors({ ...errors, newPassword: '' });
                  }}
                  placeholder="Create a strong password (min 6 characters)"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                    errors.newPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.newPassword}</p>}

              {/* Strength indicator */}
              {formData.newPassword && (
                <div className="mt-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i <= strength.level ? strength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs mt-1.5 font-medium ${
                    strength.level <= 1 ? 'text-red-500' :
                    strength.level <= 2 ? 'text-yellow-600' :
                    strength.level <= 3 ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    Password strength: {strength.text}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CheckCircle className="w-3.5 h-3.5 inline mr-1.5" />
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    setErrors({ ...errors, confirmPassword: '' });
                  }}
                  placeholder="Re-enter your new password"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                    errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.confirmPassword}</p>}
              {formData.confirmPassword && formData.newPassword === formData.confirmPassword && !errors.confirmPassword && (
                <p className="text-xs text-green-600 mt-1.5 ml-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Passwords match perfectly!
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Reset Password & Login
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to Login Link */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordComplete;
