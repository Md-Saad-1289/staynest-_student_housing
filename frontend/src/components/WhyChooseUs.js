import React from 'react';

const Bullet = ({ title, text, icon }) => (
  <div className="flex gap-4 items-start p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-300 transition">
    <div className="flex-shrink-0 text-3xl text-blue-600">
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <div className="font-semibold text-gray-900">{title}</div>
      <div className="text-sm text-gray-600">{text}</div>
    </div>
  </div>
);

export const WhyChooseUs = () => (
  <section className="py-12 bg-gradient-to-b from-blue-50 to-white">
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-bold mb-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 13l2 2 4-4" />
        </svg>
        Why Students Choose NestroStay
      </h2>
      <p className="text-gray-600 mb-8 max-w-2xl">We're committed to making student housing safe, affordable, and hassle-free</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Bullet title="Verified Listings" text="Every owner is ID-verified before listing their property." icon="fa-check-circle" />
        <Bullet title="Transparent Pricing" text="Clear rent, deposits, and no hidden charges ever." icon="fa-eye" />
        <Bullet title="Safe for Students" text="Peer reviews and safety checks protect your interests." icon="fa-shield" />
        <Bullet title="Local Support" text="24/7 Bangladesh-based customer support in Bengali." icon="fa-headset" />
      </div>
    </div>
  </section>
);
