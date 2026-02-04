import React from 'react';

const Item = ({ title, subtitle, icon }) => (
  <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-100 hover:border-blue-300 transition">
    <div className="flex-shrink-0 text-3xl text-blue-600">
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <div className="font-semibold text-gray-900">{title}</div>
      <div className="text-xs text-gray-600">{subtitle}</div>
    </div>
  </div>
);

export const TrustSignals = () => {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><i className="fas fa-shield-alt text-green-600"></i> Why Choose NestroStay?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Item
              title="Verified Owners"
              subtitle="ID-verified & trusted"
              icon="fa-badge-check"
            />

            <Item
              title="Real Reviews"
              subtitle="Authentic student feedback"
              icon="fa-star"
            />

            <Item
              title="Female-Friendly"
              subtitle="Women-safe options"
              icon="fa-venus"
            />

            <Item
              title="Zero Brokerage"
              subtitle="Transparent pricing"
              icon="fa-hands-holding-dollar"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
