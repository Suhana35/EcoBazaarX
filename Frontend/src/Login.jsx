import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaLeaf, FaShieldAlt } from "react-icons/fa";
import { FiCheckCircle, FiAlertCircle, FiArrowRight, FiUsers, FiTrendingUp, FiAward } from "react-icons/fi";
import { useGlobal } from "./context/GlobalContext";

function Login() {
  const { loginUser, currentUser } = useGlobal();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "consumer") navigate("/home");
      else if (currentUser.role === "seller") navigate("/selDashboard");
      else if (currentUser.role === "admin") navigate("/admin");
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value.trim() });
    if (errors[name] || errors.general) setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.email) {
      tempErrors.email = "Email Address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      tempErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters long.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  setLoading(true);
  
  try {
    const result = await loginUser(formData.email, formData.password);
    
    if (result.success) {
      // Navigate based on role
      if (result.user.role === "CONSUMER") navigate("/home");
      else if (result.user.role === "SELLER") navigate("/seller");
      else if (result.user.role === "ADMIN") navigate("/admin");
    } else {
      setErrors({ general: result.message || "Login failed. Please try again." });
    }
  } catch (error) {
    setErrors({ general: "An error occurred. Please try again." });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] rounded-full mb-4 shadow-xl">
            <FaLeaf className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#03045e] mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Sign in to continue your sustainable journey</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-xl p-3 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
            <FiUsers className="text-xl text-blue-500 mx-auto mb-1" />
            <div className="text-sm font-bold text-gray-700">50K+</div>
            <div className="text-xs text-gray-500">Members</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
            <FiTrendingUp className="text-xl text-green-500 mx-auto mb-1" />
            <div className="text-sm font-bold text-gray-700">1M+</div>
            <div className="text-xs text-gray-500">Eco Products</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
            <FiAward className="text-xl text-purple-500 mx-auto mb-1" />
            <div className="text-sm font-bold text-gray-700">4.9★</div>
            <div className="text-xs text-gray-500">Rating</div>
          </div>
        </div>

        {/* Main Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 animate-shake">
                <FiAlertCircle className="text-red-500 text-lg flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-medium">Login Failed</p>
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className={`relative transition-all duration-300 ${focusedField === "email" ? "transform scale-105" : ""}`}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className={`text-sm ${focusedField === "email" ? "text-[#00b4d8]" : "text-gray-400"}`} />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-300 outline-none ${
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : focusedField === "email"
                      ? "border-[#00b4d8] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                />
                {formData.email && !errors.email && /\S+@\S+\.\S+/.test(formData.email) && (
                  <FiCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                )}
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <FiAlertCircle className="text-xs" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className={`relative transition-all duration-300 ${focusedField === "password" ? "transform scale-105" : ""}`}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className={`text-sm ${focusedField === "password" ? "text-[#00b4d8]" : "text-gray-400"}`} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl transition-all duration-300 outline-none ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : focusedField === "password"
                      ? "border-[#00b4d8] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <FiAlertCircle className="text-xs" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 border-2 rounded transition-all duration-300 ${
                      rememberMe
                        ? "bg-[#00b4d8] border-[#00b4d8]"
                        : "border-gray-300 group-hover:border-gray-400"
                    }`}
                  >
                    {rememberMe && (
                      <FiCheckCircle className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:from-[#0077b6] hover:to-[#03045e] text-white transform hover:scale-105 hover:shadow-xl"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In to EcoBazaarX
                  <FiArrowRight className="text-lg" />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              New to our eco-community?{" "}
              <button
                onClick={() => navigate("/")}
                className="text-[#00b4d8] font-semibold hover:text-[#0077b6] transition-colors duration-300 hover:underline"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <FaShieldAlt className="text-green-500" />
            <span className="font-medium">Secure Login:</span>
            <span>Your data is protected with 256-bit SSL encryption</span>
          </div>
        </div>

        {/* Eco Impact Banner */}
        <div className="mt-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 text-center border border-green-200">
          <h3 className="text-lg font-bold text-[#03045e] mb-3 flex items-center justify-center gap-2">
            <FaLeaf className="text-green-500" />
            Your Impact Matters
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">2.5 tons</div>
              <div className="text-gray-600">CO₂ saved by our community</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">95%</div>
              <div className="text-gray-600">Sustainable materials used</div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Need help?{" "}
            <button className="text-[#00b4d8] hover:text-[#0077b6] hover:underline transition-colors">
              Contact Support
            </button>{" "}
            or{" "}
            <button className="text-[#00b4d8] hover:text-[#0077b6] hover:underline transition-colors">
              Visit Help Center
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default Login;
