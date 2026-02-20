import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export const DashboardHeader = ({ title, onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-gradient-to-r from-white via-blue-50 to-white shadow-md">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-5 flex items-center justify-between">
        {/* Left: Menu button + Title */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 hover:text-gray-900 flex-shrink-0"
          >
            <i className="fas fa-bars text-lg sm:text-xl"></i>
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-1 sm:gap-2 truncate">
              <i className="fas fa-chart-line text-blue-600 flex-shrink-0"></i> 
              <span className="truncate">{title}</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 hidden md:block font-medium mt-1">
              <i className="fas fa-circle text-green-500 text-xs animate-pulse"></i> 
              Welcome back, <span className="font-semibold text-gray-700">{user?.name}!</span>
            </p>
          </div>
        </div>

        {/* Right: User info + Logout */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Avatar - Hidden on very small screens */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs sm:text-sm font-black shadow-md flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-xs sm:text-sm hidden md:block">
              <p className="font-bold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600 capitalize font-semibold flex items-center gap-1">
                {user?.role === 'student' && <i className="fas fa-graduation-cap"></i>}
                {user?.role === 'owner' && <i className="fas fa-building"></i>}
                {user?.role === 'admin' && <i className="fas fa-shield-alt text-amber-600"></i>}
                {user?.role}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg transition-colors font-semibold flex-shrink-0" 
            title="Logout"
          >
            <i className="fas fa-sign-out-alt text-lg"></i>
          </button>
        </div>
      </div>
    </header>
  );
};
