import React, { useState, useEffect, useRef } from "react";
import { useGlobal } from "../context/GlobalContext"; // Adjust path as needed
import { 
  FiX,
  FiSave,
  FiUpload,
  FiInfo,
  FiAlertTriangle
} from "react-icons/fi";
import { FaLeaf, FaCalculator } from "react-icons/fa";

const ProductModal = ({ 
  isOpen, 
  onClose, 
  product = null, 
  isEditMode = false 
}) => {
  const { 
    currentUser,
    addProduct,
    updateProduct,
    fetchProductsBySeller
  } = useGlobal();

  // Local error state for the modal
  const [modalError, setModalError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    price: "",
    ecoScore: "",
    footprint: "",
    materialCO2: "",
    shippingCO2: "",
    image: "",
    stockQuantity: "",
    description: "",
    status: "active",
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    materials: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoCalculateMode, setAutoCalculateMode] = useState(true);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // File input ref for image upload
  const fileInputRef = useRef(null);

  // Product categories
  const productCategories = [
    "Laptop", "Accessories", "Cloth", "Shoes", "Bag", "Kitchenware", "Electronics", "Home & Garden", "Sports", "Books"
  ];

  // Material types with CO2 factors
  const materialTypes = [
    { name: "Recycled Plastic", factor: 1.2, ecoBonus: 0.5 },
    { name: "Organic Cotton", factor: 2.1, ecoBonus: 0.7 },
    { name: "Bamboo", factor: 0.8, ecoBonus: 0.9 },
    { name: "Recycled Glass", factor: 0.5, ecoBonus: 0.6 },
    { name: "Regular Plastic", factor: 3.4, ecoBonus: 0 },
    { name: "Regular Cotton", factor: 5.9, ecoBonus: 0.1 },
    { name: "Aluminum", factor: 8.2, ecoBonus: 0.3 },
    { name: "Steel", factor: 2.3, ecoBonus: 0.2 },
    { name: "Wood", factor: 0.9, ecoBonus: 0.4 },
    { name: "Cork", factor: 0.3, ecoBonus: 0.8 },
    { name: "Hemp", factor: 0.7, ecoBonus: 0.8 },
    { name: "Recycled Paper", factor: 0.6, ecoBonus: 0.6 }
  ];

  // Category-based environmental impact factors
  const categoryImpactFactors = {
    "Laptop": { baseFootprint: 250, complexity: 1.5, transportMultiplier: 1.3 },
    "Electronics": { baseFootprint: 80, complexity: 1.3, transportMultiplier: 1.2 },
    "Accessories": { baseFootprint: 5, complexity: 0.8, transportMultiplier: 0.8 },
    "Cloth": { baseFootprint: 10, complexity: 0.6, transportMultiplier: 0.7 },
    "Shoes": { baseFootprint: 15, complexity: 1.0, transportMultiplier: 0.9 },
    "Bag": { baseFootprint: 8, complexity: 0.9, transportMultiplier: 0.8 },
    "Kitchenware": { baseFootprint: 12, complexity: 0.7, transportMultiplier: 1.0 },
    "Home & Garden": { baseFootprint: 20, complexity: 0.8, transportMultiplier: 1.1 },
    "Sports": { baseFootprint: 18, complexity: 0.9, transportMultiplier: 1.0 },
    "Books": { baseFootprint: 2, complexity: 0.5, transportMultiplier: 0.6 }
  };

  // Stock level utilities
  const getStockLevel = (stockQuantity) => {
    if (stockQuantity === 0) return 'out';
    if (stockQuantity <= 10) return 'low';
    if (stockQuantity <= 50) return 'medium';
    return 'high';
  };

  const getStockColor = (stockQuantity) => {
    const level = getStockLevel(stockQuantity);
    switch (level) {
      case 'out': return 'text-red-600 bg-red-100';
      case 'low': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStockText = (stockQuantity) => {
    const level = getStockLevel(stockQuantity);
    switch (level) {
      case 'out': return `Out of Stock (${stockQuantity})`;
      case 'low': return `Low Stock (${stockQuantity})`;
      case 'medium': return `Medium Stock (${stockQuantity})`;
      case 'high': return `In Stock (${stockQuantity})`;
      default: return `${stockQuantity} units`;
    }
  };

  // Auto-calculate environmental metrics
  const calculateEnvironmentalMetrics = (productData) => {
    if (!autoCalculateMode) return productData;

    const category = productData.type;
    const weight = parseFloat(productData.weight) || 1;
    const price = parseFloat(productData.price) || 0;
    
    const categoryFactor = categoryImpactFactors[category] || categoryImpactFactors["Accessories"];
    
    let materialCO2 = 0;
    let ecoBonus = 0;
    
    if (productData.materials && productData.materials.length > 0) {
      productData.materials.forEach(materialName => {
        const material = materialTypes.find(m => m.name === materialName);
        if (material) {
          materialCO2 += (material.factor * weight) / productData.materials.length;
          ecoBonus += material.ecoBonus / productData.materials.length;
        }
      });
    } else {
      materialCO2 = categoryFactor.baseFootprint * 0.01 * weight;
    }

    const dimensions = productData.dimensions;
    const volume = dimensions.length && dimensions.width && dimensions.height 
      ? (parseFloat(dimensions.length) * parseFloat(dimensions.width) * parseFloat(dimensions.height)) / 1000000
      : weight * 0.001;
    
    const shippingCO2 = (weight * 0.5 + volume * 10) * categoryFactor.transportMultiplier;
    const footprint = materialCO2 + shippingCO2;

    let ecoScore = 3.0;
    ecoScore += ecoBonus;
    
    if (weight < 0.5) ecoScore += 0.3;
    else if (weight > 5) ecoScore -= 0.2;
    
    const categoryAvgPrice = {
      "Laptop": 50000, "Electronics": 5000, "Accessories": 1500,
      "Cloth": 1000, "Shoes": 3000, "Bag": 2000,
      "Kitchenware": 800, "Home & Garden": 1500, "Sports": 2500, "Books": 500
    };
    
    const avgPrice = categoryAvgPrice[category] || 1500;
    if (price < avgPrice * 0.8) ecoScore += 0.2;
    
    if (footprint > 50) ecoScore -= 0.3;
    else if (footprint < 5) ecoScore += 0.2;
    
    ecoScore = Math.max(1, Math.min(5, ecoScore));

    return {
      ...productData,
      materialCO2: Math.round(materialCO2 * 10) / 10,
      shippingCO2: Math.round(shippingCO2 * 10) / 10,
      footprint: Math.round(footprint * 10) / 10,
      ecoScore: Math.round(ecoScore * 10) / 10
    };
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setImagePreview(base64String);
        setFormData(prev => ({
          ...prev,
          image: base64String
        }));
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadingImage(false);
      alert('Error uploading file. Please try again.');
    }
  };

  // Initialize form data when modal opens or product changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && product) {
        setFormData({
          name: product.name || "",
          type: product.type || "",
          price: product.price?.toString() || "",
          ecoScore: product.ecoScore?.toString() || "",
          footprint: product.footprint?.toString() || "",
          materialCO2: product.materialCO2?.toString() || "",
          shippingCO2: product.shippingCO2?.toString() || "",
          image: product.image || "",
          stockQuantity: product.stockQuantity?.toString() || "",
          description: product.description || "",
          status: product.status || "active",
          weight: product.weight?.toString() || "",
          dimensions: product.dimensions || { length: "", width: "", height: "" },
          materials: product.materials || []
        });
        setImagePreview(product.image || "");
        setAutoCalculateMode(false);
      } else {
        setFormData({
          name: "",
          type: "",
          price: "",
          ecoScore: "",
          footprint: "",
          materialCO2: "",
          shippingCO2: "",
          image: "",
          stockQuantity: "",
          description: "",
          status: "active",
          weight: "",
          dimensions: { length: "", width: "", height: "" },
          materials: []
        });
        setImagePreview("");
        setAutoCalculateMode(true);
      }
      setFormErrors({});
    }
  }, [isOpen, isEditMode, product]);

  // Auto-calculate when form data changes
  useEffect(() => {
    if (autoCalculateMode && (formData.type || formData.weight || formData.materials?.length)) {
      const calculated = calculateEnvironmentalMetrics(formData);
      if (calculated.materialCO2 !== formData.materialCO2 || 
          calculated.shippingCO2 !== formData.shippingCO2 ||
          calculated.footprint !== formData.footprint ||
          calculated.ecoScore !== formData.ecoScore) {
        
        setFormData(prev => ({
          ...prev,
          materialCO2: calculated.materialCO2.toString(),
          shippingCO2: calculated.shippingCO2.toString(),
          footprint: calculated.footprint.toString(),
          ecoScore: calculated.ecoScore.toString()
        }));
      }
    }
  }, [formData.type, formData.weight, formData.materials, formData.price, autoCalculateMode]);

  // Update image preview when form data changes
  useEffect(() => {
    setImagePreview(formData.image);
  }, [formData.image]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleDimensionChange = (dimension, value) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value
      }
    }));
  };

  const handleMaterialToggle = (materialName) => {
    setFormData(prev => {
      const materials = prev.materials || [];
      const newMaterials = materials.includes(materialName)
        ? materials.filter(m => m !== materialName)
        : [...materials, materialName];
      
      return {
        ...prev,
        materials: newMaterials
      };
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.type.trim()) errors.type = "Category is required";
    if (!formData.price || formData.price <= 0) errors.price = "Valid price is required";
    if (!formData.stockQuantity || formData.stockQuantity < 0) errors.stockQuantity = "Valid stock quantity is required";
    if (!formData.image.trim()) errors.image = "Product image is required";
    if (!formData.description.trim()) errors.description = "Product description is required";
    if (autoCalculateMode && !formData.weight) errors.weight = "Weight is required for automatic calculations";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setModalError(null);
    
    try {
      let productData = {
        name: formData.name.trim(),
        type: formData.type,
        price: parseFloat(formData.price),
        ecoScore: parseFloat(formData.ecoScore) || 3.0,
        footprint: parseFloat(formData.footprint) || 0,
        materialCO2: parseFloat(formData.materialCO2) || 0,
        shippingCO2: parseFloat(formData.shippingCO2) || 0,
        image: formData.image.trim(),
        stockQuantity: parseInt(formData.stockQuantity),
        description: formData.description.trim(),
        weight: parseFloat(formData.weight) || 1,
        dimensions: formData.dimensions,
        materials: formData.materials || []
      };

      if (autoCalculateMode) {
        productData = calculateEnvironmentalMetrics(productData);
      }

      let result;
      if (isEditMode && product) {
        result = await updateProduct(product.id, productData);
      } else {
        result = await addProduct(productData);
      }

      if (result.success) {
        // Refresh products list
        if (currentUser && currentUser.id) {
          fetchProductsBySeller(currentUser.id);
        }
        onClose();
      } else {
        setModalError(result.message || 'Failed to save product');
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setModalError('An error occurred while saving the product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setFormErrors({});
    setImagePreview("");
    setAutoCalculateMode(true);
    setModalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-cyan-50">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditMode ? "Edit Product" : "Add New Product"}
            </h2>
            {!isEditMode && (
              <div className="flex items-center gap-2">
                <FaCalculator className={`text-lg ${autoCalculateMode ? 'text-green-600' : 'text-gray-400'}`} />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCalculateMode}
                    onChange={(e) => setAutoCalculateMode(e.target.checked)}
                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Smart Calculate</span>
                </label>
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <FiX size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Smart Calculate Info */}
        {autoCalculateMode && !isEditMode && (
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-start gap-3">
              <FiInfo className="text-blue-500 mt-0.5" size={16} />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Smart Calculate Mode</p>
                <p>Environmental metrics will be automatically calculated based on product category, materials, weight, and dimensions. You can still manually adjust values if needed.</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {modalError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-3">
              <FiAlertTriangle size={20} />
              <span>{modalError}</span>
              <button 
                type="button"
                onClick={() => setModalError(null)}
                className="ml-auto text-red-700 hover:text-red-900"
              >
                <FiX size={16} />
              </button>
            </div>
          )}

          {/* Basic Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                  formErrors.name ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Enter product name"
              />
              {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                  formErrors.type ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Select category</option>
                {productCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {formErrors.type && <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>}
            </div>
          </div>

          {/* Price, Weight, Stock Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                  formErrors.price ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="0.00"
              />
              {formErrors.price && <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Weight (kg) {autoCalculateMode && '*'}
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                  formErrors.weight ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="1.0"
              />
              {formErrors.weight && <p className="text-red-500 text-sm mt-1">{formErrors.weight}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                min="0"
                className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                  formErrors.stockQuantity ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="100"
              />
              {formErrors.stockQuantity && <p className="text-red-500 text-sm mt-1">{formErrors.stockQuantity}</p>}
              
              {/* Stock Level Indicator */}
              {formData.stockQuantity && (
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStockColor(parseInt(formData.stockQuantity))}`}>
                    {getStockText(parseInt(formData.stockQuantity))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dimensions - only show in auto-calculate mode */}
          {autoCalculateMode && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Dimensions (cm) - Optional for better shipping calculation
              </label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  value={formData.dimensions.length}
                  onChange={(e) => handleDimensionChange('length', e.target.value)}
                  step="0.1"
                  min="0"
                  className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="Length"
                />
                <input
                  type="number"
                  value={formData.dimensions.width}
                  onChange={(e) => handleDimensionChange('width', e.target.value)}
                  step="0.1"
                  min="0"
                  className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="Width"
                />
                <input
                  type="number"
                  value={formData.dimensions.height}
                  onChange={(e) => handleDimensionChange('height', e.target.value)}
                  step="0.1"
                  min="0"
                  className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="Height"
                />
              </div>
            </div>
          )}

          {/* Materials Selection - only show in auto-calculate mode */}
          {autoCalculateMode && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Materials Used - Select all that apply for accurate environmental calculation
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {materialTypes.map(material => (
                  <label key={material.name} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.materials?.includes(material.name) || false}
                      onChange={() => handleMaterialToggle(material.name)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 flex-1">{material.name}</span>
                    <FaLeaf className={`text-xs ${material.ecoBonus > 0.5 ? 'text-green-500' : 'text-yellow-500'}`} title={`Eco bonus: ${material.ecoBonus}`} />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Environmental Metrics */}
          <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaLeaf className="text-green-500" />
              Environmental Impact
              {autoCalculateMode && <span className="text-sm font-normal text-gray-600">(Auto-calculated)</span>}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Eco Score (1-5)
                </label>
                <input
                  type="number"
                  name="ecoScore"
                  value={formData.ecoScore}
                  onChange={handleInputChange}
                  step="0.1"
                  min="1"
                  max="5"
                  disabled={autoCalculateMode}
                  className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                    autoCalculateMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  } border-gray-200`}
                  placeholder="4.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Material CO₂ (kg)
                </label>
                <input
                  type="number"
                  name="materialCO2"
                  value={formData.materialCO2}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  disabled={autoCalculateMode}
                  className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                    autoCalculateMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  } border-gray-200`}
                  placeholder="3.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Shipping CO₂ (kg)
                </label>
                <input
                  type="number"
                  name="shippingCO2"
                  value={formData.shippingCO2}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  disabled={autoCalculateMode}
                  className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                    autoCalculateMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  } border-gray-200`}
                  placeholder="1.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Footprint (kg CO₂)
                </label>
                <input
                  type="number"
                  name="footprint"
                  value={formData.footprint}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  disabled={autoCalculateMode}
                  className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                    autoCalculateMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  } border-gray-200`}
                  placeholder="5.0"
                />
              </div>
            </div>

            {/* Environmental Impact Indicator */}
            {formData.footprint && (
              <div className="mt-4 p-3 bg-white rounded-xl border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Carbon Impact Level:</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      parseFloat(formData.footprint) <= 5 ? 'bg-green-500' :
                      parseFloat(formData.footprint) <= 20 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm font-semibold ${
                      parseFloat(formData.footprint) <= 5 ? 'text-green-600' :
                      parseFloat(formData.footprint) <= 20 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {parseFloat(formData.footprint) <= 5 ? 'Low Impact' :
                       parseFloat(formData.footprint) <= 20 ? 'Medium Impact' : 'High Impact'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Image *
            </label>
            
            {/* Image Upload Options */}
            <div className="space-y-4">
              {/* URL Input */}
              <div className="flex gap-3">
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className={`flex-1 px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                    formErrors.image ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Paste image URL here..."
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-4 py-3 bg-sky-100 text-sky-700 rounded-2xl hover:bg-sky-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title="Upload from device"
                >
                  {uploadingImage ? (
                    <div className="w-5 h-5 border-2 border-sky-700 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FiUpload size={20} />
                  )}
                  <span className="hidden sm:inline">Upload</span>
                </button>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {formErrors.image && <p className="text-red-500 text-sm">{formErrors.image}</p>}
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        setImagePreview("");
                        setFormData(prev => ({ ...prev, image: "" }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setFormData(prev => ({ ...prev, image: "" }));
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Image preview - Click X to remove</p>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                You can either paste an image URL or upload an image from your device (max 5MB)
              </p>
            </div>
          </div>

          {/* Product Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none ${
                formErrors.description ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Describe your eco-friendly product, its features, and environmental benefits..."
            />
            {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors duration-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditMode ? 'Updating Product...' : 'Adding Product...'}
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  {isEditMode ? 'Update Product' : 'Add Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;