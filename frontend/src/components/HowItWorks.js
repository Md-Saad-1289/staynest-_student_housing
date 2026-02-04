import React from 'react';

const Step = ({ number, title, text, icon }) => (
  <div className="flex items-start gap-4 p-6 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition">
    <div className="flex-shrink-0">
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-lg text-lg">
        <i className={`fas ${icon}`}></i>
      </div>
    </div>
    <div>
      <div className="font-semibold text-gray-900 text-lg flex items-center gap-2">Step {number}: {title}</div>
      <div className="text-sm text-gray-600 mt-1">{text}</div>
    </div>
  </div>
);

export const HowItWorks = () => (
  <section id="how" className="py-12 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2"><i className="fas fa-lightbulb text-yellow-500"></i> How NestroStay Works</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">Finding your perfect student housing is easy with our simple 3-step process</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Step number={1} icon="fa-search" title="Search" text="Discover mess, hostels, and rooms near your campus with smart filters for location, price, and amenities." />
        <Step number={2} icon="fa-calendar-check" title="Book" text="Request a visit or booking directly from verified owners. Chat and negotiate terms easily." />
        <Step number={3} icon="fa-home" title="Move In" text="Accept the offer, complete verification, and move into your new home with confidence." />
      </div>
    </div>
  </section>
);
