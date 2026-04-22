import { createContext, useContext, useState, useEffect } from "react";

// FIX: Use the shared API instance — all requests automatically get the auth header
// via the interceptor in api.js. Previously raw axios was imported here and tokens were
// manually attached to every single call — inconsistent and error-prone.
import API from "../api";

const GlobalContext = createContext();

const defaultProducts = [
  {
    id: 1, name: "Solar Powered Laptop", type: "Laptop", price: 45999,
    ecoScore: 4.5, footprint: 20.0, materialCO2: 15.0, shippingCO2: 5.0,
    image: "https://images.unsplash.com/photo-1587202372775-98927bbee07f?w=600",
    date: new Date().toISOString(), stockQuantity: 50, sellerId: 101,
    sellerName: "EcoTech Pvt Ltd", status: "active",
    description: "High-performance solar laptop with eco-friendly materials.", rating: 0, sales: 0,
  },
  {
    id: 2, name: "Eco-Friendly Bamboo Laptop Stand", type: "Accessories", price: 1299,
    ecoScore: 4.8, footprint: 2.0, materialCO2: 1.3, shippingCO2: 0.7,
    image: "https://images.unsplash.com/photo-1606813902911-08fa33d68a07?w=600",
    date: new Date().toISOString(), stockQuantity: 120, sellerId: 102,
    sellerName: "GreenLiving Store", status: "active",
    description: "Durable bamboo laptop stand for ergonomic work setup.", rating: 0, sales: 0,
  },
];

const sampleOrders = [
  {
    id: 1, name: "Eco-Friendly Water Bottle", price: 599, quantity: 2,
    ecoScore: 4.5, materialCO2: 2.1, shippingCO2: 0.8, date: "4 Sept 2025, 02:15 pm",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop",
    status: "delivered", trackingNumber: "TRK123456789", estimatedDelivery: null,
  },
];

