import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { listingService, bookingService } from '../services/api';
import { BookingModal } from '../components/BookingModal';
import { AuthContext } from '../context/AuthContext';
import ImageSlider from '../components/ImageSlider';
import FacilityItem from '../components/FacilityItem';
import ReviewCard from '../components/ReviewCard';
import AvailabilityCalendar from '../components/AvailabilityCalendar';

const calculateRatings = (reviewsList) => {
  if (!reviewsList || reviewsList.length === 0) return null;

  const categories = ['food', 'cleanliness', 'safety', 'owner', 'facilities', 'study'];
  const ratings = {};

  categories.forEach(category => {
    const sum = reviewsList.reduce((acc, review) => acc + (review.ratings?.[category] || 0), 0);
    ratings[category] = parseFloat((sum / reviewsList.length).toFixed(1));
  });

  const overallSum = Object.values(ratings).reduce((a, b) => a + b, 0);
  const averageRating = parseFloat((overallSum / categories.length).toFixed(1));

  return { ratings, averageRating };
};

const InfoItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
    <span className="text-sm font-semibold text-gray-900 mt-1">{value}</span>
  </div>
);

const ListingDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useContext(AuthContext);

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await listingService.getListing(id);
        const listingData = res.data.listing;
        setListing(listingData);
        setReviews(res.data.reviews || []);

        const bookingsRes = await bookingService.getBookings({ listingId: id, status: 'approved' });
        setBookings(bookingsRes.data?.bookings || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!listing) return null;

  const ratingData = calculateRatings(reviews);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="relative h-[420px] rounded-2xl overflow-hidden shadow-lg">
          <ImageSlider images={listing.photos} />

          <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md p-6 rounded-2xl text-white max-w-md">
            <h1 className="text-3xl font-bold">{listing.title}</h1>
            <p className="text-lg mt-2">৳{listing.rent}/month</p>
            {listing.verified && (
              <span className="inline-block mt-3 px-4 py-1 bg-green-500 text-sm rounded-full">
                Verified Property
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 grid grid-cols-2 md:grid-cols-6 gap-6">
          <InfoItem label="Rating" value={ratingData?.averageRating || '—'} />
          <InfoItem label="Reviews" value={reviews.length} />
          <InfoItem label="Bookings" value={bookings.length} />
          <InfoItem label="Deposit" value={`৳${listing.deposit}`} />
          <InfoItem label="Type" value={listing.type} />
          <InfoItem label="Gender" value={listing.genderAllowed} />
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left */}
        <div className="lg:col-span-2 space-y-10">

          {/* Description */}
          <section>
            <h2 className="text-xl font-bold mb-4">About this place</h2>
            <p className="text-gray-700 leading-relaxed">{listing.description}</p>
          </section>

          {/* Facilities */}
          <section>
            <h2 className="text-xl font-bold mb-4">Facilities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listing.facilities && Object.entries(listing.facilities).map(([key, value]) => (
                <FacilityItem
                  key={key}
                  label={key}
                  available={value}
                />
              ))}
            </div>
          </section>

          {/* Availability */}
          <section>
            <h2 className="text-xl font-bold mb-4">Availability</h2>
            <AvailabilityCalendar listingId={listing._id} bookings={bookings} />
          </section>

          {/* Reviews */}
          <section>
            <h2 className="text-xl font-bold mb-6">Reviews</h2>

            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet.</p>
            ) : (
              <div className="space-y-6">
                {reviews.slice(0, 3).map(review => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
                {listing.ownerId?.name?.charAt(0) || 'O'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{listing.ownerId?.name}</p>
                <p className="text-sm text-gray-500">
                  {listing.ownerId?.totalListings || 0} listings
                </p>
              </div>
            </div>

            {isAuthenticated && user?.role === 'student' ? (
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Request Booking
              </button>
            ) : (
              <div className="text-sm text-gray-500 text-center">
                Login as student to request booking
              </div>
            )}

          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          listing={listing}
          onClose={() => setShowBookingModal(false)}
        />
      )}

    </div>
  );
};

export default ListingDetailPage;