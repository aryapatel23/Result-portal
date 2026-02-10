/* global google */
import React, { useEffect, useState, useRef } from 'react';
import { FaGlobe, FaChevronDown, FaTimes } from 'react-icons/fa';

/**
 * LanguageSwitcher Component (Navbar Version)
 * Uses Google Translate Element API to provide translation for:
 * - English (en)
 * - Hindi (hi)
 * - Gujarati (gu)
 */
const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
];

const LanguageSwitcher = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('en');
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Check cookie for existing language
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };

        const cookieValue = getCookie('googtrans');
        if (cookieValue) {
            const lang = cookieValue.split('/').pop();
            if (['en', 'hi', 'gu'].includes(lang)) {
                setCurrentLang(lang);
            }
        }

        // Initialize Google Translate script
        if (!window.googleTranslateElementInit) {
            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        includedLanguages: 'en,hi,gu',
                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                        autoDisplay: false,
                    },
                    'google_translate_element'
                );
            };

            const script = document.createElement('script');
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        }

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (langCode) => {
        const domain = window.location.hostname;
        document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}`;
        document.cookie = `googtrans=/en/${langCode}; path=/;`;

        setCurrentLang(langCode);
        setIsOpen(false);
        window.location.reload();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Hidden container for Google Translate widget */}
            <div id="google_translate_element" style={{ display: 'none' }}></div>

            {/* Navbar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${isOpen
                    ? "bg-sky-100 text-indigo-600 ring-2 ring-sky-200"
                    : "bg-gray-100/80 text-gray-700 hover:bg-sky-50 hover:text-indigo-600"
                    }`}
                aria-label="Change Language"
            >
                <FaGlobe className={`text-sm transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
                <span className="text-sm font-bold uppercase tracking-tight">
                    {currentLang.toUpperCase()}
                </span>
                <FaChevronDown className={`text-[10px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-sky-100 overflow-hidden z-50 transform origin-top animate-in fade-in zoom-in duration-200">
                    <div className="p-3 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Language</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-all"
                        >
                            <FaTimes size={10} />
                        </button>
                    </div>

                    <div className="py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-all hover:bg-sky-50 group ${currentLang === lang.code ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600'
                                    }`}
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm">{lang.nativeName}</span>
                                    <span className="text-[10px] text-gray-400 font-normal group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{lang.name}</span>
                                </div>
                                {currentLang === lang.code && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-2 bg-gray-50/80 border-t border-gray-100 flex flex-col items-center gap-0.5">
                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Powered by</span>
                        <div className="flex items-center gap-1 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 cursor-default">
                            <img
                                src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
                                alt="Google"
                                className="h-3"
                            />
                            <span className="text-[9px] text-gray-400 font-medium">Translate</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Global CSS to hide Google's default UI and tooltips */}
            <style>{`
        /* Hide Google Translate Banner and associated elements */
        .goog-te-banner-frame.skiptranslate,
        .goog-te-banner-frame,
        #goog-gt-tt,
        .goog-te-balloon-frame,
        .goog-te-menu-value,
        .goog-te-gadget-icon,
        .goog-te-banner {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        
        /* Force body and html to the top */
        body, html {
          top: 0 !important;
          position: static !important;
        }
        
        /* Disable text highlights */
        .goog-text-highlight {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* Prevent Google from adding padding to the top of the body */
        body {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }

        .skiptranslate {
          display: none !important;
        }
      `}</style>
        </div>
    );
};

export default LanguageSwitcher;
