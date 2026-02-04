import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { listingService, bookingService, flagService } from '../services/api';
import { BookingModal } from '../components/BookingModal';
import { AuthContext } from '../context/AuthContext';
import ImageSlider from '../components/ImageSlider';
import FacilityItem from '../components/FacilityItem';
import ReviewCard from '../components/ReviewCard';
import QuickActionBar from '../components/QuickActionBar';
import AvailabilityCalendar from '../components/AvailabilityCalendar';

// Mock data for fallback
const MOCK_LISTING = {
  _id: 'mock1',
  title: 'Premium Dhanmondi Female Mess',
  address: 'House 45, Road 12',
  city: 'Dhaka',
  area: 'Dhanmondi',
  rent: 6500,
  deposit: 15000,
  type: 'mess',
  genderAllowed: 'female',
  verified: true,
  photos: [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=60',
  ],
  description: 'A well-maintained mess in the heart of Dhanmondi with all modern facilities. Perfect for female students studying at nearby universities.',
  rules: 'No guests after 10 PM | Electricity bill separate | Guest meal available | Study hours: 7 PM - 10 PM',
  facilities: {
    wifi: true,
    attachedBathroom: true,
    cctv: true,
    studyTable: true,
    ac: false,
    fan: true,
    electricity: true,
    water: true,
    meals: true,
    parking: false,
  },
  ownerId: {
    _id: 'owner1',
    name: 'Fatima Khan',
    email: 'fatima@example.com',
    mobile: '01712345678',
    isVerified: true,
    totalListings: 3,
  },
  averageRating: 4.6,
  ratings: {
    food: 4.5,
    cleanliness: 4.7,
    safety: 4.8,
    owner: 4.6,
    facilities: 4.4,
    study: 4.5,
  },
};

