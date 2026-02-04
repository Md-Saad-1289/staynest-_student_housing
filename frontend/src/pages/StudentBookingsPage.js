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
      setBookings(response.data.bookings);
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
      alert('Review submitted successfully!');
      setShowReviewModal(false);
      fetchBookings();
    } catch (err) {
      throw err.response?.data?.error || 'Failed to submit review';
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100';
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8"><i className="fas fa-calendar-check text-blue-600"></i> My Bookings</h1>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
            <p className="text-lg text-gray-600 mb-4">You haven't made any bookings yet.</p>
            <Link to="/listings" className="text-blue-600 hover:underline inline-flex items-center justify-center gap-2 text-lg font-semibold bg-blue-50 px-6 py-2 rounded-lg hover:bg-blue-100">
              <i className="fas fa-search"></i> Start Exploring
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2"><i className="fas fa-home text-blue-600"></i> {booking.listingId?.title}</h3>
                    <p className="text-gray-600"><i className="fas fa-map-marker-alt text-red-600"></i> {booking.listingId?.address}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold"><i className="fas fa-money-bill-wave text-green-600"></i> Rent</p>
                    <p className="text-lg">৳{booking.listingId?.rent}/month</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold"><i className="fas fa-calendar text-purple-600"></i> Move-in Date</p>
                    <p className="text-lg">
                      {new Date(booking.moveInDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`px-4 py-2 rounded font-semibold flex items-center gap-2 ${getStatusBadgeColor(booking.status)}`}>
                    <i className="fas fa-info-circle"></i> {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>

                  {booking.status === 'completed' && (
                    <button
                      onClick={() => handleReview(booking)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                      <i className="fas fa-star"></i> Write Review
                    </button>
                  )}
                </div>
              </div>
            ))}}
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
