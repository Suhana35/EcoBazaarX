import React, { useState, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';

const AdminDashboard = () => {
  const { 
    products, 
    orders,
    fetchAllUsers,
    fetchAllOrders,
    fetchProducts,
    currentUser,
    loading,
    error
  } = useGlobal();

  const [users, setUsers] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  // Fetch all admin data on component mount
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!currentUser || currentUser.role !== 'admin') return;
      
      setDashboardLoading(true);
      setDashboardError(null);
      
      try {
        // Fetch all users
        const usersResult = await fetchAllUsers();
        if (usersResult.success) {
          setUsers(usersResult.users);
        } else {
          setDashboardError(usersResult.message);
        }

        // Fetch all orders and products (should already be called from GlobalContext for admin)
        await Promise.all([
          fetchAllOrders(),
          fetchProducts()
        ]);

      } catch (error) {
        console.error('Error fetching admin data:', error);
        setDashboardError('Failed to load admin data');
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchAdminData();
  }, [currentUser]);

  // Statistics calculations based on actual data structure
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const totalUsers = users.length;
  
  // Calculate revenue from order items structure
  const totalRevenue = orders.reduce((sum, order) => {
    return sum + (order.totalAmount || 0);
  }, 0);

  // User statistics
  const sellerCount = users.filter(u => u.role === 'SELLER').length;
  const consumerCount = users.filter(u => u.role === 'CONSUMER').length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;

  // Order status statistics
  const pendingOrders = orders.filter(o => o.status === 'processing' || o.status === 'pending').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  const StatCard = ({ title, value, icon, color, change, subtext }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-white text-2xl font-bold mt-1">{value}</p>
          {change && <p className="text-white/70 text-xs mt-1">{change}</p>}
          {subtext && <p className="text-white/60 text-xs">{subtext}</p>}
        </div>
        <div className="text-white/80 text-3xl">{icon}</div>
      </div>
    </div>
  );

  if (dashboardLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (dashboardError || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600">{dashboardError || error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 text-sm">Manage your eco-marketplace</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-4 py-2 rounded-full">
                <span className="text-white text-sm font-medium">🌱 Eco-Friendly</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Overview Content */}
        <div className="space-y-6">
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={totalUsers}
              icon="👥"
              color="from-blue-600 to-sky-400"
              change={`${sellerCount} sellers, ${consumerCount} consumers`}
            />
            <StatCard
              title="Total Revenue"
              value={`$${totalRevenue.toFixed(2)}`}
              icon="💰"
              color="from-emerald-500 to-teal-400"
              change="From all completed orders"
            />
            <StatCard
              title="Total Orders"
              value={totalOrders}
              icon="🛍️"
              color="from-purple-500 to-pink-400"
              change={`${deliveredOrders} delivered, ${shippedOrders} shipped`}
            />
            <StatCard
              title="Total Products"
              value={totalProducts}
              icon="📦"
              color="from-orange-500 to-amber-400"
              change={`${activeProducts} active products`}
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Pending Orders"
              value={pendingOrders}
              icon="⏳"
              color="from-yellow-500 to-orange-400"
              subtext="Awaiting processing"
            />
            <StatCard
              title="Active Sellers"
              value={sellerCount}
              icon="🏪"
              color="from-indigo-500 to-purple-400"
              subtext="Registered sellers"
            />
            <StatCard
              title="Customers"
              value={consumerCount}
              icon="🛒"
              color="from-pink-500 to-rose-400"
              subtext="Active consumers"
            />
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-sky-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                📈 Recent Orders
              </h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-sky-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">#{order.id}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {order.orderItems?.length || 0} item(s)
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">${order.totalAmount?.toFixed(2) || '0.00'}</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' || order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No orders found</p>
                )}
              </div>
            </div>

            {/* Top Eco Products */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-sky-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                🌱 Top Eco Products
              </h3>
              <div className="space-y-3">
                {products
                  .sort((a, b) => b.ecoScore - a.ecoScore)
                  .slice(0, 5)
                  .map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                          <p className="text-gray-500 text-xs">{product.type} • Stock: {product.stockQuantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <span className="text-green-600 font-semibold">{product.ecoScore}</span>
                          <span className="text-green-500">🌿</span>
                        </div>
                        <p className="text-gray-500 text-xs">{product.sales || 0} sales</p>
                      </div>
                    </div>
                  ))}
                {products.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No products found</p>
                )}
              </div>
            </div>
          </div>

          {/* User Management Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-sky-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              👥 User Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Sellers ({sellerCount})</h4>
                <div className="space-y-2">
                  {users
                    .filter(u => u.role === 'SELLER')
                    .slice(0, 3)
                    .map(user => (
                      <div key={user.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{user.name}</span>
                        <span className="text-xs text-blue-600">{user.email}</span>
                      </div>
                    ))}
                  {sellerCount > 3 && <p className="text-xs text-blue-600">+{sellerCount - 3} more</p>}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Consumers ({consumerCount})</h4>
                <div className="space-y-2">
                  {users
                    .filter(u => u.role === 'CONSUMER')
                    .slice(0, 3)
                    .map(user => (
                      <div key={user.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{user.name}</span>
                        <span className="text-xs text-green-600">{user.email}</span>
                      </div>
                    ))}
                  {consumerCount > 3 && <p className="text-xs text-green-600">+{consumerCount - 3} more</p>}
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Admins ({adminCount})</h4>
                <div className="space-y-2">
                  {users
                    .filter(u => u.role === 'ADMIN')
                    .map(user => (
                      <div key={user.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{user.name}</span>
                        <span className="text-xs text-purple-600">{user.email}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;