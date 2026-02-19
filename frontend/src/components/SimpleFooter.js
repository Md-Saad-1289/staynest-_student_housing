import React from "react";
import { Link } from "react-router-dom";

export const SimpleFooter = () => {
  return (
    <footer className="bg-black text-gray-400 border-t border-gray-800">
      
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            StayNest
          </h2>
          <p className="text-sm leading-relaxed">
            A trusted student housing marketplace in Bangladesh.
            Find verified mess, hostels & shared flats near your campus.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-6 text-lg">
            <a href="#" className="hover:text-white transition">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="hover:text-white transition">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="hover:text-white transition">
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
            <li><Link to="/careers" className="hover:text-white transition">Careers</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-white font-semibold mb-4">Resources</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-white font-semibold mb-4">
            Get Updates
          </h3>
          <p className="text-sm mb-4">
            Stay updated with new listings & offers.
          </p>
          <form className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-l-lg focus:outline-none focus:border-sky-500 text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 transition rounded-r-lg text-white text-sm font-medium"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} StayNest. All rights reserved.
          </p>

          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/terms" className="hover:text-white transition">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
