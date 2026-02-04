import React from 'react';
import { Link } from 'react-router-dom';

export default function ListingComparisonModal({ listings, onClose }) {
  if (!listings || listings.length === 0) return null;

  const features = [
    'Rent/Month',
    'City',
    'Type',
    'Rooms',
    'Capacity',
    'Gender',
    'Furnishing',
    'Verified',
    'Rating',
    'Reviews',
    'Views',
    'Featured'
  ];

  const getFeatureValue = (listing, feature) => {
    switch (feature) {
      case 'Rent/Month':
        return `৳${listing.rent}`;
      case 'City':
        return listing.city || 'N/A';
      case 'Type':
        return listing.type?.charAt(0).toUpperCase() + listing.type?.slice(1) || 'N/A';
      case 'Rooms':
        return listing.numberOfRooms || 'N/A';
      case 'Capacity':
        return listing.capacity || 'N/A';
      case 'Gender':
        return listing.genderAllowed?.charAt(0).toUpperCase() + listing.genderAllowed?.slice(1) || 'N/A';
      case 'Furnishing':
        return listing.furnishing || 'N/A';
      case 'Verified':
        return listing.verified ? <i className="fas fa-check text-green-600"></i> : <i className="fas fa-times text-red-600"></i>;
      case 'Rating':
        return listing.averageRating ? `${listing.averageRating.toFixed(1)}/5` : 'N/A';
      case 'Reviews':
        return listing.reviews?.length || '0';
      case 'Views':
        return listing.views || '0';
      case 'Featured':
        return listing.isFeatured ? <i className="fas fa-star text-yellow-500"></i> : <i className="fas fa-times text-gray-400"></i>;
      default:
        return 'N/A';
    }
  };
  // compute a simple string for each feature to detect differences across listings
  const featureValues = features.map((feature) =>
    listings.map((l) => {
      const v = getFeatureValue(l, feature);
      // normalize React nodes to text for comparison
      if (typeof v === 'string' || typeof v === 'number') return String(v);
      if (React.isValidElement(v)) return v.props?.className || v.type || '';
      return String(v ?? '');
    })
  );

  const rows = features.map((feature, idx) => {
    const values = featureValues[idx];
    const isDifferent = new Set(values).size > 1;
    return { feature, values, isDifferent };
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[80vh] overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-6 text-white flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <i className="fas fa-columns text-lg"></i>
              <span>Compare Listings</span>
              <span className="ml-2 text-sm bg-white bg-opacity-20 px-2 py-0.5 rounded">{listings.length}</span>
            </h2>
            <p className="text-blue-100 text-sm mt-1">Compare important details side-by-side to make a confident decision.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const compareIds = listings.map(l => l._id).join(',');
                const shareUrl = `${window.location.origin}/listings?compare=${compareIds}`;
                navigator.clipboard.writeText(shareUrl);
                alert('Comparison link copied to clipboard!');
              }}
              className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-lg hover:bg-opacity-30 transition flex items-center gap-2"
              title="Copy comparison link"
            >
              <i className="fas fa-link"></i>
              <span className="text-sm">Copy Link</span>
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
              title="Close"
            >
              <i className="fas fa-times text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Mobile: stacked cards */}
        <div className="sm:hidden p-4 space-y-3">
          {listings.map((listing) => (
            <div key={listing._id} className="border rounded-lg p-3 shadow-sm">
              <div className="flex items-start gap-3">
                <img src={listing.photos?.[0] || 'https://via.placeholder.com/120'} alt={listing.title} className="w-24 h-20 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{listing.title}</h3>
                  <p className="text-sm text-gray-500">{listing.address}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                    <span className="font-semibold">৳{listing.rent}</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{listing.type}</span>
                    {listing.isFeatured && <span className="text-yellow-500"><i className="fas fa-star"></i></span>}
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
                {features.map((f) => (
                  <div key={`${listing._id}-${f}`} className="flex items-center gap-2">
                    <span className="font-semibold text-gray-600">{f}:</span>
                    <span className="truncate">{getFeatureValue(listing, f)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop/tablet: side-by-side table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-bold text-gray-800 w-48 sticky left-0 bg-gray-50">Feature</th>
                {listings.map((listing) => (
                  <th key={listing._id} className="px-6 py-4 text-center min-w-[220px] align-top">
                    <div className="flex flex-col items-center gap-3">
                      {listing.photos && listing.photos[0] && (
                        <img
                          src={listing.photos[0]}
                          alt={listing.title}
                          className="w-28 h-20 object-cover rounded-lg shadow"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{listing.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">ID: {listing._id.slice(-6)}</p>
                        <div className="mt-2 flex items-center gap-2 justify-center">
                          <span className="text-lg font-semibold">৳{listing.rent}</span>
                          <Link to={`/listing/${listing._id}`} className="text-sm text-blue-600 hover:underline">Open</Link>
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ feature, values, isDifferent }, idx) => (
                <tr key={feature} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${isDifferent ? 'ring-1 ring-yellow-200' : ''}`}>
                  <td className="px-4 py-3 font-semibold text-gray-700 sticky left-0 bg-inherit w-48">{feature}</td>
                  {values.map((val, i) => (
                    <td key={`${feature}-${i}`} className={`px-6 py-3 text-center text-gray-700 ${isDifferent ? 'bg-yellow-50' : ''}`}>
                      {getFeatureValue(listings[i], feature)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer with Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3 justify-end sticky bottom-0">
          <button onClick={onClose} className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-semibold">
            <i className="fas fa-times"></i> Close
          </button>
        </div>
      </div>
    </div>
  );
}
