import React from "react";
import { ListingCard } from "./ListingCard";
import { Link } from "react-router-dom";

export const FeaturedListingsPreview = ({ listings = [] }) => {
  const preview = listings.slice(0, 6);

  return (
    <section className="py-24 bg-gradient-to-b from-sky-50 via-white to-white relative overflow-hidden">
      
      {/* Soft Background Accent */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-sky-200 rounded-full blur-3xl opacity-30"></div>

      <div className="max-w-7xl mx-auto px-6 relative">

        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Featured Student Stays
          </h2>
          <p className="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">
            Verified, affordable and comfortable living spaces near your campus.
          </p>
        </div>

        {/* Listings */}
        {preview.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {preview.map((l) => (
                <div
                  key={l._id}
                  className="transition-all duration-500 hover:-translate-y-2"
                >
                  <ListingCard listing={l} />
                </div>
              ))}
            </div>

            {/* Centered CTA */}
            <div className="flex justify-center mt-14">
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Explore All Listings
                <i className="fas fa-arrow-right text-sm"></i>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl shadow-md border border-gray-100">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sky-100 flex items-center justify-center">
              <i className="fas fa-building text-sky-600 text-xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              No Featured Listings Yet
            </h3>
            <p className="text-gray-500 mt-2">
              New verified stays are coming soon.
            </p>
          </div>
        )}

      </div>
    </section>
  );
};