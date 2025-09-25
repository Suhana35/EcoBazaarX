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

import SellerNavbar from './Seller/SellerNavbar'
import SellerDashboard from './Seller/SellerDashboard'
import SellerOrders from './Seller/SellerOrders'

import AdminDashboard from './Admin/AdminDashboard'
import UserManagement from './Admin/UserManagement'
import AdminNavbar from './Admin/AdminNavbar'
import CarbonInsightDashboard from './Admin/CarbonInsightDashboard'
import { useGlobal } from './context/GlobalContext'


function Layout() {
  const location = useLocation();
  const {currentUser} = useGlobal();

  const showNavbarRoutes = ["/home", "/orders", "/cart","/register","/login",];
  const showNavbar =
    showNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/productInfo/");

  const sellerRoutes = ["/selDashboard", "/addProduct", "/selOrders",];
  const showSellerNavbar = sellerRoutes.some(route => location.pathname.startsWith(route));

  const adminRoutes = ["/admin", "/userManagement","/carbonManagement"];
  const showAdminNavbar = adminRoutes.some(route => location.pathname.startsWith(route));

  const isUser = location.pathname === "/user";
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      {/* Navbars */}
      {showNavbar && <Navbar />}
      {showSellerNavbar && <SellerNavbar />}
      {showAdminNavbar && <AdminNavbar />}
     

      {/* Main Content */}
      <main className="flex-grow">
        <Routes>
          {/* Customer */}
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user" element={<UserProfile />} />
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/cart" element={<ProductCart />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/productInfo/:id" element={<ProductDetails />} />

          {/* Seller */}
          <Route path="/selDashboard" element={<SellerDashboard />} />
          {/* <Route path="/addProduct" element={<AddProduct />} /> */}
          <Route path="/selOrders" element={<SellerOrders />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/userManagement" element={<UserManagement />} />
          <Route path="/carbonManagement" element={<CarbonInsightDashboard />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
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
