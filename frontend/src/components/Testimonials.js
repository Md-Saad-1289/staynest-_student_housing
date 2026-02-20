import React, { useState, useEffect } from 'react';
import { testimonialService } from '../services/api';

const Testimonial = ({ text, name, tag, rating }) => (
  <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
    <div className="flex items-start gap-1 mb-3">
      {[...Array(5)].map((_, i) => (
        <i key={i} className={`fas fa-star text-xs ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
      ))}
    </div>
    <div className="text-sm text-gray-700 mb-4 flex items-start gap-2">
      <i className="fas fa-quote-left text-gray-300 text-lg flex-shrink-0 mt-1"></i>
      <p>"{text}"</p>
    </div>
    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
      <div>
        <div className="font-semibold text-gray-900 flex items-center gap-1"><i className="fas fa-user-circle text-blue-500"></i> {name}</div>
        <div className="text-xs text-gray-500 flex items-center gap-1"><i className="fas fa-graduation-cap text-purple-500"></i> {tag}</div>
      </div>
    </div>
  </div>
);

export const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await testimonialService.getTestimonials();
        const approved = res.data.testimonials || [];
        // Show featured first, then others
        const sorted = approved.sort((a, b) => {
          if (a.featured === b.featured) return 0;
          return a.featured ? -1 : 1;
        });
        setTestimonials(sorted.slice(0, 6)); // Show max 6
      } catch (err) {
        console.log('Error fetching testimonials:', err);
        // Fallback to default testimonials
        setTestimonials([
          { name: 'Aisha Rahman', tag: 'BUET Student', rating: 5, text: 'Clean rooms and helpful owner — felt safe and welcomed.' },
          { name: 'Rafi Ahmed', tag: 'DU Student', rating: 4, text: 'Affordable rent near my campus, zero brokerage.' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2"><i className="fas fa-comment-dots text-blue-600"></i> What Students Say</h2>
        <p className="text-gray-600 mb-8">Real reviews from NestroStay users</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <Testimonial key={i} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
};
