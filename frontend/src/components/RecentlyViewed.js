import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ListingCard } from './ListingCard';

export const RecentlyViewed = () => {
  const [recentListings, setRecentListings] = useState([]);

  useEffect(() => {
    // Get from localStorage
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try {
        setRecentListings(JSON.parse(stored).slice(0, 6));
      } catch (err) {
        console.error('Failed to parse recently viewed:', err);
      }
    }
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Clear all recently viewed listings?')) {
      localStorage.removeItem('recentlyViewed');
      setRecentListings([]);
    }
  };

  if (recentListings.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <i className="fas fa-history text-purple-600"></i> Recently Viewed
          </h2>
          <button
            onClick={handleClearHistory}
            className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
          >
            <i className="fas fa-trash"></i> Clear History
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentListings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/listings"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold transition"
          >
            <i className="fas fa-arrow-right"></i> Explore All Listings
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
