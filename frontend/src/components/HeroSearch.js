import React from "react";
import { Link } from "react-router-dom";
import heroImg from "../assets/images/hero-img.png";

export const FriendlyHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Student Housing"
          className="w-full h-full object-cover"
        />
        {/* Stronger premium overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6 tracking-tight">
          Safe & Verified
          <br />
          <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
            Student Housing
          </span>{" "}
          Near Your Campus
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
          Discover trusted mess and shared flats across Dhaka.
          Transparent pricing, real reviews, and zero brokerage.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            to="/listings"
            className="px-10 py-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 rounded-full font-medium text-lg shadow-2xl transition duration-300"
          >
            Explore Listings
          </Link>

          <Link
            to="/register"
            className="px-10 py-4 border border-white/30 bg-white/5 backdrop-blur-md hover:bg-white/10 rounded-full font-medium text-lg transition duration-300"
          >
            List Your Property
          </Link>
        </div>

      </div>
    </section>
  );
};

export const HeroSearch = FriendlyHero;