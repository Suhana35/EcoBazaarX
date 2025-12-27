

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const GlobalContext = createContext();

const API_BASE_URL = "http://localhost:8080/api";

const defaultProducts = [
  {
    id: 1,
    name: "Solar Powered Laptop",
    type: "Laptop",
    price: 45999,
    ecoScore: 4.5,
    footprint: 20.0,
    materialCO2: 15.0,
    shippingCO2: 5.0,
    image: "https://images.unsplash.com/photo-1587202372775-98927bbee07f?w=600",
    date: new Date().toISOString(),
    stockQuantity: 50, // Fixed: was 'quantity'
    sellerId: 101,
    sellerName: "EcoTech Pvt Ltd",
    status: "active",
    description: "High-performance solar laptop with eco-friendly materials.",
    rating: 0,
    sales: 0,
  },
  {
    id: 2,
    name: "Eco-Friendly Bamboo Laptop Stand",
    type: "Accessories",
    price: 1299,
    ecoScore: 4.8,
    footprint: 2.0,
    materialCO2: 1.3,
    shippingCO2: 0.7,
    image: "https://images.unsplash.com/photo-1606813902911-08fa33d68a07?w=600",
    date: new Date().toISOString(),
    stockQuantity: 120, // Fixed: was 'quantity'
    sellerId: 102,
    sellerName: "GreenLiving Store",
    status: "active",
    description: "Durable bamboo laptop stand for ergonomic work setup.",
    rating: 0,
    sales: 0,
  },
];

