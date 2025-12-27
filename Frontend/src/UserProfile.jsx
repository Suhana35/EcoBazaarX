<<<<<<< HEAD
import React from "react";
import { FaUser, FaEnvelope, FaShieldAlt, FaUserCheck, FaCrown, FaShoppingBag } from "react-icons/fa";
import { useGlobal } from "./context/GlobalContext"; 
=======
import React, { useState } from "react";
import { FaUser, FaEnvelope, FaShieldAlt, FaUserCheck, FaCrown, FaShoppingBag, FaEdit, FaCalendarAlt, FaStar } from "react-icons/fa";
import { FiAward, FiPackage, FiHeart } from "react-icons/fi";
import { useGlobal } from "./context/GlobalContext";
import { useNavigate } from "react-router-dom";
import Navbar from "./Consumer/UserNavbar";
import SellerNavbar from "./Seller/SellerNavbar";
import AdminNavbar from "./Admin/AdminNavbar";
import EditProfileModal from "./EditProfileModal";
>>>>>>> 7163893 (Update UserProfile)

// Role-based styling and icons
const getRoleConfig = (role) => {
  switch (role) {
    case "buyer":
      return {
        bgGradient: "from-[#00b4d8] to-[#0077b6]",
        cardBg: "bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100",
        icon: FaShoppingBag,
        badge: "bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white",
        title: "Buyer Account",
        description: "Shop eco-friendly products and track your orders",
        accentColor: "text-[#0077b6]"
      };
    case "seller":
      return {
        bgGradient: "from-[#0077b6] to-[#023e8a]",
        cardBg: "bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50",
        icon: FaUserCheck,
        badge: "bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white",
        title: "Seller Account",
        description: "Manage your products and grow your eco-business",
        accentColor: "text-[#0077b6]"
      };
    case "admin":
      return {
        bgGradient: "from-[#023e8a] to-[#03045e]",
        cardBg: "bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-50",
        icon: FaCrown,
        badge: "bg-gradient-to-r from-[#023e8a] to-[#03045e] text-white",
        title: "Admin Account",
        description: "Oversee platform operations and user management",
        accentColor: "text-[#03045e]"
      };
    default:
      return {
        bgGradient: "from-[#00b4d8] to-[#0077b6]",
        cardBg: "bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100",
        icon: FaUser,
        badge: "bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white",
        title: "User Account",
        description: "Welcome to our eco-friendly marketplace",
        accentColor: "text-[#0077b6]"
      };
  }
};

// Profile Avatar
const ProfileAvatar = ({ user, roleConfig }) => {
  const RoleIcon = roleConfig.icon;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative group">
      <div
        className={`w-40 h-40 rounded-full bg-gradient-to-r ${roleConfig.bgGradient} flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white group-hover:scale-105 transition-transform duration-300`}
      >
        {initials}
      </div>
      <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-white">
        <RoleIcon className="w-7 h-7 text-gray-700" />
      </div>
      <div className="absolute top-3 right-3 w-5 h-5 bg-green-400 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
    </div>
  );
};

// Stats Card Component with inline styles for vibrant blue backgrounds
const StatsCard = ({ icon: Icon, label, value, bgColor }) => (
  <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
    <div className="flex items-center gap-3">
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  </div>
);

