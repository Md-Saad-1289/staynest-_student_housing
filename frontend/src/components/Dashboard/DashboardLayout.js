import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';

export const DashboardLayout = ({ children, title }) => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar - Desktop only */}
      <div className="hidden lg:block fixed h-screen w-64 border-r border-gray-200 bg-white overflow-y-auto">
        <DashboardSidebar userRole={user?.role} />
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Header */}
        <DashboardHeader
          title={title}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Content - Mobile friendly padding */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 overflow-y-auto">
            <DashboardSidebar userRole={user?.role} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white z-30 max-h-20 overflow-y-auto">
        <DashboardSidebar userRole={user?.role} mobile={true} />
      </div>

      {/* Main content padding for mobile bottom nav */}
      <div className="lg:hidden h-20" />
    </div>
  );
};
