import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobal } from "../context/GlobalContext";
import { FaLeaf, FaRecycle, FaSeedling } from "react-icons/fa";
import { FiArrowLeft, FiAlertTriangle, FiCheckCircle, FiInfo } from "react-icons/fi";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => (typeof n === "number" ? n.toFixed(2) : "0.00");

const getCO2Level = (kg) => {
  if (kg === 0)   return { label: "No Impact",  color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", icon: "🌿", desc: "No carbon footprint recorded yet." };
  if (kg < 5)     return { label: "Low",         color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", icon: "🌱", desc: "Great job! Your shopping has a low carbon impact." };
  if (kg < 20)    return { label: "Moderate",    color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", icon: "⚠️", desc: "Your impact is moderate. A few changes can make a big difference." };
  if (kg < 50)    return { label: "High",        color: "#ef4444", bg: "#fef2f2", border: "#fecaca", icon: "🔴", desc: "Your carbon footprint is high. Check our suggestions below." };
  return           { label: "Very High",   color: "#991b1b", bg: "#fff1f2", border: "#fecdd3", icon: "🚨", desc: "Very high footprint. Prioritising eco-friendly products can help significantly." };
};

const getEcoScoreLabel = (score) => {
  if (score >= 4.5) return { label: "Excellent", color: "#15803d" };
  if (score >= 3.5) return { label: "Good",       color: "#22c55e" };
  if (score >= 2.5) return { label: "Average",    color: "#f59e0b" };
  if (score >= 1.5) return { label: "Poor",       color: "#ef4444" };
  return                   { label: "Very Poor",  color: "#991b1b" };
};

const TIPS = [
  { icon: "🌿", tip: "Choose products with an Eco Score of 4 or above to reduce your footprint per purchase." },
  { icon: "📦", tip: "Fewer orders with more items each time reduces total shipping CO₂." },
  { icon: "🔍", tip: "Use the 'Lowest Carbon Footprint' sort on the Home page to always see the greenest options first." },
  { icon: "♻️", tip: "Products with low Material CO₂ use sustainable raw materials. Look for ones under 2 kg." },
  { icon: "🚚", tip: "Products with low Shipping CO₂ come from nearby sellers or use efficient delivery methods." },
];

// ── Sub-components ────────────────────────────────────────────────────────────
const StatCard = ({ label, value, unit, icon, color, bg, border }) => (
  <div className="rounded-2xl p-5 flex flex-col gap-2 shadow-sm border"
    style={{ background: bg, borderColor: border }}>
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>{label}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="flex items-end gap-1">
      <span className="text-3xl font-extrabold text-gray-900">{value}</span>
      {unit && <span className="text-sm text-gray-500 mb-1">{unit}</span>}
    </div>
  </div>
);

const CO2Bar = ({ label, materialCO2, shippingCO2, total, maxTotal }) => {
  const pct = maxTotal > 0 ? Math.min((total / maxTotal) * 100, 100) : 0;
  const level = getCO2Level(total);
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 truncate max-w-[60%]">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{fmt(materialCO2)}+{fmt(shippingCO2)} kg</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: level.color }}>
            {fmt(total)} kg
          </span>
        </div>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${level.color}cc, ${level.color})` }} />
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ConsumerCarbonInsight = () => {
  const { orders, fetchOrders, currentUser } = useGlobal();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (currentUser) await fetchOrders();
      setLoading(false);
    };
    load();
  }, [currentUser]);

  // Build display orders from raw order data (same mapping as OrderHistory)
  const displayOrders = useMemo(() => {
    return (orders || [])
      .filter(o => o.status !== "cancelled")
      .map(order => {
        const items = order.orderItems || [];
        const materialCO2 = items.reduce((s, i) => s + (i.materialCO2 || 0) * (i.quantity || 1), 0);
        const shippingCO2 = items.reduce((s, i) => s + (i.shippingCO2 || 0) * (i.quantity || 1), 0);
        const totalCO2    = order.totalCO2Footprint || (materialCO2 + shippingCO2);
        const ecoScore    = order.totalEcoScore || 0;
        const name        = items.length > 1
          ? `Order #${order.id} (${items.length} items)`
          : (items[0]?.productName || `Order #${order.id}`);
        return {
          id: order.id,
          name,
          date: order.orderDate,
          totalCO2: parseFloat(totalCO2) || 0,
          materialCO2: parseFloat(materialCO2) || 0,
          shippingCO2: parseFloat(shippingCO2) || 0,
          ecoScore: parseFloat(ecoScore) || 0,
          status: order.status,
        };
      });
  }, [orders]);

  // Aggregates
  const totalCO2      = displayOrders.reduce((s, o) => s + o.totalCO2, 0);
  const totalMaterial = displayOrders.reduce((s, o) => s + o.materialCO2, 0);
  const totalShipping = displayOrders.reduce((s, o) => s + o.shippingCO2, 0);
  const avgEcoScore   = displayOrders.length
    ? displayOrders.reduce((s, o) => s + o.ecoScore, 0) / displayOrders.length
    : 0;
  const avgCO2PerOrder = displayOrders.length ? totalCO2 / displayOrders.length : 0;
  const maxOrderCO2   = Math.max(...displayOrders.map(o => o.totalCO2), 0.1);
  const level         = getCO2Level(totalCO2);
  const ecoLabel      = getEcoScoreLabel(avgEcoScore);
  const materialPct   = totalCO2 > 0 ? ((totalMaterial / totalCO2) * 100).toFixed(0) : 0;
  const shippingPct   = totalCO2 > 0 ? ((totalShipping / totalCO2) * 100).toFixed(0) : 0;

  const sortedByWorst = [...displayOrders].sort((a, b) => b.totalCO2 - a.totalCO2).slice(0, 5);
  const sortedByBest  = [...displayOrders].sort((a, b) => b.ecoScore - a.ecoScore).slice(0, 5);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-green-700 font-semibold text-lg">Loading your carbon insights…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#00b4d8] text-white px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium mb-6 transition-all">
            <FiArrowLeft /> Back
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-3xl">🌍</div>
            <div>
              <h1 className="text-3xl font-extrabold">My Carbon Footprint</h1>
              <p className="text-white/75 text-sm mt-1">
                Impact from {displayOrders.length} active order{displayOrders.length !== 1 ? "s" : ""}
                {currentUser?.name ? ` · ${currentUser.name}` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {displayOrders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Place your first eco-friendly order to see your carbon impact here.</p>
            <button onClick={() => navigate("/home")}
              className="bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Overall Rating Banner */}
            <div className="rounded-2xl p-6 border-2 shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-4"
              style={{ background: level.bg, borderColor: level.border }}>
              <div className="text-5xl">{level.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl font-extrabold" style={{ color: level.color }}>
                    {level.label} Impact
                  </span>
                  <span className="text-sm font-bold px-3 py-1 rounded-full text-white" style={{ background: level.color }}>
                    {fmt(totalCO2)} kg CO₂
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{level.desc}</p>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total CO₂"        value={fmt(totalCO2)}        unit="kg"  icon="🌍" color="#0077b6" bg="#eff6ff" border="#bfdbfe" />
              <StatCard label="Material CO₂"     value={fmt(totalMaterial)}   unit="kg"  icon="🏭" color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" />
              <StatCard label="Shipping CO₂"     value={fmt(totalShipping)}   unit="kg"  icon="🚚" color="#d97706" bg="#fffbeb" border="#fde68a" />
              <StatCard label="Avg Eco Score"    value={avgEcoScore.toFixed(1)} unit="/5" icon="🌿" color={ecoLabel.color} bg="#f0fdf4" border="#bbf7d0" />
            </div>

            {/* Breakdown + Avg per Order */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Material vs Shipping Split */}
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaRecycle className="text-[#0077b6]" /> Emissions Breakdown
                </h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="h-5 rounded-full overflow-hidden flex bg-gray-100">
                      <div className="h-full bg-purple-500 transition-all duration-700" style={{ width: `${materialPct}%` }} />
                      <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${shippingPct}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0" />
                    <span className="text-gray-600">Material: <strong>{materialPct}%</strong> ({fmt(totalMaterial)} kg)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="text-gray-600">Shipping: <strong>{shippingPct}%</strong> ({fmt(totalShipping)} kg)</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                  Material CO₂ comes from manufacturing the product. Shipping CO₂ comes from delivery. Choosing nearby sellers and products made with sustainable materials reduces both.
                </p>
              </div>

              {/* Per-order average */}
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiInfo className="text-[#0077b6]" /> Your Averages
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Avg CO₂ per order</span>
                    <span className="font-bold text-gray-900">{fmt(avgCO2PerOrder)} kg</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Avg Eco Score</span>
                    <span className="font-bold" style={{ color: ecoLabel.color }}>
                      {avgEcoScore.toFixed(1)}/5 — {ecoLabel.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total orders counted</span>
                    <span className="font-bold text-gray-900">{displayOrders.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-gray-600">Highest single-order CO₂</span>
                    <span className="font-bold text-red-600">{fmt(maxOrderCO2)} kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Per-Order CO₂ Chart */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>📊</span> CO₂ by Order (top 10)
              </h2>
              {sortedByWorst.length === 0 ? (
                <p className="text-gray-400 text-center py-6">No data available</p>
              ) : (
                sortedByWorst.map(o => (
                  <CO2Bar
                    key={o.id}
                    label={o.name}
                    materialCO2={o.materialCO2}
                    shippingCO2={o.shippingCO2}
                    total={o.totalCO2}
                    maxTotal={maxOrderCO2}
                  />
                ))
              )}
            </div>

            {/* Greenest Orders */}
            {sortedByBest.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiCheckCircle className="text-green-500" /> Your Greenest Orders
                </h2>
                <div className="space-y-3">
                  {sortedByBest.map((o, i) => (
                    <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <span className="text-sm text-gray-700 truncate max-w-[200px]">{o.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{fmt(o.totalCO2)} kg CO₂</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          ⭐ {o.ecoScore.toFixed(1)}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] rounded-2xl p-6 text-white shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaSeedling className="text-green-300" /> How to Reduce Your Footprint
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {TIPS.map((t, i) => (
                  <div key={i} className="bg-white/10 border border-white/20 rounded-xl p-4 text-sm leading-relaxed">
                    <span className="text-lg mr-2">{t.icon}</span>{t.tip}
                  </div>
                ))}
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
};

export default ConsumerCarbonInsight;