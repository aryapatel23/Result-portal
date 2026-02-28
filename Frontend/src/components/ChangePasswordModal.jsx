import React, { useState, useEffect } from 'react';
import { X, Lock, Eye, EyeOff, KeyRound, ShieldCheck, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';

const ChangePasswordModal = ({ isOpen, onClose, required = false, onSuccess }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.oldPassword.trim()) newErrors.oldPassword = 'Current password is required';
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
    if (formData.oldPassword && formData.newPassword && formData.oldPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await axios.put('/profile/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password changed successfully!');
      if (onSuccess) onSuccess();
      if (!required) onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={required ? undefined : onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5 relative">
          {!required && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {required ? 'Password Change Required' : 'Change Password'}
              </h2>
              <p className="text-sm text-white/70">
                {required ? 'Please set a new password to continue' : 'Update your account security'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Security Info */}
          <div className={`border rounded-xl p-3 flex items-start gap-2 ${
            required 
              ? 'bg-red-50 border-red-200' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <ShieldCheck className={`w-5 h-5 mt-0.5 shrink-0 ${
              required ? 'text-red-600' : 'text-amber-600'
            }`} />
            <p className={`text-sm ${
              required ? 'text-red-700' : 'text-amber-700'
            }`}>
              {required 
                ? 'You are using a temporary password. For security, you must change it before continuing.' 
                : 'Choose a strong password with at least 6 characters. We recommend using a mix of letters, numbers, and symbols.'
              }
            </p>
          </div>

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Lock className="w-3.5 h-3.5 inline mr-1" />
              Current Password
            </label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                value={formData.oldPassword}
                onChange={(e) => {
                  setFormData({ ...formData, oldPassword: e.target.value });
                  setErrors({ ...errors, oldPassword: '' });
                }}
                placeholder="Enter your current password"
                className={`w-full px-4 py-2.5 pr-10 rounded-xl border ${
                  errors.oldPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'
                } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.oldPassword && <p className="text-xs text-red-500 mt-1">{errors.oldPassword}</p>}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <KeyRound className="w-3.5 h-3.5 inline mr-1" />
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
                placeholder="Enter new password (min 6 characters)"
                className={`w-full px-4 py-2.5 pr-10 rounded-xl border ${
                  errors.newPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'
                } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}

            {/* Strength indicator */}
            {formData.newPassword && (
              <div className="mt-2">
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
                <p className={`text-xs mt-1 ${
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
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
                placeholder="Re-enter new password"
                className={`w-full px-4 py-2.5 pr-10 rounded-xl border ${
                  errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'
                } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            {formData.confirmPassword && formData.newPassword === formData.confirmPassword && !errors.confirmPassword && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Changing Password...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
