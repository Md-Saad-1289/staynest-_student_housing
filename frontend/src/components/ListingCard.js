import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { listingService } from '../services/api';
import { AuthContext } from '../context/AuthContext';

export const ListingCard = ({ listing, onFavoriteToggle }) => {
  const [isFavorited, setIsFavorited] = useState(listing?.isFavorited || false);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const avgRating = listing.averageRating ? listing.averageRating.toFixed(1) : 'N/A';

  const handleFavorite = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to add favorites');
      return;
    }

    try {
      setLoading(true);
      await listingService.toggleFavorite(listing._id);
      setIsFavorited(!isFavorited);
      if (onFavoriteToggle) onFavoriteToggle(listing._id, !isFavorited);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 relative overflow-hidden">
      {/* Favorite Button */}
      <button
        onClick={handleFavorite}
        disabled={loading}
        className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center transition ${isFavorited ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
        aria-label={isFavorited ? 'Remove favorite' : 'Add favorite'}
      >
        <i className={`${isFavorited ? 'fas fa-heart' : 'far fa-heart'}`}></i>
      </button>

      {/* Image */}
      <div className="h-44 bg-gray-200 overflow-hidden relative">
        <img
          src={listing.photos?.[0] || 'https://via.placeholder.com/400x300'}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        {listing.isFeatured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded text-sm font-bold flex items-center gap-1">
            <i className="fas fa-star"></i> Featured
          </div>
        )}
        {listing.views > 0 && (
          <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <i className="fas fa-eye"></i> {listing.views} views
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2 gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-800 truncate">{listing.title}</h3>
            <p className="text-xs text-gray-500 mt-1 truncate">{listing.address}</p>
          </div>
          {listing.verified && (
            <div className="flex-shrink-0">
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                <i className="fas fa-check-circle"></i>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-700 mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1"><i className="fas fa-money-bill text-blue-600"></i> <span className="font-semibold">৳{listing.rent}</span><span className="text-gray-500">/mo</span></div>
            <div className="flex items-center gap-1"><i className="fas fa-building text-purple-600"></i> <span className="capitalize">{listing.type}</span></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-yellow-500"><i className="fas fa-star"></i> <span className="font-semibold">{avgRating}</span></div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/listing/${listing._id}`}
            className="flex-1 bg-blue-600 text-white py-2 rounded text-center hover:bg-blue-700 flex items-center justify-center gap-2 transition text-sm"
          >
            <i className="fas fa-eye"></i> View Details
          </Link>
        </div>
      </div>
    </div>
  );
};
