import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import Home from './Consumer/Home'
import Navbar from './Consumer/UserNavbar'
import Footer from './Consumer/Footer'
import { Authenticate } from './context/GlobalContext'
import RegistrationForm from './RegistrationForm'
import Login from './Login'
import UserProfile from './UserProfile'
import ProductCart from './Consumer/ProductCart'
import OrderHistory from './Consumer/OrderHistory'
import ProductDetails from './Consumer/ProductDetails'
import About from './Consumer/About'
import Contact from './Consumer/Contact'
import Faq from './Consumer/Faq'
import HowItWorks from './Consumer/HowItWorks'
import Privacy from './Consumer/Privacy'
import ConsumerCarbonInsight from './Consumer/ConsumerCarbonInsight'

import SellerNavbar from './Seller/SellerNavbar'
import SellerDashboard from './Seller/SellerDashboard'
import SellerOrders from './Seller/SellerOrders'
import SellerCarbonInsight from './Seller/SellerCarbonInsight'

import AdminDashboard from './Admin/AdminDashboard'
import UserManagement from './Admin/UserManagement'
import AdminNavbar from './Admin/AdminNavbar'
import CarbonInsightDashboard from './Admin/CarbonInsightDashboard'
import { useGlobal } from './context/GlobalContext'
import Chatbot from './Chatbot'

function Layout() {
  const location = useLocation();
  const { currentUser } = useGlobal();

  const showNavbarRoutes = [
    "/home", "/orders", "/cart", "/register", "/login",
    "/about", "/contact", "/faq", "/how-it-works", "/privacy",
    "/my-carbon",
  ];
  const showNavbar =
    showNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/productInfo/");

  const sellerRoutes = ["/selDashboard", "/addProduct", "/selOrders", "/sel-carbon"];
  const showSellerNavbar = sellerRoutes.some(route => location.pathname.startsWith(route));

  const adminRoutes = ["/admin", "/userManagement", "/carbonManagement"];
  const showAdminNavbar = adminRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      {showNavbar && <Navbar />}
      {showSellerNavbar && <SellerNavbar />}
      {showAdminNavbar && <AdminNavbar />}

      <main className="flex-grow">
        <Routes>
          {/* Customer */}
          <Route path="/register"        element={<RegistrationForm />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/user"            element={<UserProfile />} />
          <Route path="/"                element={<Navigate to="/home" />} />
          <Route path="/home"            element={<Home />} />
          <Route path="/cart"            element={<ProductCart />} />
          <Route path="/orders"          element={<OrderHistory />} />
          <Route path="/productInfo/:id" element={<ProductDetails />} />
          <Route path="/my-carbon"       element={<ConsumerCarbonInsight />} />

          {/* Info Pages */}
          <Route path="/about"           element={<About />} />
          <Route path="/contact"         element={<Contact />} />
          <Route path="/faq"             element={<Faq />} />
          <Route path="/how-it-works"    element={<HowItWorks />} />
          <Route path="/privacy"         element={<Privacy />} />

          {/* Seller */}
          <Route path="/selDashboard"    element={<SellerDashboard />} />
          <Route path="/selOrders"       element={<SellerOrders />} />
          <Route path="/sel-carbon"      element={<SellerCarbonInsight />} />

          {/* Admin */}
          <Route path="/admin"           element={<AdminDashboard />} />
          <Route path="/userManagement"  element={<UserManagement />} />
          <Route path="/carbonManagement" element={<CarbonInsightDashboard />} />
        </Routes>
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <Authenticate>
      <Router>
        <Layout />
      </Router>
    </Authenticate>
  );
}

export default App;