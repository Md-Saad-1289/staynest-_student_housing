import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const MENU_ITEMS = {
  student: [
    { icon: 'fas fa-home', label: 'Dashboard', path: '/dashboard/student' },
    { icon: 'fas fa-calendar-check', label: 'My Bookings', path: '/my-bookings' },
    { icon: 'fas fa-star', label: 'My Reviews', path: '/student/reviews' },
    { icon: 'fas fa-search', label: 'Find Housing', path: '/listings' },
  ],
  owner: [
    { icon: 'fas fa-chart-line', label: 'Dashboard', path: '/dashboard/owner' },
    { icon: 'fas fa-home', label: 'My Listings', path: '/dashboard/owner' },
    { icon: 'fas fa-inbox', label: 'Booking Requests', path: '/dashboard/owner' },
    { icon: 'fas fa-comments', label: 'Reviews', path: '/dashboard/owner' },
    { icon: 'fas fa-plus-circle', label: 'Create Listing', path: '/dashboard/owner/create-listing' },
  ],
  admin: [
    { icon: 'fas fa-chart-pie', label: 'Dashboard', path: '/dashboard/admin' },
    { icon: 'fas fa-users', label: 'Users', path: '/dashboard/admin' },
    { icon: 'fas fa-list', label: 'Listings', path: '/dashboard/admin' },
    { icon: 'fas fa-flag', label: 'Reports', path: '/dashboard/admin' },
    { icon: 'fas fa-shield-alt', label: 'Moderation', path: '/dashboard/admin' },
  ],
};

export const DashboardSidebar = ({ userRole, mobile = false, onClose }) => {
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const menuItems = MENU_ITEMS[userRole] || [];

  const isActive = (path) => location.pathname === path;

  if (mobile) {
    return (
      <nav className="flex overflow-x-auto gap-1 p-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
              isActive(item.path)
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <i className="fas fa-home"></i> NestroStay
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <i className={`${item.icon} w-5 text-center`}></i>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <i className="fas fa-sign-out-alt w-5 text-center"></i>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};
