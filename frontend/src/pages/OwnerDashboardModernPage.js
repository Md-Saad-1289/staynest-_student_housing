import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
export const OwnerDashboardModernPage = ({ tab: tabProp }) => {
  const { tab } = useParams();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState(tab || tabProp || 'overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false });
  const [refreshKey, setRefreshKey] = useState(0);
  const [listingsFilterStatus, setListingsFilterStatus] = useState('all'); // all, verified, unverified
  const [listingsSearchQuery, setListingsSearchQuery] = useState('');

  // Update activeTab when route param changes
  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

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

  // Handle listing deletion
  const handleDeleteListing = (listingId, listingTitle) => {
    setConfirmModal({
      open: true,
      title: 'Delete Listing?',
      message: `You are about to permanently delete the listing "${listingTitle}". This action cannot be undone. Any pending bookings will also be affected.`,
      confirmText: 'Delete Permanently',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await listingService.deleteListing(listingId);
          alert('✓ Listing deleted successfully');
          setRefreshKey((k) => k + 1);
          setConfirmModal({ open: false });
        } catch (err) {
          alert('Failed to delete listing: ' + (err.response?.data?.error || err.message));
        }
      },
    });
  };

  // Listings table columns
  const listingsColumns = [
    {
      key: 'title',
      label: 'Property Details',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-home text-blue-600"></i>
            {row.title}
          </p>
          <p className="text-xs text-gray-500 mt-1">{row.address}, {row.city}</p>
        </div>
      ),
    },
    {
      key: 'rent',
      label: 'Monthly Rent',
      render: (row) => (
        <div>
          <p className="font-bold text-gray-900">৳{row.rent?.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-0.5">{row.type || 'Listing'}</p>
        </div>
      ),
    },
    {
      key: 'bookings',
      label: 'Inquiries',
      render: (row) => {
        const bookingCount = bookingRequests.filter(b => b.listingId?._id === row._id).length;
        const pendingCount = bookingRequests.filter(b => b.listingId?._id === row._id && b.status === 'pending').length;
        return (
          <div>
            <p className="font-semibold text-gray-900">{bookingCount}</p>
            {pendingCount > 0 && (
              <p className="text-xs text-orange-600 font-medium mt-0.5">{pendingCount} pending</p>
            )}
          </div>
        );
      },
    },
    {
      key: 'verified',
      label: 'Status',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.verified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              <i className="fas fa-check-circle text-sm"></i>
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
              <i className="fas fa-clock text-sm"></i>
              Pending
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <a
            href={`/listing/${row._id}`}
            className="px-2 sm:px-3 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors flex items-center gap-1 whitespace-nowrap"
            title="View public listing"
          >
            <i className="fas fa-eye hidden sm:inline"></i>
            <span>View</span>
          </a>
          <a
            href={`/dashboard/owner/edit-listing/${row._id}`}
            className="px-2 sm:px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-1 whitespace-nowrap"
            title="Edit listing details"
          >
            <i className="fas fa-edit hidden sm:inline"></i>
            <span>Edit</span>
          </a>
          <button
            onClick={() => handleDeleteListing(row._id, row.title)}
            className="px-2 sm:px-3 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors flex items-center gap-1 whitespace-nowrap"
            title="Delete listing"
          >
            <i className="fas fa-trash hidden sm:inline"></i>
            <span>Delete</span>
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
          <p className="font-semibold text-gray-900">{row.studentId?.name || 'Unknown'}</p>
          <p className="text-xs text-gray-500 mt-0.5">{row.studentId?.email || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'listing',
      label: 'Property',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.listingId?.title || 'Unknown'}</p>
          <p className="text-xs text-gray-500 mt-0.5">{row.listingId?.city || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'moveInDate',
      label: 'Move-in Date',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">
            {new Date(row.moveInDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {Math.ceil((new Date(row.moveInDate) - new Date()) / (1000 * 60 * 60 * 24))} days away
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const statusConfig = {
          pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'fas fa-clock' },
          accepted: { bg: 'bg-green-100', text: 'text-green-700', icon: 'fas fa-check-circle' },
          rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: 'fas fa-times-circle' },
          completed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'fas fa-flag-checkered' },
        };
        const config = statusConfig[row.status] || statusConfig.pending;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${config.bg} ${config.text} rounded-full text-xs font-semibold`}>
            <i className={`${config.icon} text-sm`}></i>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        row.status === 'pending' ? (
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <button
              onClick={() => handleBookingAction(row._id, 'accepted')}
              className="px-3 py-1.5 text-xs bg-green-600 text-white hover:bg-green-700 rounded-lg font-semibold transition-colors flex items-center gap-1 whitespace-nowrap"
              title="Accept this booking request"
            >
              <i className="fas fa-check hidden sm:inline"></i>
              <span>Accept</span>
            </button>
            <button
              onClick={() => handleBookingAction(row._id, 'rejected')}
              className="px-3 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded-lg font-semibold transition-colors flex items-center gap-1 whitespace-nowrap"
              title="Reject this booking request"
            >
              <i className="fas fa-times hidden sm:inline"></i>
              <span>Reject</span>
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-500 font-medium">No action needed</span>
        ),
    },
  ];

  // Reviews table columns
  const reviewsColumns = [
    {
      key: 'student',
      label: 'Review From',
      render: (row) => {
        const rating = (Object.values(row.ratings).reduce((a, b) => a + b, 0) / 6).toFixed(1);
        return (
          <div>
            <p className="font-semibold text-gray-900">{row.studentId?.name || 'Unknown Student'}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={`fas fa-star text-xs ${i < Math.round(rating / 2) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-700">{rating}/10</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'review',
      label: 'Review',
      render: (row) => (
        <div>
          <p className="text-sm text-gray-700 line-clamp-3">{row.textReview}</p>
        </div>
      ),
    },
    {
      key: 'reply',
      label: 'Your Response',
      render: (row) =>
        row.ownerReply ? (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-green-900 mb-1">Your reply:</p>
            <p className="text-sm text-green-800 line-clamp-2">{row.ownerReply}</p>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
            <i className="fas fa-clock text-xs"></i>
            Awaiting response
          </span>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        !row.ownerReply ? (
          <button
            onClick={() => handleReplyToReview(row._id)}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center gap-1 whitespace-nowrap"
            title="Write a response to this review"
          >
            <i className="fas fa-reply hidden sm:inline"></i>
            <span>Reply</span>
          </button>
        ) : (
          <span className="text-xs text-gray-500 font-medium">Done</span>
        ),
    },
  ];

  if (loading && activeTab !== 'overview') {
    return (
      <DashboardLayout title="Owner Dashboard">
        <div className="flex items-center justify-center h-64 sm:h-96">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-3xl sm:text-4xl text-blue-600 mb-3 sm:mb-4"></i>
            <p className="text-gray-600 font-medium text-sm sm:text-base">Loading data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Owner Dashboard">
      {error && (
        <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex gap-2 text-xs sm:text-sm">
          <i className="fas fa-circle-exclamation flex-shrink-0 mt-0.5"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
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
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 sm:p-6 text-white mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <i className="fas fa-plus-circle"></i>
                  Add a New Listing
                </h3>
                <p className="text-xs sm:text-sm opacity-90 mt-1">Reach more students and earn more bookings</p>
              </div>
              <button
                onClick={() => navigate('/dashboard/owner/create-listing')}
                className="px-4 sm:px-6 py-2 bg-white text-green-600 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
              >
                <i className="fas fa-plus"></i> Create Listing
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <button
              onClick={() => {
                setActiveTab('listings');
                navigate('/dashboard/owner/listings');
              }}
              className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition text-left"
            >
              <i className="fas fa-home text-blue-600 text-2xl sm:text-3xl mb-2 sm:mb-3"></i>
              <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">View Listings</h3>
              <p className="text-xs sm:text-sm text-gray-600">{listings.length} properties</p>
            </button>
            <button
              onClick={() => {
                setActiveTab('bookings');
                navigate('/dashboard/owner/bookings');
              }}
              className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition text-left"
            >
              <i className="fas fa-inbox text-orange-600 text-2xl sm:text-3xl mb-2 sm:mb-3"></i>
              <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Booking Requests</h3>
              <p className="text-xs sm:text-sm text-gray-600">{stats.pendingBookings} pending</p>
            </button>
            <button
              onClick={() => {
                setActiveTab('reviews');
                navigate('/dashboard/owner/reviews');
              }}
              className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition text-left"
            >
              <i className="fas fa-comments text-green-600 text-2xl sm:text-3xl mb-2 sm:mb-3"></i>
              <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Reviews</h3>
              <p className="text-xs sm:text-sm text-gray-600">{stats.totalReviews} total</p>
            </button>
          </div>
        </>
      )}

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div>
          {/* Header Section */}
          <div className="mb-8 sm:mb-10">
            {/* Main Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b-2 border-gray-100">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <i className="fas fa-home text-lg"></i>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">My Listings</h2>
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-2 ml-15">
                  <i className="fas fa-chart-bar text-blue-500"></i>
                  {listings.length} total propert{listings.length !== 1 ? 'ies' : 'y'} • {listings.filter(l => l.verified).length} verified
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard/owner/create-listing')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 text-sm sm:text-base shadow-md"
              >
                <i className="fas fa-plus-circle"></i> New Listing
              </button>
            </div>

            {/* Search and Filters Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
              <div className="space-y-4 sm:space-y-0 sm:flex sm:items-end gap-4">
                {/* Search */}
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Search Properties</label>
                  <div className="relative">
                    <i className="fas fa-search absolute left-4 top-3 text-gray-400 text-sm"></i>
                    <input
                      type="text"
                      placeholder="Search by title, address, or city..."
                      value={listingsSearchQuery}
                      onChange={(e) => setListingsSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="min-w-fit">
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Verification Status</label>
                  <div className="relative">
                    <i className="fas fa-filter absolute right-4 top-3.5 text-gray-400 text-sm"></i>
                    <select
                      value={listingsFilterStatus}
                      onChange={(e) => setListingsFilterStatus(e.target.value)}
                      className="w-full sm:w-56 pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl text-sm hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all appearance-none cursor-pointer bg-white"
                    >
                      <option value="all">🔍 All Listings</option>
                      <option value="verified">✅ Verified Only</option>
                      <option value="unverified">⏳ Pending Verification</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-0">
                  <button
                    onClick={() => {
                      setListingsSearchQuery('');
                      setListingsFilterStatus('all');
                    }}
                    className="px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-all duration-200 text-sm flex items-center justify-center gap-2 flex-shrink-0 h-11"
                    title="Clear all filters"
                  >
                    <i className="fas fa-redo text-xs"></i>
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                  <button
                    onClick={() => setRefreshKey((k) => k + 1)}
                    className="px-4 py-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl font-bold transition-all duration-200 text-sm flex items-center justify-center gap-2 flex-shrink-0 h-11"
                    title="Refresh data"
                  >
                    <i className="fas fa-sync"></i>
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          {listings.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {/* Total Stats Card */}
              <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-100 p-5 sm:p-6 rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-20 group-hover:scale-125 transition-transform duration-300"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Total Properties</p>
                    <i className="fas fa-home text-xl text-blue-500 opacity-20"></i>
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-blue-900">{listings.length}</p>
                  <p className="text-xs text-blue-600 mt-2 font-semibold">Active on platform</p>
                </div>
              </div>

              {/* Verified Stats Card */}
              <div className="bg-gradient-to-br from-green-50 via-green-50 to-emerald-100 p-5 sm:p-6 rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full -mr-10 -mt-10 opacity-20 group-hover:scale-125 transition-transform duration-300"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Verified</p>
                    <i className="fas fa-check-circle text-xl text-green-500 opacity-20"></i>
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-green-900">{listings.filter(l => l.verified).length}</p>
                  <p className="text-xs text-green-600 mt-2 font-semibold">{Math.round((listings.filter(l => l.verified).length / Math.max(listings.length, 1)) * 100)}% verified</p>
                </div>
              </div>

              {/* Pending Stats Card */}
              <div className="bg-gradient-to-br from-amber-50 via-amber-50 to-yellow-100 p-5 sm:p-6 rounded-xl border border-amber-200 shadow-md hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200 rounded-full -mr-10 -mt-10 opacity-20 group-hover:scale-125 transition-transform duration-300"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending</p>
                    <i className="fas fa-hourglass-half text-xl text-amber-500 opacity-20"></i>
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-amber-900">{listings.filter(l => !l.verified).length}</p>
                  <p className="text-xs text-amber-600 mt-2 font-semibold">Awaiting verification</p>
                </div>
              </div>

              {/* Inquiries Stats Card */}
              <div className="bg-gradient-to-br from-orange-50 via-orange-50 to-red-100 p-5 sm:p-6 rounded-xl border border-orange-200 shadow-md hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 rounded-full -mr-10 -mt-10 opacity-20 group-hover:scale-125 transition-transform duration-300"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">Inquiries</p>
                    <i className="fas fa-envelope text-xl text-orange-500 opacity-20"></i>
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-orange-900">{bookingRequests.length}</p>
                  <p className="text-xs text-orange-600 mt-2 font-semibold">Booking requests</p>
                </div>
              </div>
            </div>
          )}

          {/* Listings Table */}
          {listings.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300 shadow-sm">
              <div className="inline-flex w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full items-center justify-center mb-6 shadow-md">
                <i className="fas fa-home text-3xl text-blue-500"></i>
              </div>
              <p className="text-lg font-bold text-gray-900 mb-2">No listings yet</p>
              <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">Start your property hosting journey! Create your first listing to showcase your space and start accepting booking requests from students.</p>
              <button
                onClick={() => navigate('/dashboard/owner/create-listing')}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md"
              >
                <i className="fas fa-plus-circle"></i> Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <DataTable 
                columns={listingsColumns} 
                data={listings.filter(l => {
                  const matchesSearch = l.title.toLowerCase().includes(listingsSearchQuery.toLowerCase()) || 
                                      l.address.toLowerCase().includes(listingsSearchQuery.toLowerCase()) ||
                                      (l.city && l.city.toLowerCase().includes(listingsSearchQuery.toLowerCase()));
                  const matchesStatus = listingsFilterStatus === 'all' || 
                                      (listingsFilterStatus === 'verified' && l.verified) ||
                                      (listingsFilterStatus === 'unverified' && !l.verified);
                  return matchesSearch && matchesStatus;
                })}
              />
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <i className="fas fa-inbox text-orange-600"></i>
                  Booking Requests
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{stats.pendingBookings} pending requests</p>
              </div>
            </div>

            {/* Booking Stats */}
            {bookingRequests.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-4 rounded-lg border border-orange-200">
                  <p className="text-xs font-semibold text-orange-700 uppercase">Pending</p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">{bookingRequests.filter(b => b.status === 'pending').length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-green-700 uppercase">Accepted</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">{bookingRequests.filter(b => b.status === 'accepted').length}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 sm:p-4 rounded-lg border border-red-200">
                  <p className="text-xs font-semibold text-red-700 uppercase">Rejected</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">{bookingRequests.filter(b => b.status === 'rejected').length}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 uppercase">Total</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{bookingRequests.length}</p>
                </div>
              </div>
            )}
          </div>

          {bookingRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <i className="fas fa-envelope text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-600 mb-2 font-medium">No booking requests</p>
              <p className="text-sm text-gray-500">Requests will appear here when students book your listings</p>
            </div>
          ) : (
            <DataTable columns={requestsColumns} data={bookingRequests} />
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500"></i>
                  Reviews & Ratings
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{reviews.length} total reviews</p>
              </div>
            </div>

            {/* Review Stats */}
            {reviews.length > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 sm:p-4 rounded-lg border border-yellow-200">
                  <p className="text-xs font-semibold text-yellow-700 uppercase">Avg Rating</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-bold text-yellow-900">{stats.avgRating}</p>
                    <span className="text-xs text-yellow-700">/10</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 uppercase">Total Reviews</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{reviews.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-green-700 uppercase">Replied</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">{reviews.filter(r => r.ownerReply).length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-lg border border-purple-200">
                  <p className="text-xs font-semibold text-purple-700 uppercase">No Response</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">{reviews.filter(r => !r.ownerReply).length}</p>
                </div>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <i className="fas fa-comment-dots text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-600 mb-2 font-medium">No reviews yet</p>
              <p className="text-sm text-gray-500">Reviews will appear here when students rate your properties</p>
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
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors text-sm sm:text-base"
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
      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-900 font-medium flex gap-2">
          <i className="fas fa-info-circle text-blue-600 flex-shrink-0 mt-0.5"></i>
          <span><strong>Owner Privileges:</strong> You can create, edit, and manage only your own listings. Admins will verify your account and listings.</span>
        </p>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboardModernPage;
