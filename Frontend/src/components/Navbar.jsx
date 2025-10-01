// import React, { useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { Menu, X } from 'lucide-react';

// const Navbar = () => {
//   const { pathname } = useLocation();
//   const [isOpen, setIsOpen] = useState(false);

//   const isActive = (path) =>
//     pathname === path
//       ? 'text-indigo-600 font-semibold'
//       : 'text-gray-700 hover:text-indigo-500';

//   return (
//     <nav className="bg-white shadow-sm sticky top-0 z-50 w-full">
//       <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
//         {/* Logo + Name */}
//         <Link
//           to="/"
//           className="flex items-center gap-3 w-full md:w-auto max-w-[85%] overflow-hidden"
//         >
//           <img
//             className="h-10 w-10 shrink-0"
//             src="https://res.cloudinary.com/dzsvjyg2c/image/upload/gyzoxsk22n0z1kkkh3di.png"
//             alt="Logo"
//           />
//           <div>
//           <span className="text-sm sm:text-base md:text-lg font-bold text-indigo-600 truncate">
//             KAMLI ANUPAM PRIMARY SCHOOL,
//           </span>
//           <div className='text-[13px] 1xl:text-base md:text-1xl font-medium truncate'> Ta.-UNJHA, Dis.-MAHESANA</div>
//           </div>
//         </Link>

//         {/* Hamburger (Mobile) */}
//         <div className="md:hidden">
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="text-gray-700 hover:text-indigo-600 focus:outline-none"
//           >
//             {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//           </button>
//         </div>

//         {/* Desktop Menu */}
//         <div className="hidden md:flex space-x-6 text-base">
//           <Link to="/" className={isActive('/')}>
//             Home
//           </Link>
//           <Link to="/admin/login" className={isActive('/admin/login')}>
//             Teacher Login
//           </Link>
//         </div>
//       </div>

//       {/* Mobile Dropdown */}
//       {isOpen && (
//         <div className="md:hidden px-4 pb-4">
//           <div className="flex flex-col space-y-2 text-base">
//             <Link to="/" className={isActive('/')} onClick={() => setIsOpen(false)}>
//               Home
//             </Link>
//             <Link
//               to="/admin/login"
//               className={isActive('/admin/login')}
//               onClick={() => setIsOpen(false)}
//             >
//               Teacher Login
//             </Link>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;


import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false); // dropdown state
  const { i18n, t } = useTranslation();

  const isActive = (path) =>
    pathname === path
      ? "text-indigo-600 font-semibold"
      : "text-gray-700 hover:text-indigo-500";

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLangOpen(false); // close dropdown
    setIsOpen(false); // close mobile menu if open
  };

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
          <div>
            <span className="text-sm sm:text-base md:text-lg font-bold text-indigo-600 truncate">
              {t("schoolName")}
            </span>
            <div className="text-[13px] 1xl:text-base md:text-1xl font-medium truncate">
              {t("schoolTagline")}
            </div>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 text-base">
          <Link to="/" className={isActive("/")}>
            {t("home", "Home")}
          </Link>
          <Link to="/admin/login" className={isActive("/admin/login")}>
            {t("teacherPortal")}
          </Link>

          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              {i18n.language.toUpperCase()} <ChevronDown className="ml-1 h-4 w-4" />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow-md">
                <button
                  onClick={() => changeLanguage("en")}
                  className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${
                    i18n.language === "en" ? "bg-blue-500 text-white" : ""
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage("gu")}
                  className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${
                    i18n.language === "gu" ? "bg-orange-500 text-white" : ""
                  }`}
                >
                  ગુજરાતી
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hamburger (Mobile) */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-indigo-600 focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4">
          <div className="flex flex-col space-y-2 text-base">
            <Link
              to="/"
              className={isActive("/")}
              onClick={() => setIsOpen(false)}
            >
              {t("home", "Home")}
            </Link>
            <Link
              to="/admin/login"
              className={isActive("/admin/login")}
              onClick={() => setIsOpen(false)}
            >
              {t("teacherPortal")}
            </Link>

            {/* Language Dropdown (Mobile) */}
            <div className="relative mt-2">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                {i18n.language.toUpperCase()} <ChevronDown className="ml-1 h-4 w-4" />
              </button>

              {langOpen && (
                <div className="absolute left-0 mt-2 w-32 bg-white border rounded shadow-md">
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${
                      i18n.language === "en" ? "bg-blue-500 text-white" : ""
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage("gu")}
                    className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${
                      i18n.language === "gu" ? "bg-orange-500 text-white" : ""
                    }`}
                  >
                    ગુજરાતી
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
