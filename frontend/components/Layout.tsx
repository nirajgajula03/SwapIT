import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from './Icons';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[#EFEFDE] dark:bg-[#001845] text-[#001233] dark:text-[#EFEFDE] font-sans">
      <Sidebar isOpen={isSidebarOpen} />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <button
          onClick={toggleSidebar}
          className="absolute top-1/2 -translate-y-1/2 -left-4 bg-white dark:bg-[#001233] border border-gray-200 dark:border-gray-700 rounded-full p-1 z-10 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-[#001233]/80 focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isSidebarOpen ? <ChevronDoubleLeftIcon className="w-5 h-5" /> : <ChevronDoubleRightIcon className="w-5 h-5" />}
        </button>
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;