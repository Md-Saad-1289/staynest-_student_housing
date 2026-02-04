import React from 'react';
import { Link } from 'react-router-dom';

export const OwnerCTA = () => (
  <section className="py-12 bg-gradient-to-r from-orange-500 to-red-600 text-white">
    <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2"><i className="fas fa-building text-yellow-200"></i> Own a Mess or Hostel?</h2>
        <p className="text-orange-100 text-lg">List your property for FREE and start receiving verified student bookings today. No brokerage, no hidden fees.</p>
      </div>

      <div className="flex-shrink-0">
        <Link to="/register" className="inline-flex items-center gap-2 bg-yellow-300 hover:bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg">
          <i className="fas fa-plus-circle"></i> List Property Free
        </Link>
      </div>
    </div>
  </section>
);
