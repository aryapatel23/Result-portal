import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Mail, Lock, Shield, ArrowRight, Loader2 } from 'lucide-react';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('https://result-portal-tkom.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Invalid email or password');
        } else {
          throw new Error(data.message || 'Something went wrong');
        }
      }

      if (data.user.role !== 'admin') {
        throw new Error('Access denied. Admin only.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gray-50">
      {/* Subtle Animated Background Elements (Theme Aligned) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-100/50 blur-[100px] rounded-full animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-50/30 blur-[140px] rounded-full" />

      {/* Login Card */}
      <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5">
          <div className="p-8">
            {/* Header */}
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="bg-gradient-to-br from-indigo-600 to-sky-600 p-4 rounded-2xl shadow-lg shadow-indigo-100 mb-4 ring-2 ring-white">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-600">Portal</span>
              </h1>
              <p className="text-gray-500 mt-2 font-medium">Secure access for school management</p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              <div className="group space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    placeholder="admin@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 placeholder:text-gray-300 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="group space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 placeholder:text-gray-300 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                  />
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="group relative w-full bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                <div className="shrink-0 bg-red-500 p-1.5 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50/50 p-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium">
              Authorized Personnel Only • IP: Tracked
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
