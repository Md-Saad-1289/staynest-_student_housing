import React, { useState } from "react";
import { Link } from "react-router-dom";
import heroImg from "../assets/images/hero-img.png";

export const FriendlyHero = ({ onSearch, hideForm = false }) => {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');

  const submit = (e) => {
    e && e.preventDefault();
    if (onSearch) onSearch({ query, city });
  };

  return (
    <section className="relative min-h-[60vh] sm:min-h-[70vh] md:min-h-[75vh] lg:min-h-[85vh] flex items-center justify-center text-white overflow-hidden">

      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroImg} alt="Student Housing" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center py-10 sm:py-16 lg:py-24">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-3">
          Find Safe & Verified
          <br />
          <span className="bg-gradient-to-r from-sky-300 to-blue-400 bg-clip-text text-transparent">Student Housing</span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-200 max-w-3xl mx-auto mb-6">
          Discover trusted messes, hostels and shared flats near your campus — verified owners, transparent pricing, and real reviews.
        </p>

        {/* Search Card (optionally hidden) */}
        {!hideForm ? (
          <form onSubmit={submit} className="mt-6 mx-auto max-w-3xl bg-white/95 rounded-xl p-4 sm:p-6 shadow-xl text-left flex flex-col sm:flex-row gap-3 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, area, or keyword"
              className="flex-1 px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <select value={city} onChange={(e) => setCity(e.target.value)} className="w-40 px-3 py-3 rounded-md border border-gray-200 bg-white focus:outline-none">
              <option value="">All Cities</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Chittagong">Chittagong</option>
              <option value="Sylhet">Sylhet</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="px-5 py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-md font-semibold shadow-md">Search</button>
              <Link to="/listings" className="px-4 py-3 border rounded-md bg-gray-50 text-gray-700 font-medium">Browse</Link>
            </div>
          </form>
        ) : (
          <div className="mt-6 mx-auto max-w-3xl flex items-center justify-center gap-4">
            <Link to="/listings" className="px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-md font-semibold shadow-md">Search Listings</Link>
            <Link to="/listings?featured=1" className="px-5 py-3 border rounded-md bg-white text-gray-700 font-medium">Featured</Link>
          </div>
        )}
      </div>

      {/* Decorative wave */}
      <div className="absolute left-0 right-0 bottom-0 pointer-events-none">
        <svg viewBox="0 0 1440 80" className="w-full h-20 text-white/10"><path d="M0,48 C240,96 480,0 720,32 C960,64 1200,16 1440,48 L1440 80 L0 80 Z" fill="currentColor" /></svg>
      </div>
    </section>
  );
};

export const HeroSearch = FriendlyHero;