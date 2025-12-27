import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiShoppingCart, FiMinus, FiPlus, FiArrowLeft, FiTruck, FiAward, FiCreditCard } from "react-icons/fi";
import { FaRecycle, FaShieldAlt } from "react-icons/fa";
import { FiSun } from "react-icons/fi";
import { useGlobal } from "../context/GlobalContext";
import CheckOut from "./CheckOut";

const ProductCart = () => {
  const { cartItems, setCartItems, addOrder, placeOrderFromCart, products, updateCartItem, removeFromCart, addToCart } = useGlobal();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [checkoutQty, setCheckoutQty] = useState(1);

  // quantity update - use item.id (cart item ID)
  const updateQuantity = (cartItemId, qty) => {
    updateCartItem(cartItemId, Math.max(1, qty));
  };

  // remove product - use item.id (cart item ID)  
  const removeProduct = cartItemId => {
    removeFromCart(cartItemId);
  };

<<<<<<< HEAD
  // save for later - use entire cart item
  const saveForLater = (cartItem) => {
    setSavedForLater(prev => [...prev, cartItem]);
    removeProduct(cartItem.id); // Use cart item ID
  };

  // move to cart - use product from cart item
  const moveToCart = (cartItem) => {
    addToCart(cartItem.product, 1); // Use the product object
    setSavedForLater(prev => prev.filter(item => item.id !== cartItem.id));
  };

  // checkout handler
=======
  // Fixed checkout handler
>>>>>>> 7163893 (Update UserProfile)
  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    
    if (cartItems.length === 1) {
      // For single item, pass the product with quantity
      const item = cartItems[0];
      setCheckoutProduct({
        ...item.product,
        quantity: item.quantity
      });
      setCheckoutQty(item.quantity);
    } else {
      // For multiple items, create aggregated product
      const multiProduct = {
        id: "multi",
        name: "Multiple Items",
        price: totalCost,
        ecoScore: avgEcoScore,
        materialCO2: cartItems.reduce((sum, item) => sum + (item.product.materialCO2 * item.quantity), 0),
        shippingCO2: cartItems.reduce((sum, item) => sum + (item.product.shippingCO2 * item.quantity), 0),
      };
      setCheckoutProduct(multiProduct);
      setCheckoutQty(1);
    }
    setShowCheckout(true);
  };

  // calculations - access product data correctly
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const totalCost = subtotal + shipping;
  const totalCO2 = cartItems.reduce((sum, item) => sum + ((item.product.materialCO2 + item.product.shippingCO2) * item.quantity), 0);
  const avgEcoScore = cartItems.length > 0 ? (cartItems.reduce((sum, item) => sum + item.product.ecoScore, 0) / cartItems.length).toFixed(1) : 0;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-6">
              <FiShoppingCart className="text-4xl text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-700 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start your sustainable shopping journey by adding some eco-friendly products to your cart!
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate("/home")}
                className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white px-8 py-4 rounded-xl hover:from-[#0077b6] hover:to-[#03045e] transition-all duration-300 flex items-center gap-2 mx-auto font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FiShoppingCart />
                Start Shopping
              </button>
              <div className="text-sm text-gray-500">
                <span>✨ Free shipping on orders over ₹50</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-[#00b4d8] hover:text-[#0077b6] transition-colors duration-300 font-medium"
          >
            <FiArrowLeft className="text-lg" />
            <span>Continue Shopping</span>
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#03045e] flex items-center gap-3">
              <FiShoppingCart className="text-[#00b4d8]" />
              Shopping Cart
              <span className="text-lg font-normal text-gray-600">({cartItems.length} items)</span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Eco Impact Banner */}
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 border border-green-200 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#03045e] flex items-center gap-2 mb-3">
                    <FiSun className="text-green-500 text-xl" />
                    Your Eco Impact
                  </h3>
                  <div className="text-sm">
                    <span className="text-gray-600">Carbon Footprint:</span>
                    <div className="font-bold text-green-600 text-lg">{totalCO2.toFixed(1)} kg CO₂</div>
                  </div>
                </div>
                <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">{avgEcoScore}</div>
                  <div className="text-sm text-gray-600">Avg Eco Score</div>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Product Image */}
                    <div className="relative">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full sm:w-32 h-32 object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform duration-300 shadow-md"
                        onClick={() => navigate(`/productInfo/${item.product.id}`)}
                      />
                      {item.product.ecoScore >= 4 && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2">
                          <FiAward className="text-sm" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3
                          className="text-xl font-bold text-[#03045e] cursor-pointer hover:text-[#0077b6] transition-colors"
                          onClick={() => navigate(`/productInfo/${item.product.id}`)}
                        >
                          {item.product.name}
                        </h3>
                        <p className="text-gray-500 font-medium">{item.product.type}</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Price</span>
                          <p className="font-bold text-[#03045e] text-lg">₹{item.product.price.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Eco Score</span>
                          <div className="flex items-center gap-1">
                            <FiSun className="text-green-500" />
                            <span className="font-bold text-green-600">{item.product.ecoScore}/5</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Carbon</span>
                          <p className="font-medium text-gray-700">{(item.product.materialCO2 + item.product.shippingCO2).toFixed(1)} kg</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Subtotal</span>
                          <p className="font-bold text-[#03045e] text-lg">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Quantity and Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 font-medium">Quantity:</span>
                          <div className="flex items-center border-2 border-gray-200 rounded-lg shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                              disabled={item.quantity <= 1}
                            >
                              <FiMinus className={`text-sm ${item.quantity <= 1 ? "text-gray-300" : "text-gray-600"}`} />
                            </button>
                            <span className="px-4 py-2 font-bold text-[#03045e] min-w-[3rem] text-center bg-gray-50">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                            >
                              <FiPlus className="text-sm text-gray-600" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeProduct(item.id)}
                            className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-red-50 font-medium"
                          >
                            <FiTrash2 className="text-sm" />
                            <span className="text-sm">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-[#03045e] mb-6 flex items-center gap-2 text-lg">
                <FiCreditCard className="text-blue-500" />
                Order Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? "text-green-600" : ""}`}>
                    {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                {shipping > 0 && subtotal < 50 && (
                  <div className="text-xs text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    💡 Add ₹{(50 - subtotal).toFixed(2)} more for free shipping!
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold text-[#03045e]">
                    <span>Total</span>
                    <span>₹{totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Eco Impact Summary */}
              <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-[#03045e] mb-3 flex items-center gap-2">
                  <FaRecycle className="text-green-500" />
                  Environmental Impact
                </h4>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{totalCO2.toFixed(1)}</div>
                  <div className="text-gray-600 text-sm">kg CO₂ footprint</div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                className="w-full mt-6 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white py-4 rounded-xl hover:from-[#0077b6] hover:to-[#03045e] transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                <FiShoppingCart />
                Proceed to Checkout
              </button>

              {/* Security & Benefits */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaShieldAlt className="text-green-500" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiTruck className="text-blue-500" />
                  <span>Carbon-neutral shipping available</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaRecycle className="text-green-500" />
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>

            {/* Recommended Products */}
            {products && products.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="font-bold text-[#03045e] mb-4 flex items-center gap-2">
                  <FiAward className="text-orange-500" />
                  You Might Also Like
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {products.slice(0, 4).map((p) => (
                    <div key={p.id} className="group cursor-pointer" onClick={() => navigate(`/productInfo/${p.id}`)}>
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-20 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300 shadow-sm"
                      />
                      <h4 className="text-sm font-medium mt-2 group-hover:text-[#00b4d8] transition-colors line-clamp-2">
                        {p.name}
                      </h4>
                      <p className="text-sm font-bold text-[#03045e]">₹{p.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Signals */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-[#03045e] mb-4">Why Shop With Us?</h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <FiSun className="text-green-500 text-lg" />
                  <span>100% Sustainable Materials</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiTruck className="text-blue-500 text-lg" />
                  <span>Fast, Eco-Friendly Delivery</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaShieldAlt className="text-purple-500 text-lg" />
                  <span>Secure Payment Processing</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiAward className="text-orange-500 text-lg" />
                  <span>Quality Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/home")}
            className="bg-white text-[#00b4d8] border-2 border-[#00b4d8] px-8 py-3 rounded-xl hover:bg-[#00b4d8] hover:text-white transition-all duration-300 flex items-center gap-2 mx-auto font-semibold shadow-lg hover:shadow-xl"
          >
            <FiArrowLeft />
            Continue Shopping
          </button>
        </div>
      </div>

      {/* Checkout Popup */}
      <CheckOut
        show={showCheckout}
        product={checkoutProduct}
        quantity={checkoutQty}
        onConfirm={() => {
          cartItems.forEach(item => {
            const orderWithDate = { ...item, date: new Date().toISOString() };
            placeOrderFromCart(orderWithDate);
          });
          setCartItems([]);
          setShowCheckout(false);
          // navigate("/orders");
        }}
        onClose={() => setShowCheckout(false)}
      />
    </div>
  );
};

export default ProductCart;
