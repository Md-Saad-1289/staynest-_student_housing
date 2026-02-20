import React from "react";
import { Link } from "react-router-dom";

export const FriendlyHero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center text-white overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
          alt="Student Apartment"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

        {/* Small Friendly Tag */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm mb-6">
          <i className="fas fa-heart text-pink-400"></i>
          Made for Students, By People Who Care
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          Find a Place That
          <br />
          <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
            Feels Like Home
          </span>
        </h1>

        {/* Friendly Subtext */}
        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
          Searching for a safe and comfortable mess near your campus?
          We’ve made it simple. Browse verified listings, check real reviews,
          and move in with confidence.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <Link
            to="/listings"
            className="px-10 py-4 bg-sky-600 hover:bg-sky-700 rounded-full font-semibold text-lg shadow-xl transition duration-300"
          >
            Start Exploring
          </Link>

          <Link
            to="/register"
            className="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 rounded-full font-semibold text-lg transition duration-300"
          >
            List Your Property
          </Link>
        </div>

      </div>
    </section>
  );
};