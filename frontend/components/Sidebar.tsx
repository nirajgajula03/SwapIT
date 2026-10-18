import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, ItemsIcon, SwapsIcon, WalletIcon, RepairAssistantIcon, ProfileIcon, MessagesIcon, LogoutIcon } from './Icons';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

const navigationItems = [
  { path: '/home', name: 'Home', icon: HomeIcon },
  { path: '/items', name: 'Items', icon: ItemsIcon },
  { path: '/swaps', name: 'Swaps', icon: SwapsIcon },
  { path: '/messages', name: 'Messages', icon: MessagesIcon },
  { path: '/wallet', name: 'Wallet', icon: WalletIcon },
  { path: '/repair-assistant', name: 'Repair Assistant', icon: RepairAssistantIcon },
  { path: '/profile', name: 'Profile', icon: ProfileIcon },
];

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { logout } = useAuth();

  return (
    <aside className={`flex flex-col flex-shrink-0 bg-white dark:bg-[#001233] border-r border-gray-200 dark:border-[#001845] transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="h-20 flex items-center justify-center border-b border-gray-200 dark:border-[#001845] flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#001233] dark:text-[#EFEFDE] tracking-wider">
          {isOpen ? (
            <>Swap<span className="text-[#2A67C9]">It</span></>
          ) : (
            <>S<span className="text-[#2A67C9]">I</span></>
          )}
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 overflow-y-auto overflow-x-hidden">
        <ul>
          {navigationItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                title={isOpen ? '' : item.name}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${isOpen ? '' : 'justify-center'} ${
                    isActive
                      ? 'bg-[#2A67C9] text-white dark:bg-[#2A67C9]/30 dark:text-[#E9D8A6]'
                      : 'text-[#001233] dark:text-[#EFEFDE] hover:bg-gray-100 dark:hover:bg-[#001845] dark:hover:text-[#E9D8A6]'
                  }`
                }
              >
                <item.icon className="w-6 h-6 flex-shrink-0" />
                <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ${isOpen ? 'ml-4 opacity-100' : 'w-0 opacity-0'}`}>
                    {item.name}
                </span>
              </NavLink>
            </li>
          ))}
           <li>
             <button
                onClick={logout}
                title={isOpen ? '' : 'Logout'}
                className={`flex items-center w-full px-4 py-3 my-1 rounded-lg transition-colors duration-200 text-[#001233] dark:text-[#EFEFDE] hover:bg-gray-100 dark:hover:bg-[#001845] dark:hover:text-[#E9D8A6] ${isOpen ? '' : 'justify-center'}`}
              >
                <LogoutIcon className="w-6 h-6 flex-shrink-0" />
                <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ${isOpen ? 'ml-4 opacity-100' : 'w-0 opacity-0'}`}>
                    Logout
                </span>
              </button>
           </li>
        </ul>
      </nav>
      <div className={`border-t border-gray-200 dark:border-[#001845] transition-all duration-300 ease-in-out ${isOpen ? 'p-4' : 'h-0 p-0 overflow-hidden opacity-0'}`}>
        <div className="mb-4">
            <ThemeToggle />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">&copy; 2024 SwapIt</p>
      </div>
    </aside>
  );
};

export default Sidebar;