import React from "react";

const TrustItem = ({ title, subtitle, icon }) => (
  <div className="group flex items-start gap-4 p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    
    {/* Icon */}
    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white text-lg shadow-md group-hover:scale-110 transition">
      <i className={`fas ${icon}`}></i>
    </div>

    {/* Text */}
    <div>
      <h4 className="font-semibold text-gray-900 mb-1">
        {title}
      </h4>
      <p className="text-sm text-gray-600 leading-relaxed">
        {subtitle}
      </p>
    </div>
  </div>
);

export const TrustSignals = () => {
  return (
    <section className="relative py-16 bg-gradient-to-b from-white to-sky-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
            Why Students Trust StayNest
          </h3>
          <p className="text-gray-600 mt-3">
            Safe, transparent, and built for real student needs.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          <TrustItem
            title="Verified Owners"
            subtitle="Every owner is ID-verified before listing."
            icon="fa-check-circle"
          />

          <TrustItem
            title="Real Reviews"
            subtitle="Authentic feedback from real students."
            icon="fa-star"
          />

          <TrustItem
            title="Female-Friendly Options"
            subtitle="Safer choices for female students."
            icon="fa-shield-alt"
          />

          <TrustItem
            title="Zero Brokerage"
            subtitle="No hidden charges. Transparent pricing."
            icon="fa-hand-holding-usd"
          />

        </div>
      </div>
    </section>
  );
};