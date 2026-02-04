import React, { useState } from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { StatCard } from '../components/Dashboard/StatCard';
import { DataTable } from '../components/Dashboard/DataTable';
import { StatusBadge } from '../components/Dashboard/StatusBadge';
import { ConfirmModal } from '../components/Dashboard/ConfirmModal';

// Mock data
const MOCK_LISTINGS = [
  {
    _id: '1',
    title: 'Premium Mess in Dhanmondi',
    city: 'Dhaka',
    rent: 8000,
    verified: true,
    bookings: 5,
  },
  {
    _id: '2',
    title: 'Budget Hostel Mirpur',
    city: 'Dhaka',
    rent: 5500,
    verified: false,
    bookings: 2,
  },
];

const MOCK_BOOKING_REQUESTS = [
  {
    _id: '1',
    studentId: { name: 'Karim Ahmed' },
    listingId: { title: 'Premium Mess' },
    moveInDate: '2026-02-15',
    status: 'pending',
  },
  {
    _id: '2',
    studentId: { name: 'Nadia Hassan' },
    listingId: { title: 'Budget Hostel' },
    moveInDate: '2026-03-01',
    status: 'pending',
  },
];

export const OwnerDashboardPage = () => {
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [bookingRequests, setBookingRequests] = useState(MOCK_BOOKING_REQUESTS);
  const [confirmModal, setConfirmModal] = useState({ open: false });

  const stats = {
    totalListings: listings.length,
    pendingRequests: bookingRequests.filter((b) => b.status === 'pending').length,
    totalBookings: bookingRequests.length,
    avgRating: 4.6,
  };

  const handleBookingAction = (bookingId, action) => {
    setConfirmModal({
      open: true,
      title: action === 'accept' ? 'Accept Booking?' : 'Reject Booking?',
      message: `Are you sure you want to ${action} this booking request?`,
      confirmText: action === 'accept' ? 'Accept' : 'Reject',
      isDangerous: action === 'reject',
      onConfirm: () => {
        setBookingRequests(
          bookingRequests.map((b) =>
            b._id === bookingId ? { ...b, status: action === 'accept' ? 'accepted' : 'rejected' } : b
          )
        );
        setConfirmModal({ open: false });
      },
    });
  };

  const listingsColumns = [
    {
      key: 'title',
      label: 'Listing',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.title}</p>
          <p className="text-xs text-gray-500">{row.city}</p>
        </div>
      ),
    },
    {
      key: 'rent',
      label: 'Monthly Rent',
      render: (row) => <span className="font-medium">৳{row.rent.toLocaleString()}</span>,
    },
    {
      key: 'bookings',
      label: 'Bookings',
      render: (row) => (
        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-medium">
          {row.bookings} active
        </span>
      ),
    },
    {
      key: 'verified',
      label: 'Status',
      render: (row) => <StatusBadge status={row.verified ? 'verified' : 'unverified'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors">
            <i className="fas fa-edit mr-1"></i> Edit
          </button>
          <button className="px-3 py-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded-lg font-medium transition-colors">
            <i className="fas fa-eye mr-1"></i> View
          </button>
        </div>
      ),
    },
  ];

  const requestsColumns = [
    {
      key: 'student',
      label: 'Student',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.studentId.name}</p>
          <p className="text-xs text-gray-500">{row.listingId.title}</p>
        </div>
      ),
    },
    {
      key: 'moveInDate',
      label: 'Move-in Date',
      render: (row) =>
        new Date(row.moveInDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        row.status === 'pending' ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleBookingAction(row._id, 'accept')}
              className="px-3 py-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded-lg font-medium transition-colors"
            >
              <i className="fas fa-check mr-1"></i> Accept
            </button>
            <button
              onClick={() => handleBookingAction(row._id, 'reject')}
              className="px-3 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
            >
              <i className="fas fa-times mr-1"></i> Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-500">No actions</span>
        ),
    },
  ];

  return (
    <DashboardLayout title="Owner Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="fas fa-home"
          label="Total Listings"
          value={stats.totalListings}
          subtext="Active properties"
          color="blue"
        />
        <StatCard
          icon="fas fa-inbox"
          label="Pending Requests"
          value={stats.pendingRequests}
          subtext="Awaiting response"
          color="orange"
        />
        <StatCard
          icon="fas fa-calendar-check"
          label="Total Bookings"
          value={stats.totalBookings}
          subtext="All time"
          color="green"
        />
        <StatCard
          icon="fas fa-star"
          label="Avg Rating"
          value={stats.avgRating}
          subtext="From reviews"
          color="purple"
        />
      </div>

      {/* Create Listing CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Add a New Listing</h3>
            <p className="text-sm opacity-90">Reach more students and earn more bookings</p>
          </div>
          <a
            href="/dashboard/owner/create-listing"
            className="px-6 py-2 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-50 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i> Create Listing
          </a>
        </div>
      </div>

      {/* Listings Table */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          <i className="fas fa-home text-blue-600 mr-2"></i>
          My Listings
        </h2>
        <DataTable columns={listingsColumns} data={listings} emptyMessage="No listings yet" />
      </div>

      {/* Booking Requests Table */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          <i className="fas fa-inbox text-blue-600 mr-2"></i>
          Booking Requests
        </h2>
        <DataTable columns={requestsColumns} data={bookingRequests} emptyMessage="No booking requests" />
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDangerous={confirmModal.isDangerous}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ open: false })}
      />
    </DashboardLayout>
  );
};

export default OwnerDashboardPage;
