import React from "react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#03045e] text-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* About */}
        <div>
          <h4 className="font-bold text-lg mb-2">EcoBazaarX</h4>
          <p className="text-sm text-gray-300">
            Sustainable shopping made simple. Track carbon footprint, eco score,
            and shop responsibly 🌱
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-bold text-lg mb-2">Quick Links</h4>
          <ul className="text-sm space-y-1">
            <li><a href="/home" className="hover:text-[#90e0ef]">Home</a></li>
            <li><a href="/orders" className="hover:text-[#90e0ef]">Orders</a></li>
            <li><a href="/cart" className="hover:text-[#90e0ef]">Cart</a></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-bold text-lg mb-2">Follow Us</h4>
          <div className="flex gap-4">
            <FaFacebook className="hover:text-[#90e0ef] cursor-pointer" size={20} />
            <FaTwitter className="hover:text-[#90e0ef] cursor-pointer" size={20} />
            <FaInstagram className="hover:text-[#90e0ef] cursor-pointer" size={20} />
          </div>
        </div>
      </div>

      <div className="bg-[#0077b6] text-center py-3 text-sm">
        © {new Date().getFullYear()} EcoBazaarX. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
