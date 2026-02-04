import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listingService, bookingService, reviewService } from '../services/api';

export const OwnerDashboardPage = () => {
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('listings');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (tab === 'listings') {
        const res = await listingService.getOwnerListings();
        setListings(res.data.listings);
      } else if (tab === 'bookings') {
        const res = await bookingService.getOwnerBookings();
        setBookings(res.data.bookings);
      } else if (tab === 'reviews') {
        // Fetch reviews for all owner's listings
        const listingsRes = await listingService.getOwnerListings();
        for (const listing of listingsRes.data.listings) {
          const reviewsRes = await reviewService.getListingReviews(listing._id);
          setReviews((prev) => [...prev, ...reviewsRes.data.reviews]);
        }
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBookingStatus = async (bookingId, status) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      alert('Booking updated!');
      fetchData();
    } catch (err) {
      alert('Failed to update booking');
    }
  };

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) return;
    try {
      await reviewService.replyToReview(reviewId, replyText);
      alert('Reply added!');
      setReplyingTo(null);
      setReplyText('');
      fetchData();
    } catch (err) {
      alert('Failed to add reply');
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
        <h1 className="text-3xl font-bold mb-8"><i className="fas fa-chart-line text-blue-600"></i> Owner Dashboard</h1>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          {[
            { name: 'listings', icon: 'fas fa-home', label: 'Listings' },
            { name: 'bookings', icon: 'fas fa-calendar-check', label: 'Bookings' },
            { name: 'reviews', icon: 'fas fa-star', label: 'Reviews' }
          ].map((t) => (
            <button
              key={t.name}
              onClick={() => setTab(t.name)}
              className={`px-6 py-3 font-semibold flex items-center gap-2 ${
                tab === t.name
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className={t.icon}></i> {t.label}
            </button>
          ))}
        </div>

        {/* Listings Tab */}
        {tab === 'listings' && (
          <div className="space-y-4">
            <Link
              to="/dashboard/owner/create-listing"
              className="inline-flex bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 items-center gap-2"
            >
              <i className="fas fa-plus"></i> Create Listing
            </Link>
            {listings.length === 0 ? (
              <p className="text-gray-600">No listings yet</p>
            ) : (
              listings.map((listing) => (
                <div key={listing._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{listing.title}</h3>
                      <p className="text-gray-600">{listing.address}</p>
                      <p className="mt-2">
                        <strong>Rent:</strong> ৳{listing.rent} | <strong>Deposit:</strong> ৳{listing.deposit}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${listing.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {listing.verified ? '✓ Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {tab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <p className="text-gray-600">No booking requests yet</p>
            ) : (
              bookings.map((booking) => (
                <div key={booking._id} className="bg-white rounded-lg shadow p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 font-semibold">Student</p>
                      <p className="text-lg">{booking.studentId?.name}</p>
                      <p className="text-sm text-gray-500">{booking.studentId?.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Move-in Date</p>
                      <p className="text-lg">
                        {new Date(booking.moveInDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Status</p>
                      <span className={`inline-block px-3 py-1 rounded font-semibold ${getStatusBadgeColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  {booking.status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleBookingStatus(booking._id, 'accepted')}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleBookingStatus(booking._id, 'rejected')}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {tab === 'reviews' && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-600">No reviews yet</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg">{review.studentId?.name}</h3>
                    <span className="text-yellow-500">⭐ {((Object.values(review.ratings).reduce((a, b) => a + b) / 6).toFixed(1))}</span>
                  </div>

                  <p className="text-gray-600 mb-3">{review.textReview}</p>

                  {review.ownerReply ? (
                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                      <p className="text-sm font-semibold text-blue-900">Your Reply:</p>
                      <p className="text-sm text-blue-800">{review.ownerReply}</p>
                    </div>
                  ) : (
                    <>
                      {replyingTo === review._id ? (
                        <div className="mt-3 space-y-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full border rounded px-3 py-2 h-20"
                            placeholder="Write your reply..."
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReplySubmit(review._id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                              Send Reply
                            </button>
                            <button
                              onClick={() => setReplyingTo(null)}
                              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(review._id)}
                          className="text-blue-600 hover:underline mt-3"
                        >
                          Reply to Review
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
