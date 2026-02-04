import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { StatCard } from '../components/Dashboard/StatCard';
import { DataTable } from '../components/Dashboard/DataTable';
import { StatusBadge } from '../components/Dashboard/StatusBadge';

// Mock data
const MOCK_BOOKINGS = [
  {
    _id: '1',
    listingId: { title: 'Premium Mess in Dhanmondi', rent: 8000 },
    status: 'completed',
    moveInDate: '2025-12-01',
  },
  {
    _id: '2',
    listingId: { title: 'Female Friendly Hostel', rent: 6500 },
    status: 'accepted',
    moveInDate: '2026-02-15',
  },
  {
    _id: '3',
    listingId: { title: 'Budget Mess in Mirpur', rent: 5000 },
    status: 'pending',
    moveInDate: '2026-03-01',
  },
];

export const StudentDashboardPage = () => {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [stats, setStats] = useState({
    active: 1,
    pending: 1,
    completed: 1,
  });

  const bookingColumns = [
    {
      key: 'listing',
      label: 'Listing',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 flex items-center gap-1"><i className="fas fa-home text-blue-600"></i> {row.listingId.title}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><i className="fas fa-money-bill-wave text-green-600"></i> ৳{row.listingId.rent}/mo</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'moveInDate',
      label: 'Move-in Date',
      render: (row) => (
        <div className="flex items-center gap-1">
          <i className="fas fa-calendar text-purple-600"></i>
          {new Date(row.moveInDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors flex items-center gap-1">
            <i className="fas fa-eye"></i> View
          </button>
          {row.status === 'completed' && (
            <button className="px-3 py-1 text-xs bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg font-medium transition-colors flex items-center gap-1">
              <i className="fas fa-star"></i> Review
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="My Dashboard">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon="fas fa-home"
          label="Active Booking"
          value={stats.active}
          subtext="Currently staying"
          color="blue"
        />
        <StatCard
          icon="fas fa-clock"
          label="Pending Requests"
          value={stats.pending}
          subtext="Awaiting approval"
          color="orange"
        />
        <StatCard
          icon="fas fa-check-circle"
          label="Completed Stays"
          value={stats.completed}
          subtext="Past bookings"
          color="green"
        />
      </div>

      {/* My Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            <i className="fas fa-calendar-check text-blue-600 mr-2"></i>
            My Bookings
          </h2>
          <a
            href="/listings"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <i className="fas fa-plus"></i> Find More Housing
          </a>
        </div>
        <DataTable columns={bookingColumns} data={bookings} emptyMessage="No bookings yet. Start exploring!" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200 hover:border-blue-400 transition">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-lg">
            <i className="fas fa-search text-blue-600 text-xl"></i>
            Find Housing
          </h3>
          <p className="text-sm text-gray-700 mb-4">Browse verified listings from trusted owners and find your perfect home.</p>
          <a
            href="/listings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-arrow-right"></i> Explore Listings
          </a>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200 hover:border-purple-400 transition">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-lg">
            <i className="fas fa-headset text-purple-600 text-xl"></i>
            Need Help?
          </h3>
          <p className="text-sm text-gray-700 mb-4">Get in touch with our support team for any questions or assistance.</p>
          <a
            href="mailto:support@nestrostay.com"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <i className="fas fa-envelope"></i> Contact Support
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboardPage;
