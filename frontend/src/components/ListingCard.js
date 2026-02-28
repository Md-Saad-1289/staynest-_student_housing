import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { listingService } from "../services/api";
import { AuthContext } from "../context/AuthContext";

export const ListingCard = ({ listing, onFavoriteToggle }) => {
  const [isFavorited, setIsFavorited] = useState(
    listing?.isFavorited || false
  );
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const avgRating = listing.averageRating
    ? listing.averageRating.toFixed(1)
    : "New";

  const handleFavorite = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Login first to save stays");
      return;
    }

    try {
      setLoading(true);
      await listingService.toggleFavorite(listing._id);
      setIsFavorited(!isFavorited);
      if (onFavoriteToggle)
        onFavoriteToggle(listing._id, !isFavorited);
    } catch (err) {
      console.error("Favorite failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2">

      {/* Image Section */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={listing.photos?.[0] || "https://via.placeholder.com/400x300"}
          alt={listing.title}
          className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          disabled={loading}
          className={`absolute top-4 right-4 z-20 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
            isFavorited
              ? "bg-red-500 text-white shadow-lg scale-110"
              : "bg-white/80 text-gray-700 hover:text-red-500 hover:scale-110"
          }`}
        >
          <i className={`${isFavorited ? "fas fa-heart" : "far fa-heart"}`}></i>
        </button>

        {/* Price */}
        <div className="absolute bottom-4 left-4 bg-white text-gray-900 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
          <i className="fas fa-money-bill-wave text-sky-600"></i>
          <span className="text-lg font-bold">
            ৳{listing.rent}
          </span>
          <span className="text-xs text-gray-500">/month</span>
        </div>

        {/* Featured Badge */}
        {listing.isFeatured && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
            <i className="fas fa-star"></i>
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">

        {/* Title + Verified */}
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {listing.title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-1 flex items-center gap-1 mt-1">
              <i className="fas fa-location-dot text-gray-400 text-xs"></i>
              {listing.address}
            </p>
          </div>

          {listing.verified && (
            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              <i className="fas fa-circle-check"></i>
              Verified
            </div>
          )}
        </div>

        {/* Info Row */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <i className="fas fa-building text-purple-600"></i>
              {listing.type}
            </span>

            <span className="flex items-center gap-1">
              <i className="fas fa-venus-mars text-pink-500"></i>
              {listing.genderAllowed}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full font-semibold">
            <i className="fas fa-star"></i>
            {avgRating}
          </div>
        </div>

        {/* CTA */}
        <Link
          to={`/listing/${listing._id}`}
          className="mt-5 block w-full text-center bg-gradient-to-r from-sky-600 to-indigo-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:opacity-90 hover:shadow-lg flex items-center justify-center gap-2"
        >
          <i className="fas fa-eye"></i>
          View Details
        </Link>
      </div>
    </div>
  );
};