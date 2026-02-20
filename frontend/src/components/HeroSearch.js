import React from "react";
import { Link } from "react-router-dom";
import heroImg from "../assets/images/hero-img.png";

export const FriendlyHero = () => {
  return (
    <section className="relative min-h-screen sm:min-h-[80vh] flex items-center justify-center text-white overflow-hidden">

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

      {/* Content - Mobile Responsive */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center py-12 sm:py-20">

        {/* Headline - Responsive sizing */}
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-4 sm:mb-6 tracking-tight">
          Safe & Verified
          <br />
          <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
            Student Housing
          </span>
          <br className="hidden xs:block" />
          <span className="text-base sm:text-2xl md:text-3xl lg:text-4xl"> Near Your Campus</span>
        </h1>

        {/* Subheading - Responsive text */}
        <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed">
          Discover trusted mess and shared flats across Dhaka.
          Transparent pricing, real reviews, and zero brokerage.
        </p>

        {/* CTA Buttons - Mobile optimized */}
        <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 sm:gap-6 justify-center px-2 xs:px-0">
          <Link
            to="/listings"
            className="px-6 xs:px-8 sm:px-10 py-3 xs:py-3.5 sm:py-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 rounded-full font-medium text-sm xs:text-base sm:text-lg shadow-2xl transition duration-300 touch-button"
          >
            Explore Listings
          </Link>

          <Link
            to="/register"
            className="px-6 xs:px-8 sm:px-10 py-3 xs:py-3.5 sm:py-4 border border-white/30 bg-white/5 backdrop-blur-md hover:bg-white/10 rounded-full font-medium text-sm xs:text-base sm:text-lg transition duration-300 touch-button"
          >
            List Property
          </Link>
        </div>

      </div>
    </section>
  );
};

export const HeroSearch = FriendlyHero;