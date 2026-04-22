import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiStar, FiShoppingCart, FiHeart, FiEye, FiFilter, FiGrid, FiList, FiTrendingUp, FiAward } from "react-icons/fi";
import { useGlobal } from "../context/GlobalContext";
import { FaLeaf } from "react-icons/fa";

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
  

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  // Add to cart handler with notification (like in ProductDetails)
  const handleAddToCart = (product, quantity = 1) => {
    const productWithQuantity = { ...product, quantity };
    addToCart(productWithQuantity);
    
    // Show success message
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.textContent = `Added ${quantity}x ${product.name} to cart!`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  let filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? p.type === categoryFilter : true;
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    const matchesEco = p.ecoScore >= ecoFilter;
    return matchesSearch && matchesCategory && matchesPrice && matchesEco;
  });

  if (sortBy === "priceLowHigh") filteredProducts.sort((a, b) => a.price - b.price);
  if (sortBy === "priceHighLow") filteredProducts.sort((a, b) => b.price - a.price);
  if (sortBy === "ecoScore") filteredProducts.sort((a, b) => b.ecoScore - a.ecoScore);
  if (sortBy === "footprint") filteredProducts.sort((a, b) => a.footprint - b.footprint);
  if (sortBy === "popularity") filteredProducts.sort((a, b) => (b.rating || 4) - (a.rating || 4));

  const featuredProducts = products.slice(0, 3);
  const categories = [...new Set(products.map(p => p.type))];

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
            {[1, 2, 3, 4, 5, 6].map(i => (
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🌿 EcoBazaarX
            </h1>
            <p className="text-xl mb-6 opacity-90">
              Sustainable fashion for a better tomorrow
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <FaLeaf className="text-green-300" />
                <span>Carbon Neutral Shipping</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <FiAward className="text-yellow-300" />
                <span>Certified Sustainable</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <FiTrendingUp className="text-blue-300" />
                <span>1M+ Happy Customers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl font-bold text-green-600">{products.length}</div>
            <div className="text-sm text-gray-600">Eco Products</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl font-bold text-purple-600">4.8★</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl font-bold text-orange-600">24h</div>
            <div className="text-sm text-gray-600">Fast Delivery</div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-[#03045e] mb-6 flex items-center gap-3">
            <FiTrendingUp className="text-orange-500 text-2xl" />
            Featured Products
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {featuredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                {/* Image Section */}
                <div className="relative overflow-hidden h-64 sm:h-72 md:h-80 lg:h-66">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 cursor-pointer"
                    onClick={() => navigate(`/productInfo/${p.id}`)}
                  />
                  {/* Featured Badge */}
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    FEATURED
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <h4
                    className="font-semibold text-lg text-gray-800 cursor-pointer hover:text-[#0077b6] transition-colors duration-200 line-clamp-2"
                    onClick={() => navigate(`/productInfo/${p.id}`)}
                  >
                    {p.name}
                  </h4>

                  <p className="text-xl font-bold text-orange-600">₹{p.price.toFixed(2)}</p>

                  <button
                    className="mt-auto w-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white px-4 py-3 rounded-xl hover:from-[#0077b6] hover:to-[#03045e] transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    onClick={() => handleAddToCart(p)}
                  >
                    <FiShoppingCart className="text-lg" />
                    Add to Cart
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
              <input
                type="text"
                placeholder="Search sustainable products..."
                className="w-full outline-none text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-[#00b4d8] text-white px-4 py-3 rounded-xl hover:bg-[#0077b6] transition-all duration-300"
            >
              <FiFilter />
              Filters
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-lg transition-all ${viewMode === "grid" ? "bg-[#00b4d8] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-lg transition-all ${viewMode === "list" ? "bg-[#00b4d8] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                <FiList />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
              <select
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-[#00b4d8] outline-none transition-colors"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                onChange={(e) => setSortBy(e.target.value)}
                className="border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-[#00b4d8] outline-none transition-colors"
              >
                <option value="">Sort By</option>
                <option value="priceLowHigh">Price: Low → High</option>
                <option value="priceHighLow">Price: High → Low</option>
                <option value="ecoScore">Best Eco Score</option>
                <option value="footprint">Lowest Carbon Footprint</option>
                <option value="popularity">Most Popular</option>
              </select>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</label>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-[#00b4d8]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Min Eco Score: {ecoFilter}</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={ecoFilter}
                  onChange={(e) => setEcoFilter(parseFloat(e.target.value))}
                  className="w-full accent-green-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing <span className="font-bold text-[#03045e]">{filteredProducts.length}</span> sustainable products
          </p>
          {searchTerm && (
            <p className="text-sm text-gray-500">
              Results for "<span className="font-medium">{searchTerm}</span>"
            </p>
          )}
        </div>

        {/* Products Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div key={p.id} className="group bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                <div className="relative overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-56 object-cover cursor-pointer group-hover:scale-110 transition-transform duration-500"
                    onClick={() => navigate(`/productInfo/${p.id}`)}
                  />

                  {/* Overlay Actions - Only Eye Icon */}
                  <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                      <button
                        onClick={() => navigate(`/productInfo/${p.id}`)}
                        className="bg-white text-gray-700 p-3 rounded-full hover:bg-[#00b4d8] hover:text-white transition-all duration-300 shadow-lg"
                      >
                        <FiEye />
                      </button>
                    </div>
                  </div>

                  {/* Eco Badge */}
                  {p.ecoScore >= 4 && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <FaLeaf className="text-xs" />
                      ECO CHOICE
                    </div>
                  )}

                  {/* Discount Badge */}
                  {p.originalPrice && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      -{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-3">
                    <h3
                      className="text-lg font-bold cursor-pointer hover:text-[#0077b6] transition-colors duration-300 line-clamp-2"
                      onClick={() => navigate(`/productInfo/${p.id}`)}
                    >
                      {p.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">{p.type}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-[#03045e]">₹{p.price.toFixed(2)}</span>
                      {p.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">₹{p.originalPrice.toFixed(2)}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Eco Score:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <FiStar
                              key={star}
                              className={`text-sm ${star <= p.ecoScore ? "text-green-500 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-green-600">{p.ecoScore}/5</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <span>🌍</span>
                      <span>{p.footprint} kg CO₂e footprint</span>
                    </div>
                  </div>

                  <button
                    className="w-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white px-4 py-3 rounded-xl hover:from-[#0077b6] hover:to-[#03045e] transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    onClick={() => handleAddToCart(p)}
                  >
                    <FiShoppingCart className="text-lg" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full md:w-48 h-48 object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => navigate(`/productInfo/${p.id}`)}
                />

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3
                        className="text-xl font-bold cursor-pointer hover:text-[#0077b6] transition-colors"
                        onClick={() => navigate(`/productInfo/${p.id}`)}
                      >
                        {p.name}
                      </h3>
                      <p className="text-gray-500 font-medium">{p.type}</p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(p.id)}
                      className={`p-2 rounded-full transition-all duration-300 ${favorites.has(p.id)
                          ? "bg-red-100 text-red-500"
                          : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500"
                        }`}
                    >
                      <FiHeart />
                    </button>
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
                      <p className="font-medium text-gray-700">{p.footprint} kg CO₂e</p>
                    </div>
                    <div>
                      <button
                        className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white px-6 py-2 rounded-xl hover:from-[#0077b6] hover:to-[#03045e] transition-all duration-300 flex items-center gap-2 font-medium shadow-lg"
                        onClick={() => handleAddToCart(p)}
                      >
                        <FiShoppingCart />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("");
                setSortBy("");
                setPriceRange([0, 10000]);
                setEcoFilter(0);
              }}
              className="bg-[#00b4d8] text-white px-6 py-3 rounded-xl hover:bg-[#0077b6] transition-all duration-300"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Sustainability Info Banner */}
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
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
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