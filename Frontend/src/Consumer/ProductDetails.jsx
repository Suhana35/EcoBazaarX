import React, { useState } from "react";
import { FiShoppingCart, FiStar, FiArrowLeft, FiTruck, FiPackage, FiShield } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";
import { useGlobal } from "../context/GlobalContext";
import CheckOut from "./CheckOut";
import { useParams, useNavigate } from "react-router-dom";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const productId = parseInt(id, 10);
  const { products, addToCart, placeOrderForProduct } = useGlobal();
  const [showCheckout, setShowCheckout] = useState(false);
  const [quantity, setQuantity] = useState(1);
  // Get product from GlobalContext products
  const product = products.find(p => p.id === productId) || products[0];

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600">The requested product could not be found.</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    
    // Show success message
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.textContent = `Added ${quantity}x ${product.name} to cart!`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleConfirmOrder = async () => {
    try {
      // Use the placeOrderForProduct function from context
      const orderDetails = {
        // Add any additional order details your API might need
        paymentMethod: "card", // or whatever default you want
        shippingAddress: "Default Address", // you might want to collect this
        // Add other required fields based on your API
      };

      const result = await placeOrderForProduct(product.id, quantity, orderDetails);
      
      if (result.success) {
        setShowCheckout(false);
        setQuantity(1); // Reset quantity
        
        // Show success message
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
        notification.textContent = `Order placed successfully for ${quantity}x ${product.name}!`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
        }, 3000);

        // Optionally navigate to orders page
        // navigate("/orders");
      } else {
        // Handle error
        alert(`Failed to place order: ${result.message}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout. Please try again.");
    }
  };

  const handleBackClick = () => {
    navigate("/home"); // or wherever you want to go back to
  };

  const handleRelatedProductClick = (productId) => {
    navigate(`/productInfo/${productId}`);
  };

  const ecoScorePercentage = (product.ecoScore / 5) * 100;
  
  // Updated to use footprint instead of calculating from materialCO2 + shippingCO2
  const totalFootprint = product.footprint || (product.materialCO2 + product.shippingCO2);
  const materialPercentage = (product.materialCO2 / totalFootprint) * 100;
  const shippingPercentage = (product.shippingCO2 / totalFootprint) * 100;



  // Get related products from GlobalContext
  const relatedProducts = products.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <button 
          onClick={handleBackClick}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-200 group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Products
        </button>

        {/* Main Product Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="grid lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-4 right-4 space-y-2">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                    <FaLeaf className="w-4 h-4" />
                    Eco-Friendly
                  </div>
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                    <FiShield className="w-4 h-4" />
                    Sustainable
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {product.type}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Sustainable
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    Premium Quality
                  </span>
                </div>
                
                {/* Product Description */}
                {product.description && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {product.description}
                  </p>
                )}
                
                {/* Stock Status */}
                <div className="flex items-center gap-2 mb-4">
                  {product.stockQuantity > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 font-medium">
                        In Stock ({product.stockQuantity} available)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-red-700 font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating with sales info */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FiStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(product.rating || product.ecoScore) 
                          ? "text-yellow-400 fill-current" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-gray-700">
                    {(product.rating || product.ecoScore)} / 5
                  </span>
                  <span className="text-sm text-gray-500">
                    {product.sales || 0} sold • Eco Rating
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Price</p>
                    <p className="text-4xl font-bold">₹{product.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right opacity-90">
                    <p className="text-sm">Free Shipping</p>
                    <p className="text-sm">30-Day Returns</p>
                    {product.sellerName && (
                      <p className="text-xs mt-1">by {product.sellerName}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <FaLeaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-green-800">100% Natural</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <FiPackage className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-blue-800">Recyclable</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <FiShield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-purple-800">Durable</p>
                </div>
              </div>

              {/* Quantity Selector - Only show if in stock */}
              {product.stockQuantity > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">Quantity</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-100 rounded-lg">
                      <button 
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-3 hover:bg-gray-200 rounded-l-lg transition-colors disabled:opacity-50"
                        disabled={quantity <= 1}
                      >
                        <span className="text-lg font-semibold">-</span>
                      </button>
                      <span className="px-6 py-3 text-lg font-semibold bg-white border-y border-gray-200 min-w-[60px] text-center">
                        {quantity}
                      </span>
                      <button 
                        onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                        className="p-3 hover:bg-gray-200 rounded-r-lg transition-colors disabled:opacity-50"
                        disabled={quantity >= product.stockQuantity}
                      >
                        <span className="text-lg font-semibold">+</span>
                      </button>
                    </div>
                    <div className="text-right flex-1">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{(product.price * quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {product.stockQuantity > 0 ? (
                  <>
                    <button 
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                      Buy Now
                    </button>
                    <button 
                      onClick={handleAddToCart}
                      className="w-full bg-gray-100 text-gray-800 py-3 px-8 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                  </>
                ) : (
                  <button 
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-4 px-8 rounded-xl font-semibold text-lg cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Impact Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FaLeaf className="text-green-500 w-7 h-7" />
            Environmental Impact
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Eco Score</h4>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                    style={{ width: `${ecoScorePercentage}%` }}
                  >
                    <span className="text-white font-bold text-sm">
                      {product.ecoScore}/5
                    </span>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Great choice!</strong> This product has a high eco-score, 
                  meaning it's made from sustainable materials with minimal environmental impact.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FiTruck className="w-5 h-5 text-blue-500" />
                Carbon Footprint
              </h4>
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Material Production</span>
                    <span className="font-semibold text-orange-700">{product.materialCO2} kg CO₂</span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${materialPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Shipping & Transport</span>
                    <span className="font-semibold text-blue-700">{product.shippingCO2} kg CO₂</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${shippingPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">Total Carbon Impact</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {totalFootprint.toFixed(2)} kg CO₂
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    65% lower than industry average
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => handleRelatedProductClick(p.id)}
                className="group cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border border-gray-200"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1">
                    <FaLeaf className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {p.name}
                  </h4>
                  <p className="text-blue-600 font-bold text-lg">₹{p.price.toFixed(2)}</p>
                  <div className="flex items-center mt-2 gap-1">
                    <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{p.rating || p.ecoScore}</span>
                    <span className="text-xs text-gray-500 ml-1">
                      {p.rating ? 'rating' : 'eco-score'}
                    </span>
                  </div>
                  {p.sales && (
                    <p className="text-xs text-gray-500 mt-1">{p.sales} sold</p>
                  )}
                  <button className="w-full mt-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    Quick View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Modal */}
        <CheckOut
          show={showCheckout}
          product={product}
          quantity={quantity}
          onConfirm={handleConfirmOrder}
          onClose={() => setShowCheckout(false)}
        />
      </div>
    </div>
  );
};

export default ProductDetails;