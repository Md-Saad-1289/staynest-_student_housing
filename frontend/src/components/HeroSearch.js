import React from "react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative h-[85vh] flex items-center justify-center text-white overflow-hidden">

      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1598928506311-c55ded91a20b"
          alt="Student Housing"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-brightness-75"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
          Find Safe & Verified <br />
          Student Housing Near You
        </h1>

        <p className="text-lg md:text-xl text-gray-200 mb-8">
          Trusted mess & hostel listings across Dhaka — real reviews,
          verified owners, zero brokerage.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/listings"
            className="px-8 py-3 bg-sky-600 hover:bg-sky-700 transition rounded-full font-semibold shadow-lg"
          >
            Explore Listings
          </Link>

          <Link
            to="/register"
            className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 transition rounded-full font-semibold"
          >
            List Your Property
          </Link>
        </div>
      </div>
    </section>
  );
};
