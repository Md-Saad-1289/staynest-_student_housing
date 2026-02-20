import React from 'react';

export const ReviewCard = ({ review, listingTitle }) => {
  const avgRating = review.ratings 
    ? Object.values(review.ratings).reduce((a, b) => a + b, 0) / Object.values(review.ratings).length
    : 0;

  const ratingCategoryDisplay = [
    { key: 'food', label: 'Food', icon: 'fa-utensils', color: 'text-red-500' },
    { key: 'cleanliness', label: 'Cleanliness', icon: 'fa-broom', color: 'text-green-500' },
    { key: 'safety', label: 'Safety', icon: 'fa-shield', color: 'text-orange-500' },
    { key: 'owner', label: 'Owner', icon: 'fa-user-check', color: 'text-blue-500' },
    { key: 'facilities', label: 'Facilities', icon: 'fa-home', color: 'text-purple-500' },
    { key: 'study', label: 'Study', icon: 'fa-book', color: 'text-indigo-500' },
  ];

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900 flex items-center gap-2"><i className="fas fa-user-circle text-blue-500"></i> {review.studentId?.name || 'Anonymous'}</h4>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><i className="fas fa-calendar text-gray-400"></i> {new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
          <i className="fas fa-star text-yellow-500"></i>
          <span className="text-sm font-semibold text-yellow-700">{avgRating.toFixed(1)}/5</span>
        </div>
      </div>

      {/* Rating Breakdown - Compact Grid */}
      {review.ratings && (
        <div className="mb-4 grid grid-cols-3 sm:grid-cols-6 gap-2 bg-gray-50 p-3 rounded-lg">
          {ratingCategoryDisplay.map(cat => (
            <div key={cat.key} className="text-center text-xs">
              <div className="flex justify-center mb-1">
                <i className={`fas ${cat.icon} ${cat.color} text-sm`}></i>
              </div>
              <p className="text-gray-700 font-semibold">{review.ratings[cat.key]}/5</p>
              <p className="text-gray-500 text-xs capitalize">{cat.label}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-gray-700 text-sm leading-relaxed mb-3 flex items-start gap-2"><i className="fas fa-quote-left text-gray-300 text-lg flex-shrink-0 mt-1"></i> <span>{review.textReview}</span></p>

      {/* Owner Reply */}
      {review.ownerReply && (
        <div className="mt-4 ml-4 pl-4 border-l-4 border-sky-400 bg-sky-50 p-4 rounded-lg">
          <p className="text-xs font-semibold text-sky-900 mb-2 flex items-center gap-1"><i className="fas fa-user-tie text-sky-600"></i> Owner's Reply</p>
          <p className="text-sm text-sky-800">{review.ownerReply}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
