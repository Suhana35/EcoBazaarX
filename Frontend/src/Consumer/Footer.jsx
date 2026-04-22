import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLeaf } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#03045e] text-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid sm:grid-cols-2 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <FaLeaf className="text-green-400 w-5 h-5" />
            <h4 className="font-bold text-xl bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
              EcoBazaarX
            </h4>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Sustainable shopping made simple. Track carbon footprint, eco score,
            and shop responsibly 🌱
          </p>
          <div className="flex gap-4 mt-4">
            <FaFacebook  className="hover:text-[#90e0ef] cursor-pointer transition-colors" size={18} />
            <FaTwitter   className="hover:text-[#90e0ef] cursor-pointer transition-colors" size={18} />
            <FaInstagram className="hover:text-[#90e0ef] cursor-pointer transition-colors" size={18} />
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-bold text-base mb-3 text-white">Shop</h4>
          <ul className="text-sm space-y-2">
            <li><Link to="/home"     className="text-gray-300 hover:text-[#90e0ef] transition-colors">Browse Products</Link></li>
            <li><Link to="/cart"     className="text-gray-300 hover:text-[#90e0ef] transition-colors">My Cart</Link></li>
            <li><Link to="/orders"   className="text-gray-300 hover:text-[#90e0ef] transition-colors">Order History</Link></li>
            <li><Link to="/register" className="text-gray-300 hover:text-[#90e0ef] transition-colors">Become a Seller</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-bold text-base mb-3 text-white">Company</h4>
          <ul className="text-sm space-y-2">
            <li><Link to="/about"        className="text-gray-300 hover:text-[#90e0ef] transition-colors">About Us</Link></li>
            <li><Link to="/how-it-works" className="text-gray-300 hover:text-[#90e0ef] transition-colors">How It Works</Link></li>
            <li><Link to="/contact"      className="text-gray-300 hover:text-[#90e0ef] transition-colors">Contact Us</Link></li>
            <li><Link to="/faq"          className="text-gray-300 hover:text-[#90e0ef] transition-colors">FAQ</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-bold text-base mb-3 text-white">Legal</h4>
          <ul className="text-sm space-y-2">
            <li><Link to="/privacy"  className="text-gray-300 hover:text-[#90e0ef] transition-colors">Privacy Policy</Link></li>
            <li><a href="#" className="text-gray-300 hover:text-[#90e0ef] transition-colors">Terms & Conditions</a></li>
            <li><a href="#" className="text-gray-300 hover:text-[#90e0ef] transition-colors">Return Policy</a></li>
            <li><a href="#" className="text-gray-300 hover:text-[#90e0ef] transition-colors">Shipping Policy</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-[#0077b6]/30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-300">
          <span>© {new Date().getFullYear()} EcoBazaarX. All Rights Reserved.</span>
          <span className="flex items-center gap-1.5">
            <FaLeaf className="text-green-400" />
            1% of revenue goes to reforestation & carbon-offset programs
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;