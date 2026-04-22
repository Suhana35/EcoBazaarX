import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiStar, FiShoppingCart, FiHeart, FiEye, FiFilter, FiGrid, FiList, FiTrendingUp, FiAward, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useGlobal } from "../context/GlobalContext";
import { FaLeaf } from "react-icons/fa";

// ─── Pagination Component ──────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-gray-200">
      {/* Info */}
      <p className="text-sm text-gray-500">
        Showing <span className="font-semibold text-[#03045e]">{startItem}–{endItem}</span> of{" "}
        <span className="font-semibold text-[#03045e]">{totalItems}</span> products
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-[#00b4d8] hover:text-white text-gray-600 bg-white border border-gray-200 shadow-sm"
        >
          <FiChevronLeft className="text-base" />
          Prev
        </button>

        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-400 text-sm select-none">…</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 border shadow-sm
                  ${currentPage === page
                    ? "bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white border-transparent shadow-md scale-105"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-[#e0f7fa] hover:text-[#0077b6]"
                  }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-[#00b4d8] hover:text-white text-gray-600 bg-white border border-gray-200 shadow-sm"
        >
          Next
          <FiChevronRight className="text-base" />
        </button>
      </div>

      {/* Items per page */}
      <select
        onChange={(e) => onPageChange(1, parseInt(e.target.value))}
        defaultValue={itemsPerPage}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700
          focus:outline-none focus:border-[#00b4d8] shadow-sm cursor-pointer"
      >
        {[8, 12, 24, 48].map((n) => (
          <option key={n} value={n}>{n} per page</option>
        ))}
      </select>
    </div>
  );
};

// ─── Main Home Component ───────────────────────────────────────────────────────
const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { products, addToCart } = useGlobal();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [ecoFilter, setEcoFilter] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, sortBy, priceRange, ecoFilter]);

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) newFavorites.delete(productId);
    else newFavorites.add(productId);
    setFavorites(newFavorites);
  };

  const handleAddToCart = (product, quantity = 1) => {
    addToCart({ ...product, quantity });
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300";
    notification.textContent = `Added ${quantity}x ${product.name} to cart!`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  // Filtered + sorted products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter ? p.type === categoryFilter : true;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchesEco = p.ecoScore >= ecoFilter;
      return matchesSearch && matchesCategory && matchesPrice && matchesEco;
    });
    if (sortBy === "priceLowHigh") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "priceHighLow") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "ecoScore") result.sort((a, b) => b.ecoScore - a.ecoScore);
    else if (sortBy === "footprint") result.sort((a, b) => {
      // Null-safe: if footprint is missing, fall back to materialCO2 + shippingCO2
      const fa = a.footprint ?? ((a.materialCO2 || 0) + (a.shippingCO2 || 0));
      const fb = b.footprint ?? ((b.materialCO2 || 0) + (b.shippingCO2 || 0));
      return fa - fb;
    });
    else if (sortBy === "popularity") result.sort((a, b) => (b.rating || 4) - (a.rating || 4));
    return result;
  }, [products, searchTerm, categoryFilter, sortBy, priceRange, ecoFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page, newItemsPerPage) => {
    if (newItemsPerPage !== undefined) {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1);
    } else {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const featuredProducts = products.slice(0, 3);
  const categories = [...new Set(products.map((p) => p.type))];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="bg-white shadow-md rounded-lg p-4 mb-6">
            <div className="flex gap-4">
              <div className="h-10 bg-gray-300 rounded flex-1"></div>
              <div className="h-10 bg-gray-300 rounded w-32"></div>
              <div className="h-10 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white shadow-lg rounded-lg p-4">
                <div className="h-48 bg-gray-300 rounded-md mb-3"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50">
      <div className="max-w-7xl mx-auto p-6">

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#00b4d8] text-white rounded-2xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">🌿 EcoBazaarX</h1>
            <p className="text-xl mb-6 opacity-90">Sustainable fashion for a better tomorrow</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <FaLeaf className="text-green-300" /><span>Carbon Neutral Shipping</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <FiAward className="text-yellow-300" /><span>Certified Sustainable</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <FiTrendingUp className="text-blue-300" /><span>1M+ Happy Customers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { value: products.length, label: "Eco Products", color: "text-green-600" },
            { value: categories.length, label: "Categories", color: "text-blue-600" },
            { value: "4.8★", label: "Avg Rating", color: "text-purple-600" },
            { value: "24h", label: "Fast Delivery", color: "text-orange-600" },
          ].map(({ value, label, color }) => (
            <div key={label} className="bg-white rounded-xl p-4 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-sm text-gray-600">{label}</div>
            </div>
          ))}
        </div>

        {/* Featured Products */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-[#03045e] mb-6 flex items-center gap-3">
            <FiTrendingUp className="text-orange-500 text-2xl" />
            Featured Products
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {featuredProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300 flex flex-col">
                <div className="relative overflow-hidden h-64 sm:h-72 md:h-80">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 cursor-pointer" onClick={() => navigate(`/productInfo/${p.id}`)} />
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">FEATURED</div>
                </div>
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <h4 className="font-semibold text-lg text-gray-800 cursor-pointer hover:text-[#0077b6] transition-colors duration-200 line-clamp-2" onClick={() => navigate(`/productInfo/${p.id}`)}>{p.name}</h4>
                  <p className="text-xl font-bold text-orange-600">₹{p.price.toFixed(2)}</p>
                  <button className="mt-auto w-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white px-4 py-3 rounded-xl hover:from-[#0077b6] hover:to-[#03045e] transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1" onClick={() => handleAddToCart(p)}>
                    <FiShoppingCart className="text-lg" />Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow-xl rounded-2xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 w-full sm:w-1/2 focus-within:border-[#00b4d8] transition-colors">
              <FiSearch className="text-gray-400 mr-3 text-lg" />
              <input type="text" placeholder="Search sustainable products..." className="w-full outline-none text-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 bg-[#00b4d8] text-white px-4 py-3 rounded-xl hover:bg-[#0077b6] transition-all duration-300">
              <FiFilter />Filters
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => setViewMode("grid")} className={`p-3 rounded-lg transition-all ${viewMode === "grid" ? "bg-[#00b4d8] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}><FiGrid /></button>
              <button onClick={() => setViewMode("list")} className={`p-3 rounded-lg transition-all ${viewMode === "list" ? "bg-[#00b4d8] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}><FiList /></button>
            </div>
          </div>

          {showFilters && (
            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
              <select onChange={(e) => setCategoryFilter(e.target.value)} className="border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-[#00b4d8] outline-none transition-colors">
                <option value="">All Categories</option>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <select onChange={(e) => setSortBy(e.target.value)} className="border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-[#00b4d8] outline-none transition-colors">
                <option value="">Sort By</option>
                <option value="priceLowHigh">Price: Low → High</option>
                <option value="priceHighLow">Price: High → Low</option>
                <option value="ecoScore">Best Eco Score</option>
                <option value="footprint">Lowest Carbon Footprint</option>
                <option value="popularity">Most Popular</option>
              </select>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</label>
                <input type="range" min="0" max="100000" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])} className="w-full accent-[#00b4d8]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Min Eco Score: {ecoFilter}</label>
                <input type="range" min="0" max="5" step="0.5" value={ecoFilter} onChange={(e) => setEcoFilter(parseFloat(e.target.value))} className="w-full accent-green-500" />
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing <span className="font-bold text-[#03045e]">{filteredProducts.length}</span> sustainable products
            {totalPages > 1 && (
              <span className="text-gray-400 ml-2 text-sm">— page {currentPage} of {totalPages}</span>
            )}
          </p>
          {searchTerm && (
            <p className="text-sm text-gray-500">Results for "<span className="font-medium">{searchTerm}</span>"</p>
          )}
        </div>

        {/* Products Grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((p) => (
              <div key={p.id} className="group bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                <div className="relative overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-56 object-cover cursor-pointer group-hover:scale-110 transition-transform duration-500" onClick={() => navigate(`/productInfo/${p.id}`)} />
                  <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                      <button onClick={() => navigate(`/productInfo/${p.id}`)} className="bg-white text-gray-700 p-3 rounded-full hover:bg-[#00b4d8] hover:text-white transition-all duration-300 shadow-lg"><FiEye /></button>
                    </div>
                  </div>
                  {p.ecoScore >= 4 && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <FaLeaf className="text-xs" />ECO CHOICE
                    </div>
                  )}
                  {p.originalPrice && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      -{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold cursor-pointer hover:text-[#0077b6] transition-colors duration-300 line-clamp-2" onClick={() => navigate(`/productInfo/${p.id}`)}>{p.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{p.type}</p>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-[#03045e]">₹{p.price.toFixed(2)}</span>
                      {p.originalPrice && <span className="text-sm text-gray-400 line-through">₹{p.originalPrice.toFixed(2)}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">Eco Score:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar key={star} className={`text-sm ${star <= p.ecoScore ? "text-green-500 fill-current" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-green-600">{p.ecoScore}/5</span>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <span>🌍</span><span>{(p.footprint ?? ((p.materialCO2 || 0) + (p.shippingCO2 || 0))).toFixed(1)} kg CO₂e footprint</span>
                    </div>
                  </div>
                  <button className="w-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white px-4 py-3 rounded-xl hover:from-[#0077b6] hover:to-[#03045e] transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1" onClick={() => handleAddToCart(p)}>
                    <FiShoppingCart className="text-lg" />Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {paginatedProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                <img src={p.image} alt={p.name} className="w-full md:w-48 h-48 object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => navigate(`/productInfo/${p.id}`)} />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold cursor-pointer hover:text-[#0077b6] transition-colors" onClick={() => navigate(`/productInfo/${p.id}`)}>{p.name}</h3>
                      <p className="text-gray-500 font-medium">{p.type}</p>
                    </div>
                    <button onClick={() => toggleFavorite(p.id)} className={`p-2 rounded-full transition-all duration-300 ${favorites.has(p.id) ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500"}`}><FiHeart /></button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Price</span>
                      <p className="text-xl font-bold text-[#03045e]">₹{p.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Eco Score</span>
                      <div className="flex items-center gap-1">
                        <FiStar className="text-green-500 fill-current" />
                        <span className="font-bold text-green-600">{p.ecoScore}/5</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Carbon Footprint</span>
                      <p className="font-medium text-gray-700">{(p.footprint ?? ((p.materialCO2 || 0) + (p.shippingCO2 || 0))).toFixed(1)} kg CO₂e</p>
                    </div>
                    <div>
                      <button className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white px-6 py-2 rounded-xl hover:from-[#0077b6] hover:to-[#03045e] transition-all duration-300 flex items-center gap-2 font-medium shadow-lg" onClick={() => handleAddToCart(p)}>
                        <FiShoppingCart />Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {filteredProducts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
          />
        )}

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
            <button onClick={() => { setSearchTerm(""); setCategoryFilter(""); setSortBy(""); setPriceRange([0, 100000]); setEcoFilter(0); }} className="bg-[#00b4d8] text-white px-6 py-3 rounded-xl hover:bg-[#0077b6] transition-all duration-300">
              Clear All Filters
            </button>
          </div>
        )}

        {/* Sustainability Banner */}
        <div className="mt-12 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-[#03045e] mb-4">🌱 Why Choose Sustainable Fashion?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">🌍</div>
              <h4 className="font-bold mb-1">Reduce Environmental Impact</h4>
              <p className="text-gray-600">Lower carbon footprint and sustainable materials</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">👥</div>
              <h4 className="font-bold mb-1">Support Fair Trade</h4>
              <p className="text-gray-600">Ethical manufacturing and fair wages</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">💎</div>
              <h4 className="font-bold mb-1">Premium Quality</h4>
              <p className="text-gray-600">Durable, long-lasting fashion pieces</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Home;