// Info Row Component
const InfoRow = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center p-5 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 group">
    <div className={`w-14 h-14 bg-gradient-to-r ${color} rounded-xl shadow-md flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-bold text-gray-800 mt-1">{value}</p>
    </div>
  </div>
);

// Action Button Component
const ActionButton = ({ icon: Icon, label, onClick, variant = "primary", roleConfig }) => {
  const styles = variant === "primary" 
    ? `bg-gradient-to-r ${roleConfig.bgGradient} text-white hover:shadow-xl`
    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md";

  return (
    <button
      onClick={onClick}
      className={`flex-1 py-4 px-6 ${styles} font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2`}
    >
      <Icon className="text-lg" />
      <span>{label}</span>
    </button>
  );
};

// Profile Info Card
const ProfileCard = ({ user, roleConfig, onEditProfile }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <div className={`${roleConfig.cardBg} rounded-3xl p-8 shadow-2xl border-2 border-white/50 backdrop-blur-sm`}>
        <div className="text-center mb-8">
          <ProfileAvatar user={user} roleConfig={roleConfig} />
          <h1 className="text-4xl font-bold text-gray-800 mt-8 mb-3">{user.name}</h1>
          <div
            className={`inline-flex items-center px-6 py-2 rounded-full text-sm font-bold ${roleConfig.badge} mb-4 shadow-lg`}
          >
            <FiAward className="mr-2" />
            {roleConfig.title}
          </div>
          <p className="text-gray-600 max-w-md mx-auto text-lg">{roleConfig.description}</p>
        </div>

        {/* User Details */}
        <div className="space-y-4 mb-6">
          <InfoRow 
            icon={FaEnvelope} 
            label="Email Address" 
            value={user.email}
            color={roleConfig.bgGradient}
          />
          
          <InfoRow 
            icon={FaShieldAlt} 
            label="User ID" 
            value={`#${user.id.toString().padStart(6, "0")}`}
            color={roleConfig.bgGradient}
          />
          
          <InfoRow 
            icon={FaUser} 
            label="Account Type" 
            value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            color={roleConfig.bgGradient}
          />

          <InfoRow 
            icon={FaCalendarAlt} 
            label="Member Since" 
            value="December 2024"
            color={roleConfig.bgGradient}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <ActionButton 
            icon={FaEdit} 
            label="Edit Profile" 
            onClick={onEditProfile}
            variant="primary"
            roleConfig={roleConfig}
          />
        </div>
      </div>

      {/* Stats Section - Role Based */}
      {user.role === "buyer" && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100">
          <h3 className={`text-2xl font-bold ${roleConfig.accentColor} mb-6 flex items-center gap-2`}>
            <FaStar className="text-[#00b4d8]" />
            Your Activity
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatsCard icon={FiPackage} label="Orders" value="12" bgColor="#0077b6" />
            <StatsCard icon={FiHeart} label="Favorites" value="8" bgColor="#00b4d8" />
            <StatsCard icon={FaStar} label="Reviews" value="5" bgColor="#023e8a" />
          </div>
        </div>
      )}
    </div>
  );
};

// Main UserProfile
const UserProfile = () => {
  const { currentUser } = useGlobal();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Render appropriate navbar based on user role
  const renderNavbar = () => {
    if (!currentUser) return null;
    
    switch (currentUser.role) {
      case "buyer":
      case "user":
        return <Navbar />;
      case "seller":
        return <SellerNavbar />;
      case "admin":
        return <AdminNavbar />;
      default:
        return <Navbar />;
    }
  };

  if (!currentUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-md border-2 border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FaUser className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Not Signed In</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Please log in to view your profile information and access exclusive features.
            </p>
            <button 
              onClick={() => navigate("/login")}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Sign In Now
            </button>
          </div>
        </div>
      </>
    );
  }

  const roleConfig = getRoleConfig(currentUser.role);

  return (
    <>
      {/* Render role-based navbar */}
      {renderNavbar()}
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-[#03045e] mb-4 tracking-tight">My Profile</h1>
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className={`w-16 h-1 bg-gradient-to-r ${roleConfig.bgGradient} rounded-full`}></div>
              <div className={`w-8 h-1 bg-gradient-to-r ${roleConfig.bgGradient} rounded-full`}></div>
            </div>
            <p className="text-gray-600 text-lg">Manage your account and preferences</p>
          </div>

          {/* Profile Content */}
          <ProfileCard 
            user={currentUser} 
            roleConfig={roleConfig}
            onEditProfile={() => setIsEditModalOpen(true)}
          />
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={currentUser}
      />
    </>
  );
};

export default UserProfile;