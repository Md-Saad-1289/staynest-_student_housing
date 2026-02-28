import React from "react";
import { ListingCard } from "./ListingCard";
import { Link } from "react-router-dom";

export const FeaturedListingsPreview = ({ listings = [] }) => {
  const preview = listings.slice(0, 6);

  return (
    <section className="py-20 bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Featured Listings
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              Handpicked verified stays for students
            </p>
          </div>

          <Link
            to="/listings"
            className="mt-6 md:mt-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 text-white font-semibold shadow-md hover:bg-sky-700 hover:shadow-lg transition-all duration-300"
          >
            View All
            <i className="fas fa-arrow-right text-sm"></i>
          </Link>
        </div>

        {/* Listings Grid */}
        {preview.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {preview.map((l) => (
              <div
                key={l._id}
                className="transform transition duration-300 hover:-translate-y-2"
              >
                <ListingCard listing={l} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border">
            <h3 className="text-xl font-semibold text-gray-800">
              No Featured Listings Yet
            </h3>
            <p className="text-gray-500 mt-2">
              Check back soon for newly added properties.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};