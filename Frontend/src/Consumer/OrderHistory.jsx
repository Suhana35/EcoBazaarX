import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobal } from "../context/GlobalContext";

const OrderHistory = () => {
  const { orders, fetchOrders, currentUser, updateOrderStatus, cancelOrder } = useGlobal();
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadOrders();
    }
  }, [currentUser]);
  
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      await fetchOrders();
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const navigate = useNavigate();

  

  // Handle status change with confirmation
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setStatusUpdateError(null);
    setSuccessMessage(null);

    try {
      let result;
      
      if (newStatus === "cancelled") {
        result = await cancelOrder(orderId);
      } else {
        result = await updateOrderStatus(orderId, newStatus);
      }

      if (result.success) {
        setSuccessMessage(`Order status updated to ${newStatus}`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setStatusUpdateError(result.message || "Failed to update order status");
      }
    } catch (error) {
      setStatusUpdateError("An error occurred while updating the order");
      console.error("Status update error:", error.response?.data);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const transformedOrders = (orders || []).map(order => {
    const orderItems = order.orderItems || [];
    const firstItem = orderItems[0] || {};
    
    return {
      id: order.id,
      name: orderItems.length > 1 
        ? `Order #${order.id} (${orderItems.length} items)`
        : firstItem.productName || `Order #${order.id}`,
      image: firstItem.productImage || '/placeholder-image.jpg',
      price: order.totalAmount || 0,
      quantity: orderItems.reduce((total, item) => total + (item.quantity || 0), 0),
      status: order.status,
      date: order.orderDate,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      shippedDate: order.shippedDate,
      deliveredDate: order.deliveredDate,
      ecoScore: order.totalEcoScore || 0,
      materialCO2: orderItems.reduce((total, item) => total + (item.materialCO2 || 0), 0),
      shippingCO2: orderItems.reduce((total, item) => total + (item.shippingCO2 || 0), 0),
      totalCO2: order.totalCO2Footprint || 0,
      orderItems: orderItems
    };
  });

  const displayOrders = transformedOrders;

  const statusConfig = {
    processing: {
      label: "Processing",
      color: "bg-gradient-to-r from-yellow-500 to-orange-500",
      icon: "⚡"
    },
    shipped: {
      label: "Shipped",
      color: "bg-gradient-to-r from-blue-500 to-indigo-500",
      icon: "🚚"
    },
    delivered: {
      label: "Delivered",
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
      icon: "✅"
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-gradient-to-r from-red-500 to-pink-500",
      icon: "❌"
    }
  };

  // Consumer can only change status if order is in "shipped" or "processing" state
  const canChangeStatus = (status) => {
    return ["shipped", "processing"].includes(status?.toLowerCase());
  };

  const filteredOrders = displayOrders.filter(order => {
    if (filterStatus === "all") return true;
    return order.status === filterStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.date) - new Date(a.date);
      case "oldest":
        return new Date(a.date) - new Date(b.date);
      case "price-high":
        return b.price - a.price;
      case "price-low":
        return a.price - b.price;
      case "eco-score":
        return b.ecoScore - a.ecoScore;
      default:
        return 0;
    }
  });

  const getStatusCounts = () => {
    const counts = {
      all: displayOrders.length,
      processing: displayOrders.filter(o => o.status === "processing").length,
      shipped: displayOrders.filter(o => o.status === "shipped").length,
      delivered: displayOrders.filter(o => o.status === "delivered").length,
      cancelled: displayOrders.filter(o => o.status === "cancelled").length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Date not available";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">📦</span>
                Your Orders
              </h1>
              <p className="text-sky-100 mt-1">Track and manage your eco-friendly purchases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <span className="text-green-600 text-xl">✓</span>
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {statusUpdateError && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <span className="text-red-600 text-xl">!</span>
            <p className="text-red-800 font-medium">{statusUpdateError}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
            <span className="text-lg font-medium text-gray-700">Loading your orders...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!isLoading && displayOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto border border-sky-100">
              <div className="text-6xl mb-6">🛒</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Orders Yet</h3>
              <p className="text-gray-600 mb-6">Start your eco-friendly shopping journey today!</p>
              <button 
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : !isLoading && (
          <div className="space-y-6">
            {/* Filters and Controls */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {sortedOrders.length} Order{sortedOrders.length !== 1 ? 's' : ''}
                  {filterStatus !== "all" && (
                    <span className="text-lg font-normal text-gray-600 ml-2">
                      ({statusConfig[filterStatus]?.label})
                    </span>
                  )}
                </h2>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors text-sm font-medium text-sky-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filter
                  </button>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="eco-score">Best Eco Score</option>
                  </select>
                </div>
              </div>

              {/* Filter Pills */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterStatus("all")}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        filterStatus === "all"
                          ? "bg-sky-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      All ({statusCounts.all})
                    </button>
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                          filterStatus === status
                            ? `${config.color} text-white shadow-md`
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <span>{config.icon}</span>
                        {config.label} ({statusCounts[status]})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Orders List */}
            <div className="grid gap-6">
              {sortedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div 
                          className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden bg-gradient-to-br from-sky-100 to-blue-100 shadow-inner cursor-pointer"
                          
                        >
                          <img
                            src={order.image}
                            alt={order.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = "/fallback.png";
                            }}
                          />
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div  className="cursor-pointer flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-1 hover:text-sky-600 transition-colors">{order.name}</h3>
                            {order.orderItems.length > 1 && (
                              <p className="text-sm text-gray-600">
                                {order.orderItems.map(item => item.productName).join(', ')}
                              </p>
                            )}
                          </div>
                          
                          <span className={`${statusConfig[order.status]?.color || 'bg-gray-500'} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                            <span>{statusConfig[order.status]?.icon || '❓'}</span>
                            {statusConfig[order.status]?.label || order.status}
                          </span>
                        </div>

                        {/* Tracking Info */}
                        {order.trackingNumber && order.status !== "cancelled" && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                              <div>
                                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Tracking Number</span>
                                <div className="text-sm font-mono text-gray-800">{order.trackingNumber}</div>
                              </div>
                              {order.estimatedDelivery && order.status === "shipped" && (
                                <div className="text-right">
                                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Est. Delivery</span>
                                  <div className="text-sm text-gray-800">
                                    {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
                                      month: "short",
                                      day: "numeric"
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Total Price */}
                          <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-100">
                            <div className="text-xs font-semibold text-sky-700 uppercase tracking-wide mb-1">Total</div>
                            <div className="text-lg font-bold text-gray-800">{formatCurrency(order.price)}</div>
                            <div className="text-sm text-gray-600">
                              {order.quantity} item{order.quantity !== 1 ? 's' : ''}
                            </div>
                          </div>

                          {/* Items Count */}
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Items</div>
                            <div className="text-lg font-bold text-gray-800">
                              {order.orderItems.length}
                            </div>
                            <div className="text-sm text-gray-600">products</div>
                          </div>

                          {/* Eco Score */}
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                            <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Eco Score</div>
                            <div className="flex items-center gap-2">
                              <div className="text-lg font-bold text-gray-800">
                                {order.ecoScore ? order.ecoScore.toFixed(1) : 'N/A'}
                              </div>
                              {order.ecoScore > 0 && (
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-3 h-3 ${i < Math.floor(order.ecoScore) ? 'text-green-500' : 'text-gray-300'}`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Carbon Footprint */}
                          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
                            <div className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">CO₂ Impact</div>
                            <div className="text-lg font-bold text-gray-800">
                              {order.totalCO2 ? order.totalCO2.toFixed(1) : '0.0'}
                            </div>
                            <div className="text-xs text-gray-600">kg CO₂</div>
                          </div>
                        </div>

                        {/* Order Date and Actions */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">Ordered:</span>{" "}
                            {formatDate(order.date)}
                          </div>
                          
                          <div className="flex gap-2 items-center">
                            {canChangeStatus(order.status) && (
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleStatusChange(order.id, e.target.value);
                                    e.target.value = "";
                                  }
                                }}
                                disabled={updatingOrderId === order.id}
                                className="appearance-none bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer pr-8"
                              >
                                <option value="" className="text-gray-800">Update Status</option>
                                {order.status !== "delivered" && (
                                  <option value="delivered" className="text-gray-800">Mark as Delivered</option>
                                )}
                                {order.status !== "cancelled" && (
                                  <option value="cancelled" className="text-gray-800">Cancel Order</option>
                                )}
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;