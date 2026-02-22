import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const MENU_ITEMS = {
  student: [
    { icon: 'fas fa-home', label: 'Dashboard', path: '/dashboard/student', section: 'Main' },
    { icon: 'fas fa-calendar-check', label: 'My Bookings', path: '/dashboard/student/bookings', section: 'Main' },
    { icon: 'fas fa-star', label: 'My Reviews', path: '/dashboard/student/reviews', section: 'Activity' },
    { icon: 'fas fa-heart', label: 'Saved Listings', path: '/dashboard/student/saved', section: 'Activity' },
    { icon: 'fas fa-search', label: 'Find Housing', path: '/listings', section: 'Explore' },
  ],
  owner: [
    { icon: 'fas fa-chart-line', label: 'Dashboard', path: '/dashboard/owner', section: 'Overview' },
    { icon: 'fas fa-home', label: 'My Listings', path: '/dashboard/owner/listings', section: 'Management' },
    { icon: 'fas fa-inbox', label: 'Booking Requests', path: '/dashboard/owner/bookings', badge: 'notifications', section: 'Management' },
    { icon: 'fas fa-comments', label: 'Reviews & Ratings', path: '/dashboard/owner/reviews', section: 'Management' },
    { icon: 'fas fa-plus-circle', label: 'Create Listing', path: '/dashboard/owner/create-listing', section: 'Actions' },
  ],
  admin: [
    { icon: 'fas fa-chart-pie', label: 'Dashboard Overview', path: '/dashboard/admin/dashboard', section: 'Overview' },
    { icon: 'fas fa-layer-group', label: 'Listings Management', path: '/dashboard/admin/listings-overview', badge: 'pending', section: 'Management' },
    { icon: 'fas fa-users', label: 'User Management', path: '/dashboard/admin/users', badge: 'verification', section: 'Management' },
    { icon: 'fas fa-star', label: 'Featured Listings', path: '/dashboard/admin/featured', section: 'Management' },
    { icon: 'fas fa-comment-dots', label: 'Testimonials', path: '/dashboard/admin/testimonials', section: 'Content' },
    { icon: 'fas fa-flag', label: 'Flags & Reports', path: '/dashboard/admin/flags', badge: 'flags', section: 'Moderation' },
    { icon: 'fas fa-shield-alt', label: 'Audit Logs', path: '/dashboard/admin/logs', section: 'Security' },
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
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Logo & Branding */}
      <div className="p-6 border-b border-slate-700">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-lg">
            SN
          </div>
          <div>
            <div className="font-bold text-white leading-tight">StayNest</div>
            <div className="text-xs text-blue-400">{userRole?.toUpperCase()} PANEL</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Group menu items by section */}
        {[...new Set(menuItems.map(item => item.section))].map(section => (
          <div key={section}>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 mt-2 first:mt-0">
              {section}
            </div>
            {menuItems.filter(item => item.section === section).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`group flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className={`${item.icon} w-5 text-center text-base`}></i>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                    item.badge === 'premium' ? 'bg-yellow-500 text-slate-900' :
                    item.badge === 'verification' ? 'bg-red-500 text-white' :
                    item.badge === 'pending' ? 'bg-orange-500 text-white' :
                    item.badge === 'flags' ? 'bg-red-600 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {item.badge === 'premium' ? '✨' :
                     item.badge === 'verification' ? '⚡' :
                     item.badge === 'pending' ? '⏳' :
                     item.badge === 'flags' ? '🚩' : '📬'}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer - User Info & Logout */}
      <div className="border-t border-slate-700 p-4 space-y-2">
        <div className="px-4 py-2 bg-slate-700/50 rounded-lg">
          <div className="text-xs text-slate-400">Logged in as</div>
          <div className="text-sm font-semibold text-white capitalize">{userRole} User</div>
        </div>
        <button
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-600/20 hover:text-red-300 rounded-lg transition-colors font-medium"
        >
          <i className="fas fa-sign-out-alt w-5 text-center"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
