import React, { useState, useEffect } from "react";
import { FaLeaf, FaRecycle, FaShieldAlt, FaChartBar, FaSeedling, FaStar } from "react-icons/fa";
import { FiArrowRight, FiUsers, FiPackage, FiTrendingUp, FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Products Listed",  value: "50+",  icon: FiPackage,      color: "from-blue-500 to-cyan-500" },
  { label: "Registered Users", value: "30+",  icon: FiUsers,        color: "from-green-500 to-teal-500" },
  { label: "Orders Placed",    value: "100+", icon: FiShoppingCart, color: "from-emerald-500 to-green-600" },
  { label: "Active Sellers",   value: "10+",  icon: FiTrendingUp,   color: "from-purple-500 to-indigo-500" },
];

const values = [
  {
    icon: FaLeaf,
    title: "Eco Score on Every Product",
    color: "bg-green-100 text-green-700",
    desc: "Every product carries an Eco Score from 0 to 5. Shoppers can filter and sort by this score so the greenest option is always the easiest to find.",
  },
  {
    icon: FaRecycle,
    title: "Carbon Footprint Transparency",
    color: "bg-blue-100 text-blue-700",
    desc: "Each product displays its exact carbon footprint — split into material CO₂ and shipping CO₂. No hidden numbers, no greenwashing.",
  },
  {
    icon: FaShieldAlt,
    title: "Role-Based Access",
    color: "bg-purple-100 text-purple-700",
    desc: "Consumers shop, sellers manage their listings and orders, and admins oversee the entire platform — each with their own tailored dashboard.",
  },
  {
    icon: FaChartBar,
    title: "Carbon Insights Dashboard",
    color: "bg-teal-100 text-teal-700",
    desc: "Admins get a dedicated analytics dashboard showing platform-wide CO₂ totals, emissions by product category, monthly trends, and top eco-friendly products.",
  },
];

const team = [
  { name: "Full Stack Developer",  role: "Auth, Orders & Cart APIs",         emoji: "⚙️", bg: "from-blue-400 to-cyan-500" },
  { name: "Backend Developer",     role: "Products, Analytics & Security",   emoji: "🛠️", bg: "from-green-400 to-teal-500" },
  { name: "Frontend Developer",    role: "Consumer & Seller UI",             emoji: "🎨", bg: "from-purple-400 to-indigo-500" },
  { name: "UI/UX & Integration",   role: "Admin Dashboard & Chatbot",        emoji: "🌿", bg: "from-emerald-400 to-green-600" },
];

const About = () => {
  const navigate = useNavigate();
  const [visibleStats, setVisibleStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisibleStats(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] text-white py-24 px-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-300/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 text-sm font-medium mb-6 backdrop-blur-sm">
            <FaSeedling className="text-green-300" />
            About This Project
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Shopping that heals
            <span className="block bg-gradient-to-r from-green-300 to-cyan-200 bg-clip-text text-transparent">
              the planet 🌍
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-10">
            EcoBazaarX is a full-stack eco-friendly marketplace built as a student project.
            It connects consumers with sustainable sellers, tracks the carbon footprint of
            every product, and gives admins deep environmental insights.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="inline-flex items-center gap-2 bg-white text-[#03045e] font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            Browse Products <FiArrowRight />
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 -mt-12 mb-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`bg-white rounded-2xl shadow-xl p-6 text-center transition-all duration-700 ${
                visibleStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${s.color} mb-3`}>
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="bg-gradient-to-br from-[#03045e] to-[#0077b6] p-10 text-white flex flex-col justify-center">
              <span className="text-green-300 font-semibold uppercase tracking-widest text-xs mb-4">What We Built</span>
              <h2 className="text-3xl font-bold mb-4 leading-snug">
                A platform that makes the eco-friendly choice the obvious choice.
              </h2>
              <p className="text-white/75 leading-relaxed">
                Every product on EcoBazaarX shows its Eco Score and exact carbon footprint —
                split into material and shipping emissions — so shoppers can compare products
                on environmental impact, not just price.
              </p>
            </div>
            <div className="p-10 flex flex-col justify-center">
              <span className="text-[#0077b6] font-semibold uppercase tracking-widest text-xs mb-4">How It Works</span>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-snug">
                Three roles. One platform. Full transparency.
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Consumers browse, filter by eco score, add to cart, and track orders.
                Sellers manage product listings and fulfil orders through their dashboard.
                Admins monitor the platform, manage users, and view carbon analytics — all
                from a single, role-aware interface.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Key Features</h2>
          <p className="text-gray-500 max-w-xl mx-auto">The four pillars that make EcoBazaarX different from a standard marketplace.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div key={v.title} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className={`inline-flex p-3 rounded-xl ${v.color} mb-4`}>
                <v.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{v.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">The Team</h2>
          <p className="text-gray-500">Built by students, for a greener tomorrow.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {team.map((m) => (
            <div key={m.role} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${m.bg} text-3xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                {m.emoji}
              </div>
              <h3 className="font-bold text-gray-900 text-sm">{m.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 mb-20">
        <div className="bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#00b4d8] rounded-3xl p-12 text-center text-white shadow-2xl">
          <FaStar className="text-yellow-300 w-10 h-10 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold mb-3">Try EcoBazaarX</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Browse eco-friendly products, track your carbon footprint, and shop sustainably.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/home")}
              className="bg-white text-[#03045e] font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
            >
              Browse Products
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;