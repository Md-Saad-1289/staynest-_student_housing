import React, { useState } from 'react';

export const BookingModal = ({ listing, onSubmit, onClose }) => {
  const [moveInDate, setMoveInDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!moveInDate) {
      setError('Please select a move-in date');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ listingId: listing._id, moveInDate, notes });
      onClose();
    } catch (err) {
      setError(err || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2"><i className="fas fa-calendar-check"></i> Book {listing.title}</h2>
        </div>

        <div className="p-6">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 flex items-center gap-2"><i className="fas fa-circle-exclamation"></i> {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2"><i className="fas fa-calendar text-blue-600"></i> Move-in Date *</label>
              <input
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2"><i className="fas fa-note-sticky text-purple-600"></i> Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 h-24 focus:outline-none focus:border-blue-500"
                placeholder="Tell owner about yourself, your background, etc..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
              >
                <i className="fas fa-check"></i> {loading ? 'Submitting...' : 'Submit Booking'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-semibold flex items-center justify-center gap-2"
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
