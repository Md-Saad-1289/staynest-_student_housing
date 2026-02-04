import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const HeroSearch = ({ onSearch }) => {
  const [city, setCity] = useState('Dhaka');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [gender, setGender] = useState('');

  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const values = { city, minRent, maxRent, gender };
    onSearch && onSearch(values);

    // Navigate to listings page with query params
    try {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (minRent) params.set('minRent', minRent);
      if (maxRent) params.set('maxRent', maxRent);
      if (gender) params.set('gender', gender);
      const qs = params.toString();
      navigate(qs ? `/listings?${qs}` : '/listings');
    } catch (err) {
      // ignore navigation errors
    }
  };

  return (
    <section className="bg-gradient-to-b from-sky-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden lg:flex lg:items-center border border-gray-100">
          <div className="p-8 lg:flex-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 flex items-center gap-2"><i className="fas fa-shield text-green-600"></i> Find Safe & Verified Mess Near Your Campus</h1>
            <p className="mt-3 text-gray-600 text-lg flex items-center gap-2"><i className="fas fa-check text-green-500"></i> Trusted student housing across Dhaka — verified owners, real reviews, and zero brokerage.</p>

            <form onSubmit={submit} className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><i className="fas fa-city text-blue-600"></i> City</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Dhaka</option>
                  <option>Chittagong</option>
                  <option>Sylhet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><i className="fas fa-money-bill text-green-600"></i> Min Rent (৳)</label>
                <input type="number" value={minRent} onChange={(e) => setMinRent(e.target.value)} placeholder="Minimum" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><i className="fas fa-money-bill text-green-600"></i> Max Rent (৳)</label>
                <input type="number" value={maxRent} onChange={(e) => setMaxRent(e.target.value)} placeholder="Maximum" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><i className="fas fa-venus-mars text-pink-600"></i> Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Any Gender</option>
                  <option value="male"><i className="fas fa-mars"></i> Male</option>
                  <option value="female"><i className="fas fa-venus"></i> Female</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className="sm:col-span-2 md:col-span-4 mt-4">
                <button type="submit" className="w-full bg-gradient-to-r from-sky-600 to-sky-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
                  <i className="fas fa-search"></i> Search Now
                </button>
              </div>
            </form>
          </div>

          <div className="hidden lg:block lg:w-1/3 bg-gradient-to-br from-sky-50 to-blue-50 p-8">
            <div className="rounded-xl bg-white p-4 shadow-md border border-gray-100">
              <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center text-gray-500 font-semibold flex items-center justify-center gap-2">
                <i className="fas fa-image text-2xl"></i> Featured Property
              </div>
              <div className="mt-4 text-sm text-gray-700">
                <p className="font-semibold flex items-center gap-1 mb-1"><i className="fas fa-map-marker-alt text-red-500"></i> Popular near Dhanmondi</p>
                <p className="flex items-center gap-1 mb-1"><i className="fas fa-money-bill-wave text-green-500"></i> ৳6,000/month</p>
                <p className="flex items-center gap-1"><i className="fas fa-venus text-pink-500"></i> Female Friendly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
