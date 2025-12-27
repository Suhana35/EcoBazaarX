import React, { useState, useEffect, useMemo } from 'react';
import { useGlobal } from '../context/GlobalContext';

const CarbonFootprintDashboard = () => {
  const { fetchCarbonAnalyticsData } = useGlobal();
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all');

  // Fetch data from GlobalContext
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await fetchCarbonAnalyticsData();

        if (result.success) {
          setProducts(result.products || []);
          setOrders(result.orders || []);
        } else {
          setError(result.message || 'Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchCarbonAnalyticsData]);

  // Carbon Analytics Calculations
  const analytics = useMemo(() => {
    if (!products.length) {
      return {
        totalEmissions: 0,
        avgEmissionsPerProduct: 0,
        totalMaterialCO2: 0,
        totalShippingCO2: 0,
        highestEmissionProduct: null,
        emissionsByType: [],
        emissionsByMonth: [],
        topOffenders: [],
        ecoFriendly: []
      };
    }

    // Total emissions calculation
    const totalMaterialCO2 = products.reduce((sum, p) => sum + (p.materialCO2 || 0), 0);
    const totalShippingCO2 = products.reduce((sum, p) => sum + (p.shippingCO2 || 0), 0);
    const totalEmissions = totalMaterialCO2 + totalShippingCO2;

    // Emissions by product type
    const emissionsByType = {};
    products.forEach(p => {
      const type = p.type || 'Unknown';
      if (!emissionsByType[type]) {
        emissionsByType[type] = { name: type, emissions: 0, count: 0, avgEcoScore: 0 };
      }
      const emissions = (p.materialCO2 || 0) + (p.shippingCO2 || 0);
      emissionsByType[type].emissions += emissions;
      emissionsByType[type].count += 1;
      emissionsByType[type].avgEcoScore += p.ecoScore || 0;
    });

    Object.keys(emissionsByType).forEach(type => {
      emissionsByType[type].avgEcoScore = emissionsByType[type].avgEcoScore / emissionsByType[type].count;
    });

    // Top offenders (highest emissions)
    const topOffenders = [...products]
      .sort((a, b) => ((b.materialCO2 || 0) + (b.shippingCO2 || 0)) - ((a.materialCO2 || 0) + (a.shippingCO2 || 0)))
      .slice(0, 5);

    // Eco-friendly products
    const ecoFriendly = [...products]
      .sort((a, b) => (b.ecoScore || 0) - (a.ecoScore || 0))
      .slice(0, 5);

    // Highest emission product
    const highestEmissionProduct = topOffenders[0] || null;

    // Emissions by month (from orders)
    const emissionsByMonth = {};
    orders.forEach(order => {
      const date = new Date(order.orderDate || order.createdAt || new Date());
      const month = date.toISOString().slice(0, 7);
      
      if (!emissionsByMonth[month]) {
        emissionsByMonth[month] = { month, emissions: 0, orders: 0 };
      }
      emissionsByMonth[month].emissions += order.totalCO2Footprint || 0;
      emissionsByMonth[month].orders += 1;
    });

    const monthlyData = Object.values(emissionsByMonth)
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .slice(-6);

    return {
      totalEmissions,
      avgEmissionsPerProduct: totalEmissions / products.length,
      totalMaterialCO2,
      totalShippingCO2,
      highestEmissionProduct,
      emissionsByType: Object.values(emissionsByType),
      emissionsByMonth: monthlyData,
      topOffenders,
      ecoFriendly
    };
  }, [products, orders]);

  const StatCard = ({ title, value, icon, gradient, subtext }) => (
    <div style={{ 
      background: gradient,
      borderRadius: '16px', 
      padding: '24px', 
      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.25)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.15)';
    }}>
      {/* Decorative circle */}
      <div style={{
        position: 'absolute',
        right: '-20px',
        top: '-20px',
        width: '100px',
        height: '100px',
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '50%'
      }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div>
          <p style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '13px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{title}</p>
          <p style={{ color: '#ffffff', fontSize: '32px', fontWeight: 'bold', marginTop: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{value}</p>
          {subtext && <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px', marginTop: '8px' }}>{subtext}</p>}
        </div>
        <div style={{ 
          fontSize: '42px', 
          opacity: 0.95,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
        }}>{icon}</div>
      </div>
    </div>
  );

  const SimpleBarChart = ({ data, dataKey, colors }) => {
    if (!data.length) return <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No data available</p>;
    
    const max = Math.max(...data.map(d => d[dataKey]), 1);
    
    return (
      <div style={{ width: '100%' }}>
        {data.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>{item.name || item.month}</span>
              <span style={{ 
                color: '#ffffff', 
                fontSize: '13px', 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                padding: '4px 12px',
                borderRadius: '20px',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
              }}>
                {item[dataKey].toFixed(2)} kg
              </span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '32px', 
              background: '#f1f5f9',
              borderRadius: '8px', 
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div
                style={{
                  width: `${(item[dataKey] / max) * 100}%`,
                  height: '100%',
                  background: colors?.[idx % colors.length] || 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                  transition: 'width 0.5s ease',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid rgba(59, 130, 246, 0.2)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#1e40af', fontSize: '18px', fontWeight: '600' }}>Loading carbon analytics...</p>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Please wait</p>
        </div>
      </div>
    );
  }

  const avgEcoScore = (products.reduce((sum, p) => sum + (p.ecoScore || 0), 0) / Math.max(products.length, 1)).toFixed(1);
  const highEmissionCount = products.filter(p => ((p.materialCO2 || 0) + (p.shippingCO2 || 0)) > 10).length;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
      padding: '40px 20px',
      position: 'relative'
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        height: '400px',
        background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px', 
            flexWrap: 'wrap', 
            gap: '20px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '40px', 
                fontWeight: '800', 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px'
              }}>
                🌿 Carbon Footprint Analytics
              </h1>
              <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>Track and optimize environmental impact across products and orders</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                outline: 'none'
              }}
            >
              <option value="all">All Time</option>
              <option value="year">This Year</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {error && (
          <div style={{ 
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', 
            border: '2px solid #fca5a5', 
            borderRadius: '16px', 
            padding: '20px', 
            marginBottom: '24px', 
            display: 'flex', 
            gap: '12px',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.15)'
          }}>
            <span style={{ fontSize: '24px', flexShrink: 0 }}>⚠️</span>
            <p style={{ color: '#991b1b', fontWeight: '600', fontSize: '15px' }}>{error}</p>
          </div>
        )}

        {/* Key Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '36px' }}>
          <StatCard
            title="Total Emissions"
            value={`${analytics.totalEmissions.toFixed(1)} kg`}
            icon="💨"
            gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            subtext={`${products.length} products tracked`}
          />
          <StatCard
            title="Avg per Product"
            value={`${analytics.avgEmissionsPerProduct.toFixed(2)} kg`}
            icon="📦"
            gradient="linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
            subtext="Material + Shipping"
          />
          <StatCard
            title="Material Emissions"
            value={`${analytics.totalMaterialCO2.toFixed(1)} kg`}
            icon="🏭"
            gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
            subtext={`${((analytics.totalMaterialCO2 / analytics.totalEmissions) * 100 || 0).toFixed(0)}% of total`}
          />
          <StatCard
            title="Shipping Emissions"
            value={`${analytics.totalShippingCO2.toFixed(1)} kg`}
            icon="🚚"
            gradient="linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"
            subtext={`${((analytics.totalShippingCO2 / analytics.totalEmissions) * 100 || 0).toFixed(0)}% of total`}
          />
        </div>

        {/* Main Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '36px' }}>
          {/* Emissions by Type */}
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            padding: '28px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ 
              color: '#1e293b', 
              fontWeight: '700', 
              marginBottom: '24px', 
              fontSize: '18px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              paddingBottom: '12px',
              borderBottom: '2px solid #f1f5f9'
            }}>
              📊 Emissions by Product Type
            </h3>
            <SimpleBarChart 
              data={analytics.emissionsByType} 
              dataKey="emissions"
              colors={[
                'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)',
                'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
                'linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)',
                'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)'
              ]}
            />
          </div>

          {/* Material vs Shipping */}
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            padding: '28px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ 
              color: '#1e293b', 
              fontWeight: '700', 
              marginBottom: '24px', 
              fontSize: '18px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              paddingBottom: '12px',
              borderBottom: '2px solid #f1f5f9'
            }}>
              📈 Material vs Shipping
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <defs>
                    <linearGradient id="materialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="shippingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#0891b2', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="28" />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="url(#materialGradient)"
                    strokeWidth="28"
                    strokeDasharray={`${(analytics.totalMaterialCO2 / (analytics.totalMaterialCO2 + analytics.totalShippingCO2 || 1)) * 440} 440`}
                    transform="rotate(-90 80 80)"
                    style={{ filter: 'drop-shadow(0 2px 6px rgba(59, 130, 246, 0.3))' }}
                  />
                  <text x="80" y="85" textAnchor="middle" style={{ fontSize: '24px', fontWeight: 'bold', fill: '#1e293b' }}>
                    {((analytics.totalMaterialCO2 / (analytics.totalMaterialCO2 + analytics.totalShippingCO2 || 1)) * 100).toFixed(0)}%
                  </text>
                </svg>
              </div>
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                    }} />
                    <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Material</span>
                  </div>
                  <p style={{ color: '#1e293b', fontSize: '22px', fontWeight: 'bold', marginLeft: '26px' }}>
                    {analytics.totalMaterialCO2.toFixed(1)} kg
                  </p>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(6, 182, 212, 0.3)'
                    }} />
                    <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shipping</span>
                  </div>
                  <p style={{ color: '#1e293b', fontSize: '22px', fontWeight: 'bold', marginLeft: '26px' }}>
                    {analytics.totalShippingCO2.toFixed(1)} kg
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trends */}
        {analytics.emissionsByMonth.length > 0 && (
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            padding: '28px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
            border: '1px solid #e5e7eb', 
            marginBottom: '36px'
          }}>
            <h3 style={{ 
              color: '#1e293b', 
              fontWeight: '700', 
              marginBottom: '24px', 
              fontSize: '18px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              paddingBottom: '12px',
              borderBottom: '2px solid #f1f5f9'
            }}>
              📈 Monthly Emissions Trend
            </h3>
            <SimpleBarChart 
              data={analytics.emissionsByMonth} 
              dataKey="emissions"
              colors={['linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)']}
            />
          </div>
        )}

        {/* Top Products Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '36px' }}>
          {/* High Emission Products */}
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            padding: '28px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
            border: '1px solid #fca5a5'
          }}>
            <h3 style={{ 
              color: '#1e293b', 
              fontWeight: '700', 
              marginBottom: '20px', 
              fontSize: '18px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              paddingBottom: '12px',
              borderBottom: '2px solid #fee2e2'
            }}>
              ⚠️ High Emission Products
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {analytics.topOffenders.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px', fontSize: '15px' }}>No products found</p>
              ) : (
                analytics.topOffenders.map((product, idx) => (
                  <div key={product.id} style={{ 
                    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                    borderRadius: '12px', 
                    padding: '16px', 
                    border: '1px solid #fca5a5', 
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.08)';
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <div>
                        <p style={{ color: '#1e293b', fontWeight: '700', fontSize: '15px' }}>{idx + 1}. {product.name}</p>
                        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>{product.type}</p>
                      </div>
                      <span style={{ 
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: '#ffffff', 
                        padding: '6px 14px', 
                        borderRadius: '20px', 
                        fontSize: '13px', 
                        fontWeight: '700',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)'
                      }}>
                        {((product.materialCO2 || 0) + (product.shippingCO2 || 0)).toFixed(1)} kg
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap' }}>
                      <div>Material: <span style={{ color: '#1e293b', fontWeight: '700' }}>{(product.materialCO2 || 0).toFixed(2)} kg</span></div>
                      <div>Shipping: <span style={{ color: '#1e293b', fontWeight: '700' }}>{(product.shippingCO2 || 0).toFixed(2)} kg</span></div>
                      <div>Eco: <span style={{ color: '#1e293b', fontWeight: '700' }}>{product.ecoScore || 0}/5</span></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Eco-Friendly Products */}
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            padding: '28px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
            border: '1px solid #86efac'
          }}>
            <h3 style={{ 
              color: '#1e293b', 
              fontWeight: '700', 
              marginBottom: '20px', 
              fontSize: '18px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              paddingBottom: '12px',
              borderBottom: '2px solid #dcfce7'
            }}>
              🌿 Most Eco-Friendly Products
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {analytics.ecoFriendly.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px', fontSize: '15px' }}>No products found</p>
              ) : (
                analytics.ecoFriendly.map((product, idx) => (
                  <div key={product.id} style={{ 
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    borderRadius: '12px', 
                    padding: '16px', 
                    border: '1px solid #86efac', 
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.08)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(34, 197, 94, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.08)';
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <div>
                        <p style={{ color: '#1e293b', fontWeight: '700', fontSize: '15px' }}>{idx + 1}. {product.name}</p>
                        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>{product.type}</p>
                      </div>
                      <span style={{ 
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        color: '#ffffff', 
                        padding: '6px 14px', 
                        borderRadius: '20px', 
                        fontSize: '13px', 
                        fontWeight: '700',
                        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.25)'
                      }}>
                        {product.ecoScore || 0}/5 ⭐
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap' }}>
                      <div>Material: <span style={{ color: '#1e293b', fontWeight: '700' }}>{(product.materialCO2 || 0).toFixed(2)} kg</span></div>
                      <div>Shipping: <span style={{ color: '#1e293b', fontWeight: '700' }}>{(product.shippingCO2 || 0).toFixed(2)} kg</span></div>
                      <div>Total: <span style={{ color: '#1e293b', fontWeight: '700' }}>{((product.materialCO2 || 0) + (product.shippingCO2 || 0)).toFixed(2)} kg</span></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '28px', 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            color: '#1e293b', 
            fontWeight: '700', 
            marginBottom: '24px', 
            fontSize: '18px',
            paddingBottom: '12px',
            borderBottom: '2px solid #f1f5f9'
          }}>Summary Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              borderRadius: '12px', 
              padding: '20px', 
              border: '1px solid #93c5fd',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.08)';
            }}>
              <p style={{ color: '#1e40af', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Products</p>
              <p style={{ color: '#1e293b', fontSize: '32px', fontWeight: 'bold', marginTop: '10px' }}>{products.length}</p>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              borderRadius: '12px', 
              padding: '20px', 
              border: '1px solid #93c5fd',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.08)';
            }}>
              <p style={{ color: '#1e40af', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</p>
              <p style={{ color: '#1e293b', fontSize: '32px', fontWeight: 'bold', marginTop: '10px' }}>{orders.length}</p>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              borderRadius: '12px', 
              padding: '20px', 
              border: '1px solid #93c5fd',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.08)';
            }}>
              <p style={{ color: '#1e40af', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Eco Score</p>
              <p style={{ color: '#1e293b', fontSize: '32px', fontWeight: 'bold', marginTop: '10px' }}>{avgEcoScore}/5</p>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              borderRadius: '12px', 
              padding: '20px', 
              border: '1px solid #93c5fd',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.08)';
            }}>
              <p style={{ color: '#1e40af', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>High Emission</p>
              <p style={{ color: '#1e293b', fontSize: '32px', fontWeight: 'bold', marginTop: '10px' }}>{highEmissionCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonFootprintDashboard;