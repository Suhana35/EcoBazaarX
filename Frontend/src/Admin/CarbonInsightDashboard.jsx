import React, { useState, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';

const fmt   = (n) => (typeof n === 'number' ? n.toFixed(2) : '0.00');
const fmt1  = (n) => (typeof n === 'number' ? n.toFixed(1) : '0.0');

// ── Shared sub-components ─────────────────────────────────────────────────────

const StatCard = ({ title, value, icon, gradient, subtext }) => (
  <div style={{
    background: gradient, borderRadius: '16px', padding: '24px',
    boxShadow: '0 4px 20px rgba(59,130,246,0.15)',
    border: '1px solid rgba(59,130,246,0.2)',
    transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
  }}
  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(59,130,246,0.25)'; }}
  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.15)'; }}>
    <div style={{ position:'absolute', right:'-20px', top:'-20px', width:'100px', height:'100px', background:'rgba(255,255,255,0.3)', borderRadius:'50%' }} />
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative' }}>
      <div>
        <p style={{ color:'rgba(255,255,255,0.95)', fontSize:'13px', fontWeight:'600', letterSpacing:'0.5px', textTransform:'uppercase' }}>{title}</p>
        <p style={{ color:'#ffffff', fontSize:'32px', fontWeight:'bold', marginTop:'10px', textShadow:'0 2px 4px rgba(0,0,0,0.1)' }}>{value}</p>
        {subtext && <p style={{ color:'rgba(255,255,255,0.9)', fontSize:'13px', marginTop:'8px' }}>{subtext}</p>}
      </div>
      <div style={{ fontSize:'42px', opacity:0.95, filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>{icon}</div>
    </div>
  </div>
);

const BarChart = ({ data, dataKey, nameKey = 'name', colors, unit = 'kg' }) => {
  if (!data || !data.length) return <p style={{ color:'#94a3b8', textAlign:'center', padding:'20px' }}>No data</p>;
  const max = Math.max(...data.map(d => d[dataKey] || 0), 1);
  return (
    <div style={{ width:'100%' }}>
      {data.map((item, idx) => (
        <div key={idx} style={{ marginBottom:'18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
            <span style={{ color:'#1e293b', fontSize:'14px', fontWeight:'600', maxWidth:'60%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item[nameKey]}</span>
            <span style={{ color:'#fff', fontSize:'13px', fontWeight:'bold', background:'linear-gradient(135deg,#3b82f6,#2563eb)', padding:'3px 12px', borderRadius:'20px' }}>
              {fmt(item[dataKey] || 0)} {unit}
            </span>
          </div>
          <div style={{ width:'100%', height:'28px', background:'#f1f5f9', borderRadius:'8px', overflow:'hidden' }}>
            <div style={{ width:`${((item[dataKey]||0)/max)*100}%`, height:'100%', background: colors?.[idx % colors.length] || 'linear-gradient(90deg,#3b82f6,#2563eb)', transition:'width 0.5s ease' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const SectionCard = ({ title, children, borderColor = '#e5e7eb' }) => (
  <div style={{ background:'white', borderRadius:'20px', padding:'28px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:`1px solid ${borderColor}` }}>
    <h3 style={{ color:'#1e293b', fontWeight:'700', marginBottom:'24px', fontSize:'18px', paddingBottom:'12px', borderBottom:'2px solid #f1f5f9', display:'flex', alignItems:'center', gap:'8px' }}>
      {title}
    </h3>
    {children}
  </div>
);

const getLevelBadge = (co2) => {
  if (co2 === 0)  return { label:'No Data',  bg:'#f1f5f9', color:'#64748b' };
  if (co2 < 5)   return { label:'Low',       bg:'#dcfce7', color:'#15803d' };
  if (co2 < 20)  return { label:'Moderate',  bg:'#fef9c3', color:'#a16207' };
  if (co2 < 50)  return { label:'High',      bg:'#fee2e2', color:'#dc2626' };
  return              { label:'Very High', bg:'#fce7f3', color:'#9d174d' };
};

const BAR_COLORS = [
  'linear-gradient(90deg,#3b82f6,#2563eb)',
  'linear-gradient(90deg,#06b6d4,#0891b2)',
  'linear-gradient(90deg,#8b5cf6,#7c3aed)',
  'linear-gradient(90deg,#0ea5e9,#0284c7)',
  'linear-gradient(90deg,#6366f1,#4f46e5)',
  'linear-gradient(90deg,#ec4899,#db2777)',
  'linear-gradient(90deg,#f59e0b,#d97706)',
];

// ── Tab components ─────────────────────────────────────────────────────────────

const OverviewTab = ({ a, materialPct, shippingPct }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:'28px' }}>
    {/* Stat cards row 1 — products */}
    <div>
      <p style={{ color:'#64748b', fontSize:'13px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px' }}>📦 Product Carbon (listed inventory)</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'20px' }}>
        <StatCard title="Total Product Emissions" value={`${fmt1(a.totalEmissions)} kg`} icon="💨" gradient="linear-gradient(135deg,#3b82f6,#2563eb)" subtext={`${a.totalProducts} products`} />
        <StatCard title="Avg per Product"          value={`${fmt(a.avgEmissionsPerProduct)} kg`} icon="📦" gradient="linear-gradient(135deg,#06b6d4,#0891b2)" subtext="Material + Shipping" />
        <StatCard title="Material Emissions"       value={`${fmt1(a.totalMaterialCO2)} kg`} icon="🏭" gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" subtext={`${materialPct}% of product total`} />
        <StatCard title="Shipping Emissions"       value={`${fmt1(a.totalShippingCO2)} kg`} icon="🚚" gradient="linear-gradient(135deg,#0ea5e9,#0284c7)" subtext={`${shippingPct}% of product total`} />
      </div>
    </div>

    {/* Stat cards row 2 — orders */}
    <div>
      <p style={{ color:'#64748b', fontSize:'13px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px' }}>🧾 Order Carbon (from completed purchases)</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'20px' }}>
        <StatCard title="Total Order CO₂"   value={`${fmt1(a.totalOrderCO2 || 0)} kg`}   icon="🌍" gradient="linear-gradient(135deg,#10b981,#059669)" subtext={`${a.totalOrders} orders`} />
        <StatCard title="Avg CO₂ per Order" value={`${fmt(a.avgCO2PerOrder || 0)} kg`}   icon="🧾" gradient="linear-gradient(135deg,#f59e0b,#d97706)" subtext="Per non-cancelled order" />
        <StatCard title="Avg Eco Score"     value={`${fmt1(a.avgEcoScore)}/5`}            icon="🌿" gradient="linear-gradient(135deg,#22c55e,#16a34a)" subtext="Across all products" />
        <StatCard title="High Emission (≥10kg)" value={a.highEmissionCount}              icon="⚠️" gradient="linear-gradient(135deg,#ef4444,#dc2626)" subtext="Products above threshold" />
      </div>
    </div>

    {/* Material vs Shipping donut + by type */}
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'24px' }}>
      <SectionCard title="📈 Material vs Shipping Split">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'32px', flexWrap:'wrap' }}>
          <svg width="150" height="150" viewBox="0 0 160 160">
            <defs>
              <linearGradient id="matG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor:'#3b82f6' }} /><stop offset="100%" style={{ stopColor:'#2563eb' }} />
              </linearGradient>
            </defs>
            <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="28" />
            <circle cx="80" cy="80" r="70" fill="none" stroke="url(#matG)" strokeWidth="28"
              strokeDasharray={`${(a.totalEmissions > 0 ? a.totalMaterialCO2 / a.totalEmissions : 0) * 440} 440`}
              transform="rotate(-90 80 80)" style={{ filter:'drop-shadow(0 2px 6px rgba(59,130,246,0.3))' }} />
            <text x="80" y="85" textAnchor="middle" style={{ fontSize:'22px', fontWeight:'bold', fill:'#1e293b' }}>{materialPct}%</text>
          </svg>
          <div>
            <div style={{ marginBottom:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                <div style={{ width:'14px', height:'14px', background:'linear-gradient(135deg,#3b82f6,#2563eb)', borderRadius:'3px' }} />
                <span style={{ color:'#64748b', fontSize:'13px', fontWeight:'600', textTransform:'uppercase' }}>Material</span>
              </div>
              <p style={{ color:'#1e293b', fontSize:'20px', fontWeight:'bold', marginLeft:'22px' }}>{fmt1(a.totalMaterialCO2)} kg</p>
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                <div style={{ width:'14px', height:'14px', background:'linear-gradient(135deg,#06b6d4,#0891b2)', borderRadius:'3px' }} />
                <span style={{ color:'#64748b', fontSize:'13px', fontWeight:'600', textTransform:'uppercase' }}>Shipping</span>
              </div>
              <p style={{ color:'#1e293b', fontSize:'20px', fontWeight:'bold', marginLeft:'22px' }}>{fmt1(a.totalShippingCO2)} kg</p>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="📅 Monthly Order Emissions Trend">
        {(a.emissionsByMonth || []).length === 0
          ? <p style={{ color:'#94a3b8', textAlign:'center', padding:'30px' }}>No monthly data yet</p>
          : <BarChart data={a.emissionsByMonth} dataKey="emissions" nameKey="month" colors={BAR_COLORS} />
        }
      </SectionCard>
    </div>
  </div>
);

const ProductsTab = ({ a }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:'28px' }}>
    <SectionCard title="📊 Emissions by Product Type">
      <BarChart data={a.emissionsByType || []} dataKey="emissions" nameKey="name" colors={BAR_COLORS} />
    </SectionCard>

    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'24px' }}>
      <SectionCard title="⚠️ High Emission Products (Top 5)" borderColor="#fca5a5">
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {(a.topOffenders || []).length === 0
            ? <p style={{ color:'#94a3b8', textAlign:'center', padding:'20px' }}>No products found</p>
            : (a.topOffenders || []).map((p, i) => {
                const total = (p.materialCO2 || 0) + (p.shippingCO2 || 0);
                const badge = getLevelBadge(total);
                return (
                  <div key={p.id} style={{ background:'linear-gradient(135deg,#fef2f2,#fee2e2)', borderRadius:'12px', padding:'14px', border:'1px solid #fca5a5', transition:'all 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.transform='translateX(4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform='translateX(0)'}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                      <div>
                        <p style={{ color:'#1e293b', fontWeight:'700', fontSize:'14px' }}>{i+1}. {p.name}</p>
                        <p style={{ color:'#64748b', fontSize:'12px', marginTop:'2px' }}>{p.type}</p>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' }}>
                        <span style={{ background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'#fff', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>{fmt(total)} kg</span>
                        <span style={{ background:badge.bg, color:badge.color, padding:'2px 8px', borderRadius:'10px', fontSize:'11px', fontWeight:'600' }}>{badge.label}</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'14px', fontSize:'12px', color:'#64748b' }}>
                      <span>🏭 {fmt(p.materialCO2||0)} kg</span>
                      <span>🚚 {fmt(p.shippingCO2||0)} kg</span>
                      <span>⭐ {fmt1(p.ecoScore||0)}/5</span>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </SectionCard>

      <SectionCard title="🌿 Most Eco-Friendly Products (Top 5)" borderColor="#86efac">
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {(a.ecoFriendly || []).length === 0
            ? <p style={{ color:'#94a3b8', textAlign:'center', padding:'20px' }}>No products found</p>
            : (a.ecoFriendly || []).map((p, i) => (
                <div key={p.id} style={{ background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius:'12px', padding:'14px', border:'1px solid #86efac', transition:'all 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateX(4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='translateX(0)'}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                    <div>
                      <p style={{ color:'#1e293b', fontWeight:'700', fontSize:'14px' }}>{i+1}. {p.name}</p>
                      <p style={{ color:'#64748b', fontSize:'12px', marginTop:'2px' }}>{p.type}</p>
                    </div>
                    <span style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>{fmt1(p.ecoScore||0)}/5 ⭐</span>
                  </div>
                  <div style={{ display:'flex', gap:'14px', fontSize:'12px', color:'#64748b' }}>
                    <span>🏭 {fmt(p.materialCO2||0)} kg</span>
                    <span>🚚 {fmt(p.shippingCO2||0)} kg</span>
                    <span>Total: {fmt((p.materialCO2||0)+(p.shippingCO2||0))} kg</span>
                  </div>
                </div>
              ))
          }
        </div>
      </SectionCard>
    </div>
  </div>
);

const UserCarbonTab = ({ users }) => {
  const maxCO2 = Math.max(...(users || []).map(u => u.totalCO2 || 0), 1);
  return (
    <SectionCard title="👥 Carbon Footprint per User (from Orders)">
      {(!users || users.length === 0)
        ? <p style={{ color:'#94a3b8', textAlign:'center', padding:'40px' }}>No user order data available yet</p>
        : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'14px' }}>
              <thead>
                <tr style={{ background:'linear-gradient(135deg,#eff6ff,#dbeafe)', borderBottom:'2px solid #bfdbfe' }}>
                  {['#','User','Total CO₂ (kg)','Orders','Avg Eco Score','Impact Level','Footprint Bar'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', color:'#1e40af', fontWeight:'700', textAlign:'left', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const badge = getLevelBadge(u.totalCO2 || 0);
                  const pct   = maxCO2 > 0 ? Math.min(((u.totalCO2||0)/maxCO2)*100, 100) : 0;
                  return (
                    <tr key={u.userId} style={{ borderBottom:'1px solid #f1f5f9', transition:'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#f8faff'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'12px 16px', color:'#94a3b8', fontWeight:'600' }}>{i+1}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#2563eb)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'700', fontSize:'13px', flexShrink:0 }}>
                            {(u.userName || '?').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight:'600', color:'#1e293b' }}>{u.userName || '—'}</span>
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px', fontWeight:'700', color:'#1e293b' }}>{fmt(u.totalCO2||0)}</td>
                      <td style={{ padding:'12px 16px', color:'#475569' }}>{u.orderCount || 0}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ color:'#15803d', fontWeight:'600' }}>{fmt1(u.avgEcoScore||0)}/5</span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ background:badge.bg, color:badge.color, padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', whiteSpace:'nowrap' }}>{badge.label}</span>
                      </td>
                      <td style={{ padding:'12px 16px', minWidth:'140px' }}>
                        <div style={{ width:'100%', height:'10px', background:'#f1f5f9', borderRadius:'5px', overflow:'hidden' }}>
                          <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,#3b82f6,#2563eb)', borderRadius:'5px', transition:'width 0.5s' }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      }
    </SectionCard>
  );
};

const SellerCarbonTab = ({ sellers }) => {
  const maxCO2 = Math.max(...(sellers || []).map(s => s.totalCO2 || 0), 1);
  return (
    <SectionCard title="🏪 Carbon Footprint per Seller (from Active Products)">
      {(!sellers || sellers.length === 0)
        ? <p style={{ color:'#94a3b8', textAlign:'center', padding:'40px' }}>No seller product data available yet</p>
        : (
          <>
            {/* Summary bar chart */}
            <div style={{ marginBottom:'28px' }}>
              <p style={{ color:'#64748b', fontSize:'13px', fontWeight:'600', marginBottom:'12px' }}>Total CO₂ by Seller (Material + Shipping)</p>
              <BarChart
                data={(sellers || []).map(s => ({ ...s, name: s.sellerName, emissions: s.totalCO2 }))}
                dataKey="emissions"
                nameKey="name"
                colors={BAR_COLORS}
              />
            </div>

            {/* Detail table */}
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'14px' }}>
                <thead>
                  <tr style={{ background:'linear-gradient(135deg,#eff6ff,#dbeafe)', borderBottom:'2px solid #bfdbfe' }}>
                    {['#','Seller','Products','Material CO₂','Shipping CO₂','Total CO₂','Avg Eco Score','Level'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', color:'#1e40af', fontWeight:'700', textAlign:'left', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((s, i) => {
                    const badge = getLevelBadge(s.totalCO2 || 0);
                    return (
                      <tr key={s.sellerId} style={{ borderBottom:'1px solid #f1f5f9', transition:'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background='#f8faff'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'12px 16px', color:'#94a3b8', fontWeight:'600' }}>{i+1}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                            <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'700', fontSize:'13px', flexShrink:0 }}>
                              {(s.sellerName || '?').charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight:'600', color:'#1e293b' }}>{s.sellerName || '—'}</span>
                          </div>
                        </td>
                        <td style={{ padding:'12px 16px', color:'#475569' }}>{s.productCount || 0}</td>
                        <td style={{ padding:'12px 16px', color:'#7c3aed', fontWeight:'600' }}>{fmt(s.materialCO2||0)} kg</td>
                        <td style={{ padding:'12px 16px', color:'#0891b2', fontWeight:'600' }}>{fmt(s.shippingCO2||0)} kg</td>
                        <td style={{ padding:'12px 16px', fontWeight:'700', color:'#1e293b' }}>{fmt(s.totalCO2||0)} kg</td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ color:'#15803d', fontWeight:'600' }}>{fmt1(s.avgEcoScore||0)}/5</span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ background:badge.bg, color:badge.color, padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', whiteSpace:'nowrap' }}>{badge.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )
      }
    </SectionCard>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────

const TABS = [
  { id:'overview',  label:'Overview',       icon:'🌍' },
  { id:'products',  label:'Products',       icon:'📦' },
  { id:'peruser',   label:'Per User',       icon:'👥' },
  { id:'perseller', label:'Per Seller',     icon:'🏪' },
];

const CarbonFootprintDashboard = () => {
  const { fetchCarbonAnalyticsData } = useGlobal();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchCarbonAnalyticsData();
        if (result.success) setAnalytics(result.analytics);
        else setError(result.message || 'Failed to load');
      } catch { setError('Failed to load dashboard data'); }
      finally { setLoading(false); }
    };
    load();
  }, [fetchCarbonAnalyticsData]);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#f0f9ff,#e0f2fe,#dbeafe)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:'64px', height:'64px', border:'4px solid rgba(59,130,246,0.2)', borderTop:'4px solid #3b82f6', borderRadius:'50%', margin:'0 auto 20px', animation:'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        <p style={{ color:'#1e40af', fontSize:'18px', fontWeight:'600' }}>Loading carbon analytics…</p>
      </div>
    </div>
  );

  const a            = analytics || {};
  const materialPct  = a.totalEmissions > 0 ? Math.round((a.totalMaterialCO2 / a.totalEmissions) * 100) : 0;
  const shippingPct  = a.totalEmissions > 0 ? Math.round((a.totalShippingCO2 / a.totalEmissions) * 100) : 0;

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#f0f9ff,#e0f2fe,#dbeafe)', padding:'32px 20px', position:'relative' }}>

      <div style={{ maxWidth:'1300px', margin:'0 auto' }}>

        {/* Header */}
        <div style={{ background:'rgba(255,255,255,0.9)', backdropFilter:'blur(10px)', borderRadius:'20px', padding:'24px 28px', border:'1px solid rgba(59,130,246,0.2)', boxShadow:'0 4px 20px rgba(59,130,246,0.1)', marginBottom:'28px' }}>
          <h1 style={{ fontSize:'36px', fontWeight:'800', background:'linear-gradient(135deg,#3b82f6,#2563eb,#1e40af)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'6px' }}>
            🌿 Carbon Footprint Analytics
          </h1>
          <p style={{ color:'#64748b', fontSize:'15px', fontWeight:'500' }}>
            Platform-wide environmental impact — products, orders, users, and sellers
          </p>
        </div>

        {error && (
          <div style={{ background:'#fee2e2', border:'2px solid #fca5a5', borderRadius:'16px', padding:'18px', marginBottom:'24px', display:'flex', gap:'12px' }}>
            <span style={{ fontSize:'22px' }}>⚠️</span>
            <p style={{ color:'#991b1b', fontWeight:'600' }}>{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'28px', flexWrap:'wrap' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display:'flex', alignItems:'center', gap:'8px',
                padding:'10px 22px', borderRadius:'12px', border:'none', cursor:'pointer',
                fontWeight:'600', fontSize:'14px', transition:'all 0.2s',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg,#3b82f6,#2563eb)'
                  : 'rgba(255,255,255,0.9)',
                color: activeTab === tab.id ? '#ffffff' : '#475569',
                boxShadow: activeTab === tab.id
                  ? '0 4px 14px rgba(37,99,235,0.35)'
                  : '0 2px 8px rgba(0,0,0,0.08)',
                transform: activeTab === tab.id ? 'translateY(-1px)' : 'none',
              }}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview'  && <OverviewTab a={a} materialPct={materialPct} shippingPct={shippingPct} />}
        {activeTab === 'products'  && <ProductsTab a={a} />}
        {activeTab === 'peruser'   && <UserCarbonTab   users={a.userCarbonList   || []} />}
        {activeTab === 'perseller' && <SellerCarbonTab sellers={a.sellerCarbonList || []} />}

      </div>
    </div>
  );
};

export default CarbonFootprintDashboard;