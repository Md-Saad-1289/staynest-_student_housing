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
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><i className="fas fa-fire text-orange-500"></i> Popular Mess & Hostels</h2>
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

        {/* Mobile quick action bar removed */}
      </main>

      <SimpleFooter />
    </div>
  );
};
