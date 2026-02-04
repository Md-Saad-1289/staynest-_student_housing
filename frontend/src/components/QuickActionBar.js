import React, { useState } from 'react';

export const QuickActionBar = ({ onBookingClick, onCallClick, isAuthenticated, userRole }) => {
  const [showMessage, setShowMessage] = useState('');

  const handleCall = () => {
    if (!isAuthenticated) {
      setShowMessage('Please login to contact owner');
      return;
    }
    if (userRole !== 'student') {
      setShowMessage('Only students can contact owners');
      return;
    }
    onCallClick && onCallClick();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 lg:hidden">
      <div className="max-w-full px-4 py-3 flex gap-3">
        <button
          onClick={onBookingClick}
          className="flex-1 bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <i className="fas fa-calendar-check"></i> Book Now
        </button>
        <button
          onClick={handleCall}
          className="flex-1 border-2 border-sky-600 text-sky-600 py-3 rounded-lg font-semibold hover:bg-sky-50 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <i className="fas fa-phone"></i> Contact
        </button>
      </div>
      {showMessage && (
        <div className="px-4 py-2 bg-yellow-50 text-yellow-800 text-xs text-center flex items-center justify-center gap-2">
          <i className="fas fa-triangle-exclamation"></i> {showMessage}
        </div>
      )}
    </div>
  );
};

export default QuickActionBar;
