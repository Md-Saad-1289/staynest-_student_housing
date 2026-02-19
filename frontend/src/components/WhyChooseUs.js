import React from "react";

const FeatureCard = ({ title, text, icon }) => (
  <div className="group relative p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    
    {/* Icon */}
    <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white text-xl mb-5 shadow-md group-hover:scale-110 transition">
      <i className={`fas ${icon}`}></i>
    </div>

    {/* Content */}
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-sm text-gray-600 leading-relaxed">
      {text}
    </p>
  </div>
);

export const WhyChooseUs = () => (
  <section className="relative py-20 bg-gradient-to-b from-sky-50 via-white to-white overflow-hidden">
    
    <div className="max-w-7xl mx-auto px-6">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Why Students Trust StayNest
        </h2>
        <p className="text-gray-600 text-lg">
          We’re building the safest and most transparent student housing platform in Bangladesh.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        
        <FeatureCard
          title="Verified Listings"
          text="Every property owner goes through strict ID verification before approval."
          icon="fa-check-circle"
        />

        <FeatureCard
          title="Transparent Pricing"
          text="No hidden fees. Clear rent, deposits, and agreement terms upfront."
          icon="fa-eye"
        />

        <FeatureCard
          title="Safe & Reviewed"
          text="Real student reviews and safety checks protect your decision."
          icon="fa-shield-alt"
        />

        <FeatureCard
          title="Local Support"
          text="Friendly Bangladesh-based support team available when you need help."
          icon="fa-headset"
        />

      </div>
    </div>
  </section>
);
