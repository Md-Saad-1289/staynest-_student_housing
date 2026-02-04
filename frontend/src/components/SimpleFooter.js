import React from 'react';
import { Link } from 'react-router-dom';

export const SimpleFooter = () => (
  <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 py-12 border-t border-gray-800">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
      <div>
        <div className="text-white font-bold text-xl flex items-center gap-2 mb-2"><i className="fas fa-home text-sky-500"></i> NestroStay</div>
        <div className="text-sm text-gray-400">Student housing marketplace — Dhaka, Bangladesh</div>
      </div>

      <div>
        <div className="font-semibold text-white flex items-center gap-2 mb-3"><i className="fas fa-link text-blue-500"></i> Quick Links</div>
        <ul className="space-y-2">
          <li><Link to="/about" className="hover:text-white transition flex items-center gap-1"><i className="fas fa-angle-right text-xs"></i> About Us</Link></li>
          <li><Link to="/contact" className="hover:text-white transition flex items-center gap-1"><i className="fas fa-angle-right text-xs"></i> Contact Support</Link></li>
          <li><Link to="/terms" className="hover:text-white transition flex items-center gap-1"><i className="fas fa-angle-right text-xs"></i> Terms & Conditions</Link></li>
        </ul>
      </div>

      <div>
        <div className="font-semibold text-white flex items-center gap-2 mb-3"><i className="fas fa-share-alt text-green-500"></i> Follow Us</div>
        <div className="flex gap-4">
          <a href="https://facebook.com/stuhousing" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition inline-flex items-center gap-1">
            <i className="fab fa-facebook text-xl"></i> Facebook
          </a>
          <a href="https://instagram.com/stuhousing" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition inline-flex items-center gap-1">
            <i className="fab fa-instagram text-xl"></i> Instagram
          </a>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-gray-800 text-xs text-gray-500 text-center flex items-center justify-center gap-1">
      <i className="fas fa-copyright text-gray-600"></i> {new Date().getFullYear()} NestroStay — Built with <i className="fas fa-heart text-red-500"></i> for students in Bangladesh
    </div>
  </footer>
);
