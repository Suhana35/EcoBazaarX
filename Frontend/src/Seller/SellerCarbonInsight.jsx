import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobal } from "../context/GlobalContext";
import { FaLeaf, FaRecycle, FaSeedling } from "react-icons/fa";
import { FiArrowLeft, FiPackage, FiAlertTriangle, FiCheckCircle, FiBarChart2 } from "react-icons/fi";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => (typeof n === "number" ? n.toFixed(2) : "0.00");

const getProductLevel = (totalCO2) => {
  if (totalCO2 === 0) return { label: "No Data", color: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0", icon: "⚪" };
  if (totalCO2 < 2)   return { label: "Low",      color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", icon: "🌱" };
  if (totalCO2 < 8)   return { label: "Moderate", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", icon: "🟡" };
  if (totalCO2 < 20)  return { label: "High",     color: "#ef4444", bg: "#fef2f2", border: "#fecaca", icon: "🔴" };
  return                     { label: "Very High", color: "#991b1b", bg: "#fff1f2", border: "#fecdd3", icon: "🚨" };
};

const getEcoScoreColor = (score) => {
  if (score >= 4) return "#15803d";
  if (score >= 3) return "#22c55e";
  if (score >= 2) return "#f59e0b";
  return "#ef4444";
};

const PRODUCT_TIPS = [
  { icon: "🌿", tip: "Raise your Eco Score to 4+ — products appear first in 'Best Eco Score' sort, attracting more buyers." },
  { icon: "🏭", tip: "Lower Material CO₂ by using recycled or sustainably sourced raw materials." },
  { icon: "🚚", tip: "Lower Shipping CO₂ by using compact packaging or partnering with local delivery services." },
  { icon: "📦", tip: "Products with total CO₂ below 5 kg get better visibility in eco filters used by conscious buyers." },
  { icon: "📊", tip: "Keep stock quantities updated — out-of-stock products still show their footprint but can't be ordered." },
];

// ── Sub-components ────────────────────────────────────────────────────────────
const StatCard = ({ label, value, unit, icon, color, bg, border }) => (
  <div className="rounded-2xl p-5 flex flex-col gap-2 shadow-sm border" style={{ background: bg, borderColor: border }}>
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

const EcoBar = ({ value, max, color }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }} />
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const SellerCarbonInsight = () => {
  const { products, orders, fetchProductsBySeller, fetchOrdersBySeller, currentUser } = useGlobal();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products"); // "products" | "orders"

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (currentUser?.id) {
        await Promise.all([fetchProductsBySeller(currentUser.id), fetchOrdersBySeller()]);
      }
      setLoading(false);
    };
    load();
  }, [currentUser]);

  // ── Products data ────────────────────────────────────────────────────────
  const productData = useMemo(() => {
    return (products || []).map(p => ({
      id: p.id,
      name: p.name || "Unnamed Product",
      type: p.type || "—",
      ecoScore:    parseFloat(p.ecoScore)    || 0,
      materialCO2: parseFloat(p.materialCO2) || 0,
      shippingCO2: parseFloat(p.shippingCO2) || 0,
      totalCO2:    parseFloat(p.footprint)   || (parseFloat(p.materialCO2) || 0) + (parseFloat(p.shippingCO2) || 0),
      stock: p.stockQuantity ?? 0,
      status: p.status || "active",
      sales: p.sales || 0,
    }));
  }, [products]);

  const totalProductCO2 = productData.reduce((s, p) => s + p.totalCO2, 0);
  const totalMaterialCO2 = productData.reduce((s, p) => s + p.materialCO2, 0);
  const totalShippingCO2 = productData.reduce((s, p) => s + p.shippingCO2, 0);
  const avgEcoScore = productData.length
    ? productData.reduce((s, p) => s + p.ecoScore, 0) / productData.length : 0;
  const maxProductCO2 = Math.max(...productData.map(p => p.totalCO2), 0.1);
  const highImpactCount = productData.filter(p => p.totalCO2 >= 8).length;
  const sortedProductsByWorst = [...productData].sort((a, b) => b.totalCO2 - a.totalCO2);
  const sortedProductsByBest  = [...productData].sort((a, b) => b.ecoScore - a.ecoScore).slice(0, 5);

  // ── Orders data ──────────────────────────────────────────────────────────
  const orderData = useMemo(() => {
    return (orders || [])
      .filter(o => o && o.orderItems && Array.isArray(o.orderItems))
      .map(order => {
        const sellerItems = order.orderItems.filter(i => i.sellerId === currentUser?.id || true); // all seller items
        const totalCO2 = sellerItems.reduce(
          (s, i) => s + ((parseFloat(i.materialCO2) || 0) + (parseFloat(i.shippingCO2) || 0)) * (i.quantity || 1), 0
        );
        const materialCO2 = sellerItems.reduce((s, i) => s + (parseFloat(i.materialCO2) || 0) * (i.quantity || 1), 0);
        const shippingCO2 = sellerItems.reduce((s, i) => s + (parseFloat(i.shippingCO2) || 0) * (i.quantity || 1), 0);
        const avgEco = sellerItems.length
          ? sellerItems.reduce((s, i) => s + (parseFloat(i.ecoScore) || 0), 0) / sellerItems.length : 0;
        const name = sellerItems.length === 1
          ? (sellerItems[0].productName || `Order #${order.id}`)
          : `Order #${order.id} (${sellerItems.length} items)`;
        return {
          id: order.id, name,
          date: order.orderDate,
          status: order.status,
          totalCO2: parseFloat(totalCO2) || 0,
          materialCO2: parseFloat(materialCO2) || 0,
          shippingCO2: parseFloat(shippingCO2) || 0,
          ecoScore: parseFloat(avgEco) || 0,
        };
      })
      .filter(o => o.status !== "cancelled");
  }, [orders, currentUser]);

  const totalOrderCO2     = orderData.reduce((s, o) => s + o.totalCO2, 0);
  const totalOrderMaterial = orderData.reduce((s, o) => s + o.materialCO2, 0);
  const totalOrderShipping = orderData.reduce((s, o) => s + o.shippingCO2, 0);
  const maxOrderCO2       = Math.max(...orderData.map(o => o.totalCO2), 0.1);
  const sortedOrdersByWorst = [...orderData].sort((a, b) => b.totalCO2 - a.totalCO2).slice(0, 10);
  const materialPct = totalOrderCO2 > 0 ? ((totalOrderMaterial / totalOrderCO2) * 100).toFixed(0) : 0;
  const shippingPct = totalOrderCO2 > 0 ? ((totalOrderShipping / totalOrderCO2) * 100).toFixed(0) : 0;

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-[#00b4d8]/30 border-t-[#0077b6] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#0077b6] font-semibold text-lg">Loading carbon insights…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">

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
              <h1 className="text-3xl font-extrabold">Carbon Insights</h1>
              <p className="text-white/75 text-sm mt-1">
                Track the eco impact of your products and orders
                {currentUser?.name ? ` · ${currentUser.name}` : ""}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mt-6">
            {[
              { id: "products", label: "My Products", icon: <FaLeaf /> },
              { id: "orders",   label: "My Orders",   icon: <FiPackage /> },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-[#03045e] shadow-lg"
                    : "bg-white/15 text-white hover:bg-white/25 border border-white/20"
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* ── PRODUCTS TAB ── */}
        {activeTab === "products" && (
          <>
            {productData.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No products listed yet</h3>
                <p className="text-gray-500 mb-6">Add products via the Seller Dashboard to see their carbon data here.</p>
                <button onClick={() => navigate("/selDashboard")}
                  className="bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Products"          value={productData.length} unit=""      icon="📦" color="#0077b6" bg="#eff6ff" border="#bfdbfe" />
                  <StatCard label="Total CO₂ Listed"  value={fmt(totalProductCO2)} unit="kg" icon="🌍" color="#dc2626" bg="#fef2f2" border="#fecaca" />
                  <StatCard label="Avg Eco Score"     value={avgEcoScore.toFixed(1)} unit="/5" icon="🌿" color="#15803d" bg="#f0fdf4" border="#bbf7d0" />
                  <StatCard label="High Impact (≥8kg)" value={highImpactCount} unit="prods" icon="⚠️" color="#d97706" bg="#fffbeb" border="#fde68a" />
                </div>

                {/* Product CO₂ breakdown table */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <FiBarChart2 className="text-[#0077b6]" />
                    <h2 className="text-lg font-bold text-gray-900">All Products — Carbon Footprint</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {sortedProductsByWorst.map(p => {
                      const lvl = getProductLevel(p.totalCO2);
                      return (
                        <div key={p.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900 truncate">{p.name}</span>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">{p.type}</span>
                                {p.status === "inactive" && (
                                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">Inactive</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>🏭 Material: {fmt(p.materialCO2)} kg</span>
                                <span>🚚 Shipping: {fmt(p.shippingCO2)} kg</span>
                                <span style={{ color: getEcoScoreColor(p.ecoScore) }}>⭐ Eco: {p.ecoScore.toFixed(1)}/5</span>
                              </div>
                              <div className="mt-2">
                                <EcoBar value={p.totalCO2} max={maxProductCO2} color={lvl.color} />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: lvl.color }}>
                                {lvl.icon} {fmt(p.totalCO2)} kg
                              </span>
                              <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ color: lvl.color, background: lvl.bg }}>
                                {lvl.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Greenest products */}
                {sortedProductsByBest.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FiCheckCircle className="text-green-500" /> Your Greenest Products
                    </h2>
                    <div className="space-y-3">
                      {sortedProductsByBest.map((p, i) => (
                        <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{fmt(p.totalCO2)} kg CO₂</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              ⭐ {p.ecoScore.toFixed(1)}/5
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (
          <>
            {orderData.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h3>
                <p className="text-gray-500">Once consumers place orders for your products, their carbon data will appear here.</p>
              </div>
            ) : (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Orders"          value={orderData.length}     unit=""    icon="📋" color="#0077b6" bg="#eff6ff" border="#bfdbfe" />
                  <StatCard label="Total CO₂ Sold"  value={fmt(totalOrderCO2)}   unit="kg"  icon="🌍" color="#dc2626" bg="#fef2f2" border="#fecaca" />
                  <StatCard label="From Materials"  value={fmt(totalOrderMaterial)} unit="kg" icon="🏭" color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" />
                  <StatCard label="From Shipping"   value={fmt(totalOrderShipping)} unit="kg" icon="🚚" color="#d97706" bg="#fffbeb" border="#fde68a" />
                </div>

                {/* Breakdown */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaRecycle className="text-[#0077b6]" /> Order Emissions Breakdown
                  </h2>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1 h-5 rounded-full overflow-hidden flex bg-gray-100">
                      <div className="h-full bg-purple-500 transition-all duration-700" style={{ width: `${materialPct}%` }} />
                      <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${shippingPct}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-purple-500" />
                      <span className="text-gray-600">Material: <strong>{materialPct}%</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="text-gray-600">Shipping: <strong>{shippingPct}%</strong></span>
                    </div>
                  </div>
                </div>

                {/* Per-order CO₂ */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>📊</span> CO₂ by Order (highest first)
                  </h2>
                  {sortedOrdersByWorst.map(o => {
                    const pct = maxOrderCO2 > 0 ? Math.min((o.totalCO2 / maxOrderCO2) * 100, 100) : 0;
                    const lvl = getProductLevel(o.totalCO2);
                    return (
                      <div key={o.id} className="mb-5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700 truncate max-w-[60%]">{o.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{fmt(o.materialCO2)}+{fmt(o.shippingCO2)} kg</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: lvl.color }}>
                              {fmt(o.totalCO2)} kg
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${lvl.color}99, ${lvl.color})` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* Tips — shown on both tabs */}
        <div className="bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaSeedling className="text-green-300" /> Tips to Improve Your Eco Impact
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {PRODUCT_TIPS.map((t, i) => (
              <div key={i} className="bg-white/10 border border-white/20 rounded-xl p-4 text-sm leading-relaxed">
                <span className="text-lg mr-2">{t.icon}</span>{t.tip}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SellerCarbonInsight;