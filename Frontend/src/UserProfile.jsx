import React from "react";
import { FaUser, FaEnvelope, FaShieldAlt, FaUserCheck, FaCrown, FaShoppingBag } from "react-icons/fa";
import { useGlobal } from "./context/GlobalContext"; 

// Role-based styling and icons
const getRoleConfig = (role) => {
  switch (role) {
    case "buyer":
      return {
        bgGradient: "from-emerald-400 to-teal-500",
        cardBg: "bg-gradient-to-br from-emerald-50 to-teal-50",
        icon: FaShoppingBag,
        badge: "bg-emerald-100 text-emerald-800",
        title: "Buyer Account",
        description: "Shop eco-friendly products and track your orders"
      };
    case "seller":
      return {
        bgGradient: "from-blue-400 to-indigo-500",
        cardBg: "bg-gradient-to-br from-blue-50 to-indigo-50",
        icon: FaUserCheck,
        badge: "bg-blue-100 text-blue-800",
        title: "Seller Account",
        description: "Manage your products and grow your eco-business"
      };
    case "admin":
      return {
        bgGradient: "from-purple-400 to-pink-500",
        cardBg: "bg-gradient-to-br from-purple-50 to-pink-50",
        icon: FaCrown,
        badge: "bg-purple-100 text-purple-800",
        title: "Admin Account",
        description: "Oversee platform operations and user management"
      };
    default:
      return {
        bgGradient: "from-gray-400 to-gray-500",
        cardBg: "bg-gradient-to-br from-gray-50 to-gray-100",
        icon: FaUser,
        badge: "bg-gray-100 text-gray-800",
        title: "User Account",
        description: "Welcome to our eco-friendly marketplace"
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
    <div className="relative">
      <div
        className={`w-32 h-32 rounded-full bg-gradient-to-r ${roleConfig.bgGradient} flex items-center justify-center text-white text-3xl font-bold shadow-xl`}
      >
        {initials}
      </div>
      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
        <RoleIcon className="w-6 h-6 text-gray-600" />
      </div>
      <div className="absolute top-2 right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
    </div>
  );
};

// Profile Info Card
const ProfileCard = ({ user, roleConfig }) => {
  return (
    <div
      className={`${roleConfig.cardBg} rounded-3xl p-8 shadow-2xl border border-white/20 backdrop-blur-sm`}
    >
      <div className="text-center mb-8">
        <ProfileAvatar user={user} roleConfig={roleConfig} />
        <h1 className="text-3xl font-bold text-gray-800 mt-6 mb-2">{user.name}</h1>
        <div
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${roleConfig.badge} mb-3`}
        >
          {roleConfig.title}
        </div>
        <p className="text-gray-600 max-w-md mx-auto">{roleConfig.description}</p>
      </div>

      {/* User details */}
      <div className="space-y-4">
        <div className="flex items-center p-4 bg-white/50 rounded-2xl border border-white/30">
          <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center mr-4">
            <FaEnvelope className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">Email Address</p>
            <p className="text-lg font-semibold text-gray-800">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center p-4 bg-white/50 rounded-2xl border border-white/30">
          <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center mr-4">
            <FaShieldAlt className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">User ID</p>
            <p className="text-lg font-semibold text-gray-800">
              #{user.id.toString().padStart(6, "0")}
            </p>
          </div>
        </div>

        <div className="flex items-center p-4 bg-white/50 rounded-2xl border border-white/30">
          <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center mr-4">
            <FaUser className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">Account Type</p>
            <p className="text-lg font-semibold text-gray-800 capitalize">
              {user.role}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-8">
        <button
          className={`flex-1 py-3 px-6 bg-gradient-to-r ${roleConfig.bgGradient} text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

// Main UserProfile
const UserProfile = () => {
  const { currentUser } = useGlobal();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaUser className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Not Signed In</h2>
          <p className="text-gray-600 mb-6">
            Please log in to view your profile information.
          </p>
          <button className="w-full py-3 px-6 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const roleConfig = getRoleConfig(currentUser.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">My Profile</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
        </div>
        <ProfileCard user={currentUser} roleConfig={roleConfig} />
      </div>
    </div>
  );
};

export default UserProfile;
