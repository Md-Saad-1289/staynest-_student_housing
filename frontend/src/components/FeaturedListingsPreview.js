import React from 'react';
import { ListingCard } from './ListingCard';
import { Link } from 'react-router-dom';

export const FeaturedListingsPreview = ({ listings = [] }) => {
  const preview = listings.length ? listings.slice(0, 4) : [
    {
      _id: 'm1',
      title: 'Dhanmondi Female Mess',
      address: 'Dhanmondi, Dhaka',
      rent: 6000,
      type: 'mess',
      genderAllowed: 'female',
      verified: true,
      photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=60'],
      averageRating: 4.6,
    },
    {
      _id: 'm2',
      title: 'Mirpur Budget Hostel',
      address: 'Mirpur, Dhaka',
      rent: 4500,
      type: 'hostel',
      genderAllowed: 'male',
      verified: true,
      photos: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=60'],
      averageRating: 4.2,
    },
    {
      _id: 'm3',
      title: 'Gulshan Mixed Mess',
      address: 'Gulshan, Dhaka',
      rent: 8000,
      type: 'mess',
      genderAllowed: 'both',
      verified: false,
      photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60'],
      averageRating: 4.8,
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><i className="fas fa-fire text-orange-500"></i> Popular Mess & Hostels</h2>
          <Link to="/listings" className="text-sky-600 font-semibold hover:text-sky-700 flex items-center gap-1">
            View All <i className="fas fa-arrow-right"></i>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {preview.map((l) => (
            <ListingCard key={l._id} listing={l} />
          ))}
        </div>
      </div>
    </section>
  );
};
