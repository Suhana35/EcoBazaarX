import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserTag,
  FaLeaf,
  FaShieldAlt,
  FaHeart,
} from "react-icons/fa";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { useGlobal } from "./context/GlobalContext";

function RegistrationForm() {
  const { registerUser } = useGlobal();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "consumer",
    agreeToTerms: false,
    subscribeNewsletter: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData({ ...formData, [name]: fieldValue });

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    let tempErrors = {};

    if (!formData.name.trim()) {
      tempErrors.name = "Full Name is required.";
    } else if (formData.name.trim().length < 2) {
      tempErrors.name = "Name must be at least 2 characters long.";
    }

    if (!formData.email) {
      tempErrors.email = "Email Address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      tempErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      tempErrors.password = "Password must be at least 8 characters long.";
    } else if (passwordStrength < 3) {
      tempErrors.password =
        "Password should contain uppercase, lowercase, numbers, and special characters.";
    }

    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.agreeToTerms) {
      tempErrors.agreeToTerms =
        "You must agree to the terms and conditions.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (validate()) {
    setLoading(true);
    
    try {
      const result = await registerUser(formData);
      
      if (result.success) {
        // Show success message and redirect
        alert(result.message);
        navigate("/login");
      } else {
        // Show error message
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }
};

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 2) return "bg-orange-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 2) return "Fair";
    if (passwordStrength <= 3) return "Good";
    if (passwordStrength <= 4) return "Strong";
    return "Very Strong";
  };

  const roleDescriptions = {
    consumer: "Shop sustainable products and track your eco-impact",
    seller: "Sell eco-friendly products and join our green marketplace",
    admin: "Manage the platform and promote sustainability",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] rounded-full mb-4 shadow-lg">
            <FaLeaf className="text-2xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#03045e] mb-2">
            Join EcoBazaarX
          </h1>
          <p className="text-gray-600">
            Create your account and start your sustainable journey
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaUser className="text-[#00b4d8]" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border-2 rounded-xl py-3 px-4 outline-none transition ${
                  errors.name
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <FiAlertCircle /> {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaEnvelope className="text-[#00b4d8]" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border-2 rounded-xl py-3 px-4 outline-none transition ${
                  errors.email
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <FiAlertCircle /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaLock className="text-[#00b4d8]" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full border-2 rounded-xl py-3 px-4 pr-10 outline-none transition ${
                    errors.password
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formData.password && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {getPasswordStrengthText()}
                  </span>
                </div>
              )}
              {errors.password && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <FiAlertCircle /> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaLock className="text-[#00b4d8]" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full border-2 rounded-xl py-3 px-4 pr-10 outline-none transition ${
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <FiAlertCircle /> {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role Selection (Dropdown) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaUserTag className="text-[#00b4d8]" />
                Account Type
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border-2 rounded-xl py-3 px-4 bg-white focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8] transition outline-none"
              >
                <option value="consumer">Consumer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-sm text-gray-600 italic">
                {roleDescriptions[formData.role]}
              </p>
            </div>

            {/* Terms & Newsletter */}
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#00b4d8] border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <a href="/terms" className="text-[#00b4d8] underline">
                    Terms and Conditions
                  </a>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <FiAlertCircle /> {errors.agreeToTerms}
                </p>
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="subscribeNewsletter"
                  checked={formData.subscribeNewsletter}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#00b4d8] border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  Subscribe to our eco-friendly newsletter
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-medium rounded-xl shadow-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistrationForm;
