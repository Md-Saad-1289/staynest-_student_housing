import React, { useState } from 'react';

export const ReviewModal = ({ booking, listing, onSubmit, onClose }) => {
  const [ratings, setRatings] = useState({
    food: 3,
    cleanliness: 3,
    safety: 3,
    owner: 3,
    facilities: 3,
    study: 3,
  });
  const [textReview, setTextReview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const handleRatingChange = (category, value) => {
    setRatings({ ...ratings, [category]: parseInt(value) });
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 4) {
      setError('Maximum 4 photos allowed');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setPhotos(prev => [...prev, ...files]);
    setError('');
  };

  const removePhoto = (idx) => {
    setPhotos(photos.filter((_, i) => i !== idx));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!textReview.trim()) {
      setError('Please write a review');
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        bookingId: booking._id,
        ratings,
        textReview,
      };

      await onSubmit(reviewData);
      onClose();
    } catch (err) {
      setError(err || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const ratingCategories = [
    { key: 'food', label: 'Food Quality', icon: 'fa-utensils', color: 'text-red-500' },
    { key: 'cleanliness', label: 'Cleanliness', icon: 'fa-broom', color: 'text-green-500' },
    { key: 'safety', label: 'Safety', icon: 'fa-shield', color: 'text-orange-500' },
    { key: 'owner', label: 'Owner Behavior', icon: 'fa-user-check', color: 'text-blue-500' },
    { key: 'facilities', label: 'Facilities', icon: 'fa-home', color: 'text-purple-500' },
    { key: 'study', label: 'Study Environment', icon: 'fa-book', color: 'text-indigo-500' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 text-white sticky top-0">
          <h2 className="text-2xl font-bold flex items-center gap-2"><i className="fas fa-star"></i> Review: {listing.title}</h2>
          <p className="text-yellow-100 text-sm mt-1">Help other students make informed decisions</p>
        </div>

        <div className="p-6">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 flex items-center gap-2"><i className="fas fa-circle-exclamation"></i> {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-6 space-y-4">
              <p className="text-gray-700 font-semibold flex items-center gap-2 mb-4"><i className="fas fa-sliders"></i> Rate Your Experience (1 = Poor, 5 = Excellent)</p>
              {ratingCategories.map((cat) => (
                <div key={cat.key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <i className={`fas ${cat.icon} ${cat.color}`}></i> {cat.label} ({ratings[cat.key]}/5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={ratings[cat.key]}
                    onChange={(e) => handleRatingChange(cat.key, e.target.value)}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Poor</span>
                    <span>Fair</span>
                    <span>Good</span>
                    <span>Very Good</span>
                    <span>Excellent</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2"><i className="fas fa-pen-to-square text-blue-600"></i> Your Detailed Review</label>
              <textarea
                value={textReview}
                onChange={(e) => setTextReview(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 h-32 focus:outline-none focus:border-blue-500"
                placeholder="Share your experience... What did you like? What could be improved?"
              />
              <p className="text-xs text-gray-500 mt-1"><i className="fas fa-info-circle"></i> Be honest and helpful - mention both pros and cons</p>

                        <div className="mb-6">
                          <label className="block text-gray-700 font-semibold mb-3 flex items-center gap-2"><i className="fas fa-camera text-green-600"></i> Add Photos (Optional)</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition bg-gray-50">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handlePhotoChange}
                              className="hidden"
                              id="photo-upload"
                              disabled={photos.length >= 4}
                            />
                            <label htmlFor="photo-upload" className="cursor-pointer block">
                              <i className="fas fa-cloud-arrow-up text-blue-500 text-2xl mb-2"></i>
                              <p className="font-semibold text-gray-700">Click to upload photos</p>
                              <p className="text-xs text-gray-500">or drag and drop</p>
                              <p className="text-xs text-gray-500 mt-1">{photos.length} / 4 photos selected</p>
                            </label>
                          </div>

                          {photoPreviews.length > 0 && (
                            <div className="mt-4 grid grid-cols-4 gap-3">
                              {photoPreviews.map((preview, idx) => (
                                <div key={idx} className="relative">
                                  <img src={preview} alt={`Preview ${idx}`} className="w-full h-24 object-cover rounded border border-gray-200" />
                                  <button
                                    type="button"
                                    onClick={() => removePhoto(idx)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition"
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
              >
                <i className="fas fa-paper-plane"></i> {loading ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded hover:bg-gray-300 font-semibold flex items-center justify-center gap-2"
              >
                <i className="fas fa-xmark"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
