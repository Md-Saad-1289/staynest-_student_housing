import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { ListingsPage } from './pages/ListingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { StudentBookingsPage } from './pages/StudentBookingsPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { StudentDashboardModernPage } from './pages/StudentDashboardModernPage';
import { OwnerDashboardModernPage } from './pages/OwnerDashboardModernPage';
import { AdminDashboardModernPage } from './pages/AdminDashboardModernPage';
import { UserProfilePage } from './pages/UserProfilePage';

import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentBookingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Canonical dashboard routes */}
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboardModernPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/owner"
            element={
              <ProtectedRoute requiredRole="owner">
                <OwnerDashboardModernPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/owner/create-listing"
            element={
              <ProtectedRoute requiredRole="owner">
                <CreateListingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardModernPage />
              </ProtectedRoute>
            }
          />

          {/* Backwards-compatible redirects from legacy routes */}
          <Route path="/student/dashboard" element={<Navigate to="/dashboard/student" replace />} />
          <Route path="/owner/dashboard" element={<Navigate to="/dashboard/owner" replace />} />
          <Route path="/owner/create-listing" element={<Navigate to="/dashboard/owner/create-listing" replace />} />
          <Route path="/admin/dashboard" element={<Navigate to="/dashboard/admin" replace />} />

          

          <Route path="*" element={<div className="flex items-center justify-center min-h-screen text-lg text-gray-600">Page not found</div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
