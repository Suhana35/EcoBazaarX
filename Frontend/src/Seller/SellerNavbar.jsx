import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiShoppingCart, FiUser, FiMenu, FiX, FiHome, FiPackage, FiLogIn, FiUserPlus, FiLogOut, FiFileText } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";
import { useGlobal } from "../context/GlobalContext";

const SellerNavbar = () => {
  const { cartItems, currentUser, logoutUser } = useGlobal();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Calculate cart count safely
  const cartCount = cartItems?.reduce((sum, item) => sum + (item?.quantity || 1), 0) || 0;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleMobileNavClick = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser();
      setIsMobileMenuOpen(false);
      navigate('/home');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logoutUser, navigate]);

  // Navigation items
  const navItems = [
    { path: '/selDashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/selOrders', icon: FiFileText, label: 'Orders' }
  ];

  const isActiveRoute = (path) => {
    if (path === '/selDashboard') {
      return location.pathname === '/selDashboard' ;
    }
    return location.pathname === path;
  };

  return (
    <>
      <nav className={`bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#00b4d8] text-white shadow-2xl sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-lg bg-opacity-95' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center">
              <Link
                to="/selDashboard"
                className="flex items-center gap-2 font-bold text-xl md:text-2xl hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg px-2 py-1"
                aria-label="EcoBazaarX Home"
              >
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                  <FaLeaf className="text-green-300 text-lg" aria-hidden="true" />
                </div>
                <span className="bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                  EcoBazaarX
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                    isActiveRoute(path)
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'hover:bg-white/10'
                  }`}
                  aria-current={isActiveRoute(path) ? 'page' : undefined}
                >
                  <Icon className="text-lg" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Right Side - Desktop */}
            <div className="hidden md:flex items-center gap-4">
             

              {/* User Section */}
              {!currentUser ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 font-medium hover:scale-105 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Login to your account"
                  >
                    <FiLogIn className="text-sm" aria-hidden="true" />
                    <span>Login</span>
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="flex items-center gap-2 bg-white text-[#03045e] px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 font-medium hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    aria-label="Create a new account"
                  >
                    <FiUserPlus className="text-sm" aria-hidden="true" />
                    <span>Register</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate("/user")}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label={`User profile for ${currentUser.name}`}
                  >
                    <div className="bg-white/20 p-2 rounded-full">
                      <FiUser size={18} aria-hidden="true" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{currentUser.name}</span>
                      <span className="text-xs text-white/70 capitalize">{currentUser.role}</span>
                    </div>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                    aria-label="Logout from your account"
                  >
                    <FiLogOut className="text-sm" aria-hidden="true" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              {/* Mobile Cart */}
              <Link
                to="/cart"
                className="relative p-2 hover:bg-white/10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <FiShoppingCart size={20} aria-hidden="true" />
                {cartCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 bg-red-500 text-xs px-1.5 py-0.5 rounded-full font-bold text-[10px] min-w-[16px] text-center"
                    aria-label={`${cartCount} items`}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={toggleMobileMenu}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            id="mobile-menu"
            className={`md:hidden transition-all duration-300 ease-in-out ${
              isMobileMenuOpen 
                ? 'max-h-96 opacity-100' 
                : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <div className="bg-white/10 backdrop-blur-lg border-t border-white/20">
              <div className="px-4 py-6 space-y-2">
                {navItems.map(({ path, icon: Icon, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-white/50 ${
                      isActiveRoute(path)
                        ? 'bg-white/20 text-white'
                        : 'hover:bg-white/10'
                    }`}
                    onClick={handleMobileNavClick}
                    aria-current={isActiveRoute(path) ? 'page' : undefined}
                  >
                    <Icon className="text-lg" aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                ))}

                <div className="pt-4 border-t border-white/20">
                  {!currentUser ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          navigate("/login");
                          handleMobileNavClick();
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-3 rounded-lg hover:bg-white/30 transition-all duration-300 font-medium border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
                        <FiLogIn className="text-sm" aria-hidden="true" />
                        <span>Login</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/register");
                          handleMobileNavClick();
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-white text-[#03045e] px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                      >
                        <FiUserPlus className="text-sm" aria-hidden="true" />
                        <span>Register</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          navigate("/user");
                          handleMobileNavClick();
                        }}
                        className="w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
                        <FiUser size={20} aria-hidden="true" />
                        <span className="font-medium">Profile</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                      >
                        <FiLogOut className="text-sm" aria-hidden="true" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: .5;
            }
          }
        `}</style>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={handleMobileNavClick}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default SellerNavbar;
