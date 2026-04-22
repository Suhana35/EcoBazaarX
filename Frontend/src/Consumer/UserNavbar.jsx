import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiShoppingCart, FiUser, FiMenu, FiX,
  FiHome, FiPackage, FiLogIn, FiUserPlus, FiLogOut,
  FiInfo, FiHelpCircle, FiPhone, FiLock, FiBookOpen,
} from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";
import { useGlobal } from "../context/GlobalContext";

// Original top-nav items — unchanged
const navItems = [
  { path: "/home",   Icon: FiHome,    label: "Home" },
  { path: "/orders", Icon: FiPackage, label: "Orders" },
];

// Extra items only in the sidebar
const sidebarItems = [
  { path: "/my-carbon",    Icon: FaLeaf,       label: "My Carbon Footprint" },
  { path: "/about",        Icon: FiInfo,       label: "About" },
  { path: "/how-it-works", Icon: FiBookOpen,   label: "How It Works" },
  { path: "/faq",          Icon: FiHelpCircle, label: "FAQ" },
  { path: "/contact",      Icon: FiPhone,      label: "Contact" },
  { path: "/privacy",      Icon: FiLock,       label: "Privacy Policy" },
];

const Navbar = () => {
  const { cartItems, currentUser, logoutUser } = useGlobal();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled]   = useState(false);

  const cartCount = cartItems?.reduce((sum, item) => sum + (item?.quantity || 1), 0) || 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Lock body scroll & Escape key
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "unset";
    const onKey = (e) => { if (e.key === "Escape") setSidebarOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", onKey);
    };
  }, [sidebarOpen]);

  const closeSidebar  = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(v => !v), []);

  const handleLogout = useCallback(async () => {
    try { await logoutUser(); navigate("/home"); }
    catch (e) { console.error("Logout failed:", e); }
    finally { setSidebarOpen(false); }
  }, [logoutUser, navigate]);

  const isActiveRoute = (path) =>
    path === "/home"
      ? location.pathname === "/" || location.pathname === "/home"
      : location.pathname === path;

  return (
    <>
      {/* ── Top Navbar — exactly the original style ─────────────────────── */}
      <nav className={`bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#00b4d8] text-white shadow-2xl sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "backdrop-blur-lg bg-opacity-95" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Left: hamburger + logo */}
            <div className="flex items-center gap-2">
              {/* Hamburger */}
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Open sidebar menu"
              >
                <FiMenu size={22} />
              </button>

              {/* Logo — original */}
              <Link
                to="/home"
                className="flex items-center gap-2 font-bold text-xl md:text-2xl hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg px-2 py-1"
                aria-label="EcoBazaarX Home"
              >
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                  <FaLeaf className="text-green-300 text-lg" aria-hidden="true" />
                </div>
                <span className="bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">EcoBazaarX</span>
              </Link>
            </div>

            {/* Centre: original desktop nav links */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map(({ path, Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                    isActiveRoute(path) ? "bg-white/20 text-white shadow-lg" : "hover:bg-white/10"
                  }`}
                  aria-current={isActiveRoute(path) ? "page" : undefined}
                >
                  <Icon className="text-lg" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Right: cart + user — original */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/cart"
                className="relative p-3 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <FiShoppingCart size={22} aria-hidden="true" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-xs px-2 py-1 rounded-full font-bold shadow-lg min-w-[20px] text-center animate-pulse">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {!currentUser ? (
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate("/login")} className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 font-medium hover:scale-105 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50">
                    <FiLogIn className="text-sm" /><span>Login</span>
                  </button>
                  <button onClick={() => navigate("/register")} className="flex items-center gap-2 bg-white text-[#03045e] px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 font-medium hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
                    <FiUserPlus className="text-sm" /><span>Register</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button onClick={() => navigate("/user")} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50">
                    <div className="bg-white/20 p-2 rounded-full"><FiUser size={18} /></div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{currentUser.name}</span>
                      <span className="text-xs text-white/70 capitalize">{currentUser.role}</span>
                    </div>
                  </button>
                  <button onClick={handleLogout} className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-red-300">
                    <FiLogOut className="text-sm" /><span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile right — cart + hamburger (original) */}
            <div className="md:hidden flex items-center gap-3">
              <Link to="/cart" className="relative p-2 hover:bg-white/10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50">
                <FiShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-xs px-1.5 py-0.5 rounded-full font-bold text-[10px] min-w-[16px] text-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
              {/* On mobile the hamburger is already on the left; keep a user icon shortcut */}
              {currentUser && (
                <button onClick={() => navigate("/user")} className="p-2 hover:bg-white/10 rounded-full transition-all duration-300">
                  <FiUser size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Sidebar overlay ──────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ────────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col
          bg-gradient-to-b from-[#03045e] via-[#023e8a] to-[#0077b6]
          shadow-2xl transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/15">
          <div className="flex items-center gap-2">
            <FaLeaf className="text-green-300 text-lg" />
            <span className="font-bold text-white text-lg">EcoBazaarX</span>
          </div>
          <button onClick={closeSidebar} className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all" aria-label="Close sidebar">
            <FiX size={20} />
          </button>
        </div>

        {/* User info */}
        {currentUser && (
          <div
            className="mx-4 mt-4 p-3 rounded-xl bg-white/10 border border-white/15 flex items-center gap-3 cursor-pointer hover:bg-white/15 transition-all"
            onClick={() => { navigate("/user"); closeSidebar(); }}
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <FiUser size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{currentUser.name}</p>
              <p className="text-white/60 text-xs capitalize">{currentUser.role}</p>
            </div>
          </div>
        )}

        {/* Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold px-2 mb-3">Menu</p>
          {sidebarItems.map(({ path, Icon, label }) => (
            <Link
              key={path}
              to={path}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActiveRoute(path)
                  ? "bg-white/20 text-white shadow-md"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="text-base flex-shrink-0" />
              <span>{label}</span>
              {isActiveRoute(path) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-300" />}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/15 space-y-2">
          {!currentUser ? (
            <>
              <button onClick={() => { navigate("/login"); closeSidebar(); }} className="w-full flex items-center justify-center gap-2 bg-white/15 text-white px-4 py-3 rounded-xl hover:bg-white/25 transition-all font-medium text-sm border border-white/20">
                <FiLogIn size={16} /> Login
              </button>
              <button onClick={() => { navigate("/register"); closeSidebar(); }} className="w-full flex items-center justify-center gap-2 bg-white text-[#03045e] px-4 py-3 rounded-xl hover:bg-gray-100 transition-all font-medium text-sm shadow-lg">
                <FiUserPlus size={16} /> Register
              </button>
            </>
          ) : (
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/80 hover:bg-red-600 text-white px-4 py-3 rounded-xl transition-all font-medium text-sm shadow-lg">
              <FiLogOut size={16} /> Logout
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;