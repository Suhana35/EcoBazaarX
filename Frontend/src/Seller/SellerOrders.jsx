import React, { useState, useMemo, useEffect } from "react";
import { useGlobal } from "../context/GlobalContext";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiTrendingUp,
  FiAlertCircle,
  FiEye,
  FiEdit,
  FiRefreshCw,
  FiBarChart2,
} from "react-icons/fi";
import { FaLeaf, FaShippingFast } from "react-icons/fa";

// Updated status options - sellers can only set processing and shipped
const sellerStatusOptions = ["processing", "shipped"];

const statusConfig = {
  processing: {
    icon: FiClock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    label: "Processing",
    actionColor: "bg-amber-500 hover:bg-amber-600"
  },
  shipped: {
    icon: FiTruck,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Shipped",
    actionColor: "bg-blue-500 hover:bg-blue-600"
  },
  delivered: {
    icon: FiCheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    label: "Delivered",
    actionColor: "bg-green-500 hover:bg-green-600"
  },
  cancelled: {
    icon: FiXCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "Cancelled",
    actionColor: "bg-red-500 hover:bg-red-600"
  }
};

const SellerOrders = () => {
  const { 
    orders = [], 
    products = [], 
    setOrders, 
    currentUser, 
    fetchOrdersBySeller, 
    fetchProductsBySeller,
    updateOrderStatusBySeller, 
    bulkUpdateOrdersStatus, 
    loading, 
    error 
  } = useGlobal();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showOrderDetail, setShowOrderDetail] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch seller data on component mount
  useEffect(() => {
    if (currentUser && currentUser.role === 'seller') {
      fetchOrdersBySeller(currentUser.id);
      fetchProductsBySeller(currentUser.id);
    }
  }, [currentUser]);

  // Filter orders to only show those containing seller's products
  const sellerOrders = useMemo(() => {
    if (!currentUser || !currentUser.id || !products.length || !orders.length) return [];
    
    const sellerProductIds = products.map(p => p.id);
    
    return orders.filter(order => {
      if (!order || !order.orderItems || !Array.isArray(order.orderItems)) return false;
      
      // Check if any order item contains seller's products
      return order.orderItems.some(item => 
        item && sellerProductIds.includes(item.productId)
      );
    });
  }, [orders, products, currentUser]);

  // Transform seller orders to match component expectations
  const transformedOrders = useMemo(() => {
    return sellerOrders.map(order => {
      // Filter order items to only include seller's products
      const sellerProductIds = products.map(p => p.id);
      const sellerItems = order.orderItems.filter(item => 
        item && sellerProductIds.includes(item.productId)
      );
      
      // Get the first seller item for primary display
      const primaryItem = sellerItems.length > 0 ? sellerItems[0] : {};
      
      // Calculate totals for seller items only
      const sellerTotalAmount = sellerItems.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
      const sellerTotalQuantity = sellerItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const sellerTotalCO2 = sellerItems.reduce((sum, item) => sum + ((item.materialCO2 || 0) + (item.shippingCO2 || 0)), 0);
      const sellerAvgEcoScore = sellerItems.length > 0 
        ? sellerItems.reduce((sum, item) => sum + (item.ecoScore || 0), 0) / sellerItems.length 
        : 0;
      
      return {
        id: order.id,
        name: primaryItem.productName || "Unknown Product",
        type: primaryItem.productType || "Unknown",
        price: primaryItem.price || 0,
        quantity: sellerTotalQuantity,
        ecoScore: sellerAvgEcoScore,
        materialCO2: primaryItem.materialCO2 || 0,
        shippingCO2: primaryItem.shippingCO2 || 0,
        totalCO2: sellerTotalCO2,
        date: order.orderDate,
        image: primaryItem.productImage || "/api/placeholder/150/150",
        status: order.status.toLowerCase(),
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        totalAmount: sellerTotalAmount, // Only seller's revenue
        orderItems: sellerItems, // Only seller's items
        userId: order.userId,
        shippedDate: order.shippedDate,
        deliveredDate: order.deliveredDate
      };
    });
  }, [sellerOrders, products]);

  // Calculate comprehensive statistics for seller only
  const stats = useMemo(() => {
    const totalRevenue = transformedOrders.reduce((sum, order) =>
      order.status !== 'cancelled' ? sum + order.totalAmount : sum, 0
    );

    const processingOrders = transformedOrders.filter(o => o.status === 'processing');
    const shippedOrders = transformedOrders.filter(o => o.status === 'shipped');
    const deliveredOrders = transformedOrders.filter(o => o.status === 'delivered');
    const cancelledOrders = transformedOrders.filter(o => o.status === 'cancelled');

    const totalCO2 = transformedOrders.reduce((sum, order) => sum + (order.totalCO2 || 0), 0);

    const avgEcoScore = transformedOrders.length > 0
      ? transformedOrders.reduce((sum, order) => sum + (order.ecoScore || 0), 0) / transformedOrders.length
      : 0;

    return {
      totalRevenue,
      totalOrders: transformedOrders.length,
      processingOrders: processingOrders.length,
      shippedOrders: shippedOrders.length,
      deliveredOrders: deliveredOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalCO2: Math.round(totalCO2 * 10) / 10,
      avgEcoScore: Math.round(avgEcoScore * 10) / 10,
      pendingActions: processingOrders.length
    };
  }, [transformedOrders]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = [...transformedOrders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm) ||
        order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date) - new Date(a.date);
        case "value":
          return b.totalAmount - a.totalAmount;
        case "eco-score":
          return (b.ecoScore || 0) - (a.ecoScore || 0);
        case "status":
          return a.status.localeCompare(b.status);
        case "quantity":
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });

    return filtered;
  }, [transformedOrders, searchTerm, filterStatus, sortBy]);

  const handleStatusChange = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      const result = await updateOrderStatusBySeller(orderId, newStatus);
      console.log(result);
      if (!result.success) {
        console.error("Failed to update order status:", result.message);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedOrders.length === 0) return;
    
    setIsUpdating(true);
    try {
      const result = await bulkUpdateOrdersStatus(selectedOrders, status);
      if (result.success !== false) {
        setSelectedOrders([]);
      } else {
        console.error("Bulk update failed:", result.message);
      }
    } catch (error) {
      console.error("Error in bulk update:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setSortBy("date");
    setSelectedOrders([]);
  };

  const getStatusProgress = (status) => {
    const progressMap = {
      processing: 25,
      shipped: 75,
      delivered: 100,
      cancelled: 0
    };
    return progressMap[status] || 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const refreshOrders = async () => {
    setIsRefreshing(true);
    try {
      if (currentUser && currentUser.role === 'seller') {
        await fetchOrdersBySeller(currentUser.id);
        await fetchProductsBySeller(currentUser.id);
      }
    } catch (error) {
      console.error("Error refreshing orders:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check if seller can change status for this order
  const canChangeStatus = (order) => {
    return order.status === 'processing' || order.status === 'shipped';
  };

  // Get available status options for this order
  const getAvailableStatusOptions = (currentStatus) => {
    if (currentStatus === 'processing') {
      return ['processing', 'shipped']; // Can move from processing to shipped
    } else if (currentStatus === 'shipped') {
      return ['shipped']; // Can only keep shipped status
    } else {
      return []; // Cannot change delivered or cancelled
    }
  };

  const OrderCard = ({ order }) => {
    const config = statusConfig[order.status];
    const StatusIcon = config.icon;
    const isSelected = selectedOrders.includes(order.id);
    const canEdit = canChangeStatus(order);
    const availableStatuses = getAvailableStatusOptions(order.status);

    return (
      <div className={`group bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 transform hover:-translate-y-1 ${isSelected ? 'border-sky-400 ring-2 ring-sky-100' : 'border-gray-100 hover:border-sky-200'
        }`}>
        {/* Header with Status */}
        <div className={`${config.bgColor} ${config.borderColor} border-b-2 px-6 py-4 rounded-t-3xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${config.actionColor} text-white rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <StatusIcon className="text-lg" />
              </div>
              <div>
                <span className={`font-bold ${config.color} text-lg`}>
                  {config.label}
                </span>
                <div className={`w-24 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden`}>
                  <div
                    className={`h-full ${config.actionColor.split(' ')[0]} transition-all duration-500`}
                    style={{ width: `${getStatusProgress(order.status)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Only show checkbox for orders that can be edited */}
              {canEdit && (
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOrderSelection(order.id)}
                    className="w-4 h-4 text-sky-600 border-2 border-gray-300 rounded focus:ring-sky-500 focus:ring-2"
                  />
                </label>
              )}
              <span className="text-xs text-gray-600 font-mono bg-white/70 px-2 py-1 rounded-lg">
                #{order.id}
              </span>
            </div>
          </div>
        </div>

        {/* Product Content */}
        <div className="p-6">
          {/* Product Info */}
          <div className="flex gap-4 mb-6">
            <div className="relative">
              <img
                src={order.image}
                alt={order.name}
                className="w-20 h-20 object-cover rounded-2xl shadow-sm ring-2 ring-gray-100"
                onError={(e) => {
                  e.target.src = "/api/placeholder/150/150";
                }}
              />
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-sm">
                <FaLeaf className="text-xs" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 leading-tight">
                {order.name}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <FiPackage className="text-blue-500" size={14} />
                  <span className="text-gray-600">Items:</span>
                  <span className="font-semibold">{order.orderItems.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Total Qty:</span>
                  <span className="font-semibold">{order.quantity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Impact */}
          {(order.ecoScore > 0 || order.totalCO2 > 0) && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FaLeaf className="text-green-500" />
                  Environmental Impact
                </span>
                {order.ecoScore > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${i < Math.floor(order.ecoScore)
                              ? "text-green-500"
                              : "text-gray-300"
                            }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-green-700">
                      {order.ecoScore}/5.0
                    </span>
                  </div>
                )}
              </div>
              {order.totalCO2 > 0 && (
                <div className="grid grid-cols-1 gap-3 text-xs">
                  <div className="flex justify-between bg-white/50 px-2 py-1 rounded-lg">
                    <span className="text-gray-600">Total CO₂:</span>
                    <span className="font-semibold">{order.totalCO2} kg</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Order Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiCalendar className="text-gray-400" size={16} />
              <span className="font-medium">Order Date:</span>
              <span>{formatDate(order.date)}</span>
            </div>

            {order.trackingNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaShippingFast className="text-blue-400" size={16} />
                <span className="font-medium">Tracking:</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                  {order.trackingNumber}
                </span>
              </div>
            )}

            {order.estimatedDelivery && order.status === 'shipped' && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiAlertCircle className="text-orange-400" size={16} />
                <span className="font-medium">Est. Delivery:</span>
                <span>{formatDate(order.estimatedDelivery)}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <FiTrendingUp className="text-green-500" size={16} />
              <span className="font-medium text-gray-600">Your Revenue:</span>
              <span className="font-bold text-green-600 text-lg">
                ₹{order.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <div className="flex-1">
              {canEdit ? (
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  disabled={isUpdating}
                  className={`w-full px-4 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all duration-200 text-sm font-medium ${
                    isUpdating
                      ? 'bg-gray-50 cursor-not-allowed border-gray-200'
                      : 'bg-white border-gray-200 hover:border-sky-300'
                  }`}
                >
                  {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm font-medium text-gray-500 text-center">
                  {config.label} - No Actions Available
                </div>
              )}
            </div>
            <button
              onClick={() => setShowOrderDetail(order)}
              className="px-4 py-2 bg-sky-100 text-sky-700 rounded-xl hover:bg-sky-200 transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <FiEye size={16} />
              <span className="hidden sm:inline">View</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-500 mx-auto"></div>
          <p className="text-sky-600 mt-4">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-cyan-400 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
                  <FiPackage className="text-white" />
                  Your Orders
                </h1>
                <p className="text-sky-100 text-lg">Track and manage orders for your products</p>
              </div>
              <button 
                onClick={refreshOrders}
                disabled={isRefreshing}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-2xl transition-all duration-300 disabled:opacity-50"
              >
                <FiRefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 text-white/10">
            <FiPackage className="text-6xl lg:text-8xl transform rotate-12" />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
            <div className="flex items-center gap-2">
              <FiAlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-green-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-500 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiTrendingUp size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">₹{stats.totalRevenue.toLocaleString()}</h2>
                <p className="text-gray-600 text-sm font-medium">Your Revenue</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-blue-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiPackage size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{stats.totalOrders}</h2>
                <p className="text-gray-600 text-sm font-medium">Your Orders</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-amber-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-500 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiClock size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{stats.pendingActions}</h2>
                <p className="text-gray-600 text-sm font-medium">Need Action</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-green-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaLeaf size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{stats.avgEcoScore}</h2>
                <p className="text-gray-600 text-sm font-medium">Avg Eco Score</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-purple-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-500 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiBarChart2 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{stats.totalCO2} kg</h2>
                <p className="text-gray-600 text-sm font-medium">Total CO₂</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-sky-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiBarChart2 className="text-sky-500" />
            Order Status Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = stats[`${status}Orders`] || 0;
              const StatusIcon = config.icon;
              return (
                <div key={status} className={`text-center p-4 ${config.bgColor} rounded-2xl border ${config.borderColor} hover:scale-105 transition-transform duration-200`}>
                  <div className={`inline-flex p-3 ${config.actionColor} text-white rounded-xl mb-3 shadow-sm`}>
                    <StatusIcon size={24} />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{count}</div>
                  <div className={`text-sm font-medium ${config.color}`}>{config.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-sky-100">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search orders by ID, product name, or tracking number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-gray-700 bg-gray-50"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-gray-700 bg-gray-50 min-w-[150px]"
              >
                <option value="all">All Status</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-gray-700 bg-gray-50 min-w-[150px]"
              >
                <option value="date">Sort by Date</option>
                <option value="value">Sort by Value</option>
                <option value="eco-score">Sort by Eco Score</option>
                <option value="status">Sort by Status</option>
                <option value="quantity">Sort by Quantity</option>
              </select>

              <button
                onClick={resetFilters}
                className="px-4 py-3 text-sky-600 hover:text-sky-700 font-medium transition-colors duration-200 border-2 border-sky-200 rounded-2xl hover:bg-sky-50"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
              <span className="text-sm text-gray-600 font-medium py-2">
                {selectedOrders.length} order(s) selected:
              </span>
              {sellerStatusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => handleBulkStatusUpdate(status)}
                  disabled={isUpdating}
                  className={`px-4 py-2 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${statusConfig[status].actionColor
                    }`}
                >
                  Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Orders Display */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg border border-sky-100 p-16 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full flex items-center justify-center">
              <FiPackage size={40} className="text-sky-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No orders found</h3>
            <p className="text-gray-600 text-lg mb-6">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search filters to find what you're looking for"
                : "Orders containing your products will appear here when customers make purchases"}
            </p>
            {(searchTerm || filterStatus !== "all") && (
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg border border-sky-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-sky-50 to-cyan-50 border-b border-sky-100">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Your Orders</h2>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-sky-100 text-sky-700 rounded-full font-medium">
                    {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-sky-50 to-cyan-50">
              <h3 className="text-2xl font-bold text-gray-800">
                Order #{showOrderDetail.id} - Your Items
              </h3>
              <button
                onClick={() => setShowOrderDetail(null)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FiXCircle size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Order Status */}
              <div className="mb-6 p-4 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-2xl border border-sky-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${statusConfig[showOrderDetail.status].actionColor} text-white rounded-xl shadow-sm`}>
                      {React.createElement(statusConfig[showOrderDetail.status].icon, { size: 20 })}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Order Status</h4>
                      <p className={`font-semibold ${statusConfig[showOrderDetail.status].color}`}>
                        {statusConfig[showOrderDetail.status].label}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Your Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{showOrderDetail.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items - Only seller's items */}
              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiPackage className="text-sky-500" />
                  Your Items ({showOrderDetail.orderItems.length})
                </h4>
                <div className="space-y-4">
                  {showOrderDetail.orderItems.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-xl border"
                        onError={(e) => {
                          e.target.src = "/api/placeholder/150/150";
                        }}
                      />
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-800">{item.productName}</h5>
                        <p className="text-gray-600 text-sm">{item.productType}</p>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">Qty: <span className="font-semibold">{item.quantity}</span></span>
                            <span className="text-gray-600">Price: <span className="font-semibold">₹{item.price}</span></span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₹{item.subtotal.toLocaleString()}</p>
                            {item.ecoScore > 0 && (
                              <div className="flex items-center gap-1 text-sm">
                                <FaLeaf className="text-green-500" size={12} />
                                <span className="text-green-600">{item.ecoScore}/5</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-800">Order Information</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Order ID:</span>
                      <span className="font-mono">#{showOrderDetail.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Order Date:</span>
                      <span>{formatDate(showOrderDetail.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Customer ID:</span>
                      <span>#{showOrderDetail.userId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Your Items:</span>
                      <span>{showOrderDetail.quantity}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-800">Shipping Information</h4>
                  <div className="space-y-3 text-sm">
                    {showOrderDetail.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Tracking:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {showOrderDetail.trackingNumber}
                        </span>
                      </div>
                    )}
                    {showOrderDetail.shippedDate && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Shipped Date:</span>
                        <span>{formatDate(showOrderDetail.shippedDate)}</span>
                      </div>
                    )}
                    {showOrderDetail.estimatedDelivery && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Est. Delivery:</span>
                        <span>{formatDate(showOrderDetail.estimatedDelivery)}</span>
                      </div>
                    )}
                    {showOrderDetail.deliveredDate && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Delivered Date:</span>
                        <span>{formatDate(showOrderDetail.deliveredDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Environmental Impact */}
              {(showOrderDetail.ecoScore > 0 || showOrderDetail.totalCO2 > 0) && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                  <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FaLeaf className="text-green-500" />
                    Environmental Impact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {showOrderDetail.ecoScore > 0 && (
                      <div className="text-center p-3 bg-white/50 rounded-xl">
                        <p className="text-gray-600 mb-1">Avg Eco Score</p>
                        <div className="flex justify-center items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${i < Math.floor(showOrderDetail.ecoScore)
                                    ? "text-green-500"
                                    : "text-gray-300"
                                  }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="font-bold text-green-700">
                            {showOrderDetail.ecoScore.toFixed(1)}/5
                          </span>
                        </div>
                      </div>
                    )}
                    {showOrderDetail.totalCO2 > 0 && (
                      <div className="text-center p-3 bg-white/50 rounded-xl">
                        <p className="text-gray-600 mb-1">Total CO₂</p>
                        <p className="font-bold text-red-600">{showOrderDetail.totalCO2.toFixed(1)} kg</p>
                      </div>
                    )}
                    <div className="text-center p-3 bg-white/50 rounded-xl">
                      <p className="text-gray-600 mb-1">Status</p>
                      <p className={`font-bold ${statusConfig[showOrderDetail.status].color}`}>
                        {statusConfig[showOrderDetail.status].label}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex gap-3">
                {canChangeStatus(showOrderDetail) && (
                  <select
                    value={showOrderDetail.status}
                    onChange={(e) => {
                      handleStatusChange(showOrderDetail.id, e.target.value);
                      setShowOrderDetail({...showOrderDetail, status: e.target.value});
                    }}
                    disabled={isUpdating}
                    className={`px-4 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all duration-200 text-sm font-medium ${isUpdating
                        ? 'bg-gray-100 cursor-not-allowed border-gray-300'
                        : 'bg-white border-gray-300 hover:border-sky-400'
                      }`}
                  >
                    {getAvailableStatusOptions(showOrderDetail.status).map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowOrderDetail(null)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;