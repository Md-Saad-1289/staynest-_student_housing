import React from 'react';
import { HeroSearch } from '../components/HeroSearch';
import { TrustSignals } from '../components/TrustSignals';
import { FeaturedListingsPreview } from '../components/FeaturedListingsPreview';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { HowItWorks } from '../components/HowItWorks';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { OwnerCTA } from '../components/OwnerCTA';
import { Testimonials } from '../components/Testimonials';
import { SimpleFooter } from '../components/SimpleFooter';

export const HomePage = () => {
  const handleSearch = (values) => {
    // TODO: wire to listing fetch (future API integration)
    console.log('Search values', values);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <HeroSearch onSearch={handleSearch} />

        <TrustSignals />

        <FeaturedListingsPreview />

        <RecentlyViewed />

        <HowItWorks />

        <WhyChooseUs />

        <OwnerCTA />

        <Testimonials />
      </main>

      <SimpleFooter />
    </div>
  );
};
