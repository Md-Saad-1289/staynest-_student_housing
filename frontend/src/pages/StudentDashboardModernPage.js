import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { StatCard } from '../components/Dashboard/StatCard';
import { DataTable } from '../components/Dashboard/DataTable';
import { StatusBadge } from '../components/Dashboard/StatusBadge';
import { AuthContext } from '../context/AuthContext';
import { bookingService, userService, listingService } from '../services/api';

/**
 * StudentDashboardModernPage: Production-ready Student Dashboard
 * 
 * Features:
 * - View profile and personal booking history
 * - Track booking statuses (pending, accepted, rejected, completed)
 * - Submit reviews ONLY after completed bookings
 * - See verified badges and ratings on listings
 * - Mobile-first responsive design
 * 
 * Access Control:
 * - Students CANNOT see other users' data
 * - Students CANNOT create or manage listings
 * - Students CANNOT approve anything
 */
export const StudentDashboardModernPage = ({ tab: tabProp }) => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(tab || tabProp || 'dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStudentData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch user profile
      const profileRes = await userService?.getProfile?.() ?? { data: { user } };
      setProfile(profileRes.data.user || user);

      // Fetch bookings for this student
      if (activeTab === 'dashboard' || activeTab === 'bookings') {
        const bookingsRes = await bookingService.getStudentBookings();
        setBookings(bookingsRes.data.bookings || []);
      }

      // Fetch saved listings
      if (activeTab === 'dashboard' || activeTab === 'saved') {
        try {
          const favoritesRes = await listingService.getUserFavorites();
          setSavedListings(favoritesRes.data.favorites || []);
        } catch (err) {
          setSavedListings([]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    fetchStudentData();
  }, [activeTab, refreshKey, fetchStudentData]);

  // Calculate stats
  const stats = {
    activeBookings: bookings.filter((b) => b.status === 'accepted').length,
    pendingRequests: bookings.filter((b) => b.status === 'pending').length,
    completedStays: bookings.filter((b) => b.status === 'completed').length,
  };

  // Bookings table columns - student view only (read-only)
  const bookingColumns = [
    {
      key: 'listing',
      label: 'Property',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-home text-blue-600"></i>
            {row.listingId?.title || 'Unknown Listing'}
          </p>
          {row.listingId?.verified && (
            <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
              <i className="fas fa-badge-check"></i> Verified
            </p>
          )}
          <p className="text-xs text-gray-500">
            {row.listingId?.address || 'N/A'}
          </p>
        </div>
      ),
    },
    {
      key: 'rent',
      label: 'Monthly Rent',
      render: (row) => (
        <div className="flex items-center gap-1">
          <i className="fas fa-money-bill-wave text-green-600"></i>
          <span className="font-semibold">৳{row.listingId?.rent?.toLocaleString() || 'N/A'}</span>
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
          <a
            href={`/listing/${row.listingId?._id}`}
            className="px-3 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded font-medium transition-colors flex items-center gap-1"
          >
            <i className="fas fa-eye"></i> View
          </a>
          {row.status === 'completed' && (
            <a
              href={`/listing/${row.listingId?._id}`}
              className="px-3 py-1 text-xs bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded font-medium transition-colors flex items-center gap-1"
            >
              <i className="fas fa-star"></i> Review
            </a>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="My Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Dashboard">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <i className="fas fa-circle-exclamation"></i>
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        <button
          onClick={() => {
            setActiveTab('dashboard');
            navigate('/dashboard/student');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <i className="fas fa-home mr-2"></i>Dashboard
        </button>
        <button
          onClick={() => {
            setActiveTab('bookings');
            navigate('/dashboard/student/bookings');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'bookings'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <i className="fas fa-calendar-check mr-2"></i>My Bookings
        </button>
        <button
          onClick={() => {
            setActiveTab('reviews');
            navigate('/dashboard/student/reviews');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'reviews'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <i className="fas fa-star mr-2"></i>My Reviews
        </button>
        <button
          onClick={() => {
            setActiveTab('saved');
            navigate('/dashboard/student/saved');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'saved'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <i className="fas fa-heart mr-2"></i>Saved Listings ({savedListings.length})
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          {profile && (
            <div className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-400 flex items-center justify-center text-2xl font-bold">
                    {profile.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{profile.name}</h3>
                    <p className="text-blue-100 flex items-center gap-1">
                      <i className="fas fa-envelope"></i>
                      {profile.email}
                    </p>
                    <p className="text-blue-100 flex items-center gap-1 mt-1">
                      <i className="fas fa-phone"></i>
                      {profile.mobile}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-user"></i> Go Profile
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon="fas fa-home"
              label="Active Booking"
              value={stats.activeBookings}
              subtext="Currently staying"
              color="blue"
            />
            <StatCard
              icon="fas fa-clock"
              label="Pending Requests"
              value={stats.pendingRequests}
              subtext="Awaiting approval"
              color="orange"
            />
            <StatCard
              icon="fas fa-check-circle"
              label="Completed Stays"
              value={stats.completedStays}
              subtext="Past bookings"
              color="green"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200 hover:border-blue-400 transition cursor-pointer" onClick={() => setActiveTab('bookings')}>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-lg">
                <i className="fas fa-calendar-check text-blue-600 text-xl"></i>
                My Bookings
              </h3>
              <p className="text-sm text-gray-700 mb-4">View all your booking requests and active stays.</p>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                <i className="fas fa-arrow-right"></i> View Bookings
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200 hover:border-purple-400 transition cursor-pointer" onClick={() => setActiveTab('saved')}>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-lg">
                <i className="fas fa-heart text-red-600 text-xl"></i>
                Saved Listings
              </h3>
              <p className="text-sm text-gray-700 mb-4">Browse your favorite properties saved for later.</p>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                <i className="fas fa-arrow-right"></i> View Saved ({savedListings.length})
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium flex items-center gap-2">
              <i className="fas fa-info-circle text-blue-600"></i>
              <strong>Student Privileges:</strong> You can view your bookings and write reviews after stays complete.
            </p>
          </div>
        </>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              <i className="fas fa-calendar-check text-blue-600 mr-2"></i>
              My Bookings
            </h2>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <i className="fas fa-sync"></i> Refresh
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-600 mb-4">No bookings yet</p>
              <a
                href="/listings"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-search"></i> Start Exploring Listings
              </a>
            </div>
          ) : (
            <DataTable
              columns={bookingColumns}
              data={bookings}
              emptyMessage="No bookings found"
            />
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              <i className="fas fa-star text-yellow-600 mr-2"></i>
              My Reviews
            </h2>
          </div>
          <div className="text-center py-12">
            <i className="fas fa-bookmark text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-600 mb-4">Reviews will appear here after you complete bookings</p>
            <a
              href="/listings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-search"></i> Find Listings
            </a>
          </div>
        </div>
      )}

      {/* Saved Listings Tab */}
      {activeTab === 'saved' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            <i className="fas fa-heart text-red-600 mr-2"></i>
            Saved Listings ({savedListings.length})
          </h2>
          {savedListings.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <i className="fas fa-heart text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-600 mb-4">No saved listings yet</p>
              <a
                href="/listings"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-search"></i> Explore Listings
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedListings.map((listing) => (
                <div key={listing._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-300 flex items-center justify-center overflow-hidden">
                    {listing.photos?.[0] ? (
                      <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <i className="fas fa-image text-4xl text-gray-400"></i>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">{listing.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{listing.address}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-blue-600">৳{listing.rent?.toLocaleString()}</span>
                      {listing.verified && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium"><i className="fas fa-check-circle mr-1"></i>Verified</span>}
                    </div>
                    <a
                      href={`/listing/${listing._id}`}
                      className="w-full block text-center bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboardModernPage;
