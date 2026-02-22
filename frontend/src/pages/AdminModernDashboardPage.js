import React, { useState } from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { StatCard } from '../components/Dashboard/StatCard';
import { DataTable } from '../components/Dashboard/DataTable';
import { StatusBadge } from '../components/Dashboard/StatusBadge';
import { ConfirmModal } from '../components/Dashboard/ConfirmModal';

// Mock data
const MOCK_STATS = {
  totalUsers: 142,
  totalListings: 37,
  totalBookings: 89,
  flagCount: 5,
};

const MOCK_UNVERIFIED_OWNERS = [
  {
    _id: '1',
    name: 'Reza Khan',
    email: 'reza@example.com',
    phoneNo: '01712345678',
    listingsCount: 2,
  },
  {
    _id: '2',
    name: 'Aisha Ahmed',
    email: 'aisha@example.com',
    phoneNo: '01722345678',
    listingsCount: 1,
  },
];

const MOCK_UNVERIFIED_LISTINGS = [
  {
    _id: '1',
    title: 'Student Mess Banani',
    owner: 'Reza Khan',
    city: 'Dhaka',
    rent: 7500,
  },
  {
    _id: '2',
    title: 'Female Hostel Gulshan',
    owner: 'Aisha Ahmed',
    city: 'Dhaka',
    rent: 6000,
  },
];

const MOCK_FLAGS = [
  {
    _id: '1',
    listingId: { title: 'Suspicious Mess' },
    reason: 'Inappropriate content',
    flaggedBy: 'Student Name',
    status: 'open',
  },
  {
    _id: '2',
    listingId: { title: 'Misleading Photos' },
    reason: 'Misleading information',
    flaggedBy: 'Another Student',
    status: 'open',
  },
];

export const AdminDashboardPage = () => {
  const [confirmModal, setConfirmModal] = useState({ open: false });

  const handleVerify = (id, type) => {
    setConfirmModal({
      open: true,
      title: 'Verify Entry?',
      message: `Approve this ${type}?`,
      confirmText: 'Verify',
      onConfirm: () => {
        alert(`${type} verified!`);
        setConfirmModal({ open: false });
      },
    });
  };

  const handleResolveFlag = (flagId) => {
    setConfirmModal({
      open: true,
      title: 'Resolve Flag?',
      message: 'Mark this flag as resolved?',
      confirmText: 'Resolve',
      onConfirm: () => {
        alert('Flag resolved!');
        setConfirmModal({ open: false });
      },
    });
  };

  const ownersColumns = [
    {
      key: 'name',
      label: 'Owner',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'phoneNo',
      label: 'Contact',
      render: (row) => <span className="text-sm text-gray-700">{row.phoneNo}</span>,
    },
    {
      key: 'listings',
      label: 'Listings',
      render: (row) => (
        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-medium">
          {row.listingsCount}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleVerify(row._id, 'owner')}
          className="px-3 py-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded-lg font-medium transition-colors"
        >
          <i className="fas fa-check mr-1"></i> Verify
        </button>
      ),
    },
  ];

  const listingsColumns = [
    {
      key: 'title',
      label: 'Listing',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.title}</p>
          <p className="text-xs text-gray-500">by {row.owner}</p>
        </div>
      ),
    },
    {
      key: 'city',
      label: 'City',
      render: (row) => <span className="text-sm text-gray-700">{row.city}</span>,
    },
    {
      key: 'rent',
      label: 'Rent',
      render: (row) => <span className="font-medium">৳{row.rent.toLocaleString()}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleVerify(row._id, 'listing')}
          className="px-3 py-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded-lg font-medium transition-colors"
        >
          <i className="fas fa-check mr-1"></i> Approve
        </button>
      ),
    },
  ];

  const flagsColumns = [
    {
      key: 'listing',
      label: 'Listing',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.listingId.title}</p>
          <p className="text-xs text-gray-500">by {row.flaggedBy}</p>
        </div>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (row) => <span className="text-sm text-gray-700">{row.reason}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status === 'open' ? 'pending' : 'completed'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleResolveFlag(row._id)}
          className="px-3 py-1 text-xs bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg font-medium transition-colors"
        >
          <i className="fas fa-ban mr-1"></i> Resolve
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="fas fa-users"
          label="Total Users"
          value={MOCK_STATS.totalUsers}
          subtext="Registered users"
          color="blue"
        />
        <StatCard
          icon="fas fa-home"
          label="Total Listings"
          value={MOCK_STATS.totalListings}
          subtext="Verified properties"
          color="green"
        />
        <StatCard
          icon="fas fa-calendar-check"
          label="Total Bookings"
          value={MOCK_STATS.totalBookings}
          subtext="All time"
          color="purple"
        />
        <StatCard
          icon="fas fa-flag"
          label="Flags"
          value={MOCK_STATS.flagCount}
          subtext="Pending reports"
          color="red"
        />
      </div>

      {/* Verification Queue */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          <i className="fas fa-user-check text-blue-600 mr-2"></i>
          Unverified Owners
        </h2>
        <DataTable columns={ownersColumns} data={MOCK_UNVERIFIED_OWNERS} emptyMessage="All owners verified!" />
      </div>

      {/* Listing Approval Queue */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          <i className="fas fa-list-check text-blue-600 mr-2"></i>
          Unverified Listings
        </h2>
        <DataTable columns={listingsColumns} data={MOCK_UNVERIFIED_LISTINGS} emptyMessage="All listings approved!" />
      </div>

      {/* Flags & Reports */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          <i className="fas fa-flag text-red-600 mr-2"></i>
          Flagged Listings
        </h2>
        <DataTable columns={flagsColumns} data={MOCK_FLAGS} emptyMessage="No flags to review" />
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ open: false })}
      />
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
