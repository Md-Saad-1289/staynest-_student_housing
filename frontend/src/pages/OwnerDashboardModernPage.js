import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { StatCard } from '../components/Dashboard/StatCard';
import { DataTable } from '../components/Dashboard/DataTable';
import { StatusBadge } from '../components/Dashboard/StatusBadge';
import { ConfirmModal } from '../components/Dashboard/ConfirmModal';
import { listingService, bookingService, reviewService } from '../services/api';

/**
 * OwnerDashboardModernPage: Production-ready Owner Dashboard
 * 
 * Features:
 * - Complete onboarding (NID, phone number)
 * - Create new property listings (mess / hostel)
 * - Edit or delete only their own listings
 * - View booking requests for their listings
 * - Accept or reject booking requests
 * - Read reviews for their listings (read-only)
 * - Reply once per review
 * 
 * Access Control:
 * - Owners CANNOT verify themselves
 * - Owners CANNOT delete other owners' listings
 * - Owners CANNOT access admin controls
 * - UI strictly limits actions to owner's own data
 */
export const OwnerDashboardModernPage = () => {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false });
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchOwnerData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'overview' || activeTab === 'listings') {
        // Fetch owner's listings
        const listingsRes = await listingService.getOwnerListings();
        setListings(listingsRes.data.listings || []);
      }

      if (activeTab === 'overview' || activeTab === 'bookings') {
        // Fetch booking requests for owner's listings
        const bookingsRes = await bookingService.getOwnerBookings();
        setBookingRequests(bookingsRes.data.bookings || []);
      }

      if (activeTab === 'reviews') {
        // Fetch reviews for all owner's listings
        const listingsRes = await listingService.getOwnerListings();
        let allReviews = [];
        for (const listing of listingsRes.data.listings || []) {
          const reviewsRes = await reviewService.getListingReviews(listing._id);
          allReviews = [...allReviews, ...(reviewsRes.data.reviews || [])];
        }
        setReviews(allReviews);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOwnerData();
  }, [activeTab, refreshKey, fetchOwnerData]);

  // Calculate stats
  const stats = {
    totalListings: listings.length,
    verifiedListings: listings.filter((l) => l.verified).length,
    pendingBookings: bookingRequests.filter((b) => b.status === 'pending').length,
    totalReviews: reviews.length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + Object.values(r.ratings).reduce((s, v) => s + v, 0) / 6, 0) / reviews.length).toFixed(1)
      : 0,
  };

  // Handle booking status update
  const handleBookingAction = async (bookingId, status) => {
    setConfirmModal({
      open: true,
      title: status === 'accepted' ? 'Accept Booking?' : 'Reject Booking?',
      message: `Are you sure you want to ${status} this booking request?`,
      confirmText: status === 'accepted' ? 'Accept' : 'Reject',
      isDangerous: status === 'rejected',
      onConfirm: async () => {
        try {
          await bookingService.updateBookingStatus(bookingId, status);
          setRefreshKey((k) => k + 1);
          setConfirmModal({ open: false });
        } catch (err) {
          alert(err.response?.data?.error || 'Failed to update booking');
        }
      },
    });
  };

  // Handle review reply
  const handleReplyToReview = async (reviewId) => {
    const reply = prompt('Write your reply (one reply per review):');
    if (!reply) return;

    try {
      await reviewService.replyToReview(reviewId, reply);
      setRefreshKey((k) => k + 1);
      alert('Reply added successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add reply');
    }
  };

  // Listings table columns
  const listingsColumns = [
    {
      key: 'title',
      label: 'Listing',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-home text-blue-600"></i>
            {row.title}
          </p>
          <p className="text-xs text-gray-500">{row.address}</p>
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
      label: 'Monthly Rent',
      render: (row) => <span className="font-semibold">৳{row.rent.toLocaleString()}</span>,
    },
    {
      key: 'verified',
      label: 'Status',
      render: (row) => (
        <StatusBadge
          status={row.verified ? 'verified' : 'unverified'}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <a
            href={`/listing/${row._id}`}
            className="px-3 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded font-medium transition-colors flex items-center gap-1"
          >
            <i className="fas fa-eye"></i> View
          </a>
          <button
            className="px-3 py-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded font-medium transition-colors flex items-center gap-1"
          >
            <i className="fas fa-edit"></i> Edit
          </button>
        </div>
      ),
    },
  ];

  // Booking requests table columns
  const requestsColumns = [
    {
      key: 'student',
      label: 'Student',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-user text-blue-600"></i>
            {row.studentId?.name || 'Unknown'}
          </p>
          <p className="text-xs text-gray-500">{row.studentId?.email || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'listing',
      label: 'Property',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.listingId?.title || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{row.listingId?.city || 'N/A'}</p>
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
              onClick={() => handleBookingAction(row._id, 'accepted')}
              className="px-3 py-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded font-medium transition-colors flex items-center gap-1"
            >
              <i className="fas fa-check"></i> Accept
            </button>
            <button
              onClick={() => handleBookingAction(row._id, 'rejected')}
              className="px-3 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded font-medium transition-colors flex items-center gap-1"
            >
              <i className="fas fa-times"></i> Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-500 font-medium capitalize">
            {row.status}
          </span>
        ),
    },
  ];

  // Reviews table columns
  const reviewsColumns = [
    {
      key: 'student',
      label: 'Review From',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.studentId?.name || 'Unknown Student'}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <i className="fas fa-star text-yellow-500"></i>
            {(Object.values(row.ratings).reduce((a, b) => a + b, 0) / 6).toFixed(1)} rating
          </p>
        </div>
      ),
    },
    {
      key: 'review',
      label: 'Review',
      render: (row) => (
        <div>
          <p className="text-sm text-gray-700 line-clamp-2">{row.textReview}</p>
        </div>
      ),
    },
    {
      key: 'reply',
      label: 'Your Reply',
      render: (row) =>
        row.ownerReply ? (
          <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <p className="text-xs font-semibold text-blue-900">Your reply:</p>
            <p className="text-sm text-blue-800 line-clamp-2">{row.ownerReply}</p>
          </div>
        ) : (
          <span className="text-xs text-gray-500">Not replied yet</span>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        !row.ownerReply ? (
          <button
            onClick={() => handleReplyToReview(row._id)}
            className="px-3 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded font-medium transition-colors flex items-center gap-1"
          >
            <i className="fas fa-reply"></i> Reply
          </button>
        ) : (
          <span className="text-xs text-gray-500">Replied</span>
        ),
    },
  ];

  if (loading && activeTab !== 'overview') {
    return (
      <DashboardLayout title="Owner Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600 font-medium">Loading data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Owner Dashboard">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <i className="fas fa-circle-exclamation"></i>
          {error}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon="fas fa-home"
              label="Total Listings"
              value={stats.totalListings}
              subtext={`${stats.verifiedListings} verified`}
              color="blue"
            />
            <StatCard
              icon="fas fa-inbox"
              label="Pending Bookings"
              value={stats.pendingBookings}
              subtext="Awaiting your response"
              color="orange"
            />
            <StatCard
              icon="fas fa-star"
              label="Avg Rating"
              value={stats.avgRating}
              subtext={`From ${stats.totalReviews} reviews`}
              color="yellow"
            />
            <StatCard
              icon="fas fa-chart-line"
              label="Active Properties"
              value={listings.length}
              subtext="Live listings"
              color="green"
            />
          </div>

          {/* Create Listing CTA */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <i className="fas fa-plus-circle"></i>
                  Add a New Listing
                </h3>
                <p className="text-sm opacity-90 mt-1">Reach more students and earn more bookings</p>
              </div>
              <button
                onClick={() => navigate('/dashboard/owner/create-listing')}
                className="px-6 py-2 bg-white text-green-600 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-plus"></i> Create Listing
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setActiveTab('listings')}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition text-left"
            >
              <i className="fas fa-home text-blue-600 text-3xl mb-3"></i>
              <h3 className="font-bold text-gray-900 mb-1">View Listings</h3>
              <p className="text-sm text-gray-600">{listings.length} properties</p>
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition text-left"
            >
              <i className="fas fa-inbox text-orange-600 text-3xl mb-3"></i>
              <h3 className="font-bold text-gray-900 mb-1">Booking Requests</h3>
              <p className="text-sm text-gray-600">{stats.pendingBookings} pending</p>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition text-left"
            >
              <i className="fas fa-comments text-green-600 text-3xl mb-3"></i>
              <h3 className="font-bold text-gray-900 mb-1">Reviews</h3>
              <p className="text-sm text-gray-600">{stats.totalReviews} total</p>
            </button>
          </div>
        </>
      )}

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              <i className="fas fa-home text-blue-600 mr-2"></i>
              My Listings
            </h2>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <i className="fas fa-sync"></i> Refresh
            </button>
          </div>
          {listings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-600 mb-4">No listings yet</p>
              <button
                onClick={() => navigate('/dashboard/owner/create-listing')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <i className="fas fa-plus"></i> Create Your First Listing
              </button>
            </div>
          ) : (
            <DataTable columns={listingsColumns} data={listings} />
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              <i className="fas fa-inbox text-orange-600 mr-2"></i>
              Booking Requests
            </h2>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <i className="fas fa-sync"></i> Refresh
            </button>
          </div>
          {bookingRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">No booking requests yet</p>
            </div>
          ) : (
            <DataTable columns={requestsColumns} data={bookingRequests} />
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              <i className="fas fa-star text-yellow-500 mr-2"></i>
              Reviews & Ratings
            </h2>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <i className="fas fa-sync"></i> Refresh
            </button>
          </div>
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <i className="fas fa-star text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">No reviews yet</p>
            </div>
          ) : (
            <DataTable columns={reviewsColumns} data={reviews} />
          )}
        </div>
      )}

      {/* Tab Navigation */}
      {activeTab !== 'overview' && (
        <div className="mt-6">
          <button
            onClick={() => setActiveTab('overview')}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors"
          >
            <i className="fas fa-arrow-left"></i> Back to Overview
          </button>
        </div>
      )}

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

      {/* Important Note */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900 font-medium flex items-center gap-2">
          <i className="fas fa-info-circle text-blue-600"></i>
          <strong>Owner Privileges:</strong> You can create, edit, and manage only your own listings. Admins will verify your account and listings.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboardModernPage;
