import React, { useState, useEffect } from 'react';
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

  const handleSearch = (values) => {
    // TODO: wire to listing fetch (future API integration)
    console.log('Search values', values);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <HeroSearch onSearch={handleSearch} />

        <TrustSignals />

        {!loading && <FeaturedListingsPreview listings={featuredListings} />}

        <RecentlyViewed />

        <HowItWorks />

        <OwnerCTA />

        <Testimonials />
      </main>

      <SimpleFooter />
    </div>
  );
};
