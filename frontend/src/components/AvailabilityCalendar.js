import React, { useState, useEffect } from 'react';

export default function AvailabilityCalendar({ listingId, bookings }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState([]);

  useEffect(() => {
    // Process bookings to get booked dates
    const dates = [];
    if (bookings && Array.isArray(bookings)) {
      bookings.forEach(booking => {
        const startDate = new Date(booking.checkInDate);
        const endDate = new Date(booking.checkOutDate);
        
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          dates.push(currentDate.toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    }
    setBookedDates(dates);
  }, [bookings]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateBooked = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookedDates.includes(dateStr);
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
           currentMonth.getMonth() === today.getMonth() &&
           currentMonth.getFullYear() === today.getFullYear();
  };

  const isPastDate = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const today = new Date();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i className="fas fa-calendar-alt text-blue-600"></i> Availability Calendar
      </h3>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition"
          title="Previous month"
        >
          <i className="fas fa-chevron-left text-gray-700"></i>
        </button>

        <h4 className="text-lg font-bold text-gray-800 min-w-32 text-center">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>

        <button
          onClick={nextMonth}
          className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition"
          title="Next month"
        >
          <i className="fas fa-chevron-right text-gray-700"></i>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center font-bold text-gray-600 py-2 text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const isBooked = day && isDateBooked(day);
          const isCurrent = day && isToday(day);
          const isPast = day && isPastDate(day);

          return (
            <div
              key={idx}
              className={`
                aspect-square flex items-center justify-center rounded-lg font-semibold text-sm
                transition cursor-default
                ${!day ? 'bg-transparent' : ''}
                ${isPast ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}
                ${isBooked ? 'bg-red-500 text-white' : ''}
                ${isCurrent && !isBooked ? 'bg-blue-600 text-white ring-2 ring-blue-800' : ''}
                ${!isBooked && !isCurrent && !isPast ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
              `}
              title={
                day ? (isBooked ? 'Booked' : isPast ? 'Past' : 'Available') : ''
              }
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-gray-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-700">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-gray-700">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <span className="text-gray-700">Past</span>
        </div>
      </div>

      {/* Booking Info */}
      {bookedDates.length > 0 && (
        <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-gray-700 mb-2">
            <i className="fas fa-info-circle text-red-600 mr-2"></i>
            <strong>{bookedDates.length} dates</strong> are currently booked
          </p>
          <p className="text-xs text-gray-600">
            Contact the owner for exact availability or check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
