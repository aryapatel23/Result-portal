import React, { useState, useEffect } from 'react';
import { X, Settings, Save, AlertCircle } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const LeaveConfigModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [yearlyLimit, setYearlyLimit] = useState(12);
    const [academicYear, setAcademicYear] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchConfig();
        }
    }, [isOpen]);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/config', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setYearlyLimit(response.data.yearlyLeaveLimit || 12);
            setAcademicYear(response.data.academicYear || new Date().getFullYear().toString());
        } catch (error) {
            console.error('Error fetching config:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (yearlyLimit < 0) {
            toast.error('Leave limit cannot be negative');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.put('/config', {
                yearlyLeaveLimit: Number(yearlyLimit),
                academicYear
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Settings updated successfully');
            onClose();
        } catch (error) {
            console.error('Error updating config:', error);
            toast.error('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <Settings className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">System Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-blue-900">Leave Policy</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                This limit controls how many leaves a teacher can take in an academic year.
                                Exceeding this will block them from applying for leave.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Yearly Leave Limit (Days)
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <input
                                    type="number"
                                    min="0"
                                    value={yearlyLimit}
                                    onChange={(e) => setYearlyLimit(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 pl-4 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 border"
                                    disabled={loading}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">days</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Academic Year
                            </label>
                            <input
                                type="text"
                                value={academicYear}
                                onChange={(e) => setAcademicYear(e.target.value)}
                                placeholder="e.g. 2024-2025"
                                className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 border px-4"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeaveConfigModal;
