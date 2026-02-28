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

// Helper function to calculate average ratings from reviews
const calculateRatings = (reviewsList) => {
  if (reviewsList.length === 0) return null;

  const categories = ['food', 'cleanliness', 'safety', 'owner', 'facilities', 'study'];
  const ratings = {};

  categories.forEach(category => {
    const sum = reviewsList.reduce((acc, review) => {
      return acc + (review.ratings?.[category] || 0);
    }, 0);
    ratings[category] = parseFloat((sum / reviewsList.length).toFixed(1));
  });

  const overallSum = Object.values(ratings).reduce((a, b) => a + b, 0);
  const averageRating = parseFloat((overallSum / categories.length).toFixed(1));

  return { ratings, averageRating };
};

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
        setReviews(response.data.reviews || []);

        const stored = localStorage.getItem('recentlyViewed') || '[]';
        const recent = JSON.parse(stored);
        const filtered = recent.filter((l) => l._id !== id);
        const updated = [listingData, ...filtered].slice(0, 20);
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));

        if (isAuthenticated) {
          try {
            await listingService.addViewHistory(id);
          } catch (err) {
            console.error('Failed to track view:', err);
          }

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
        setReviews([]);
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
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#f8f7f4' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, border: '3px solid #e8e4dc',
            borderTopColor: '#c9a84c', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#9a9a9a', fontSize: 15 }}>Loading listing…</p>
        </div>
      </div>
    );
  }

  const currentListing = listing || MOCK_LISTING;
  const currentReviews = reviews || [];

  return (
    <div className="min-h-screen pb-32 lg:pb-8" style={{ background: '#f8f7f4' }}>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #1a6b4a, #2d8f63)',
          color: 'white', padding: '13px 28px', borderRadius: 100,
          fontSize: 14, fontWeight: 600, zIndex: 30,
          boxShadow: '0 8px 30px rgba(26,107,74,0.3)',
          display: 'flex', alignItems: 'center', gap: 10,
          whiteSpace: 'nowrap',
          animation: 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(-14px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
          ✓ {successMessage}
        </div>
      )}

      {/* Slider */}
      <div className="mt-4">
        <ImageSlider images={currentListing.photos} />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Title & Badges */}
          <div style={{
            background: '#ffffff', borderRadius: 16, padding: '24px 28px',
            border: '1px solid #ede9e1', boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
          }}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 style={{
                fontSize: 'clamp(20px,3vw,28px)', fontWeight: 700,
                color: '#0d0d0d', lineHeight: 1.25, margin: 0,
                fontFamily: "'Georgia', serif",
              }}>
                {currentListing.title}
              </h1>
              {currentListing.verified && (
                <span style={{
                  background: '#f0faf5', border: '1px solid #b8dece',
                  color: '#1a6b4a', padding: '5px 14px', borderRadius: 100,
                  fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                  letterSpacing: '0.04em',
                }}>
                  ✓ Verified
                </span>
              )}
            </div>
            <p style={{ color: '#9a9a9a', fontSize: 14, margin: 0 }}>
              📍 {currentListing.area}, {currentListing.city}
            </p>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '💰', label: 'Rent',    value: `৳${currentListing.rent}`,          accent: '#1a6b4a', big: true  },
              { icon: '🏦', label: 'Deposit', value: `৳${currentListing.deposit}`,        accent: '#b8923a', big: true  },
              { icon: '🏢', label: 'Type',    value: currentListing.type,                 accent: '#1d4ed8', big: false },
              { icon: '👥', label: 'Gender',  value: currentListing.genderAllowed,        accent: '#9c3a7a', big: false },
            ].map(({ icon, label, value, accent, big }) => (
              <div
                key={label}
                style={{
                  background: '#ffffff', borderRadius: 14, padding: '18px 16px',
                  border: '1px solid #ede9e1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s', cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#9a9a9a', margin: '0 0 6px' }}>{label}</p>
                <p style={{ fontSize: big ? 20 : 14, fontWeight: 700, color: accent, margin: 0, textTransform: 'capitalize', fontFamily: big ? "'Georgia',serif" : 'inherit' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* About This Place */}
          <div style={{
            background: '#ffffff', borderRadius: 16, padding: '24px 28px',
            border: '1px solid #ede9e1', boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
          }}>
            {/* Availability Calendar */}
            <AvailabilityCalendar
              listingId={currentListing._id}
              bookings={bookings || []}
            />

            <p style={{ fontSize: 15, lineHeight: 1.8, color: '#3a3a3a', margin: '16px 0 0' }}>
              {currentListing.description}
            </p>
            {currentListing.rules && (
              <div style={{
                background: 'linear-gradient(135deg, #f0f9f5, #e6f5ee)',
                borderRadius: 12, padding: '16px 20px',
                border: '1px solid #b8dece', marginTop: 20,
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#1a6b4a', margin: '0 0 8px' }}>
                  ⚖️ House Rules
                </p>
                <p style={{ fontSize: 14, color: '#2d6b50', lineHeight: 1.75, margin: 0 }}>{currentListing.rules}</p>
              </div>
            )}
          </div>

          {/* Facilities */}
          <div style={{
            background: '#ffffff', borderRadius: 16, padding: '24px 28px',
            border: '1px solid #ede9e1', boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0d0d0d', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Georgia',serif" }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#c9a84c', display: 'inline-block', flexShrink: 0 }} />
              Facilities &amp; Amenities
            </h2>
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

          {/* Meals */}
          {currentListing.meals && (
            <div style={{
              background: '#ffffff', borderRadius: 16, padding: '24px 28px',
              border: '1px solid #ede9e1', boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0d0d0d', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Georgia',serif" }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#c9a84c', display: 'inline-block', flexShrink: 0 }} />
                Meals
              </h2>
              <div style={{
                background: 'linear-gradient(135deg, #fffbf0, #fdf5e0)',
                borderRadius: 14, padding: '20px 24px',
                border: '1.5px solid #e8d5a3',
                display: 'flex', alignItems: 'center', gap: 18,
              }}>
                <span style={{ fontSize: 38 }}>{currentListing.meals.available ? '🍽️' : '🚫'}</span>
                <div>
                  {currentListing.meals.available ? (
                    <>
                      <span style={{
                        display: 'inline-block', background: '#c9a84c', color: 'white',
                        padding: '3px 12px', borderRadius: 100,
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                        textTransform: 'uppercase', marginBottom: 8,
                      }}>
                        Meals Included
                      </span>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#7a5c1e' }}>
                        {currentListing.meals.type === 'breakfast' && '🍳 Breakfast Only'}
                        {currentListing.meals.type === 'lunch' && '🥗 Lunch Only'}
                        {currentListing.meals.type === 'dinner' && '🍽️ Dinner Only'}
                        {currentListing.meals.type === 'all' && '🍽️ All Meals'}
                      </p>
                    </>
                  ) : (
                    <span style={{
                      display: 'inline-block', background: '#f0f0f0', color: '#7a7a7a',
                      padding: '4px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                    }}>
                      No Meals Provided
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          <div style={{
            background: '#ffffff', borderRadius: 16, padding: '24px 28px',
            border: '1px solid #ede9e1', boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0d0d0d', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Georgia',serif" }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#c9a84c', display: 'inline-block', flexShrink: 0 }} />
              Location
            </h2>
            <div style={{
              background: 'linear-gradient(135deg, #f5f5f2, #ebe9e3)',
              borderRadius: 14, height: 192,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #e0ddd5', gap: 8, marginBottom: 12,
            }}>
              <span style={{ fontSize: 36 }}>📍</span>
              <p style={{ margin: 0, fontWeight: 600, color: '#3a3a3a', fontSize: 15 }}>{currentListing.area}</p>
              <p style={{ margin: 0, fontSize: 13, color: '#9a9a9a' }}>{currentListing.address}</p>
            </div>
          </div>

          {/* Reviews & Ratings */}
          <div style={{
            background: '#ffffff', borderRadius: 16, padding: '24px 28px',
            border: '1px solid #ede9e1', boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
          }}>
            {(() => {
              const calculatedData = calculateRatings(currentReviews);
              return (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0d0d0d', margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Georgia',serif" }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#c9a84c', display: 'inline-block', flexShrink: 0 }} />
                      Reviews &amp; Ratings
                    </h2>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: 'linear-gradient(135deg, #0d0d0d, #1e1a14)',
                      padding: '14px 20px', borderRadius: 14,
                    }}>
                      <span style={{ fontFamily: "'Georgia',serif", fontSize: 38, color: '#c9a84c', lineHeight: 1 }}>
                        {calculatedData ? calculatedData.averageRating : currentListing.averageRating || '—'}
                      </span>
                      <div>
                        <div style={{ color: '#c9a84c', fontSize: 14, letterSpacing: 2 }}>★★★★★</div>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '3px 0 0' }}>{currentReviews.length} reviews</p>
                      </div>
                    </div>
                  </div>

                  {/* Rating Breakdown */}
                  {calculatedData && (
                    <div style={{ marginBottom: 28 }}>
                      {Object.entries(calculatedData.ratings).map(([category, score]) => (
                        <div key={category} className="flex items-center" style={{ marginBottom: 10 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9a9a9a', width: 90, flexShrink: 0, textAlign: 'right', paddingRight: 14 }}>
                            {category}
                          </span>
                          <div style={{ flex: 1, height: 6, background: '#ede9e1', borderRadius: 100, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              background: 'linear-gradient(90deg, #e8d5a3, #c9a84c)',
                              borderRadius: 100,
                              width: `${(score / 5) * 100}%`,
                              transition: 'width 1s ease',
                            }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#0d0d0d', width: 36, textAlign: 'right' }}>{score.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {currentReviews.length === 0 ? (
                      <p style={{ fontSize: 14, color: '#9a9a9a', fontStyle: 'italic' }}>No reviews yet. Be the first to review!</p>
                    ) : (
                      currentReviews.slice(0, 3).map((review) => (
                        <ReviewCard key={review._id} review={review} />
                      ))
                    )}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Report Listing */}
          <div style={{ borderTop: '1px solid #ede9e1', paddingTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowFlagModal(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: '#9a9a9a',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'color 0.2s', padding: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#be3a3a'}
              onMouseLeave={e => e.currentTarget.style.color = '#9a9a9a'}
            >
              ⚑ Report this listing
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block space-y-6">
          <div style={{
            background: '#ffffff', borderRadius: 20,
            border: '1px solid #ede9e1', overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.05)',
            position: 'sticky', top: 20,
          }}>

            {/* Dark owner header */}
            <div style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1e1a14 100%)', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #c9a84c, #e8d5a3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Georgia',serif", fontSize: 22, color: '#0d0d0d', flexShrink: 0,
                }}>
                  {currentListing.ownerId?.name?.charAt(0) || 'O'}
                </div>
                <div>
                  <p style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: 'white', margin: 0, lineHeight: 1.3 }}>
                    {currentListing.ownerId?.name}
                  </p>
                  {currentListing.ownerId?.isVerified && (
                    <p style={{ fontSize: 11, color: '#e8d5a3', margin: '3px 0 0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      ✦ Verified Owner
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                {[
                  { num: currentListing.ownerId?.totalListings || 0, label: 'Listings' },
                  { num: bookings.length, label: 'Bookings' },
                ].map(({ num, label }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Georgia',serif", fontSize: 22, color: '#c9a84c' }}>{num}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{label}</div>
                  </div>
                ))}
              </div>

              {bookings[0]?.startDate && (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 4px' }}>
                  Next booking: <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{new Date(bookings[0].startDate).toLocaleDateString()}</strong>
                </p>
              )}
              {currentListing.ownerId?.createdAt && (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                  Member since {new Date(currentListing.ownerId.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>

              {/* Contact */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <a
                  href={`mailto:${currentListing.ownerId?.email}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
                    color: 'white', padding: '13px', borderRadius: 12,
                    fontSize: 14, fontWeight: 600, textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(29,78,216,0.25)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(29,78,216,0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(29,78,216,0.25)'; }}
                >
                  ✉️ Email Owner
                </a>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <a
                    href={`tel:${currentListing.ownerId?.phoneNo}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      background: '#f8f7f4', color: '#0d0d0d', padding: '12px',
                      borderRadius: 12, fontSize: 13, fontWeight: 600, textDecoration: 'none',
                      border: '1.5px solid #ede9e1', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ede9e1'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f8f7f4'}
                  >
                    📞 Call
                  </a>
                  <a
                    href={`https://wa.me/${currentListing.ownerId?.phoneNo?.replace(/[^\d]/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      background: 'linear-gradient(135deg, #25d366, #1da851)',
                      color: 'white', padding: '12px', borderRadius: 12,
                      fontSize: 13, fontWeight: 600, textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(29,168,81,0.25)', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* Social Share */}
              <div style={{ borderTop: '1px solid #ede9e1', paddingTop: 16, marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#9a9a9a', margin: '0 0 10px' }}>
                  Share This Listing
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[
                    { href: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, bg: '#1877f2', label: 'f' },
                    { href: `https://twitter.com/intent/tweet?url=${window.location.href}&text=Check this listing: ${currentListing.title}`, bg: '#000', label: '𝕏' },
                    { href: `https://api.whatsapp.com/send?text=Check this listing: ${currentListing.title} ${window.location.href}`, bg: '#25d366', label: '💬' },
                  ].map(s => (
                    <a
                      key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      style={{
                        background: s.bg, color: 'white', borderRadius: 10,
                        padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, textDecoration: 'none', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.88'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1'; }}
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Primary CTA */}
              {isAuthenticated && user?.role === 'student' ? (
                <button
                  onClick={() => setShowBookingModal(true)}
                  style={{
                    width: '100%', padding: '15px',
                    background: 'linear-gradient(135deg, #2d8f63, #1a6b4a)',
                    color: 'white', border: 'none', borderRadius: 12,
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 16px rgba(26,107,74,0.3)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,107,74,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,107,74,0.3)'; }}
                >
                  📅 Request Booking
                </button>
              ) : (
                <div style={{
                  background: '#f8f7f4', border: '1px solid #ede9e1', borderRadius: 12,
                  padding: '14px', textAlign: 'center', fontSize: 13, color: '#9a9a9a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  🔒 {isAuthenticated ? 'Only students can book' : 'Login as student to book'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Bar (Mobile) */}
      <QuickActionBar
        onBookingClick={() => setShowBookingModal(true)}
        onCallClick={() => { window.location.href = `tel:${currentListing.ownerId?.phoneNo}`; }}
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
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(13,13,13,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, zIndex: 50,
          }}
          onClick={() => setShowFlagModal(false)}
        >
          <div
            style={{
              background: '#ffffff', borderRadius: 20,
              maxWidth: 400, width: '100%', padding: 32,
              boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 22, margin: '0 0 6px', color: '#0d0d0d' }}>
              Report Listing
            </h2>
            <p style={{ fontSize: 14, color: '#9a9a9a', margin: '0 0 24px' }}>
              Help us keep the platform safe. Select a reason:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {['Inappropriate content', 'Misleading information', 'Safety concern', 'Spam', 'Other'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleFlag(reason)}
                  style={{
                    textAlign: 'left', padding: '13px 18px',
                    border: '1px solid #ede9e1', borderRadius: 10,
                    background: 'none', cursor: 'pointer',
                    fontSize: 14, color: '#0d0d0d', transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fdf6e8'; e.currentTarget.style.borderColor = '#e8d5a3'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#ede9e1'; }}
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFlagModal(false)}
              style={{
                width: '100%', padding: '13px',
                border: '1.5px solid #ede9e1', borderRadius: 10,
                background: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, color: '#3a3a3a',
                fontFamily: 'inherit', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8f7f4'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
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