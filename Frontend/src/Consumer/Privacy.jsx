import React, { useState, useEffect, useRef } from "react";
import { FiShield, FiChevronRight } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";

const sections = [
  {
    id: "overview",
    title: "Overview",
    content: `EcoBazaarX ("we", "us", "our") is committed to protecting the personal information of our users. This Privacy Policy explains what data we collect, how we use it, and your rights under the Digital Personal Data Protection Act, 2023 (India).

By using our platform you agree to the practices described in this Policy. If you do not agree, please discontinue use of our services.

Last updated: January 2025.`,
  },
  {
    id: "data-collected",
    title: "Data We Collect",
    content: `We collect the following categories of personal data:

Account Data: Your name, email address, and password (stored using BCrypt hashing — never in plain text) when you register. You also choose your account role (Consumer or Seller) at registration, and may opt in or out of newsletter communications.

Order & Cart Data: Order history, items purchased, order status, tracking numbers, and the carbon footprint associated with your purchases. Cart contents are stored locally in your browser until you log in, at which point they are merged into your account.

Carbon & Eco Data: The eco scores and carbon footprint values of products you browse and purchase, used to display environmental impact data on your Order History page.

Seller Product Data: Product listings, including name, type, price, eco score, carbon footprint values (materialCO2 and shippingCO2), stock quantity, description, and product images provided by sellers through the Seller Dashboard.

Contact Messages: Name, email address, selected topic, and message content submitted through the Contact page form.`,
  },
  {
    id: "how-we-use",
    title: "How We Use Your Data",
    content: `We use your data for the following purposes:

- To create and manage your account and authenticate your sessions (via JWT tokens with a 24-hour expiry).
- To display your order history, current order statuses, and the carbon footprint of your purchases.
- To manage your shopping cart and process orders placed through the platform.
- To allow sellers to list, manage, and fulfil product orders through the Seller Dashboard.
- To display eco scores and carbon footprint data on products, helping you make informed sustainable choices.
- To respond to support queries submitted through the Contact page.
- To send newsletter communications if you opted in at registration (you may opt out at any time by contacting us).
- To provide platform administrators with aggregated analytics on orders, products, users, and carbon emissions.
- To comply with applicable Indian laws and regulations.

We do NOT use your data for automated profiling, advertising, or to sell to third parties.`,
  },
  {
    id: "sharing",
    title: "Data Sharing",
    content: `We share your data only in the following circumstances:

Between Users on the Platform: When a consumer places an order, the relevant seller can see the order details (items, quantities, order status) to fulfil the order. Sellers do not see consumer personal profile data beyond what is needed for order fulfilment.

Platform Administrators: Admins have access to all user accounts, orders, and product data for the purpose of managing and moderating the platform.

Legal Requirements: We may disclose data if required by law, court order, or government authority under Indian law.

We never sell your personal data to advertisers, data brokers, or any third party for commercial gain. We do not use any third-party advertising, analytics, or tracking services.`,
  },
  {
    id: "cookies",
    title: "Cookies & Local Storage",
    content: `We use the following browser storage mechanisms:

Authentication Tokens: A JWT (JSON Web Token) is stored in your browser's local storage after login. This is used to authenticate your requests to the platform. It expires after 24 hours, after which you will need to log in again.

Guest Cart: If you add items to your cart without logging in, those items are stored in your browser's local storage under "guestCart". This data stays on your device and is merged into your account cart when you log in.

We do not use advertising cookies, third-party tracking cookies, or cross-site tracking technologies.`,
  },
  {
    id: "security",
    title: "Data Security",
    content: `We implement the following security measures:

- Passwords are stored using BCrypt hashing — your actual password is never stored or accessible.
- All authenticated API requests require a valid JWT token, which expires after 24 hours.
- Role-based access control is enforced on all API endpoints — consumers, sellers, and admins can only access data relevant to their role.
- CORS (Cross-Origin Resource Sharing) policies restrict which domains can make requests to our API.

Despite these measures, no system is 100% secure. Please use a strong, unique password for your account and log out when using shared devices.`,
  },
  {
    id: "rights",
    title: "Your Rights",
    content: `Under India's Digital Personal Data Protection Act, 2023, you have the following rights:

Right to Access: Request a copy of the personal data we hold about you.

Right to Correction: Update your name, email address, or password at any time through your Profile page (/user).

Right to Erasure: Request deletion of your account and personal data by contacting us through the Contact page (/contact).

Right to Grievance Redressal: Lodge a complaint with our support team via the Contact page, or escalate to the Data Protection Board of India.

To exercise any of these rights, use the Contact page on our platform. We aim to acknowledge all requests within 48 hours.`,
  },
  {
    id: "contact",
    title: "Contact Us",
    content: `For any privacy-related questions or to exercise your data rights, please use the Contact page on our platform (/contact).

Fill in the contact form with your name, email, select "Other" or the relevant topic, and describe your request. Our team will respond to your email address within 48 hours.

If you are not satisfied with our response, you may escalate your concern to the Data Protection Board of India.`,
  },
];

const Privacy = () => {
  const [active, setActive] = useState("overview");
  const sectionRefs = useRef({});

  const scrollTo = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] text-white py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 text-sm font-medium mb-5 backdrop-blur-sm">
            <FiShield className="text-cyan-300" />
            Your privacy matters to us
          </div>
          <h1 className="text-5xl font-extrabold mb-4">Privacy Policy</h1>
          <p className="text-white/80 text-lg">
            We believe transparency is a core part of sustainability. Here's exactly
            how we handle your personal data.
          </p>
          <p className="text-white/50 text-sm mt-3">Last updated: January 2025</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex gap-8">

          {/* Sticky Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-5 sticky top-24">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Contents</p>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-200 ${
                      active === s.id
                        ? "bg-[#0077b6] text-white font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {active === s.id && <FiChevronRight className="w-3 h-3 flex-shrink-0" />}
                    {s.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-8">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex gap-3 items-start">
              <FaLeaf className="text-green-500 mt-0.5 flex-shrink-0 w-5 h-5" />
              <p className="text-sm text-green-800 leading-relaxed">
                <strong>Our commitment:</strong> We never sell your data, never use advertising
                trackers, and never store payment information — we have no payment system on the platform.
              </p>
            </div>
            {sections.map((s) => (
              <div
                key={s.id}
                id={s.id}
                ref={(el) => (sectionRefs.current[s.id] = el)}
                className="bg-white rounded-2xl shadow-md p-8 scroll-mt-24"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-2 h-6 rounded-full bg-gradient-to-b from-[#0077b6] to-[#00b4d8] flex-shrink-0" />
                  {s.title}
                </h2>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                  {s.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;