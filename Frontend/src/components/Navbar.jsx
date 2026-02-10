import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Bell, ChevronDown, UserCheck, BookOpen, LayoutDashboard, Clock } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import LoginModal from './LoginModal';

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [pathname]); // Re-check when route changes

  const isActive = (path) =>
    pathname === path
      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-1'
      : 'text-gray-700 hover:text-indigo-500 transition-colors duration-300';

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setShowProfileMenu(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 w-full border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo + School Name */}
          <Link
            to="/"
            className="flex items-center gap-3 w-full md:w-auto max-w-[85%] overflow-hidden group"
          >
            <img
              className="h-12 w-12 shrink-0 rounded-full border-2 border-indigo-100 group-hover:border-indigo-300 transition-colors duration-300"
              src="https://res.cloudinary.com/dzsvjyg2c/image/upload/gyzoxsk22n0z1kkkh3di.png"
              alt="School Logo"
            />
            <div className="min-w-0">
              <span className="text-sm sm:text-base md:text-lg font-bold text-indigo-600 truncate block leading-tight">
                KAMLI ANUPAM PRIMARY SCHOOL
              </span>
              <div className="text-xs md:text-sm font-medium text-gray-600 truncate">
                Ta.-UNJHA, Dis.-MAHESANA
              </div>
            </div>
          </Link>

          {/* User Profile / Auth Section (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 rounded-xl px-4 py-2 transition-all duration-300 border border-slate-200"
                  >
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-800 capitalize">
                        {user.name || user.email}
                      </div>
                      <div className="text-xs text-slate-600 capitalize">
                        {user.role}
                      </div>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="font-semibold text-gray-800">{user.name || user.email}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className="text-xs text-slate-600 uppercase font-medium">{user.role}</div>
                      </div>
                      
                      <Link
                        to={`/${user.role}/dashboard`}
                        className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-600" />
                        <span>Dashboard</span>
                      </Link>
                      
                      {(user.role === 'admin' || user.role === 'teacher') && (
                        <Link
                          to={user.role === 'admin' ? '/admin/attendance' : '/teacher/mark-attendance'}
                          className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span>Attendance</span>
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
                <LanguageSwitcher />
              </>
            ) : (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 bg-transparent hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium border border-gray-200 hover:border-gray-300"
                  >
                    <span>Login</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      <button
                        onClick={() => {
                          setSelectedRole('student');
                          setShowLoginModal(true);
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <User className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">Student Login</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRole('teacher');
                          setShowLoginModal(true);
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <BookOpen className="w-4 h-4 text-slate-600" />
                        <span className="text-gray-700">Teacher Login</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRole('admin');
                          setShowLoginModal(true);
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <UserCheck className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-700">Admin Login</span>
                      </button>
                    </div>
                  )}
                </div>
                <LanguageSwitcher />
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-indigo-600 focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="pt-4 space-y-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{user.name || user.email}</div>
                      <div className="text-sm text-indigo-600 capitalize">{user.role}</div>
                    </div>
                  </div>
                  
                  <Link
                    to={`/${user.role}/dashboard`}
                    className="block px-3 py-3 text-gray-700 hover:text-slate-600 hover:bg-gray-50 rounded-lg transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  {(user.role === 'admin' || user.role === 'teacher') && (
                    <Link
                      to={user.role === 'admin' ? '/admin/attendance' : '/teacher/mark-attendance'}
                      className="block px-3 py-3 text-gray-700 hover:text-slate-600 hover:bg-gray-50 rounded-lg transition-all duration-300"
                      onClick={() => setIsOpen(false)}
                    >
                      Attendance
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setSelectedRole('student');
                      setShowLoginModal(true);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-all duration-300 font-medium"
                  >
                    <User className="w-5 h-5" />
                    Student Login
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRole('teacher');
                      setShowLoginModal(true);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 w-full bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-lg transition-all duration-300 font-medium"
                  >
                    <BookOpen className="w-5 h-5" />
                    Teacher Login
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRole('admin');
                      setShowLoginModal(true);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-all duration-300 font-medium"
                  >
                    <UserCheck className="w-5 h-5" />
                    Admin Login
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Click outside to close menus */}
      {(showProfileMenu || showDropdown) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowProfileMenu(false);
            setShowDropdown(false);
          }}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        initialRole={selectedRole}
      />
    </nav>
  );
};

export default Navbar;
