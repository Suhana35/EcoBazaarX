import React from "react";
import { FiSearch, FiShoppingCart, FiPackage, FiTrendingUp, FiArrowRight, FiCheck } from "react-icons/fi";
import { FaLeaf, FaRecycle, FaUserCheck, FaStore, FaSeedling } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const buyerSteps = [
  {
    step: "01", icon: FiSearch, title: "Discover Eco Products",
    desc: "Browse thousands of verified sustainable products. Every listing shows an EcoScore (0–5) and exact carbon footprint so you can compare options at a glance.",
    color: "from-blue-500 to-cyan-500", tip: "Use filters to sort by EcoScore or footprint",
  },
  {
    step: "02", icon: FiShoppingCart, title: "Shop with Confidence",
    desc: "Add items to your cart or buy instantly. All eco claims are verified by our sustainability team. Transparent pricing with no hidden fees.",
    color: "from-green-500 to-teal-500", tip: "Guest cart saves automatically — merges on login",
  },
  {
    step: "03", icon: FiPackage, title: "Receive & Track",
    desc: "Track your order status in real time from your Order History page. Orders move through Processing → Confirmed → Shipped → Delivered. You can also cancel an order if it's still in Processing or Shipped status.",
    color: "from-purple-500 to-indigo-500", tip: "Tracking number assigned to every order",
  },
  {
    step: "04", icon: FiTrendingUp, title: "Track Your Impact",
    desc: "Your Order History page shows the cumulative CO₂ footprint of all your purchases — see the real environmental impact of your choices over time.",
    color: "from-orange-500 to-pink-500", tip: "Every purchase logged with carbon data",
  },
];

const sellerSteps = [
  { step: "01", icon: FaStore,     title: "Register as a Seller",  color: "from-[#0077b6] to-[#00b4d8]",   desc: "Create a seller account and complete your business profile. You'll need basic business details and documentation for your eco claims." },
  { step: "02", icon: FaUserCheck, title: "Access Your Seller Dashboard",  color: "from-green-500 to-emerald-600",  desc: "Once registered as a seller, you immediately get access to the Seller Dashboard (/selDashboard). From here you can add products, manage your listings, set stock quantities, and update product status." },
  { step: "03", icon: FaLeaf,      title: "List Your Products",     color: "from-purple-500 to-pink-500",    desc: "Use the Seller Dashboard to add products with all details: name, type, price, description, Eco Score (0–5), materialCO2, shippingCO2, and stock quantity. Products go live immediately for consumers to browse and purchase." },
  { step: "04", icon: FiTrendingUp,title: "Fulfil Orders & Grow",     color: "from-orange-400 to-red-500",     desc: "Manage incoming orders from the Seller Orders page (/selOrders). Update order status from Processing → Confirmed → Shipped → Delivered. Keep stock updated and maintain accurate eco data to attract more eco-conscious buyers." },
];

const features = [
  { icon: FaLeaf,    title: "EcoScore System",    desc: "Standardised 0–5 rating across all product types" },
  { icon: FaRecycle, title: "Carbon Tracking",    desc: "Per-product CO₂ data (material + shipping) shown to every shopper" },
  { icon: FiCheck,   title: "Role-Based Access",  desc: "Consumers, sellers, and admins each get tailored dashboards" },
  { icon: FaSeedling,title: "Carbon Insights",    desc: "Platform-wide emissions analytics available to admins" },
];

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 pointer-events-none blur-3xl" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 text-sm font-medium mb-5 backdrop-blur-sm">
            <FaSeedling className="text-green-300" />
            Simple. Transparent. Sustainable.
          </div>
          <h1 className="text-5xl font-extrabold mb-5">How EcoBazaarX Works</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Whether you're here to shop consciously or to sell sustainable products,
            we've made it straightforward. Here's how it all works.
          </p>
        </div>
      </section>

      {/* Buyer Journey */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">For Shoppers</span>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Shop in 4 easy steps</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Everything you need to make sustainable choices with full transparency.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {buyerSteps.map((s, i) => (
            <div key={s.step} className="relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              {i < buyerSteps.length - 1 && (
                <FiArrowRight className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-7 h-7 z-10" />
              )}
              <div className={`inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} items-center justify-center mb-4 shadow-lg`}>
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">{s.step}</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
              <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-500 flex items-center gap-1.5">
                <FiCheck className="text-green-500 flex-shrink-0" />
                {s.tip}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button onClick={() => navigate("/home")} className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            Start Shopping <FiArrowRight />
          </button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      {/* Seller Journey */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <span className="inline-block bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">For Sellers</span>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Sell sustainably in 4 steps</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Join 340+ verified sellers reaching thousands of eco-conscious shoppers.</p>
        </div>
        <div className="space-y-5">
          {sellerSteps.map((s) => (
            <div key={s.step} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6">
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                  <s.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Step {s.step}</span>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
                <div className="flex-shrink-0 text-gray-200 hidden md:block">
                  <span className="text-6xl font-black">{s.step}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button onClick={() => navigate("/register")} className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            Become a Seller <FiArrowRight />
          </button>
        </div>
      </section>

      {/* Platform Features */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] rounded-3xl p-10 text-white">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold mb-2">Built for sustainability</h2>
            <p className="text-white/75 max-w-lg mx-auto">Features that make EcoBazaarX different from every other marketplace.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 hover:bg-white/20 transition-all duration-300">
                <f.icon className="w-8 h-8 text-green-300 mb-3" />
                <h3 className="font-bold text-white mb-1">{f.title}</h3>
                <p className="text-white/70 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;