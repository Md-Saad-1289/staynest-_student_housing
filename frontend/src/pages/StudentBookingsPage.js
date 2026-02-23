import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService, reviewService } from '../services/api';
import { ReviewModal } from '../components/ReviewModal';

export const StudentBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getStudentBookings();
      setBookings(response.data.bookings || []);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await reviewService.createReview(reviewData);
      setShowReviewModal(false);
      fetchBookings();
    } catch (err) {
      throw err.response?.data?.error || 'Failed to submit review';
    }
  };

  const getStatusBadgeColor = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'fa-hourglass-half', label: 'Pending' },
      accepted: { bg: 'bg-green-100', text: 'text-green-800', icon: 'fa-check-circle', label: 'Accepted' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: 'fa-times-circle', label: 'Rejected' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'fa-flag-checkered', label: 'Completed' },
    };
    return statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'fa-question', label: status };
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your bookings...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <i className="fas fa-calendar-check text-blue-600 mr-3"></i>My Bookings
          </h1>
          <p className="text-gray-600">Manage and track all your accommodation bookings</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
            <i className="fas fa-exclamation-circle flex-shrink-0"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        {bookings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-1">Total Bookings</p>
              <p className="text-2xl font-black text-gray-900">{bookings.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-yellow-200">
              <p className="text-yellow-600 text-xs font-bold uppercase tracking-wide mb-1">Pending</p>
              <p className="text-2xl font-black text-yellow-700">{bookings.filter(b => b.status === 'pending').length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200">
              <p className="text-green-600 text-xs font-bold uppercase tracking-wide mb-1">Active</p>
              <p className="text-2xl font-black text-green-700">{bookings.filter(b => b.status === 'accepted').length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
              <p className="text-blue-600 text-xs font-bold uppercase tracking-wide mb-1">Completed</p>
              <p className="text-2xl font-black text-blue-700">{bookings.filter(b => b.status === 'completed').length}</p>
            </div>
          </div>
        )}

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <i className="fas fa-inbox text-4xl text-gray-400"></i>
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</p>
            <p className="text-gray-600 mb-6">Start exploring listings and make your first booking!</p>
            <Link
              to="/listings"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition shadow-md hover:shadow-lg"
            >
              <i className="fas fa-search"></i> Explore Listings
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => {
              const statusConfig = getStatusBadgeColor(booking.status);
              return (
                <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  <div className="p-6 sm:p-8">
                    {/* Top Row - Title and Status */}
                    <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
                          <i className="fas fa-home text-blue-600"></i>
                          {booking.listingId?.title || 'Listing'}
                        </h3>
                        <p className="text-gray-600 flex items-center gap-1">
                          <i className="fas fa-map-marker-alt text-red-600"></i>
                          {booking.listingId?.city || 'Unknown location'}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${statusConfig.bg} ${statusConfig.text}`}
                      >
                        <i className={`fas ${statusConfig.icon}`}></i>
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                      <div>
                        <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-2">
                          <i className="fas fa-money-bill-wave text-green-600 mr-2"></i>Monthly Rent
                        </p>
                        <p className="text-2xl font-black text-green-600">৳{booking.listingId?.rent?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-2">
                          <i className="fas fa-calendar-alt text-purple-600 mr-2"></i>Move-in Date
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {new Date(booking.moveInDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-2">
                          <i className="fas fa-door-open text-indigo-600 mr-2"></i>Room Type
                        </p>
                        <p className="text-lg font-bold text-gray-900 capitalize">{booking.listingId?.roomType || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-2">
                          <i className="fas fa-venus-mars text-pink-600 mr-2"></i>For
                        </p>
                        <p className="text-lg font-bold text-gray-900 capitalize">{booking.listingId?.genderAllowed || 'Any'}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end">
                      {booking.status === 'completed' && !booking.reviewSubmitted && (
                        <button
                          onClick={() => handleReview(booking)}
                          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:from-yellow-600 hover:to-amber-700 transition font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                          <i className="fas fa-star"></i> Write Review
                        </button>
                      )}
                      {booking.status === 'completed' && booking.reviewSubmitted && (
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <i className="fas fa-check-circle"></i> Review Submitted
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showReviewModal && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          listing={selectedBooking.listingId}
          onSubmit={handleReviewSubmit}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};
