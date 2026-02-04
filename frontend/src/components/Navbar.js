import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'student':
        return '/dashboard/student';
      case 'owner':
        return '/dashboard/owner';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/';
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/login');
  };

  const handleDashboardClick = () => {
    navigate(getDashboardRoute());
    setShowDropdown(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-gray-800 flex items-center gap-2 hover:opacity-90 transition">
            <i className="fas fa-home text-sky-600 text-3xl"></i>
            <span>NestroStay</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6 text-gray-700">
          <Link to="/listings" className="hover:text-gray-900 flex items-center gap-1 transition"><i className="fas fa-search"></i> Find Mess</Link>
          <a href="#how" className="hover:text-gray-900 flex items-center gap-1 transition"><i className="fas fa-question-circle"></i> How it Works</a>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <NotificationCenter />
              <div className="relative" ref={dropdownRef}>
              {/* Profile Icon Button */}
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white hover:shadow-lg transition-all duration-200"
                title={user?.name}
              >
                <i className="fas fa-user text-lg"></i>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in duration-200">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-user text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-600 capitalize flex items-center gap-1 mt-0.5">
                          {user?.role === 'student' && <i className="fas fa-graduation-cap"></i>}
                          {user?.role === 'owner' && <i className="fas fa-building"></i>}
                          {user?.role === 'admin' && <i className="fas fa-shield-alt"></i>}
                          {user?.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {/* Profile */}
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 transition-colors duration-150 border-b border-gray-100"
                    >
                      <i className="fas fa-user-circle text-purple-600 w-4"></i>
                      <span>My Profile</span>
                      <i className="fas fa-arrow-right text-purple-600 text-xs ml-auto"></i>
                    </Link>

                    {/* Dashboard */}
                    <button
                      onClick={handleDashboardClick}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors duration-150 border-b border-gray-100"
                    >
                      <i className="fas fa-chart-line text-blue-600 w-4"></i>
                      <span>Dashboard</span>
                      <i className="fas fa-arrow-right text-blue-600 text-xs ml-auto"></i>
                    </button>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition-colors duration-150"
                    >
                      <i className="fas fa-right-from-bracket text-red-600 w-4"></i>
                      <span>Logout</span>
                    </button>
                  </div>

                  {/* Footer Info */}
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <i className="fas fa-envelope text-gray-400"></i>
                      {user?.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-1 transition-colors duration-150"
              >
                <i className="fas fa-sign-in-alt"></i> Login
              </Link>
              <Link
                to="/register"
                className="bg-sky-600 text-white px-5 py-2 rounded-lg hover:bg-sky-700 hover:shadow-lg flex items-center gap-1 transition-all duration-150"
              >
                <i className="fas fa-user-plus"></i> Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
