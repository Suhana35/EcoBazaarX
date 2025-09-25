import React, { useState, useEffect, useMemo } from 'react';
import { useGlobal } from '../context/GlobalContext';

const CarbonInsightDashboard = () => {
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
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!currentUser || currentUser.role !== 'admin') return;
      
      setDashboardLoading(true);
      setDashboardError(null);
      
      try {
        const usersResult = await fetchAllUsers();
        if (usersResult.success) {
          setUsers(usersResult.users);
        } else {
          setDashboardError(usersResult.message);
        }

        await Promise.all([
          fetchAllOrders(),
          fetchProducts()
        ]);

      } catch (error) {
        console.error('Error fetching admin data:', error);
        setDashboardError('Failed to load carbon insight data');
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchAdminData();
  }, [currentUser]);

  // Carbon Analytics Calculations
  const carbonAnalytics = useMemo(() => {
    if (!products.length && !orders.length) return null;

    // 1. Carbon Emissions by Category
    const categoryEmissions = products.reduce((acc, product) => {
      const category = product.type || 'Unknown';
      const totalSales = product.sales || 0;
      const carbonPerUnit = (product.materialCO2 || 0) + (product.shippingCO2 || 0);
      
      if (!acc[category]) {
        acc[category] = {
          totalEmissions: 0,
          productCount: 0,
          totalSales: 0,
          avgEcoScore: 0,
          products: []
        };
      }
      
      acc[category].totalEmissions += carbonPerUnit * totalSales;
      acc[category].productCount += 1;
      acc[category].totalSales += totalSales;
      acc[category].avgEcoScore += product.ecoScore || 0;
      acc[category].products.push(product);
      
      return acc;
    }, {});

    // Calculate average eco scores
    Object.keys(categoryEmissions).forEach(category => {
      if (categoryEmissions[category].productCount > 0) {
        categoryEmissions[category].avgEcoScore = 
          categoryEmissions[category].avgEcoScore / categoryEmissions[category].productCount;
      }
    });

    // 2. Carbon Emissions per Seller
    const sellerEmissions = products.reduce((acc, product) => {
      const sellerId = product.sellerId;
      const sellerName = product.sellerName || `Seller ${sellerId}`;
      const totalSales = product.sales || 0;
      const carbonPerUnit = (product.materialCO2 || 0) + (product.shippingCO2 || 0);
      
      if (!acc[sellerId]) {
        acc[sellerId] = {
          name: sellerName,
          totalEmissions: 0,
          productCount: 0,
          totalSales: 0,
          avgEcoScore: 0,
          revenue: 0
        };
      }
      
      acc[sellerId].totalEmissions += carbonPerUnit * totalSales;
      acc[sellerId].productCount += 1;
      acc[sellerId].totalSales += totalSales;
      acc[sellerId].avgEcoScore += product.ecoScore || 0;
      acc[sellerId].revenue += (product.price || 0) * totalSales;
      
      return acc;
    }, {});

    // Calculate average eco scores for sellers
    Object.keys(sellerEmissions).forEach(sellerId => {
      if (sellerEmissions[sellerId].productCount > 0) {
        sellerEmissions[sellerId].avgEcoScore = 
          sellerEmissions[sellerId].avgEcoScore / sellerEmissions[sellerId].productCount;
      }
    });

    // 3. Order-based emissions analysis
    const orderEmissions = orders.reduce((acc, order) => {
      const orderDate = new Date(order.orderDate);
      const month = orderDate.toISOString().slice(0, 7); // YYYY-MM format
      
      if (!acc[month]) {
        acc[month] = {
          totalEmissions: 0,
          orderCount: 0,
          totalValue: 0
        };
      }
      
      acc[month].totalEmissions += order.totalCO2Footprint || 0;
      acc[month].orderCount += 1;
      acc[month].totalValue += order.totalAmount || 0;
      
      return acc;
    }, {});

    // 4. Calculate overall metrics
    const totalProductEmissions = Object.values(sellerEmissions)
      .reduce((sum, seller) => sum + seller.totalEmissions, 0);
    
    const totalOrderEmissions = orders.reduce((sum, order) => sum + (order.totalCO2Footprint || 0), 0);
    
    const avgEcoScore = products.length > 0 
      ? products.reduce((sum, p) => sum + (p.ecoScore || 0), 0) / products.length 
      : 0;

    // 5. Eco Impact Score (1-100 scale)
    const ecoImpactScore = Math.min(100, Math.max(0, 
      (avgEcoScore / 5) * 100 - (totalProductEmissions / Math.max(1, products.length)) * 2
    ));

    return {
      categoryEmissions,
      sellerEmissions,
      orderEmissions,
      totalProductEmissions,
      totalOrderEmissions,
      avgEcoScore,
      ecoImpactScore,
      totalProducts: products.length,
      totalOrders: orders.length
    };
  }, [products, orders, selectedTimeRange]);

  // Generate recommendations based on data
  const recommendations = useMemo(() => {
    if (!carbonAnalytics) return [];

    const recs = [];
    
    // High emission categories
    const sortedCategories = Object.entries(carbonAnalytics.categoryEmissions)
      .sort(([,a], [,b]) => b.totalEmissions - a.totalEmissions);
    
    if (sortedCategories.length > 0 && sortedCategories[0][1].totalEmissions > 50) {
      recs.push({
        type: 'warning',
        title: 'High Emission Category',
        message: `${sortedCategories[0][0]} category has the highest emissions (${sortedCategories[0][1].totalEmissions.toFixed(1)} kg CO2). Consider promoting eco-friendly alternatives.`,
        action: 'Review high-impact products'
      });
    }

    // Low eco-score sellers
    const lowEcoSellers = Object.entries(carbonAnalytics.sellerEmissions)
      .filter(([,data]) => data.avgEcoScore < 3.5)
      .sort(([,a], [,b]) => a.avgEcoScore - b.avgEcoScore);
    
    if (lowEcoSellers.length > 0) {
      recs.push({
        type: 'info',
        title: 'Seller Improvement Opportunity',
        message: `${lowEcoSellers[0][1].name} has low eco-score products (avg: ${lowEcoSellers[0][1].avgEcoScore.toFixed(1)}). Provide eco-friendly guidelines.`,
        action: 'Contact seller for sustainability training'
      });
    }

    // Eco impact score recommendations
    if (carbonAnalytics.ecoImpactScore < 60) {
      recs.push({
        type: 'warning',
        title: 'Low Eco Impact Score',
        message: `Overall eco impact is ${carbonAnalytics.ecoImpactScore.toFixed(0)}/100. Focus on promoting high eco-score products and reducing carbon footprint.`,
        action: 'Implement eco-score incentives'
      });
    } else if (carbonAnalytics.ecoImpactScore > 80) {
      recs.push({
        type: 'success',
        title: 'Excellent Eco Performance',
        message: `Great work! Eco impact score is ${carbonAnalytics.ecoImpactScore.toFixed(0)}/100. Continue promoting sustainable practices.`,
        action: 'Share success story with community'
      });
    }

    return recs;
  }, [carbonAnalytics]);

  const StatCard = ({ title, value, icon, color, subtext, trend }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-white text-2xl font-bold mt-1">{value}</p>
          {subtext && <p className="text-white/70 text-xs mt-1">{subtext}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                trend > 0 ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
              }`}>
                {trend > 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className="text-white/80 text-3xl">{icon}</div>
      </div>
    </div>
  );

  if (dashboardLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading carbon insights...</p>
        </div>
      </div>
    );
  }

  if (dashboardError || error || !carbonAnalytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">🌍</div>
          <p className="text-red-600">{dashboardError || error || 'No carbon data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent">
                Carbon Insight Dashboard
              </h1>
              <p className="text-gray-600 text-sm">Environmental impact analytics for your marketplace</p>
            </div>
            <div className="flex items-center space-x-3">
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-white border border-emerald-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
              </select>
              <div className="bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-2 rounded-full">
                <span className="text-white text-sm font-medium">🌱 Carbon Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Eco Impact Score"
              value={`${carbonAnalytics.ecoImpactScore.toFixed(0)}/100`}
              icon="🌍"
              color={carbonAnalytics.ecoImpactScore > 70 ? "from-emerald-600 to-green-400" : 
                     carbonAnalytics.ecoImpactScore > 50 ? "from-yellow-500 to-orange-400" : 
                     "from-red-500 to-pink-400"}
              subtext={carbonAnalytics.ecoImpactScore > 70 ? "Excellent performance" : 
                       carbonAnalytics.ecoImpactScore > 50 ? "Good performance" : "Needs improvement"}
            />
            <StatCard
              title="Total Carbon Footprint"
              value={`${(carbonAnalytics.totalProductEmissions + carbonAnalytics.totalOrderEmissions).toFixed(1)} kg`}
              icon="💨"
              color="from-slate-600 to-gray-400"
              subtext={`${carbonAnalytics.totalProducts} products tracked`}
            />
            <StatCard
              title="Avg Eco Score"
              value={carbonAnalytics.avgEcoScore.toFixed(1)}
              icon="⭐"
              color="from-amber-500 to-yellow-400"
              subtext="Out of 5.0 rating"
            />
            <StatCard
              title="Carbon per Order"
              value={`${(carbonAnalytics.totalOrderEmissions / Math.max(1, carbonAnalytics.totalOrders)).toFixed(2)} kg`}
              icon="📦"
              color="from-teal-500 to-cyan-400"
              subtext={`${carbonAnalytics.totalOrders} orders analyzed`}
            />
          </div>

          {/* Carbon Emissions by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                📊 Carbon Emissions by Category
              </h3>
              <div className="space-y-3">
                {Object.entries(carbonAnalytics.categoryEmissions)
                  .sort(([,a], [,b]) => b.totalEmissions - a.totalEmissions)
                  .slice(0, 6)
                  .map(([category, data]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{category}</p>
                          <p className="text-gray-500 text-xs">
                            {data.productCount} products • Avg score: {data.avgEcoScore.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{data.totalEmissions.toFixed(1)} kg CO₂</p>
                        <p className="text-gray-500 text-xs">{data.totalSales} total sales</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Seller Performance */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                🏪 Seller Environmental Impact
              </h3>
              <div className="space-y-3">
                {Object.entries(carbonAnalytics.sellerEmissions)
                  .sort(([,a], [,b]) => b.totalEmissions - a.totalEmissions)
                  .slice(0, 5)
                  .map(([sellerId, data]) => (
                    <div key={sellerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          data.avgEcoScore >= 4 ? 'bg-green-100 text-green-600' :
                          data.avgEcoScore >= 3 ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {data.avgEcoScore >= 4 ? '🌟' : data.avgEcoScore >= 3 ? '⚡' : '⚠️'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{data.name}</p>
                          <p className="text-gray-500 text-xs">
                            {data.productCount} products • Score: {data.avgEcoScore.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{data.totalEmissions.toFixed(1)} kg CO₂</p>
                        <p className="text-gray-500 text-xs">${data.revenue.toFixed(0)} revenue</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              💡 Environmental Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  rec.type === 'success' ? 'bg-green-50 border-green-400' :
                  rec.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">
                      {rec.type === 'success' ? '✅' : rec.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">{rec.title}</h4>
                      <p className="text-gray-600 text-xs mb-2">{rec.message}</p>
                      <button className={`text-xs px-3 py-1 rounded-full font-medium ${
                        rec.type === 'success' ? 'bg-green-100 text-green-700' :
                        rec.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {rec.action}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {recommendations.length === 0 && (
                <div className="col-span-3 text-center py-8">
                  <span className="text-4xl mb-2 block">🎉</span>
                  <p className="text-gray-600">Great work! No immediate environmental concerns detected.</p>
                </div>
              )}
            </div>
          </div>

          {/* Trends Over Time */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              📈 Carbon Emissions Trends
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(carbonAnalytics.orderEmissions)
                .sort(([a], [b]) => new Date(a) - new Date(b))
                .slice(-6)
                .map(([month, data]) => (
                  <div key={month} className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 text-sm">
                        {new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </h4>
                      <span className="text-xs text-teal-600 font-medium">{data.orderCount} orders</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-600 text-xs">
                        Carbon: <span className="font-semibold">{data.totalEmissions.toFixed(1)} kg CO₂</span>
                      </p>
                      <p className="text-gray-600 text-xs">
                        Value: <span className="font-semibold">${data.totalValue.toFixed(0)}</span>
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-teal-500 h-1.5 rounded-full" 
                          style={{width: `${Math.min(100, (data.totalEmissions / Math.max(...Object.values(carbonAnalytics.orderEmissions).map(d => d.totalEmissions))) * 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonInsightDashboard;