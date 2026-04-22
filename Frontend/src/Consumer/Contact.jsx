import React, { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheck, FiMessageSquare } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";

const contactInfo = [
  {
    icon: FiMail,
    label: "Email Us",
    value: "hello@ecobazaarx.in",
    sub: "We reply within 24 hours",
    color: "bg-blue-100 text-blue-600",
    href: "mailto:suhanasp35@gmail.com",
  },
  {
    icon: FiPhone,
    label: "Call Us",
    value: "+91 98765 43210",
    sub: "Mon–Sat, 9 AM – 6 PM IST",
    color: "bg-green-100 text-green-600",
    href: "tel:+919876543210",
  },
  {
    icon: FiMessageSquare,
    label: "WhatsApp",
    value: "+91 98765 43210",
    sub: "Quick support via chat",
    color: "bg-teal-100 text-teal-600",
    href: "https://wa.me/919876543210",
  },
  {
    icon: FiMapPin,
    label: "Visit Us",
    value: "Koregaon Park, Pune",
    sub: "Maharashtra, India — 411001",
    color: "bg-purple-100 text-purple-600",
    href: "https://maps.google.com",
  },
];

const topics = [
  "Order Support",
  "Product Enquiry",
  "Seller Partnership",
  "Sustainability Query",
  "Technical Issue",
  "Media / Press",
  "Other",
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.topic) e.topic = "Please select a topic";
    if (!form.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  // ✅ ADD THIS
const handleSubmit = async (e) => {
  e.preventDefault();
  const e2 = validate();
  if (Object.keys(e2).length) {
    setErrors(e2);
    return;
  }
  setLoading(true);
  try {
    const response = await fetch("http://localhost:8080/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) throw new Error("Server error");
    setSubmitted(true);
  } catch (err) {
    alert("Failed to send message. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 text-sm font-medium mb-5 backdrop-blur-sm">
            <FiMessageSquare className="text-cyan-300" />
            We'd love to hear from you
          </div>
          <h1 className="text-5xl font-extrabold mb-4">Contact Us</h1>
          <p className="text-white/80 text-lg max-w-lg mx-auto">
            Have a question, a partnership idea, or just want to say hello? Drop us a message
            and our team will get back to you shortly.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-5 gap-10">

          {/* Left: Contact Cards */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Get in touch</h2>
            <p className="text-gray-500 text-sm mb-6">
              Choose whichever channel works best for you.
            </p>

            {contactInfo.map((c) => (
              <a                                     
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-4 bg-white rounded-2xl shadow-md p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className={`flex-shrink-0 p-3 rounded-xl ${c.color}`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    {c.label}
                  </p>
                  <p className="font-semibold text-gray-900 group-hover:text-[#0077b6] transition-colors">
                    {c.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                </div>
              </a>
            ))}

            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex gap-3 items-start">
              <FaLeaf className="text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-800 leading-relaxed">
                We aim to respond within <strong>24 hours</strong>. Our support team is
                carbon-conscious — we batch communications to reduce digital footprint too!
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 shadow-lg">
                    <FiCheck className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent! 🌿</h3>
                  <p className="text-gray-500 max-w-sm">
                    Thanks for reaching out, <strong>{form.name}</strong>! We'll be in touch
                    at <strong>{form.email}</strong> within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", topic: "", message: "" });
                    }}
                    className="mt-8 px-6 py-3 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Send us a message</h2>
                  <p className="text-gray-400 text-sm mb-8">
                    Fill in the form below and we'll get back to you.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="grid sm:grid-cols-2 gap-5">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Arjun Mehta"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.name ? "border-red-400 bg-red-50" : "border-gray-200"
                          } focus:outline-none focus:ring-2 focus:ring-[#0077b6]/30 focus:border-[#0077b6] transition-all`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="arjun@example.com"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.email ? "border-red-400 bg-red-50" : "border-gray-200"
                          } focus:outline-none focus:ring-2 focus:ring-[#0077b6]/30 focus:border-[#0077b6] transition-all`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Topic */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Topic *
                      </label>
                      <select
                        name="topic"
                        value={form.topic}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.topic ? "border-red-400 bg-red-50" : "border-gray-200"
                        } focus:outline-none focus:ring-2 focus:ring-[#0077b6]/30 focus:border-[#0077b6] transition-all bg-white`}
                      >
                        <option value="">Select a topic…</option>
                        {topics.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      {errors.topic && (
                        <p className="text-red-500 text-xs mt-1">{errors.topic}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Tell us how we can help you…"
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.message ? "border-red-400 bg-red-50" : "border-gray-200"
                        } focus:outline-none focus:ring-2 focus:ring-[#0077b6]/30 focus:border-[#0077b6] transition-all resize-none`}
                      />
                      {errors.message && (
                        <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {form.message.length}/500 characters
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#00b4d8] text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                      ) : (
                        <FiSend />
                      )}
                      {loading ? "Sending…" : "Send Message"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;