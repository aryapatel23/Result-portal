import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  X,
  Settings,
  Save,
  RefreshCw,
  CheckCircle,
  Shield
} from 'lucide-react';

const SystemSettingsModal = ({ isOpen, onClose }) => {
  const [savingLeaveConfig, setSavingLeaveConfig] = useState(false);

  // Leave Configuration
  const [leaveConfig, setLeaveConfig] = useState({
    yearlyLeaveLimit: 12,
    academicYear: new Date().getFullYear().toString()
  });

  useEffect(() => {
    if (isOpen) {
      fetchLeaveConfig();
    }
  }, [isOpen]);

  const fetchLeaveConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/system-config',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeaveConfig({
        yearlyLeaveLimit: response.data.yearlyLeaveLimit || 12,
        academicYear: response.data.academicYear || new Date().getFullYear().toString()
      });
    } catch (error) {
      console.error('Error fetching leave config:', error);
    }
  };

  const handleSaveLeaveConfig = async () => {
    try {
      setSavingLeaveConfig(true);
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/system-config',
        leaveConfig,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Leave configuration saved successfully!');
      setSavingLeaveConfig(false);
    } catch (error) {
      console.error('Error saving leave config:', error);
      toast.error('Failed to save leave configuration');
      setSavingLeaveConfig(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white p-6 relative border-b-2 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-3 rounded-lg">
              <Settings className="w-8 h-8 text-gray-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Leave Configuration</h2>
              <p className="text-gray-600 text-sm mt-1">Configure teacher leave policy settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Info Banner */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold mb-2 text-gray-900">Leave Policy Configuration</p>
                <p className="text-gray-700">Set the annual leave limit for teachers and configure the academic year period.</p>
              </div>
            </div>
          </div>

          {/* Leave Settings */}
              <div className="space-y-4">
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Yearly Leave Limit (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={leaveConfig.yearlyLeaveLimit}
                    onChange={(e) => setLeaveConfig(prev => ({ ...prev, yearlyLeaveLimit: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 text-lg font-semibold focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all"
                    placeholder="Enter yearly leave limit"
                  />
                  <p className="text-xs text-gray-600 mt-2">Maximum number of leaves allowed per teacher per academic year</p>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={leaveConfig.academicYear}
                    onChange={(e) => setLeaveConfig(prev => ({ ...prev, academicYear: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 text-lg font-semibold focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all"
                    placeholder="e.g., 2024-2025"
                  />
                  <p className="text-xs text-gray-600 mt-2">Current academic year (e.g., 2024-2025)</p>
                </div>
              </div>

            {/* Save Button */}
            <div className="pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={handleSaveLeaveConfig}
                  disabled={savingLeaveConfig}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-all font-semibold disabled:opacity-50"
                >
                  {savingLeaveConfig ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Save Leave Configuration
                    </>
                  )}
                </button>
              </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsModal;