const sampleOrders = [
  {
    id: 1,
    name: "Eco-Friendly Water Bottle",
    price: 599,
    quantity: 2,
    ecoScore: 4.5,
    materialCO2: 2.1,
    shippingCO2: 0.8,
    date: "4 Sept 2025, 02:15 pm",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop",
    status: "delivered",
    trackingNumber: "TRK123456789",
    estimatedDelivery: null
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

  // Utility function for API requests with better error handling
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          setCurrentUser(null);
          throw new Error('Authentication expired');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  };

  // Fetch products with better error handling
  const fetchProducts = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setProducts(defaultProducts);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.length > 0) {
        setProducts(response.data);
      } else {
        setProducts(defaultProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products");
      setProducts(defaultProducts);
    }
  };

  const fetchProductsBySeller = async (sellerId) => {
    try {
      console.log("Fetching products for seller:", sellerId);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/products/seller/${sellerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const products = response.data || defaultProducts;
      console.log(products);
      setProducts(products);
      return products;
    } catch (error) {
      console.error("Error fetching seller products:", error);
      const fallbackProducts = defaultProducts.filter(p => p.sellerId === sellerId);
      setProducts(fallbackProducts);
      return fallbackProducts;
    }
  };

  // ================== PRODUCT CRUD ==================
  const addProduct = async (productData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      // Ensure stockQuantity is included in the request
      const productWithStock = {
        ...productData,
        stockQuantity: productData.stockQuantity || 0,
        sellerId: currentUser?.id,
        date: new Date().toISOString()
      };

      const response = await axios.post(
        `${API_BASE_URL}/products`,
        productWithStock,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newProduct = response.data;
      setProducts((prev) => [...prev, newProduct]);
      return { success: true, product: newProduct };
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Failed to add product");
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      // Ensure stockQuantity is included
      const updatedProductData = {
        ...updatedData,
        stockQuantity: updatedData.stockQuantity || 0
      };

      const response = await axios.put(
        `${API_BASE_URL}/products/seller/${id}`,
        updatedProductData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedProduct = response.data;
      setProducts((prev) =>
        prev.map((p) => (p.id === parseInt(id) ? updatedProduct : p))
      );

      return { success: true, product: updatedProduct };
    } catch (error) {
      console.error("Error updating product:", error);
      setError("Failed to update product");
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      await axios.delete(`${API_BASE_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts((prev) => prev.filter((p) => p.id !== parseInt(id)));
      return { success: true };
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Failed to delete product");
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  // Improved cart management with better error handling
  const addToCart = async (product, quantity = 1) => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await axios.post(
          `${API_BASE_URL}/cart/add`,
          { productId: product.id, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchCart();
      } else {
        // Guest cart - store in localStorage for persistence
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existingIndex = guestCart.findIndex(item => item.id === product.id);

        if (existingIndex > -1) {
          guestCart[existingIndex].quantity += quantity;
        } else {
          guestCart.push({ ...product, quantity });
        }

        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        setCartItems(guestCart);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError("Failed to add item to cart");
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    if (quantity < 1) return;

    try {
      const token = localStorage.getItem("token");

      if (token) {
        await axios.put(
          `${API_BASE_URL}/cart/items/${cartItemId}`,
          { quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchCart();
      } else {
        // Update guest cart
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const updatedCart = guestCart.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        );
        localStorage.setItem('guestCart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      setError("Failed to update cart item");
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await axios.delete(`${API_BASE_URL}/cart/items/${cartItemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchCart();
      } else {
        // Remove from guest cart
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const updatedCart = guestCart.filter(item => item.id !== cartItemId);
        localStorage.setItem('guestCart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
      }
    } catch (error) {
      console.error("Error removing item:", error);
      setError("Failed to remove cart item");
    }
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        // Load guest cart from localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        setCartItems(guestCart);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems(response.data.cartItems || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to fetch cart");
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await axios.get(`${API_BASE_URL}/auth/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });


      return { success: true, users: response.data };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setOrders(sampleOrders);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders");
      setOrders(sampleOrders);
    }
  };
  const fetchAllOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setOrders(sampleOrders);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/orders/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders");
      setOrders(sampleOrders);
    }
  };

  const fetchOrdersBySeller = async (sellerId) => {
    try {
      console.log("Fetching orders for seller:", sellerId);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await axios.get(`${API_BASE_URL}/orders/seller`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orders = response.data || [];
      console.log("Seller orders:", orders);
      setOrders(orders);
      return orders;
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      setError("Failed to fetch seller orders");
      // Return empty array as fallback for sellers
      const fallbackOrders = [];
      setOrders(fallbackOrders);
      return fallbackOrders;
    }
  };

  // ================== ORDER STATUS (SELLER) ==================
  const updateOrderStatusBySeller = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await axios.patch(
        `${API_BASE_URL}/orders/seller/${orderId}/status?status=${status}`,
        {}, // no body, just query param
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedOrder = response.data;
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );

      return { success: true, order: updatedOrder };
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Failed to update order status");
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const bulkUpdateOrdersStatus = async (orderIds, status) => {
    try {
      const results = [];
      for (const id of orderIds) {
        const res = await updateOrderStatusBySeller(id, status);
        results.push(res);
      }
      return results;
    } catch (error) {
      console.error("Bulk update failed:", error);
      return { success: false, message: error.message };
    }
  };
  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await axios.patch(
        `${API_BASE_URL}/orders/${orderId}/status?status=${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedOrder = response.data;
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );

      return { success: true, order: updatedOrder };
    } catch (error) {
      console.error("Error updating order status:", error);

      // Extract error message from backend response
      let errorMessage = "Failed to update order status";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string'
          ? error.response.data
          : error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await axios.patch(
        `${API_BASE_URL}/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedOrder = response.data;
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );

      return { success: true, order: updatedOrder };
    } catch (error) {
      console.error("Error cancelling order:", error);

      // Extract error message from backend response
      let errorMessage = "Failed to cancel order";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string'
          ? error.response.data
          : error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const placeOrderFromCart = async (orderDetails) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await axios.post(
        `${API_BASE_URL}/orders`,
        orderDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) => [...prev, response.data]);

      // Clear cart after successful order
      setCartItems([]);
      if (!token) {
        localStorage.removeItem('guestCart');
      }

      return { success: true, order: response.data };
    } catch (error) {
      console.error("Error placing order from cart:", error);
      return { success: false, message: error.response?.data?.message || error.message || "Could not place order" };
    }
  };

  const placeOrderForProduct = async (productId, quantity, orderDetails) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await axios.post(
        `${API_BASE_URL}/orders/product/${productId}?quantity=${quantity}`,
        orderDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) => [...prev, response.data]);
      return { success: true, order: response.data };
    } catch (error) {
      console.error("Error placing product order:", error);
      return { success: false, message: error.response?.data?.message || error.message || "Could not place order" };
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await makeAuthenticatedRequest('/auth/me');

      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: data.id,
          name: data.name || data.username,
          email: data.email,
          role: (data.role || (Array.isArray(data.roles) ? data.roles[0] : "user")).toLowerCase()
        };

        setCurrentUser(userData);
        return userData;
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem('token');
      setCurrentUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role.toUpperCase(),
          agreeToTerms: userData.agreeToTerms,
          subscribeNewsletter: userData.subscribeNewsletter
        })
      });

      const data = await response.json();
      return response.ok
        ? { success: true, message: data.message }
        : { success: false, message: data.message };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const loginUser = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.accessToken);

        const userData = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role.toLowerCase(),
        };

        setCurrentUser(userData);

        // Load appropriate data based on user role
        if (userData.role === "consumer") {
          await Promise.all([fetchCart(), fetchProducts()]);
        } else if (userData.role === "seller") {
          await Promise.all([
            fetchProductsBySeller(userData.id),
            fetchOrdersBySeller(userData.id)
          ]);
        }

        // Merge guest cart if exists
        if (userData.role === "consumer") {
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          if (guestCart.length > 0) {
            // Add guest cart items to user cart
            for (const item of guestCart) {
              await addToCart(item, item.quantity);
            }
            localStorage.removeItem('guestCart');
          }
        }

        return { success: true, user: userData };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('guestCart');
    setCurrentUser(null);
    setCartItems([]);
    setOrders([]);
    setError(null);
  };

  const addOrder = (product) => {
    const order = {
      id: product.id,
      name: product.name,
      price: product.price,
      ecoScore: product.ecoScore,
      materialCO2: product.materialCO2,
      shippingCO2: product.shippingCO2,
      image: product.image,
      quantity: product.quantity || 1,
      date: product.date || new Date().toISOString(),
      status: "processing",
      trackingNumber: `TRK${Math.floor(Math.random() * 1000000000)}`,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setOrders((prev) => [...prev, order]);
  };

  const updateUserStatus = async (uid, status) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await axios.patch(
        `${API_BASE_URL}/auth/admin/${uid}/status?status=${status}`,
        {}, // no body, just query param
        { headers: { Authorization: `Bearer ${token}` } }
      );



      return { success: true, user: response.data.data };
    } catch (error) {
      console.error("Error updating user status:", error);
      setError("Failed to update user status");
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };
  const updateUserRole = async (uid, role) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await axios.patch(
        `${API_BASE_URL}/auth/admin/${uid}/role?role=${role}`,
        {}, // no body, just query param
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return { success: true, user: response.data.data };
    } catch (error) {
      console.error("Error updating user role:", error);
      setError("Failed to update user role");
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const updateUserProfile = async (updateData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      // Prepare the request body
      const requestBody = {
        name: updateData.name,
        email: updateData.email
      };

      // Only include password fields if new password is provided
      if (updateData.newPassword) {
        requestBody.currentPassword = updateData.currentPassword;
        requestBody.newPassword = updateData.newPassword;
      }

      const response = await axios.put(
        `${API_BASE_URL}/auth/profile`,
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // CRITICAL FIX: If email was changed, backend returns a new JWT token
      // We MUST update localStorage with the new token to prevent authentication errors
      if (response.data.accessToken && response.data.accessToken !== "") {
        localStorage.setItem('token', response.data.accessToken);
        console.log("New JWT token saved after email change");
      }

      // Update current user state with new data
      setCurrentUser(prev => ({
        ...prev,
        name: response.data.name || updateData.name,
        email: response.data.email || updateData.email
      }));

      return { success: true, user: response.data };
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update profile";
      return { success: false, message: errorMessage };
    }
  };




  const fetchProductsForAnalytics = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        return { success: false, message: "Authentication required" };
      }

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, products: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error('Error fetching products for analytics:', error);
      setError('Failed to fetch products for analytics');
      return { success: false, message: error.message };
    }
  };

  // Fetch all orders for carbon analysis
  const fetchOrdersForAnalytics = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        return { success: false, message: "Authentication required" };
      }

      const response = await fetch(`${API_BASE_URL}/orders/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, orders: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error('Error fetching orders for analytics:', error);
      setError('Failed to fetch orders for analytics');
      return { success: false, message: error.message };
    }
  };

  // Fetch carbon analytics data (products and orders together)
  const fetchCarbonAnalyticsData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        return { success: false, message: "Authentication required" };
      }

      const [productsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_BASE_URL}/orders/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (!productsRes.ok || !ordersRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const products = await productsRes.json();
      const orders = await ordersRes.json();

      return {
        success: true,
        products: Array.isArray(products) ? products : [],
        orders: Array.isArray(orders) ? orders : []
      };
    } catch (error) {
      console.error('Error fetching carbon analytics data:', error);
      setError('Failed to fetch carbon analytics data');
      return {
        success: false,
        message: error.message,
        products: [],
        orders: []
      };
    }
  };

  // Get high emission products
  const getHighEmissionProducts = async (threshold = 10) => {
    try {
      const { success, products } = await fetchProductsForAnalytics();

      if (!success) {
        return { success: false, message: "Failed to fetch products" };
      }

      const highEmissionProducts = products.filter(p =>
        ((p.materialCO2 || 0) + (p.shippingCO2 || 0)) > threshold
      );

      return { success: true, products: highEmissionProducts };
    } catch (error) {
      console.error('Error getting high emission products:', error);
      return { success: false, message: error.message };
    }
  };

  // Get eco-friendly products
  const getEcoFriendlyProducts = async (minScore = 4.0) => {
    try {
      const { success, products } = await fetchProductsForAnalytics();

      if (!success) {
        return { success: false, message: "Failed to fetch products" };
      }

      const ecoProducts = products
        .filter(p => (p.ecoScore || 0) >= minScore)
        .sort((a, b) => (b.ecoScore || 0) - (a.ecoScore || 0));

      return { success: true, products: ecoProducts };
    } catch (error) {
      console.error('Error getting eco-friendly products:', error);
      return { success: false, message: error.message };
    }
  };

  // Calculate carbon emissions by category
  const getCarbonEmissionsByCategory = async () => {
    try {
      const { success, products } = await fetchProductsForAnalytics();

      if (!success) {
        return { success: false, message: "Failed to fetch products" };
      }

      const emissionsByCategory = {};
      products.forEach(p => {
        const category = p.type || 'Unknown';
        const emissions = (p.materialCO2 || 0) + (p.shippingCO2 || 0);

        if (!emissionsByCategory[category]) {
          emissionsByCategory[category] = {
            name: category,
            totalEmissions: 0,
            productCount: 0,
            avgEmissions: 0,
            materialCO2: 0,
            shippingCO2: 0
          };
        }

        emissionsByCategory[category].totalEmissions += emissions;
        emissionsByCategory[category].productCount += 1;
        emissionsByCategory[category].materialCO2 += p.materialCO2 || 0;
        emissionsByCategory[category].shippingCO2 += p.shippingCO2 || 0;
      });

      Object.keys(emissionsByCategory).forEach(cat => {
        emissionsByCategory[cat].avgEmissions =
          emissionsByCategory[cat].totalEmissions / emissionsByCategory[cat].productCount;
      });

      return { success: true, categories: Object.values(emissionsByCategory) };
    } catch (error) {
      console.error('Error calculating emissions by category:', error);
      return { success: false, message: error.message };
    }
  };

  // Get overall carbon metrics
  const getCarbonMetrics = async () => {
    try {
      const { success, products, orders } = await fetchCarbonAnalyticsData();

      if (!success) {
        return { success: false, message: "Failed to fetch data" };
      }

      const totalMaterialCO2 = products.reduce((sum, p) => sum + (p.materialCO2 || 0), 0);
      const totalShippingCO2 = products.reduce((sum, p) => sum + (p.shippingCO2 || 0), 0);
      const totalEmissions = totalMaterialCO2 + totalShippingCO2;
      const avgEcoScore = products.length > 0
        ? products.reduce((sum, p) => sum + (p.ecoScore || 0), 0) / products.length
        : 0;

      const orderEmissions = orders.reduce((sum, order) => sum + (order.totalCO2Footprint || 0), 0);

      return {
        success: true,
        metrics: {
          totalMaterialCO2,
          totalShippingCO2,
          totalEmissions,
          totalProductEmissions: totalEmissions,
          totalOrderEmissions: orderEmissions,
          avgEcoScore,
          totalProducts: products.length,
          totalOrders: orders.length
        }
      };
    } catch (error) {
      console.error('Error calculating carbon metrics:', error);
      return { success: false, message: error.message };
    }
  };


  // Initialize app on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = localStorage.getItem('token');

        if (token) {
          const user = await getCurrentUser();

          if (user) {
            if (user.role === "consumer") {
              await Promise.all([fetchCart(), fetchProducts()]);
            } else if (user.role === "seller") {
              await Promise.all([
                fetchProductsBySeller(user.id),
                fetchOrdersBySeller(user.id)
              ]);
            }
            else if (user.role === "admin") {
              await Promise.all([fetchProducts(), fetchAllOrders(), fetchAllUsers]);
            }
          }
        } else {
          // Load default data and guest cart
          await fetchProducts();
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          setCartItems(guestCart);
          setLoading(false);
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setError('Failed to initialize app');
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const value = {
    // State
    currentUser,
    products,
    cartItems,
    orders,
    loading,
    error,
    editingProduct,
    isEditMode,

    // Setters
    setProducts,
    setCartItems,
    setOrders,
    setEditingProduct,
    setIsEditMode,
    setError,

    // Cart functions
    addToCart,
    updateCartItem,
    removeFromCart,
    fetchCart,

    // Order functions
    addOrder,
    fetchOrders,
    fetchOrdersBySeller,
    placeOrderFromCart,
    placeOrderForProduct,
    updateOrderStatusBySeller,
    bulkUpdateOrdersStatus,

    // Product functions
    addProduct,
    updateProduct,
    deleteProduct,
    fetchProducts,
    fetchProductsBySeller,

    // Auth functions
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateUserProfile,

    // Utility
    makeAuthenticatedRequest,

    fetchAllOrders,
    fetchAllUsers,
    updateUserStatus,
    updateOrderStatus,
    cancelOrder,
    updateUserRole,

    fetchProductsForAnalytics,
    fetchOrdersForAnalytics,
    fetchCarbonAnalyticsData,
    getHighEmissionProducts,
    getEcoFriendlyProducts,
    getCarbonEmissionsByCategory,
    getCarbonMetrics
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within an Authenticate provider');
  }
  return context;
};
