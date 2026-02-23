import React, { useState, useEffect } from 'react';
// Hero search form removed from homepage per request
import { HeroSearch } from '../components/HeroSearch';
import { TrustSignals } from '../components/TrustSignals';
import { FeaturedListingsPreview } from '../components/FeaturedListingsPreview';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { HowItWorks } from '../components/HowItWorks';
import { OwnerCTA } from '../components/OwnerCTA';
import { Testimonials } from '../components/Testimonials';
import { SimpleFooter } from '../components/SimpleFooter';
import { listingService } from '../services/api';

export const HomePage = () => {
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await listingService.getFeaturedListings();
        setFeaturedListings(res.data.listings || []);
      } catch (err) {
        console.log('Error fetching featured listings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeatured();
  }, []);

  // search handler removed because search form was removed from homepage

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <HeroSearch hideForm />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10 py-8">
          <TrustSignals />

          {/* Featured Listings (responsive card grid) */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Popular Mess & Hostels</h2>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 6 }).map((_,i)=>(
                  <div key={i} className="h-40 bg-white rounded-lg border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <FeaturedListingsPreview listings={featuredListings} />
            )}
          </section>

          <RecentlyViewed />

          <HowItWorks />

          <OwnerCTA />

          <Testimonials />
        </div>

        {/* Mobile quick action bar */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center lg:hidden z-40">
          <div className="max-w-3xl w-full px-4">
            <div className="bg-white rounded-full shadow-lg p-2 flex items-center gap-3">
              <a href="/listings" className="flex-1 text-center py-2 px-4 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-full font-semibold">Search Listings</a>
              <a href="/listings?featured=1" className="px-3 py-2 rounded-full text-sm bg-gray-100">Featured</a>
              <a href="/register" className="px-3 py-2 rounded-full text-sm bg-green-600 text-white">List</a>
            </div>
          </div>
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
};
