import React, { useState } from "react";
import { FiPlus, FiMinus, FiSearch } from "react-icons/fi";
import { FaLeaf, FaShoppingBag, FaStore, FaUserShield, FaRecycle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const categories = [
  { id: "all",     label: "All",            icon: FaLeaf },
  { id: "orders",  label: "Shopping & Orders", icon: FaShoppingBag },
  { id: "eco",     label: "Eco & Carbon",   icon: FaRecycle },
  { id: "account", label: "Account",        icon: FaUserShield },
  { id: "seller",  label: "Sellers",        icon: FaStore },
];

const faqs = [
  // ── Shopping & Orders ────────────────────────────────────────────────────────
  {
    cat: "orders",
    q: "How do I browse and find products?",
    a: "Go to the Home page. You can search products by name, filter by category/type, set a price range using the slider, filter by minimum Eco Score, and sort results by price (low→high or high→low), best Eco Score, or lowest carbon footprint. Products are paginated — use the navigation at the bottom to see more.",
  },
  {
    cat: "orders",
    q: "How do I place an order?",
    a: "You need to be logged in. You can either: (1) Add products to your cart from the Home or Product Details page and checkout from the Cart page, or (2) Click 'Buy Now' on the Product Details page to order that single product directly. Both flows create an order that appears in your Order History.",
  },
  {
    cat: "orders",
    q: "Can I add items to my cart without logging in?",
    a: "Yes! You can add items to your cart as a guest. The cart is saved in your browser. When you log in, your guest cart is automatically merged into your account cart so you don't lose anything.",
  },
  {
    cat: "orders",
    q: "How do I manage items in my cart?",
    a: "Open the Cart page (/cart) to view all your items. You can update the quantity of each item or remove individual items. The cart also shows the total price and carbon footprint for your selection.",
  },
  {
    cat: "orders",
    q: "Where can I see my order history?",
    a: "Click 'Orders' in the navigation bar. You'll see all your orders with their current status, tracking number, items, total price, and the carbon footprint of each purchase. You can filter by status and sort by date or price.",
  },
  {
    cat: "orders",
    q: "What are the possible order statuses?",
    a: "Orders go through these stages: PROCESSING (just placed) → CONFIRMED (seller confirmed) → SHIPPED (on the way) → DELIVERED (received). Orders can also be CANCELLED or RETURNED.",
  },
  {
    cat: "orders",
    q: "Can I cancel my order?",
    a: "Yes, you can cancel an order from your Order History page as long as it is in PROCESSING or SHIPPED status. Once an order is CONFIRMED or DELIVERED, you cannot cancel it yourself — contact support via the Contact page.",
  },
  {
    cat: "orders",
    q: "Can I track my order?",
    a: "Yes. Every order has a unique tracking number visible on the Order History page. You can also view order details including the current status stage (Processing → Confirmed → Shipped → Delivered).",
  },
  {
    cat: "orders",
    q: "What does 'Mark as Delivered' mean for consumers?",
    a: "If your order is in PROCESSING or SHIPPED status, you can manually mark it as DELIVERED from the Order History page once you receive it. This updates the order status in the system.",
  },

  // ── Eco & Carbon ─────────────────────────────────────────────────────────────
  {
    cat: "eco",
    q: "What is the Eco Score?",
    a: "Eco Score is a rating from 0 to 5 assigned to every product on EcoBazaarX. A higher score means the product is more environmentally friendly. You can filter and sort products by Eco Score on the Home page to find the greenest options.",
  },
  {
    cat: "eco",
    q: "What is the Carbon Footprint shown on each product?",
    a: "Each product shows its total carbon footprint in kg CO₂, broken down into two parts: Material CO₂ (emissions from producing the product) and Shipping CO₂ (emissions from delivering it). Total Footprint = Material CO₂ + Shipping CO₂. Lower is better.",
  },
  {
    cat: "eco",
    q: "How can I find the most eco-friendly products?",
    a: "On the Home page, use the Eco Score filter to set a minimum score, or use the sort option 'Best Eco Score' to rank products from greenest to least green. You can also sort by 'Lowest Carbon Footprint' to minimise your environmental impact.",
  },
  {
    cat: "eco",
    q: "What are product recommendations on the Product Details page?",
    a: "When you view a product, EcoBazaarX automatically shows you similar eco-friendly alternatives. Recommendations are based on the same product category and a similar carbon footprint range, sorted by Eco Score so the greenest options appear first.",
  },
  {
    cat: "eco",
    q: "Can I see the carbon impact of all my purchases?",
    a: "Yes. Your Order History page shows the carbon footprint for each individual order. This lets you see the environmental impact of your shopping choices over time.",
  },

  // ── Account ───────────────────────────────────────────────────────────────────
  {
    cat: "account",
    q: "How do I create an account?",
    a: "Click 'Register' in the top navigation. Enter your name (3–20 characters), a valid email address, and a password (minimum 6 characters). Choose your role — Consumer to shop, or Seller to list products. Accept the terms and click Register.",
  },
  {
    cat: "account",
    q: "What is the difference between a Consumer and a Seller account?",
    a: "A Consumer account lets you browse products, add items to cart, place orders, and track deliveries. A Seller account gives you access to the Seller Dashboard where you can list and manage your own products and fulfil orders. You choose your role at registration.",
  },
  {
    cat: "account",
    q: "How do I update my profile?",
    a: "Go to the Profile page (/user) and click 'Edit Profile'. You can update your name, email address, and password. If updating your password, you'll need to enter your current password. Click Save to apply changes.",
  },
  {
    cat: "account",
    q: "My account is inactive — what does that mean?",
    a: "If your account status is INACTIVE, you won't be able to log in. This is managed by the platform admin. Please reach out to support via the Contact page (/contact) to have your account reactivated.",
  },
  {
    cat: "account",
    q: "How do I contact support?",
    a: "Go to the Contact page (/contact) and fill in the form with your name, email, and message. Your message is sent directly to the EcoBazaarX support team who will get back to you by email.",
  },

  // ── Sellers ───────────────────────────────────────────────────────────────────
  {
    cat: "seller",
    q: "How do I list a product as a seller?",
    a: "Log in with your Seller account and go to the Seller Dashboard (/selDashboard). Click 'Add Product' and fill in the product name, type/category, price (₹), description, Eco Score (0–5), Material CO₂, Shipping CO₂, stock quantity, and an image. Save to publish the listing.",
  },
  {
    cat: "seller",
    q: "How do I edit or delete one of my products?",
    a: "On the Seller Dashboard (/selDashboard), find your product and click Edit to update its details, or Delete to remove it permanently. You can also set a product's status to 'inactive' to hide it from buyers without deleting it.",
  },
  {
    cat: "seller",
    q: "What do the stock level indicators mean?",
    a: "The Seller Dashboard shows stock health for each product: Out of Stock (0 units), Low Stock (1–10 units), Medium Stock (11–50 units), In Stock (51+ units). Keep your stock updated so buyers can see accurate availability.",
  },
  {
    cat: "seller",
    q: "How do I fulfil a customer order?",
    a: "Go to Seller Orders (/selOrders) to see all orders containing your products. You can update each order's status through the fulfilment flow: PROCESSING → CONFIRMED → SHIPPED → DELIVERED. You can also do bulk status updates for multiple orders at once.",
  },
  {
    cat: "seller",
    q: "What order statuses can I set as a seller?",
    a: "As a seller you can set orders to: PROCESSING, CONFIRMED, SHIPPED, or DELIVERED. You cannot cancel or return an order — only the consumer or an admin can do that.",
  },
  {
    cat: "seller",
    q: "Why should I fill in accurate Eco Score and Carbon Footprint data?",
    a: "Buyers on EcoBazaarX actively filter and sort by Eco Score and carbon footprint. Products with higher Eco Scores appear in the 'Best Eco Score' sort results and attract more eco-conscious shoppers. Accurate data also builds buyer trust and improves your product's credibility.",
  },
];

const Faq = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = faqs.filter((f) => {
    const matchesCat = activeCategory === "all" || f.cat === activeCategory;
    const matchesSearch =
      !search ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 pointer-events-none blur-3xl" />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="text-5xl font-extrabold mb-4">Frequently Asked Questions</h1>
          <p className="text-white/80 text-lg mb-8">
            Answers to real questions about shopping, orders, eco features, accounts, and selling on EcoBazaarX.
          </p>
          <div className="relative max-w-lg mx-auto">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpenIndex(null); }}
              placeholder="Search questions…"
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-800 bg-white shadow-xl focus:outline-none focus:ring-2 focus:ring-[#00b4d8] placeholder-gray-400 font-medium"
            />
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-14">

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { setActiveCategory(c.id); setOpenIndex(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeCategory === c.id
                  ? "bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white shadow-lg scale-105"
                  : "bg-white text-gray-600 hover:bg-blue-50 shadow-md"
              }`}
            >
              <c.icon className="w-4 h-4" />
              {c.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-400 mb-6 text-center">
          {filtered.length} question{filtered.length !== 1 ? "s" : ""} found
          {search && ` for "${search}"`}
        </p>

        {/* Accordion */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <FaLeaf className="w-12 h-12 text-green-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No results found</h3>
            <p className="text-gray-400 text-sm mb-6">Try a different search term or category.</p>
            <button
              onClick={() => navigate("/contact")}
              className="px-6 py-3 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Ask Us Directly
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((faq, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "shadow-xl ring-2 ring-[#0077b6]/20" : "hover:shadow-lg"
                }`}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left"
                >
                  <span className="font-semibold text-gray-900 text-base leading-snug pr-4">
                    {faq.q}
                  </span>
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      openIndex === i
                        ? "bg-[#0077b6] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {openIndex === i ? (
                      <FiMinus className="w-4 h-4" />
                    ) : (
                      <FiPlus className="w-4 h-4" />
                    )}
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === i ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Still have questions */}
        <div className="mt-14 bg-gradient-to-r from-[#03045e] to-[#0077b6] rounded-3xl p-10 text-center text-white shadow-2xl">
          <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
          <p className="text-white/75 mb-6">Our support team is happy to help you out.</p>
          <button
            onClick={() => navigate("/contact")}
            className="bg-white text-[#03045e] font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition-all hover:-translate-y-0.5 shadow-lg"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Faq;