import React, { useState, useMemo, useEffect } from "react";
import { useGlobal } from "../context/GlobalContext";
import { 
  FiPackage, 
  FiShoppingBag, 
  FiTrendingUp, 
  FiEdit, 
  FiTrash2, 
  FiPlus,
  FiSearch,
  FiAlertTriangle,
  FiX
} from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";
import ProductModal from "./ProductModel";

const SellerDashboard = () => {
  const globalContext = useGlobal();
  
  // Safely destructure with defaults
  const { 
    currentUser, 
    products = [], 
    orders = []
  } = globalContext;

  // Check if required functions exist
  const deleteProduct = globalContext.deleteProduct || (() => Promise.resolve({ success: false, message: 'Delete function not available' }));
  const fetchProductsBySeller = globalContext.fetchProductsBySeller || (() => {});
  const fetchOrdersBySeller = globalContext.fetchOrdersBySeller || (() => {});
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [stockFilter, setStockFilter] = useState("all");

  // Modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Local error state
  const [error, setError] = useState(null);

  // Stock level categories - using stockQuantity field
  const getStockLevel = (stockQuantity) => {
    if (stockQuantity === 0) return 'out';
    if (stockQuantity <= 10) return 'low';
    if (stockQuantity <= 50) return 'medium';
    return 'high';
  };

  const getStockColor = (stockQuantity) => {
    const level = getStockLevel(stockQuantity);
    switch (level) {
      case 'out': return 'text-red-600 bg-red-100';
      case 'low': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStockText = (stockQuantity) => {
    const level = getStockLevel(stockQuantity);
    switch (level) {
      case 'out': return `Out of Stock (${stockQuantity})`;
      case 'low': return `Low Stock (${stockQuantity})`;
      case 'medium': return `Medium Stock (${stockQuantity})`;
      case 'high': return `In Stock (${stockQuantity})`;
      default: return `${stockQuantity} units`;
    }
  };

  // Load seller data on component mount
  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchProductsBySeller(currentUser.id);
      fetchOrdersBySeller(currentUser.id);
    }
  }, [currentUser]);

  // Calculate total revenue from orders with correct structure
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => {
      try {
        // Use totalAmount if available, otherwise calculate from orderItems
        if (order && order.totalAmount) {
          return sum + parseFloat(order.totalAmount);
        }
        
        // Fallback to calculating from orderItems
        if (order && order.orderItems && Array.isArray(order.orderItems)) {
          return sum + order.orderItems.reduce((itemSum, item) => {
            const subtotal = parseFloat(item?.subtotal) || 0;
            return itemSum + subtotal;
          }, 0);
        }
        
        return sum;
      } catch (err) {
        console.warn('Error calculating revenue for order:', order, err);
        return sum;
      }
    }, 0);
  }, [orders]);

  // Filter orders for seller's products
  const sellerOrders = useMemo(() => {
    if (!currentUser || !currentUser.id || !products.length) return [];
    
    const sellerProductIds = products.map(p => p.id);
    
    return orders.filter(order => {
      if (!order || !order.orderItems || !Array.isArray(order.orderItems)) return false;
      
      // Check if any order item contains seller's products
      return order.orderItems.some(item => 
        item && sellerProductIds.includes(item.productId)
      );
    });
  }, [orders, products, currentUser]);

  // Calculate seller-specific revenue
  const sellerRevenue = useMemo(() => {
    if (!currentUser || !currentUser.id || !products.length) return 0;
    
    const sellerProductIds = products.map(p => p.id);
    
    return orders.reduce((sum, order) => {
      if (!order || !order.orderItems || !Array.isArray(order.orderItems)) return sum;
      
      const sellerItemsTotal = order.orderItems.reduce((itemSum, item) => {
        if (item && sellerProductIds.includes(item.productId)) {
          return itemSum + (parseFloat(item?.subtotal) || 0);
        }
        return itemSum;
      }, 0);
      
      return sum + sellerItemsTotal;
    }, 0);
  }, [orders, products, currentUser]);

  // Get unique categories from products with safe handling
  const categories = useMemo(() => {
    try {
      const validProducts = products.filter(product => product && product.type);
      const uniqueCategories = [...new Set(validProducts.map(product => product.type))];
      return ["all", ...uniqueCategories];
    } catch (err) {
      console.warn('Error processing categories:', err);
      return ["all"];
    }
  }, [products]);

  // Filter and search products with safe handling
  const filteredProducts = useMemo(() => {
    try {
      const validProducts = products.filter(product => product && typeof product === 'object');
      
      let filtered = validProducts.filter(product => {
        const name = product.name || '';
        const type = product.type || '';
        const price = parseFloat(product.price) || 0;
        const stockQuantity = parseInt(product.stockQuantity) || 0;
        
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             type.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = selectedCategory === "all" || type === selectedCategory;
        
        const matchesPrice = (!priceRange.min || price >= parseInt(priceRange.min)) &&
                            (!priceRange.max || price <= parseInt(priceRange.max));
        
        // Stock filter logic using stockQuantity
        let matchesStock = true;
        if (stockFilter !== "all") {
          const stockLevel = getStockLevel(stockQuantity);
          matchesStock = stockLevel === stockFilter;
        }
        
        return matchesSearch && matchesCategory && matchesPrice && matchesStock;
      });

      filtered.sort((a, b) => {
        try {
          switch (sortBy) {
            case "name":
              return (a.name || '').localeCompare(b.name || '');
            case "price-low":
              return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
            case "price-high":
              return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
            case "eco-score":
              return (parseFloat(b.ecoScore) || 0) - (parseFloat(a.ecoScore) || 0);
            case "stock-low":
              return (parseInt(a.stockQuantity) || 0) - (parseInt(b.stockQuantity) || 0);
            case "stock-high":
              return (parseInt(b.stockQuantity) || 0) - (parseInt(a.stockQuantity) || 0);
            case "date":
              return new Date(b.date || 0) - new Date(a.date || 0);
            default:
              return 0;
          }
        } catch (err) {
          console.warn('Error sorting products:', err);
          return 0;
        }
      });

      return filtered;
    } catch (err) {
      console.warn('Error filtering products:', err);
      return [];
    }
  }, [products, searchTerm, selectedCategory, sortBy, priceRange, stockFilter]);

  // Stock statistics using stockQuantity with safe handling
  const stockStats = useMemo(() => {
    try {
      const validProducts = products.filter(product => product && typeof product === 'object');
      
      const outOfStock = validProducts.filter(p => (parseInt(p.stockQuantity) || 0) === 0).length;
      const lowStock = validProducts.filter(p => {
        const stock = parseInt(p.stockQuantity) || 0;
        return stock > 0 && stock <= 10;
      }).length;
      const mediumStock = validProducts.filter(p => {
        const stock = parseInt(p.stockQuantity) || 0;
        return stock > 10 && stock <= 50;
      }).length;
      const highStock = validProducts.filter(p => (parseInt(p.stockQuantity) || 0) > 50).length;
      
      return { outOfStock, lowStock, mediumStock, highStock };
    } catch (err) {
      console.warn('Error calculating stock stats:', err);
      return { outOfStock: 0, lowStock: 0, mediumStock: 0, highStock: 0 };
    }
  }, [products]);

  // Modal functions
  const openAddModal = () => {
    setEditingProduct(null);
    setIsEditMode(false);
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsEditMode(true);
    setShowProductModal(true);
  };

  const closeModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setIsEditMode(false);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("name");
    setPriceRange({ min: "", max: "" });
    setStockFilter("all");
  };

  const handleDeleteProduct = async (productId) => {
    if (!productId) {
      setError('Invalid product ID');
      return;
    }

    if (window.confirm("Are you sure you want to delete this product?")) {
      setError(null);
      try {
        const result = await deleteProduct(productId);
        console.log(result);
        if (result && result.success) {
          // Refresh products list
          if (currentUser && currentUser.id) {
            fetchProductsBySeller(currentUser.id);
          }
        } else {
          setError(result?.message || 'Failed to delete product');
        }
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('An error occurred while deleting the product');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-3">
            <FiAlertTriangle size={20} />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <FiX size={16} />
            </button>
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-sky-500 to-cyan-400 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                Welcome back, {currentUser?.name || "Seller"}
              </h1>
              <p className="text-sky-100 text-lg">Manage your eco-friendly store with smart analytics</p>
            </div>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <FiPlus className="text-xl" />
              <span className="font-semibold">Add New Product</span>
            </button>
          </div>
          <div className="absolute -bottom-4 -right-4 text-white/10">
            <FaLeaf className="text-6xl lg:text-8xl transform rotate-12" />
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-sky-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-sky-400 to-sky-500 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiPackage size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{products.length}</h2>
                <p className="text-gray-600 text-sm font-medium">Total Products</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-emerald-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiShoppingBag size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{sellerOrders.length}</h2>
                <p className="text-gray-600 text-sm font-medium">Your Orders</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-yellow-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-400 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiTrendingUp size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">₹{sellerRevenue.toLocaleString()}</h2>
                <p className="text-gray-600 text-sm font-medium">Your Revenue</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-red-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-400 to-red-500 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiAlertTriangle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{stockStats.outOfStock + stockStats.lowStock}</h2>
                <p className="text-gray-600 text-sm font-medium">Low/Out Stock</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Overview */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-sky-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Stock Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="text-2xl font-bold text-red-600">{stockStats.outOfStock}</div>
              <div className="text-sm text-red-600 font-medium">Out of Stock</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">{stockStats.lowStock}</div>
              <div className="text-sm text-orange-600 font-medium">Low Stock</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <div className="text-2xl font-bold text-yellow-600">{stockStats.mediumStock}</div>
              <div className="text-sm text-yellow-600 font-medium">Medium Stock</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="text-2xl font-bold text-green-600">{stockStats.highStock}</div>
              <div className="text-sm text-green-600 font-medium">In Stock</div>
            </div>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-sky-100">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-gray-700 bg-gray-50"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-gray-700 bg-gray-50 min-w-[150px]"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-gray-700 bg-gray-50 min-w-[150px]"
            >
              <option value="all">All Stock Levels</option>
              <option value="out">Out of Stock</option>
              <option value="low">Low Stock</option>
              <option value="medium">Medium Stock</option>
              <option value="high">In Stock</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-gray-700 bg-gray-50 min-w-[150px]"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock-low">Stock: Low to High</option>
              <option value="stock-high">Stock: High to Low</option>
              <option value="eco-score">Eco Score</option>
              <option value="date">Date Added</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium">Price Range:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-20 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-20 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm"
                />
              </div>
            </div>
            
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sky-600 hover:text-sky-700 font-medium transition-colors duration-200"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-3xl shadow-lg border border-sky-100 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-sky-50 to-cyan-50 border-b border-sky-100">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Your Products</h2>
              <span className="px-4 py-2 bg-sky-100 text-sky-700 rounded-full font-medium">
                {filteredProducts.length} products
              </span>
            </div>
          </div>

          <div className="p-6">
            {filteredProducts.length > 0 ? (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group flex items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-sky-200"
                  >
                    <div className="relative overflow-hidden rounded-xl">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-24 h-24 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                        <FaLeaf className="text-green-500 text-xs" />
                        <span className="text-xs font-semibold text-gray-700">{product.ecoScore || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                      <div className="lg:col-span-2">
                        <h3 className="font-bold text-gray-800 mb-2 text-lg leading-tight">{product.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                            {product.type}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-center lg:text-left">
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <span className="text-sm font-medium">Price</span>
                        </div>
                        <div className="text-xl font-bold text-gray-800">₹{(product.price || 0).toLocaleString()}</div>
                      </div>

                      <div className="text-center lg:text-left">
                        <div className="flex items-center gap-1 text-gray-600 mb-1 justify-center lg:justify-start">
                          <FiPackage className="text-blue-500" size={16} />
                          <span className="text-sm font-medium">Stock</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStockColor(product.stockQuantity || 0)}`}>
                          {getStockText(product.stockQuantity || 0)}
                        </div>
                      </div>
                      
                      <div className="text-center lg:text-left">
                        <div className="flex items-center gap-1 text-gray-600 mb-1 justify-center lg:justify-start">
                          <FaLeaf className="text-green-500" size={16} />
                          <span className="text-sm font-medium">Eco Score</span>
                        </div>
                        <div className="flex items-center gap-1 justify-center lg:justify-start">
                          <span className="text-xl font-bold text-green-600">{product.ecoScore || 'N/A'}</span>
                          <span className="text-sm text-gray-500">/5.0</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 justify-center lg:justify-end">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all duration-200 hover:scale-105"
                        >
                          <FiEdit size={16} />
                          <span className="font-medium">Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200 hover:scale-105"
                        >
                          <FiTrash2 size={16} />
                          <span className="font-medium">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <FiPackage size={40} className="text-sky-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  onClick={openAddModal}
                  className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Add Your First Product
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={showProductModal}
        onClose={closeModal}
        product={editingProduct}
        isEditMode={isEditMode}
      />
    </div>
  );
};

export default SellerDashboard;