const MOCK_REVIEWS = [
  {
    _id: 'rev1',
    studentId: { name: 'Aisha Rahman' },
    textReview: 'Great mess! Clean environment, helpful owner, and good food. Highly recommended for female students.',
    ratings: { food: 4, cleanliness: 5, safety: 5, owner: 4, facilities: 4, study: 4 },
    ownerReply: 'Thank you Aisha! We hope you have a great experience with us.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    _id: 'rev2',
    studentId: { name: 'Riya Das' },
    textReview: 'Good location, affordable rent. WiFi could be faster but overall satisfied.',
    ratings: { food: 4, cleanliness: 4, safety: 4, owner: 5, facilities: 4, study: 4 },
    ownerReply: null,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
];

export const ListingDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await listingService.getListing(id);
        const listingData = response.data.listing || MOCK_LISTING;
        setListing(listingData);
        setReviews(response.data.reviews || MOCK_REVIEWS);

        // Add to recently viewed (localStorage)
        const stored = localStorage.getItem('recentlyViewed') || '[]';
        const recent = JSON.parse(stored);
        const filtered = recent.filter((l) => l._id !== id);
        const updated = [listingData, ...filtered].slice(0, 20);
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));

        // Track view on backend if user is logged in
        if (isAuthenticated) {
          try {
            await listingService.addViewHistory(id);
          } catch (err) {
            console.error('Failed to track view:', err);
          }

                // Fetch bookings for this listing (approved bookings only)
                try {
                  const bookingsRes = await bookingService.getBookings({ listingId: id, status: 'approved' });
                  setBookings(bookingsRes.data?.bookings || []);
                } catch (err) {
                  console.error('Failed to fetch bookings:', err);
                  setBookings([]);
                }
        }
      } catch (err) {
        setListing(MOCK_LISTING);
        setReviews(MOCK_REVIEWS);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchListing();
  }, [id, isAuthenticated]);

  const handleBooking = async (bookingData) => {
    try {
      await bookingService.createBooking(bookingData);
      setSuccessMessage('Booking request submitted! Owner will review soon.');
      setShowBookingModal(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      throw err.response?.data?.error || 'Booking failed';
    }
  };

  const handleFlag = async (reason) => {
    try {
      await flagService.flagListing(id, reason);
      setShowFlagModal(false);
      alert('Thank you for reporting. Our admin team will review this.');
    } catch (err) {
      alert('Failed to report listing');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg text-gray-600">Loading listing...</div>;
  }

  const currentListing = listing || MOCK_LISTING;
  const currentReviews = reviews && reviews.length > 0 ? reviews : MOCK_REVIEWS;

  return (
    <div className="min-h-screen bg-gray-50 pb-32 lg:pb-8">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 left-4 right-4 bg-green-100 text-green-800 p-4 rounded-lg shadow-lg z-30 max-w-md">
          {successMessage}
        </div>
      )}

      {/* Image Gallery */}
      <div className="lg:hidden">
        <ImageSlider images={currentListing.photos} />
      </div>

      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <ImageSlider images={currentListing.photos} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title & Badges */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{currentListing.title}</h1>
              {currentListing.verified && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm">
              {currentListing.area}, {currentListing.city}
            </p>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition">
              <p className="text-xs text-gray-600 font-semibold mb-2 flex items-center gap-1"><i className="fas fa-money-bill-wave text-green-500"></i> Rent</p>
              <p className="text-xl font-bold text-gray-900">৳{currentListing.rent}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition">
              <p className="text-xs text-gray-600 font-semibold mb-2 flex items-center gap-1"><i className="fas fa-vault text-orange-500"></i> Deposit</p>
              <p className="text-xl font-bold text-gray-900">৳{currentListing.deposit}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition">
              <p className="text-xs text-gray-600 font-semibold mb-2 flex items-center gap-1"><i className="fas fa-building text-blue-500"></i> Type</p>
              <p className="text-sm font-semibold text-gray-900 capitalize">{currentListing.type}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition">
              <p className="text-xs text-gray-600 font-semibold mb-2 flex items-center gap-1"><i className="fas fa-venus-mars text-pink-500"></i> Gender</p>
              <p className="text-sm font-semibold text-gray-900 capitalize">{currentListing.genderAllowed}</p>
            </div>
          </div>

          {/* About This Place */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i className="fas fa-info-circle text-blue-600"></i> About This Place</h2>
            {/* Availability Calendar */}
            <AvailabilityCalendar 
              listingId={currentListing._id} 
              bookings={bookings || []}
            />

            <p className="text-gray-700 leading-relaxed mb-4">{currentListing.description}</p>
            {currentListing.rules && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2"><i className="fas fa-gavel text-blue-600"></i> House Rules</p>
                <p className="text-sm text-blue-800">{currentListing.rules}</p>
              </div>
            )}
          </div>

          {/* Facilities */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i className="fas fa-chair text-purple-600"></i> Facilities & Amenities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentListing.facilities && Object.entries(currentListing.facilities).map(([key, available]) => (
                <FacilityItem
                  key={key}
                  label={key.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + key.replace(/([A-Z])/g, ' $1').trim().slice(1)}
                  available={available}
                />
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i className="fas fa-location-dot text-red-500"></i> Location</h2>
            <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center mb-3 border border-gray-300">
              <div className="text-center">
                <i className="fas fa-map text-5xl text-gray-400 mb-2"></i>
                <p className="text-gray-600 font-medium">{currentListing.area}</p>
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1"><i className="fas fa-map-pin"></i> {currentListing.address}</p>
              </div>
            </div>
          </div>

          {/* Reviews & Ratings */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><i className="fas fa-star text-yellow-500"></i> Reviews & Ratings</h2>
              <div className="flex items-center gap-3 bg-yellow-50 px-4 py-3 rounded-lg border border-yellow-200">
                <span className="text-3xl font-bold text-yellow-600">{currentListing.averageRating}</span>
                <div>
                  <div className="text-sm text-yellow-600">★★★★★</div>
                  <p className="text-xs text-yellow-600 flex items-center gap-1"><i className="fas fa-comment"></i> {currentReviews.length} reviews</p>
                </div>
              </div>
            </div>

            {/* Rating Breakdown */}
            {currentListing.ratings && (
              <div className="mb-6 space-y-2">
                {Object.entries(currentListing.ratings).map(([category, score]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize w-28">{category}</span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8">{score}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {currentReviews.length === 0 ? (
                <p className="text-gray-600 text-sm">No reviews yet. Be the first to review!</p>
              ) : (
                currentReviews.slice(0, 3).map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))
              )}
            </div>
          </div>

          {/* Report Listing */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowFlagModal(true)}
              className="text-red-600 text-sm font-medium hover:text-red-700 hover:underline"
            >
              Report this listing
            </button>
          </div>
        </div>

        {/* Right Sidebar - Owner Info & CTA (Desktop) */}
        <div className="hidden lg:block space-y-6">
          {/* Owner Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><i className="fas fa-user-circle text-blue-600"></i> Owner Information</h3>

            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center text-lg font-bold text-sky-600">
                {currentListing.ownerId?.name?.charAt(0) || 'O'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{currentListing.ownerId?.name}</p>
                {currentListing.ownerId?.isVerified && (
                  <p className="text-xs text-green-600 font-semibold flex items-center gap-1"><i className="fas fa-badge-check"></i> Verified Owner</p>
                )}
              </div>
            </div>

            {currentListing.ownerId?.totalListings && (
              <p className="text-sm text-gray-600 mb-4 flex items-center gap-2"><i className="fas fa-home text-gray-500"></i> <strong>{currentListing.ownerId.totalListings}</strong> active listings</p>
            )}

            <div className="space-y-2 mb-6">
              <a
                href={`mailto:${currentListing.ownerId?.email}`}
                className="w-full bg-sky-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-sky-700 text-sm flex items-center justify-center gap-2 transition"
              >
                <i className="fas fa-envelope"></i> Send Email
              </a>
              <a
                href={`tel:${currentListing.ownerId?.mobile}`}
                className="w-full border border-sky-600 text-sky-600 text-center py-3 rounded-lg font-semibold hover:bg-sky-50 text-sm flex items-center justify-center gap-2 transition"
              >
                <i className="fas fa-phone"></i> Call Owner
              </a>
              <a
                href={`https://wa.me/${currentListing.ownerId?.mobile?.replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-600 text-sm flex items-center justify-center gap-2 transition"
              >
                <i className="fab fa-whatsapp"></i> WhatsApp
              </a>
            </div>

            {/* Social Share */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3"><i className="fas fa-share-alt text-gray-600"></i> Share This Listing</p>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-center text-sm font-semibold transition flex items-center justify-center gap-1"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=Check%20this%20listing:%20${currentListing.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-400 text-white py-2 rounded-lg hover:bg-blue-500 text-center text-sm font-semibold transition flex items-center justify-center gap-1"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=Check%20this%20listing:%20${currentListing.title}%20${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 text-center text-sm font-semibold transition flex items-center justify-center gap-1"
                >
                  <i className="fab fa-whatsapp"></i>
                </a>
              </div>
            </div>

            {/* Primary CTA */}
            {isAuthenticated && user?.role === 'student' ? (
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition mb-3 flex items-center justify-center gap-2"
              >
                <i className="fas fa-calendar-check"></i> Request Booking
              </button>
            ) : (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg text-center flex items-center justify-center gap-2">
                <i className="fas fa-info-circle text-blue-500"></i> {isAuthenticated ? 'Only students can book' : 'Login as student to book'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Bar (Mobile) */}
      <QuickActionBar
        onBookingClick={() => setShowBookingModal(true)}
        onCallClick={() => {
          window.location.href = `tel:${currentListing.ownerId?.mobile}`;
        }}
        isAuthenticated={isAuthenticated}
        userRole={user?.role}
      />

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          listing={currentListing}
          onSubmit={handleBooking}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h2 className="text-xl font-bold mb-4">Report This Listing</h2>
            <div className="space-y-2 mb-6">
              {['Inappropriate content', 'Misleading information', 'Safety concern', 'Spam', 'Other'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => {
                    handleFlag(reason);
                  }}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFlagModal(false)}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;
