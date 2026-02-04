import React from 'react';

export const ReviewCard = ({ review, listingTitle }) => {
  const avgRating = review.ratings 
    ? (Object.values(review.ratings).reduce((a, b) => a + b) / Object.values(review.ratings).length).toFixed(1)
    : 0;

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900 flex items-center gap-2"><i className="fas fa-user-circle text-blue-500"></i> {review.studentId?.name || 'Anonymous'}</h4>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><i className="fas fa-calendar text-gray-400"></i> {new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
          <i className="fas fa-star text-yellow-500"></i>
          <span className="text-sm font-semibold text-yellow-700">{avgRating}/5</span>
        </div>
      </div>

      {/* Rating Breakdown */}
      {review.ratings && (
        <div className="mb-4 space-y-2 text-xs bg-gray-50 p-3 rounded-lg">
          {Object.entries(review.ratings).map(([category, score]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-gray-700 capitalize font-medium flex items-center gap-2">
                <i className={`fas fa-circle text-yellow-${score * 100} text-xs`}></i>
                {category}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500"><i className="fas fa-star text-xs"></i></span>
                <span className="font-semibold text-gray-900">{score}/5</span>
              </div>
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
