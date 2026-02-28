import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { listingService, bookingService, flagService } from '../services/api';
import { BookingModal } from '../components/BookingModal';
import { AuthContext } from '../context/AuthContext';
import ImageSlider from '../components/ImageSlider';
import FacilityItem from '../components/FacilityItem';
import ReviewCard from '../components/ReviewCard';
import QuickActionBar from '../components/QuickActionBar';

/* ─────────────────────────────────────────────
   Injected design system styles
───────────────────────────────────────────── */
const DESIGN_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  :root {
    --ink: #0d0d0d;
    --ink-soft: #3a3a3a;
    --ink-mute: #7a7a7a;
    --cream: #faf8f4;
    --paper: #ffffff;
    --gold: #c9a84c;
    --gold-light: #e8d5a3;
    --gold-pale: #fdf6e8;
    --emerald: #1a6b4a;
    --emerald-light: #2d8f63;
    --sky: #1d4ed8;
    --sky-light: #3b82f6;
    --rose: #be3a3a;
    --border: #e8e4dc;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
    --shadow-glow: 0 0 0 3px rgba(201,168,76,0.2);
  }

  .ldp-root * { box-sizing: border-box; }
  .ldp-root { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--ink); }
  .ldp-serif { font-family: 'DM Serif Display', serif; }

  /* Image slider wrapper */
  .ldp-slider-wrap { width: 100%; overflow: hidden; }

  /* Title section */
  .ldp-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 8px; }

  /* Verified badge */
  .ldp-badge-verified {
    display: inline-flex; align-items: center; gap: 6px;
    background: #f0faf5; border: 1px solid #b8dece;
    color: var(--emerald); padding: 4px 14px; border-radius: 100px;
    font-size: 12px; font-weight: 600; letter-spacing: 0.04em; flex-shrink: 0;
  }

  /* Stat ribbon */
  .ldp-stat-ribbon {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px;
    background: var(--border); border-radius: 16px; overflow: hidden;
    box-shadow: var(--shadow-md); margin: 20px 0 0;
  }
  @media (max-width: 640px) { .ldp-stat-ribbon { grid-template-columns: repeat(2, 1fr); } }
  .ldp-stat-cell {
    background: var(--paper); padding: 20px 16px; text-align: center;
    transition: background 0.2s;
  }
  .ldp-stat-cell:hover { background: var(--gold-pale); }
  .ldp-stat-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-mute); margin-bottom: 6px; }
  .ldp-stat-value { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--ink); }
  .ldp-stat-value.accent { color: var(--gold); }

  /* Layout */
  .ldp-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .ldp-grid { display: grid; grid-template-columns: 1fr 360px; gap: 40px; margin-top: 40px; }
  @media (max-width: 1024px) { .ldp-grid { grid-template-columns: 1fr; } }

  /* Section headers */
  .ldp-section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 22px; color: var(--ink); margin-bottom: 20px;
    display: flex; align-items: center; gap: 10px;
  }
  .ldp-section-title .icon-dot {
    width: 8px; height: 8px; border-radius: 50%; background: var(--gold); flex-shrink: 0;
  }
  .ldp-section { padding-bottom: 40px; border-bottom: 1px solid var(--border); margin-bottom: 40px; }
  .ldp-section:last-of-type { border-bottom: none; }

  /* Detail cards */
  .ldp-detail-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  @media (max-width: 640px) { .ldp-detail-grid { grid-template-columns: repeat(2, 1fr); } }
  .ldp-detail-card {
    background: var(--paper); border: 1px solid var(--border); border-radius: 12px;
    padding: 18px; transition: all 0.2s; cursor: default;
  }
  .ldp-detail-card:hover { border-color: var(--gold-light); box-shadow: var(--shadow-sm), var(--shadow-glow); transform: translateY(-1px); }
  .ldp-detail-card-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-mute); margin-bottom: 8px; }
  .ldp-detail-card-value { font-family: 'DM Serif Display', serif; font-size: 20px; color: var(--ink); }
  .ldp-detail-card-icon { font-size: 18px; margin-bottom: 10px; }

  /* Description */
  .ldp-description { font-size: 15px; line-height: 1.8; color: var(--ink-soft); }
  .ldp-rules-box {
    background: linear-gradient(135deg, #f0f7f4, #e8f5ef);
    border: 1px solid #b8dece; border-radius: 12px; padding: 18px; margin-top: 20px;
  }
  .ldp-rules-title { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--emerald); margin-bottom: 8px; }
  .ldp-rules-text { font-size: 14px; color: #2d6b50; line-height: 1.7; }

  /* Facilities grid */
  .ldp-facility-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  @media (max-width: 500px) { .ldp-facility-grid { grid-template-columns: 1fr; } }
  .ldp-facility-item {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px; border-radius: 10px; font-size: 14px; font-weight: 500;
    border: 1px solid;
  }
  .ldp-facility-item.available { background: #f0f9f5; border-color: #b8dece; color: #1a5c3d; }
  .ldp-facility-item.unavailable { background: #fafafa; border-color: #eee; color: #aaa; text-decoration: line-through; }
  .ldp-facility-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .available .ldp-facility-dot { background: var(--emerald-light); }
  .unavailable .ldp-facility-dot { background: #ddd; }

  /* Meals card */
  .ldp-meals-card {
    background: linear-gradient(135deg, #fffbf0, #fdf5e0);
    border: 1.5px solid var(--gold-light); border-radius: 16px; padding: 24px;
    display: flex; align-items: center; gap: 20px;
  }
  .ldp-meals-emoji { font-size: 40px; }
  .ldp-meals-badge {
    display: inline-block; background: var(--gold); color: white;
    padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 6px;
  }

  /* Map placeholder */
  .ldp-map-placeholder {
    background: linear-gradient(135deg, #f5f5f2, #ebe9e3);
    border: 1px solid var(--border); border-radius: 16px; height: 200px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 8px; color: var(--ink-mute);
  }
  .ldp-map-pin { font-size: 32px; }

  /* Ratings */
  .ldp-rating-hero {
    display: flex; align-items: center; gap: 20px; padding: 24px;
    background: linear-gradient(135deg, var(--ink) 0%, #2a2520 100%);
    border-radius: 16px; margin-bottom: 24px; color: white;
  }
  .ldp-rating-big { font-family: 'DM Serif Display', serif; font-size: 56px; color: var(--gold); line-height: 1; }
  .ldp-rating-stars { display: flex; gap: 3px; margin-bottom: 4px; }
  .ldp-rating-star { color: var(--gold); font-size: 16px; }
  .ldp-rating-count { font-size: 13px; color: rgba(255,255,255,0.5); }

  .ldp-rating-bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .ldp-rating-bar-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: var(--ink-mute); width: 80px; flex-shrink: 0; text-align: right; }
  .ldp-rating-bar-track { flex: 1; height: 6px; background: var(--border); border-radius: 100px; overflow: hidden; }
  .ldp-rating-bar-fill { height: 100%; background: linear-gradient(90deg, var(--gold-light), var(--gold)); border-radius: 100px; transition: width 1s ease; }
  .ldp-rating-bar-score { font-size: 13px; font-weight: 600; color: var(--ink); width: 32px; }

  /* Sidebar */
  .ldp-sidebar-card {
    background: var(--paper); border: 1px solid var(--border); border-radius: 20px;
    overflow: hidden; box-shadow: var(--shadow-lg); position: sticky; top: 24px;
  }
  .ldp-sidebar-header {
    background: linear-gradient(135deg, var(--ink) 0%, #1e1a14 100%);
    padding: 24px; color: white;
  }
  .ldp-sidebar-body { padding: 24px; }
  .ldp-owner-avatar {
    width: 52px; height: 52px; border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--ink); flex-shrink: 0;
  }
  .ldp-owner-name { font-family: 'DM Serif Display', serif; font-size: 20px; color: white; }
  .ldp-owner-tag { font-size: 11px; color: var(--gold-light); letter-spacing: 0.06em; text-transform: uppercase; }
  .ldp-owner-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 16px 0; }
  .ldp-owner-meta-item { background: var(--cream); border-radius: 10px; padding: 12px; text-align: center; }
  .ldp-owner-meta-num { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--ink); }
  .ldp-owner-meta-label { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-mute); }

  /* Buttons */
  .ldp-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; text-decoration: none; }
  .ldp-btn-primary { background: linear-gradient(135deg, var(--gold), #b8923a); color: white; box-shadow: 0 4px 14px rgba(201,168,76,0.3); }
  .ldp-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,168,76,0.4); }
  .ldp-btn-outline { background: transparent; color: var(--ink); border: 1.5px solid var(--border); }
  .ldp-btn-outline:hover { border-color: var(--ink-soft); background: var(--cream); }
  .ldp-btn-green { background: linear-gradient(135deg, #25d366, #1da851); color: white; }
  .ldp-btn-green:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(29,168,81,0.3); }
  .ldp-btn-book { background: linear-gradient(135deg, var(--emerald-light), var(--emerald)); color: white; font-size: 15px; padding: 16px; border-radius: 12px; box-shadow: 0 4px 14px rgba(26,107,74,0.3); }
  .ldp-btn-book:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(26,107,74,0.4); }

  /* Share buttons */
  .ldp-share-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 16px; }
  .ldp-share-btn { border-radius: 8px; padding: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: none; cursor: pointer; transition: transform 0.2s, opacity 0.2s; }
  .ldp-share-btn:hover { transform: translateY(-2px); opacity: 0.9; }

  /* Report */
  .ldp-report-btn { background: none; border: none; cursor: pointer; font-size: 13px; color: var(--ink-mute); letter-spacing: 0.02em; padding: 0; transition: color 0.2s; display: flex; align-items: center; gap: 6px; }
  .ldp-report-btn:hover { color: var(--rose); }

  /* Flag modal */
  .ldp-modal-overlay { position: fixed; inset: 0; background: rgba(13,13,13,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50; }
  .ldp-modal { background: var(--paper); border-radius: 20px; max-width: 400px; width: 100%; padding: 32px; box-shadow: var(--shadow-lg); }
  .ldp-modal-title { font-family: 'DM Serif Display', serif; font-size: 24px; margin-bottom: 6px; }
  .ldp-modal-sub { font-size: 14px; color: var(--ink-mute); margin-bottom: 24px; }
  .ldp-modal-option { display: block; width: 100%; text-align: left; padding: 14px 18px; border: 1px solid var(--border); border-radius: 10px; background: none; cursor: pointer; font-size: 14px; color: var(--ink); transition: all 0.15s; margin-bottom: 8px; font-family: 'DM Sans', sans-serif; }
  .ldp-modal-option:hover { background: var(--gold-pale); border-color: var(--gold-light); }
  .ldp-modal-cancel { width: 100%; padding: 13px; border: 1.5px solid var(--border); border-radius: 10px; background: none; cursor: pointer; font-size: 14px; font-weight: 600; color: var(--ink-soft); margin-top: 8px; font-family: 'DM Sans', sans-serif; transition: background 0.15s; }
  .ldp-modal-cancel:hover { background: var(--cream); }

  /* Success toast */
  .ldp-toast {
    position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
    background: linear-gradient(135deg, var(--emerald), var(--emerald-light));
    color: white; padding: 14px 24px; border-radius: 100px;
    font-size: 14px; font-weight: 600; z-index: 30;
    box-shadow: 0 8px 30px rgba(26,107,74,0.3);
    display: flex; align-items: center; gap: 10px;
    animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(-16px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

  /* Divider */
  .ldp-divider { height: 1px; background: var(--border); margin: 16px 0; }

  /* Loading */
  .ldp-loading { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; background: var(--cream); }
  .ldp-loading-spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ─── Helper ───────────────────────────────
const calculateRatings = (reviewsList) => {
  if (!reviewsList || reviewsList.length === 0) return null;
  const categories = ['food', 'cleanliness', 'safety', 'owner', 'facilities', 'study'];
  const ratings = {};
  categories.forEach(category => {
    const sum = reviewsList.reduce((acc, r) => acc + (r.ratings?.[category] || 0), 0);
    ratings[category] = parseFloat((sum / reviewsList.length).toFixed(1));
  });
  const overallSum = Object.values(ratings).reduce((a, b) => a + b, 0);
  return { ratings, averageRating: parseFloat((overallSum / categories.length).toFixed(1)) };
};

const starRating = (score, max = 5) =>
  Array.from({ length: max }, (_, i) => (
    <span key={i} className="ldp-rating-star" style={{ opacity: i < Math.round(score) ? 1 : 0.25 }}>★</span>
  ));

const MEAL_LABELS = {
  breakfast: '🍳 Breakfast Only',
  lunch: '🥗 Lunch Only',
  dinner: '🍽️ Dinner Only',
  all: '🍽️ All Meals',
};

// ─── Component ────────────────────────────
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
        const listingData = response.data.listing;
        setListing(listingData);
        setReviews(response.data.reviews || []);
        const stored = localStorage.getItem('recentlyViewed') || '[]';
        const recent = JSON.parse(stored);
        const updated = [listingData, ...recent.filter(l => l._id !== id)].slice(0, 20);
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
        if (isAuthenticated) {
          try { await listingService.addViewHistory(id); } catch {}
          try {
            const r = await bookingService.getBookings({ listingId: id, status: 'approved' });
            setBookings(r.data?.bookings || []);
          } catch { setBookings([]); }
        }
      } catch {
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
      setSuccessMessage('Booking request sent! The owner will be in touch soon.');
      setShowBookingModal(false);
      setTimeout(() => setSuccessMessage(''), 4500);
    } catch (err) {
      throw err.response?.data?.error || 'Booking failed';
    }
  };

  const handleFlag = async (reason) => {
    try {
      await flagService.flagListing(id, reason);
      setShowFlagModal(false);
      alert('Thank you for reporting. Our team will review this listing.');
    } catch { alert('Failed to report listing'); }
  };

  if (loading) return (
    <>
      <style>{DESIGN_STYLES}</style>
      <div className="ldp-loading ldp-root">
        <div className="ldp-loading-spinner" />
        <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: '#7a7a7a' }}>Loading listing…</p>
      </div>
    </>
  );

  const L = listing || {};
  const R = reviews || [];
  const ratingData = calculateRatings(R);

  return (
    <>
      <style>{DESIGN_STYLES}</style>
      <div className="ldp-root" style={{ minHeight: '100vh', paddingBottom: 80 }}>

        {/* ── Toast ── */}
        {successMessage && (
          <div className="ldp-toast">
            <span>✓</span> {successMessage}
          </div>
        )}

        {/* ── Image Slider ── */}
        <div className="ldp-slider-wrap">
          <ImageSlider images={L.photos} />
        </div>

        {/* ── Stat ribbon ── */}
        <div className="ldp-container">
          <div className="ldp-stat-ribbon">
            {[
              { label: 'Rating', value: ratingData?.averageRating || L.averageRating || '—', accent: true },
              { label: 'Reviews', value: R.length },
              { label: 'Bookings', value: bookings.length },
              { label: 'Owner Lists', value: L.ownerId?.totalListings || 0 },
              { label: 'Monthly Rent', value: `৳${L.rent}`, accent: true },
            ].map(s => (
              <div key={s.label} className="ldp-stat-cell">
                <div className="ldp-stat-label">{s.label}</div>
                <div className={`ldp-stat-value${s.accent ? ' accent' : ''}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="ldp-container">
          <div className="ldp-grid">

            {/* LEFT COLUMN */}
            <div>

              {/* Title & Badges */}
              <div className="ldp-section" style={{ paddingTop: 8, paddingBottom: 20 }}>
                <div className="ldp-title-row">
                  <h1 className="ldp-serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', lineHeight: 1.25, margin: 0 }}>
                    {L.title}
                  </h1>
                  {L.verified && <span className="ldp-badge-verified">✓ Verified</span>}
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink-mute)', margin: '6px 0 0', letterSpacing: '0.02em' }}>
                  📍 {L.area}, {L.city}
                </p>
              </div>

              {/* Key details */}
              <div className="ldp-section" style={{ paddingTop: 8 }}>
                <div className="ldp-detail-grid">
                  {[
                    { label: 'Monthly Rent', value: `৳${L.rent}`, icon: '💰' },
                    { label: 'Deposit', value: `৳${L.deposit}`, icon: '🏦' },
                    { label: 'Property Type', value: L.type, icon: '🏢' },
                    { label: 'Gender Policy', value: L.genderAllowed, icon: '👥' },
                  ].map(d => (
                    <div key={d.label} className="ldp-detail-card">
                      <div className="ldp-detail-card-icon">{d.icon}</div>
                      <div className="ldp-detail-card-label">{d.label}</div>
                      <div className="ldp-detail-card-value" style={{ fontSize: 16, textTransform: 'capitalize' }}>{d.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* About */}
              <div className="ldp-section">
                <div className="ldp-section-title">
                  <span className="icon-dot" />
                  <span>About This Place</span>
                </div>
                <p className="ldp-description" style={{ marginTop: 0 }}>{L.description}</p>
                {L.rules && (
                  <div className="ldp-rules-box">
                    <div className="ldp-rules-title">⚖️ House Rules</div>
                    <p className="ldp-rules-text">{L.rules}</p>
                  </div>
                )}
              </div>

              {/* Facilities */}
              <div className="ldp-section">
                <div className="ldp-section-title">
                  <span className="icon-dot" />
                  <span>Facilities & Amenities</span>
                </div>
                <div className="ldp-facility-grid">
                  {L.facilities && Object.entries(L.facilities).map(([key, available]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').trim();
                    const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
                    return (
                      <div key={key} className={`ldp-facility-item ${available ? 'available' : 'unavailable'}`}>
                        <span className="ldp-facility-dot" />
                        {capitalized}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Meals */}
              {L.meals && (
                <div className="ldp-section">
                  <div className="ldp-section-title">
                    <span className="icon-dot" />
                    <span>Meals</span>
                  </div>
                  <div className="ldp-meals-card">
                    <span className="ldp-meals-emoji">{L.meals.available ? '🍽️' : '🚫'}</span>
                    <div>
                      <div className="ldp-meals-badge">{L.meals.available ? 'Included' : 'Not Included'}</div>
                      {L.meals.available && L.meals.type && (
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#7a5c1e' }}>
                          {MEAL_LABELS[L.meals.type] || L.meals.type}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="ldp-section">
                <div className="ldp-section-title">
                  <span className="icon-dot" />
                  <span>Location</span>
                </div>
                <div className="ldp-map-placeholder">
                  <span className="ldp-map-pin">📍</span>
                  <p style={{ margin: 0, fontFamily: 'DM Serif Display, serif', fontSize: 18 }}>{L.area}</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#9a9a9a' }}>{L.address}</p>
                </div>
              </div>

              {/* Reviews */}
              <div className="ldp-section">
                <div className="ldp-section-title">
                  <span className="icon-dot" />
                  <span>Reviews & Ratings</span>
                </div>

                <div className="ldp-rating-hero">
                  <div>
                    <div className="ldp-rating-big">
                      {ratingData?.averageRating || L.averageRating || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="ldp-rating-stars">{starRating(ratingData?.averageRating || L.averageRating || 0)}</div>
                    <p className="ldp-rating-count">{R.length} verified {R.length === 1 ? 'review' : 'reviews'}</p>
                  </div>
                </div>

                {ratingData && (
                  <div style={{ marginBottom: 32 }}>
                    {Object.entries(ratingData.ratings).map(([cat, score]) => (
                      <div key={cat} className="ldp-rating-bar-row">
                        <span className="ldp-rating-bar-label">{cat}</span>
                        <div className="ldp-rating-bar-track">
                          <div className="ldp-rating-bar-fill" style={{ width: `${(score / 5) * 100}%` }} />
                        </div>
                        <span className="ldp-rating-bar-score">{score.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {R.length === 0 ? (
                    <p style={{ fontSize: 14, color: '#9a9a9a', fontStyle: 'italic' }}>No reviews yet — be the first to leave one.</p>
                  ) : (
                    R.slice(0, 3).map(review => <ReviewCard key={review._id} review={review} />)
                  )}
                </div>
              </div>

              {/* Report */}
              <div style={{ paddingTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="ldp-report-btn" onClick={() => setShowFlagModal(true)}>
                  ⚑ Report this listing
                </button>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="lg-only-sidebar" style={{ display: 'block' }}>
              <div className="ldp-sidebar-card">
                {/* Header */}
                <div className="ldp-sidebar-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <div className="ldp-owner-avatar">
                      {L.ownerId?.name?.charAt(0) || 'O'}
                    </div>
                    <div>
                      <div className="ldp-owner-name">{L.ownerId?.name || 'Owner'}</div>
                      {L.ownerId?.isVerified && (
                        <div className="ldp-owner-tag">✦ Verified Owner</div>
                      )}
                    </div>
                  </div>
                  <div className="ldp-owner-meta">
                    <div className="ldp-owner-meta-item">
                      <div className="ldp-owner-meta-num">{L.ownerId?.totalListings || 0}</div>
                      <div className="ldp-owner-meta-label">Listings</div>
                    </div>
                    <div className="ldp-owner-meta-item">
                      <div className="ldp-owner-meta-num">{bookings.length}</div>
                      <div className="ldp-owner-meta-label">Bookings</div>
                    </div>
                  </div>
                  {L.ownerId?.createdAt && (
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>
                      Member since {new Date(L.ownerId.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Body */}
                <div className="ldp-sidebar-body">
                  {/* CTA */}
                  {isAuthenticated && user?.role === 'student' ? (
                    <button className="ldp-btn ldp-btn-book" style={{ marginBottom: 12 }} onClick={() => setShowBookingModal(true)}>
                      📅 Request a Booking
                    </button>
                  ) : (
                    <div style={{ background: '#faf8f4', borderRadius: 10, padding: '14px 16px', textAlign: 'center', fontSize: 13, color: '#9a9a9a', marginBottom: 12, border: '1px solid #e8e4dc' }}>
                      {isAuthenticated ? '🔒 Only students can book' : '🔑 Login as a student to book'}
                    </div>
                  )}

                  {/* Contact */}
                  <a href={`mailto:${L.ownerId?.email}`} className="ldp-btn ldp-btn-outline" style={{ marginBottom: 8 }}>
                    ✉️ Email Owner
                  </a>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                    <a href={`tel:${L.ownerId?.phoneNo}`} className="ldp-btn ldp-btn-outline" style={{ fontSize: 13 }}>
                      📞 Call
                    </a>
                    <a href={`https://wa.me/${L.ownerId?.phoneNo?.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="ldp-btn ldp-btn-green" style={{ fontSize: 13 }}>
                      WhatsApp
                    </a>
                  </div>

                  <div className="ldp-divider" />

                  {/* Share */}
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#9a9a9a', margin: '0 0 8px' }}>Share this listing</p>
                  <div className="ldp-share-row">
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer"
                      className="ldp-share-btn" style={{ background: '#1877f2', color: 'white' }}>f</a>
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(L.title)}`} target="_blank" rel="noopener noreferrer"
                      className="ldp-share-btn" style={{ background: '#000', color: 'white' }}>𝕏</a>
                    <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(L.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer"
                      className="ldp-share-btn" style={{ background: '#25d366', color: 'white' }}>💬</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile quick action bar */}
        <QuickActionBar
          onBookingClick={() => setShowBookingModal(true)}
          onCallClick={() => { window.location.href = `tel:${L.ownerId?.phoneNo}`; }}
          isAuthenticated={isAuthenticated}
          userRole={user?.role}
        />

        {/* Booking modal */}
        {showBookingModal && (
          <BookingModal listing={L} onSubmit={handleBooking} onClose={() => setShowBookingModal(false)} />
        )}

        {/* Flag modal */}
        {showFlagModal && (
          <div className="ldp-modal-overlay" onClick={() => setShowFlagModal(false)}>
            <div className="ldp-modal" onClick={e => e.stopPropagation()}>
              <h2 className="ldp-modal-title">Report Listing</h2>
              <p className="ldp-modal-sub">Help us keep the platform safe. Select a reason:</p>
              {['Inappropriate content', 'Misleading information', 'Safety concern', 'Spam', 'Other'].map(reason => (
                <button key={reason} className="ldp-modal-option" onClick={() => handleFlag(reason)}>{reason}</button>
              ))}
              <button className="ldp-modal-cancel" onClick={() => setShowFlagModal(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ListingDetailPage;