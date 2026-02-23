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
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 hover:scale-[1.01] group relative overflow-hidden">
      {/* Favorite Button */}
      <button
        onClick={handleFavorite}
        disabled={loading}
        className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center transition backdrop-blur-sm ${isFavorited ? 'bg-red-500 text-white shadow-lg' : 'bg-white/80 text-gray-600 hover:text-red-500 hover:scale-105'}`}
        aria-label={isFavorited ? 'Remove favorite' : 'Add favorite'}
      >
        <i className={`${isFavorited ? 'fas fa-heart' : 'far fa-heart'}`}></i>
      </button>

      {/* Image */}
      <div className="h-44 bg-gray-200 overflow-hidden relative">
        <img
          src={listing.photos?.[0] || 'https://via.placeholder.com/400x300'}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute left-3 bottom-3 text-white">
          <h4 className="text-sm font-semibold drop-shadow">{listing.title}</h4>
          <p className="text-xs text-white/80">{listing.address}</p>
        </div>

        {listing.isFeatured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded text-sm font-bold flex items-center gap-1">
            <i className="fas fa-star"></i> Featured
          </div>
        )}

        {listing.views > 0 && (
          <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <i className="fas fa-eye"></i> {listing.views}
          </div>
        )}

        <div className="absolute right-3 bottom-3 bg-white/90 text-gray-900 px-2 py-1 rounded text-sm font-semibold">৳{listing.rent}</div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2 gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-md font-semibold text-gray-800 truncate">{listing.title}</h3>
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-gray-700"><i className="fas fa-building text-purple-600"></i> <span className="capitalize">{listing.type}</span></div>
            <div className="flex items-center gap-1 text-sm text-gray-700"><i className="fas fa-venus-mars text-pink-500"></i> <span className="capitalize">{listing.genderAllowed}</span></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full font-semibold"> <i className="fas fa-star"></i> {avgRating}</div>
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