export const Authenticate = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ================== PRODUCTS ==================

  const fetchProducts = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) { setProducts(defaultProducts); return; }
      const response = await API.get("/products");
      setProducts(response.data?.length > 0 ? response.data : defaultProducts);
    } catch {
      setError("Failed to fetch products");
      setProducts(defaultProducts);
    }
  };

  const fetchProductsBySeller = async (sellerId) => {
    try {
      const response = await API.get(`/products/seller/${sellerId}`);
      const data = response.data || defaultProducts;
      setProducts(data);
      return data;
    } catch {
      const fallback = defaultProducts.filter((p) => p.sellerId === sellerId);
      setProducts(fallback);
      return fallback;
    }
  };

  // ================== PRODUCT CRUD ==================

  const addProduct = async (productData) => {
    try {
      const payload = { ...productData, stockQuantity: productData.stockQuantity || 0,
                        sellerId: currentUser?.id, date: new Date().toISOString() };
      const response = await API.post("/products", payload);
      setProducts((prev) => [...prev, response.data]);
      return { success: true, product: response.data };
    } catch (err) {
      setError("Failed to add product");
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const payload = { ...updatedData, stockQuantity: updatedData.stockQuantity || 0 };
      const response = await API.put(`/products/seller/${id}`, payload);
      setProducts((prev) => prev.map((p) => (p.id === parseInt(id) ? response.data : p)));
      return { success: true, product: response.data };
    } catch (err) {
      setError("Failed to update product");
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      await API.delete(`/products/seller/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== parseInt(id)));
      return { success: true };
    } catch (err) {
      setError("Failed to delete product");
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  // ================== CART ==================

  const addToCart = async (product, quantity = 1) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await API.post("/cart/add", { productId: product.id, quantity });
        await fetchCart();
      } else {
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        const idx = guestCart.findIndex((item) => item.id === product.id);
        if (idx > -1) guestCart[idx].quantity += quantity;
        else guestCart.push({ ...product, quantity });
        localStorage.setItem("guestCart", JSON.stringify(guestCart));
        setCartItems(guestCart);
      }
    } catch { setError("Failed to add item to cart"); }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    if (quantity < 1) return;
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await API.put(`/cart/items/${cartItemId}`, { quantity });
        await fetchCart();
      } else {
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        const updated = guestCart.map((item) =>
          item.id === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item
        );
        localStorage.setItem("guestCart", JSON.stringify(updated));
        setCartItems(updated);
      }
    } catch { setError("Failed to update cart item"); }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await API.delete(`/cart/items/${cartItemId}`);
        await fetchCart();
      } else {
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        const updated = guestCart.filter((item) => item.id !== cartItemId);
        localStorage.setItem("guestCart", JSON.stringify(updated));
        setCartItems(updated);
      }
    } catch { setError("Failed to remove cart item"); }
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { setCartItems(JSON.parse(localStorage.getItem("guestCart") || "[]")); return; }
      const response = await API.get("/cart");
      setCartItems(response.data.cartItems || []);
    } catch { setError("Failed to fetch cart"); }
  };

  // ================== ORDERS ==================

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { setOrders(sampleOrders); return; }
      const response = await API.get("/orders");
      setOrders(response.data || []);
    } catch { setError("Failed to fetch orders"); setOrders(sampleOrders); }
  };

  const fetchAllOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { setOrders(sampleOrders); return; }
      // Backend returns a Page — content array is at response.data.content
      const response = await API.get("/orders/all?page=0&size=100");
      setOrders(response.data?.content || response.data || []);
    } catch { setError("Failed to fetch orders"); setOrders(sampleOrders); }
  };

  const fetchOrdersBySeller = async () => {
    try {
      const response = await API.get("/orders/seller");
      const data = response.data || [];
      setOrders(data);
      return data;
    } catch { setError("Failed to fetch seller orders"); setOrders([]); return []; }
  };

  const updateOrderStatusBySeller = async (orderId, status) => {
    try {
      const response = await API.patch(`/orders/seller/${orderId}/status?status=${status}`, {});
      setOrders((prev) => prev.map((o) => (o.id === orderId ? response.data : o)));
      return { success: true, order: response.data };
    } catch (err) {
      setError("Failed to update order status");
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  // FIX: Changed from sequential await-in-loop to Promise.all — fires all in parallel.
  // Previously 20 orders = 20 serial round-trips. Now they all fire at once.
  const bulkUpdateOrdersStatus = async (orderIds, status) => {
    try {
      return await Promise.all(orderIds.map((id) => updateOrderStatusBySeller(id, status)));
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await API.patch(`/orders/${orderId}/status?status=${status}`, {});
      setOrders((prev) => prev.map((o) => (o.id === orderId ? response.data : o)));
      return { success: true, order: response.data };
    } catch (err) {
      const msg = err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        err.message || "Failed to update order status";
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await API.patch(`/orders/${orderId}/cancel`, {});
      setOrders((prev) => prev.map((o) => (o.id === orderId ? response.data : o)));
      return { success: true, order: response.data };
    } catch (err) {
      const msg = err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        err.message || "Failed to cancel order";
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const placeOrderFromCart = async (orderDetails) => {
    try {
      const response = await API.post("/orders", orderDetails);
      setOrders((prev) => [...prev, response.data]);
      setCartItems([]);
      return { success: true, order: response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message || "Could not place order" };
    }
  };

  const placeOrderForProduct = async (productId, quantity, orderDetails) => {
    try {
      const response = await API.post(`/orders/product/${productId}?quantity=${quantity}`, orderDetails);
      setOrders((prev) => [...prev, response.data]);
      return { success: true, order: response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message || "Could not place order" };
    }
  };

  const addOrder = (product) => {
    setOrders((prev) => [...prev, {
      id: product.id, name: product.name, price: product.price,
      ecoScore: product.ecoScore, materialCO2: product.materialCO2,
      shippingCO2: product.shippingCO2, image: product.image,
      quantity: product.quantity || 1, date: product.date || new Date().toISOString(),
      status: "processing",
      trackingNumber: `TRK${Math.floor(Math.random() * 1000000000)}`,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    }]);
  };

  // ================== AUTH ==================

  const getCurrentUser = async () => {
    try {
      const response = await API.get("/auth/me");
      const data = response.data;
      const userData = {
        id: data.id, name: data.name || data.username, email: data.email,
        role: (data.role || (Array.isArray(data.roles) ? data.roles[0] : "user")).toLowerCase(),
      };
      setCurrentUser(userData);
      return userData;
    } catch {
      localStorage.removeItem("token");
      setCurrentUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await API.post("/auth/signup", {
        name: userData.name, email: userData.email, password: userData.password,
        role: userData.role.toUpperCase(), agreeToTerms: userData.agreeToTerms,
        subscribeNewsletter: userData.subscribeNewsletter,
      });
      return { success: true, message: response.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Registration failed. Please try again." };
    }
  };

  const loginUser = async (email, password) => {
    try {
      const response = await API.post("/auth/signin", { email, password });
      const data = response.data;
      localStorage.setItem("token", data.accessToken);
      const userData = { id: data.id, name: data.name, email: data.email, role: data.role.toLowerCase() };
      setCurrentUser(userData);

      if (userData.role === "consumer") {
        await Promise.all([fetchCart(), fetchProducts()]);
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        for (const item of guestCart) await addToCart(item, item.quantity);
        if (guestCart.length > 0) localStorage.removeItem("guestCart");
      } else if (userData.role === "seller") {
        await Promise.all([fetchProductsBySeller(userData.id), fetchOrdersBySeller()]);
      }
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login failed. Please try again." };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("guestCart");
    setCurrentUser(null); setCartItems([]); setOrders([]); setError(null);
  };

  // ================== ADMIN ==================

  const fetchAllUsers = async () => {
    try {
      const response = await API.get("/auth/admin/users");
      return { success: true, users: response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const updateUserStatus = async (uid, status) => {
    try {
      const response = await API.patch(`/auth/admin/${uid}/status?status=${status}`, {});
      return { success: true, user: response.data.data };
    } catch (err) {
      setError("Failed to update user status");
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const updateUserRole = async (uid, role) => {
    try {
      const response = await API.patch(`/auth/admin/${uid}/role?role=${role}`, {});
      return { success: true, user: response.data.data };
    } catch (err) {
      setError("Failed to update user role");
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const updateUserProfile = async (updateData) => {
    try {
      const body = { name: updateData.name, email: updateData.email };
      if (updateData.newPassword) {
        body.currentPassword = updateData.currentPassword;
        body.newPassword = updateData.newPassword;
      }
      const response = await API.put("/auth/profile", body);
      if (response.data.accessToken && response.data.accessToken !== "") {
        localStorage.setItem("token", response.data.accessToken);
      }
      setCurrentUser((prev) => ({
        ...prev, name: response.data.name || updateData.name, email: response.data.email || updateData.email,
      }));
      return { success: true, user: response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message || "Failed to update profile" };
    }
  };

  // ================== ANALYTICS ==================

  /**
   * BEFORE: called GET /products (all rows) + GET /orders/all?size=1000,
   * then computed totals / groupings / rankings inside useMemo in the component.
   *
   * AFTER: one call to GET /api/analytics/carbon which returns a fully
   * pre-aggregated CarbonAnalyticsDto built with DB-level GROUP BY / SUM / COUNT
   * queries. The component only needs to render the numbers.
   */
  const fetchCarbonAnalyticsData = async () => {
    try {
      const response = await API.get("/analytics/carbon");
      const data = response.data;
      return { success: true, analytics: data };
    } catch (err) {
      setError("Failed to fetch carbon analytics data");
      return { success: false, message: err.message, analytics: null };
    }
  };

  // Kept for backwards compat — callers that still need raw product list
  const fetchProductsForAnalytics = async () => {
    try {
      const response = await API.get("/products");
      return { success: true, products: Array.isArray(response.data) ? response.data : [] };
    } catch (err) {
      setError("Failed to fetch products for analytics");
      return { success: false, message: err.message };
    }
  };

  // Kept for backwards compat — new analytics code should use fetchCarbonAnalyticsData
  const makeAuthenticatedRequest = async (url, options = {}) => {
    return API.request({ url, method: options.method || "GET",
      data: options.body ? JSON.parse(options.body) : undefined, headers: options.headers });
  };

  // ================== INIT ==================

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const user = await getCurrentUser();
          if (user) {
            if (user.role === "consumer") await Promise.all([fetchCart(), fetchProducts()]);
            else if (user.role === "seller") await Promise.all([fetchProductsBySeller(user.id), fetchOrdersBySeller()]);
            else if (user.role === "admin") await Promise.all([fetchProducts(), fetchAllOrders(), fetchAllUsers()]);
          }
        } else {
          await fetchProducts();
          setCartItems(JSON.parse(localStorage.getItem("guestCart") || "[]"));
          setLoading(false);
        }
      } catch {
        setError("Failed to initialize app");
        setLoading(false);
      }
    };
    initializeApp();
  }, []);

  const value = {
    currentUser, products, cartItems, orders, loading, error, editingProduct, isEditMode,
    setProducts, setCartItems, setOrders, setEditingProduct, setIsEditMode, setError,
    addToCart, updateCartItem, removeFromCart, fetchCart,
    addOrder, fetchOrders, fetchOrdersBySeller, placeOrderFromCart, placeOrderForProduct,
    updateOrderStatusBySeller, bulkUpdateOrdersStatus,
    addProduct, updateProduct, deleteProduct, fetchProducts, fetchProductsBySeller,
    registerUser, loginUser, logoutUser, getCurrentUser, updateUserProfile,
    makeAuthenticatedRequest,
    fetchAllOrders, fetchAllUsers, updateUserStatus, updateOrderStatus, cancelOrder, updateUserRole,
    fetchProductsForAnalytics, fetchCarbonAnalyticsData,
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobal must be used within an Authenticate provider");
  return context;
};