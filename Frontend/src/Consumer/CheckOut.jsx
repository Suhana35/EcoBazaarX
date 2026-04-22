import React from "react";
import { useNavigate } from "react-router-dom";

const CheckOut = ({ show, product, quantity, onConfirm, onClose }) => {
  // Mock navigate function for demo purposes
  const navigate = useNavigate();
  if (!show || !product) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleViewHistory = () => {
    navigate("/orders");
    onClose();
  };

  const totalPrice = product.price * quantity;
  const totalCarbonFootprint = (product.materialCO2 + product.shippingCO2) * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal - Improved sizing */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 animate-slideIn">
        {/* Enhanced Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white shadow-md hover:shadow-lg hover:bg-red-50 transition-all duration-200 group border border-gray-200"
          aria-label="Close modal"
        >
          <svg 
            className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Success Header - Reduced padding */}
        <div className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] rounded-t-2xl px-6 py-6 text-center relative overflow-hidden">
          {/* Decorative elements - smaller */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full -translate-x-12 -translate-y-12" />
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full translate-x-10 translate-y-10" />
          
          {/* Success Icon - smaller */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3 backdrop-blur-sm border-2 border-white/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-1">Order Successful!</h2>
          <p className="text-[#90e0ef] text-sm">Your eco-friendly purchase is confirmed</p>
        </div>

        {/* Order Details - Reduced padding and spacing */}
        <div className="px-6 py-5 space-y-4">
          {/* Product Info - more compact */}
          <div className="bg-gradient-to-r from-[#caf0f8] to-[#90e0ef] rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-[#0077b6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#03045e] leading-tight">{product.name}</h3>
                <p className="text-[#0077b6] text-sm">Quantity: {quantity}</p>
              </div>
            </div>
          </div>

          {/* Order Summary - more compact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#03045e] flex items-center gap-2">
              <svg className="w-4 h-4 text-[#00b4d8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Order Summary
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Price */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total Price</div>
                <div className="text-lg font-bold text-[#03045e]">₹{totalPrice.toFixed(2)}</div>
              </div>

              {/* Eco Score */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <div className="text-xs text-green-600 font-medium uppercase tracking-wide flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Eco Score
                </div>
                <div className="text-lg font-bold text-green-700">{product.ecoScore}/5</div>
              </div>
            </div>

            {/* Environmental Impact - more compact */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
              <h5 className="font-semibold text-[#03045e] mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                Environmental Impact
              </h5>
              <div className="text-center">
                <div className="text-base font-bold text-orange-600">{totalCarbonFootprint.toFixed(1)}</div>
                <div className="text-gray-600 text-xs">kg CO₂ footprint</div>
              </div>
            </div>
          </div>

          {/* Benefits - more compact */}
          <div className="bg-[#f8f9fa] rounded-lg p-3">
            <h5 className="font-semibold text-[#03045e] mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              What's Next?
            </h5>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Carbon-neutral shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Sustainable packaging included</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Contributing to a greener planet</span>
              </div>
            </div>
          </div>

          {/* Action Buttons - slightly smaller */}
          <div className="space-y-3">
            <button
              onClick={handleConfirm}
              className="w-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:from-[#0077b6] hover:to-[#03045e] text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirm Order
            </button>

            <button
              onClick={handleViewHistory}
              className="w-full bg-white border-2 border-[#00b4d8] text-[#00b4d8] hover:bg-[#00b4d8] hover:text-white py-2.5 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              View Order History
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Trust Signal - more compact */}
          <div className="text-center text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 mb-1">
              <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Secure checkout completed</span>
            </div>
            <p>Your order confirmation will be sent via email</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: scale(0.95) translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CheckOut;