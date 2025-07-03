import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) =>
    pathname === path
      ? 'text-indigo-600 font-semibold'
      : 'text-gray-700 hover:text-indigo-500';

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 w-full">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo + Name */}
        <Link
          to="/"
          className="flex items-center gap-3 w-full md:w-auto max-w-[85%] overflow-hidden"
        >
          <img
            className="h-10 w-10 shrink-0"
            src="https://res.cloudinary.com/dzsvjyg2c/image/upload/gyzoxsk22n0z1kkkh3di.png"
            alt="Logo"
          />
          <span className="text-sm sm:text-base md:text-lg font-bold text-indigo-600 truncate">
            KAMLI ANUPAM PRIMARY SCHOOL, Ta.-UNJHA, Dis.-MAHESANA
          </span>
        </Link>

        {/* Hamburger (Mobile) */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-indigo-600 focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 text-base">
          <Link to="/" className={isActive('/')}>
            Home
          </Link>
          <Link to="/admin/login" className={isActive('/admin/login')}>
            Teacher Login
          </Link>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4">
          <div className="flex flex-col space-y-2 text-base">
            <Link to="/" className={isActive('/')} onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link
              to="/admin/login"
              className={isActive('/admin/login')}
              onClick={() => setIsOpen(false)}
            >
              Teacher Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
