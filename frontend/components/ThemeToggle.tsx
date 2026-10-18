import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#EE9B00]">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#E9D8A6]">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
);


const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex items-center justify-center">
            <button
                onClick={toggleTheme}
                className="relative inline-flex items-center h-8 w-16 rounded-full transition-colors bg-[#E9D8A6] dark:bg-[#001233] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A67C9] focus:ring-offset-white dark:focus:ring-offset-[#001233]"
                aria-label="Toggle theme"
            >
                <span className="sr-only">Toggle theme</span>
                <span className={`transform transition-transform duration-300 ease-in-out ${theme === 'dark' ? 'translate-x-9' : 'translate-x-1'} h-6 w-6 rounded-full bg-white dark:bg-[#2A67C9] flex items-center justify-center shadow-md`}>
                    {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
                </span>
            </button>
        </div>
    );
};

export default ThemeToggle;