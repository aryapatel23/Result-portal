import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/slices/authSlice';
import { X, User, Briefcase, Shield, Mail, Lock, Calendar, LogIn, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginModal = ({ isOpen, onClose, initialRole = 'student' }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(initialRole);
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);

    // Clear errors when modal opens/closes or tab changes
    React.useEffect(() => {
        if (isOpen) {
            dispatch(clearError());
            setActiveTab(initialRole);
        } else {
            // Clear all input fields when modal closes for security
            setStudentData({ grNumber: '', dateOfBirth: '' });
            setAuthData({ email: '', password: '' });
        }
    }, [isOpen, initialRole, dispatch]);

    // Show toast on error
    React.useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // Form states
    const [studentData, setStudentData] = useState({ grNumber: '', dateOfBirth: '' });
    const [authData, setAuthData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    const handleLogin = async (e) => {
        e.preventDefault();

        const credentials = activeTab === 'student' ? studentData : authData;

        try {
            const resultAction = await dispatch(loginUser({ role: activeTab, credentials }));
            if (loginUser.fulfilled.match(resultAction)) {
                const user = resultAction.payload.user;
                toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} login successful!`);
                onClose();

                const dashboardPath = user.role === 'admin' ? '/admin/dashboard' :
                    user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
                navigate(dashboardPath);
            }
        } catch (err) {
            // Error is handled by the useEffect above
            console.error(err);
        }
    };

    const tabs = [
        { id: 'student', label: 'Student', icon: User, color: 'text-green-600', bg: 'bg-green-50' },
        { id: 'teacher', label: 'Teacher', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'admin', label: 'Admin', icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-lg bg-white/80 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 ring-1 ring-black/5">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100/50 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome <span className="text-indigo-600">Back</span></h2>
                        <p className="text-gray-500 mt-2 font-medium">Choose your role to sign in</p>
                    </div>

                    {/* Tab Selection */}
                    <div className="flex bg-gray-100/50 p-1.5 rounded-2xl mb-8 gap-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-300 ${isActive
                                        ? `bg-white shadow-sm ${tab.color}`
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                                        }`}
                                >
                                    <Icon className={`h-4 w-4 ${isActive ? tab.color : 'text-gray-400'}`} />
                                    <span className="text-sm">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        {activeTab === 'student' ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">GR Number</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                        <input
                                            type="text"
                                            placeholder="GR001"
                                            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all shadow-sm"
                                            value={studentData.grNumber}
                                            onChange={(e) => setStudentData({ ...studentData, grNumber: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                        <input
                                            type="date"
                                            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all shadow-sm"
                                            value={studentData.dateOfBirth}
                                            onChange={(e) => setStudentData({ ...studentData, dateOfBirth: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                        <input
                                            type="email"
                                            placeholder="name@school.com"
                                            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-sm"
                                            value={authData.email}
                                            onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-12 py-4 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-sm"
                                            value={authData.password}
                                            onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                                        >
                                            {showPassword ? "HIDE" : "SHOW"}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`group w-full py-4 rounded-2xl font-black text-white transition-all duration-300 transform active:scale-[0.98] shadow-xl ${activeTab === 'student' ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-green-100' :
                                activeTab === 'teacher' ? 'bg-gradient-to-r from-blue-600 to-sky-600 shadow-blue-100' :
                                    'bg-gradient-to-r from-indigo-600 to-sky-600 shadow-indigo-100'
                                } flex items-center justify-center gap-2 disabled:opacity-50`}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In as {tabs.find(t => t.id === activeTab).label}</span>
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-sm text-gray-500 font-medium">
                            Secure Cloud Verification • <span className="text-indigo-600">SSO Enabled</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
