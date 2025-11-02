import React from "react";
import { assets } from "../assets/assets";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-borderColor text-gray-600 mt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32 py-10 flex flex-col md:flex-row justify-between gap-10">

        {/* Logo + Description */}
        <div className="md:max-w-sm">
          <div className="flex items-center gap-2">
            <img src={assets.logo} alt="Rent-A-Ride Logo" className="h-8" />
          </div>
          <p className="mt-4 text-sm">
            Rent-A-Ride — your trusted car rental partner. Whether it's a short trip or a long journey,
            we make every ride smooth, secure, and affordable.
          </p>
          <div className="mt-4 text-sm space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Pune, Maharashtra, India</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span>support@rentaride.com</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">Company</h3>
          <ul className="text-sm space-y-2">
            <li><a href="/" className="hover:text-primary">Home</a></li>
            <li><a href="/about" className="hover:text-primary">About Us</a></li>
            <li><a href="/contact" className="hover:text-primary">Contact</a></li>
            <li><a href="/privacy" className="hover:text-primary">Privacy Policy</a></li>
          </ul>
        </div>

        {/* User Links */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">For Users</h3>
          <ul className="text-sm space-y-2">
            <li><a href="/cars" className="hover:text-primary">Browse Cars</a></li>
            <li><a href="/owner" className="hover:text-primary">Owner Dashboard</a></li>
            <li><a href="/bookings" className="hover:text-primary">My Bookings</a></li>
            <li><a href="/faq" className="hover:text-primary">FAQs</a></li>
          </ul>
        </div>

        {/* Newsletter + Socials */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">Stay Updated</h3>
          <p className="text-sm mb-3">
            Subscribe to get exclusive offers and travel tips directly to your inbox.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="border border-gray-400 placeholder-gray-500 focus:ring-2 ring-primary outline-none w-full max-w-64 h-9 rounded px-2"
            />
            <button className="bg-primary hover:bg-primary-dull text-white px-4 h-9 rounded transition-all">
              Subscribe
            </button>
          </div>
          <div className="flex items-center gap-4 mt-5">
            <a href="#" aria-label="Facebook"><Facebook className="w-5 h-5 hover:text-primary" /></a>
            <a href="#" aria-label="Instagram"><Instagram className="w-5 h-5 hover:text-primary" /></a>
            <a href="#" aria-label="Twitter"><Twitter className="w-5 h-5 hover:text-primary" /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-borderColor text-center text-sm py-4">
        © Copyright Saharsh Dudhyal. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
