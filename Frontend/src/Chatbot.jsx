import React, { useState, useRef, useEffect } from "react";
import { FiX, FiSend, FiRefreshCw } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";
import { useGlobal } from "./context/GlobalContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// ── Role config: welcome message + quick suggestions ─────────────────────────
const ROLE_CONFIG = {
  consumer: {
    welcome: (name) =>
      `Hi ${name ? name.split(" ")[0] : "there"}! 👋 I'm **EcoBot**.\n\nI can help you with:\n• 🛍️ Finding & filtering eco-friendly products\n• 🛒 Managing your cart\n• 📦 Placing orders & tracking status\n• 🌱 Understanding Eco Score & Carbon Footprint\n• 👤 Updating your profile`,
    suggestions: [
      { emoji: "🛍️", text: "How do I find products by eco score?" },
      { emoji: "🛒", text: "How does the cart work?" },
      { emoji: "📦", text: "How do I track my order?" },
      { emoji: "🌱", text: "What is Carbon Footprint?" },
    ],
    badge: "Shopper Assistant",
    accent: "#0077b6",
  },
  seller: {
    welcome: (name) =>
      `Welcome back, ${name ? name.split(" ")[0] : "Seller"}! 🌿 I'm **EcoBot**.\n\nI can help you with:\n• 📦 Adding & managing your products\n• 📊 Handling orders and updating status\n• 🌱 Setting Eco Score & Carbon Footprint\n• 📈 Understanding stock level indicators\n• 👤 Updating your profile`,
    suggestions: [
      { emoji: "📦", text: "How do I add a new product?" },
      { emoji: "📊", text: "How do I update an order status?" },
      { emoji: "🌱", text: "What fields does Eco Score affect?" },
      { emoji: "📈", text: "What are the stock level indicators?" },
    ],
    badge: "Seller Assistant",
    accent: "#023e8a",
  },
  admin: {
    welcome: (name) =>
      `Hello, ${name ? name.split(" ")[0] : "Admin"}! 🛡️ I'm **EcoBot**.\n\nI can help you with:\n• 📊 Understanding the Admin Dashboard stats\n• 👥 Managing users (roles & status)\n• 📋 Viewing and updating all orders\n• 🌍 Reading the Carbon Insights Dashboard\n• 🛠️ Managing any product on the platform`,
    suggestions: [
      { emoji: "👥", text: "How do I change a user's role?" },
      { emoji: "📊", text: "What stats are on the Admin Dashboard?" },
      { emoji: "🌍", text: "What does the Carbon Insights Dashboard show?" },
      { emoji: "📋", text: "How do I manage all orders?" },
    ],
    badge: "Admin Assistant",
    accent: "#03045e",
  },
  guest: {
    welcome: () =>
      `Hi! 👋 I'm **EcoBot**, your guide to EcoBazaarX.\n\nI can help you with:\n• 🌿 What is EcoBazaarX?\n• 🛍️ Browsing & filtering products\n• 🔑 How to register or log in\n• 🌱 Understanding Eco Score & Carbon Footprint`,
    suggestions: [
      { emoji: "🌿", text: "What is EcoBazaarX?" },
      { emoji: "🛍️", text: "How do I browse products?" },
      { emoji: "🔑", text: "How do I create an account?" },
      { emoji: "🌱", text: "What is an Eco Score?" },
    ],
    badge: "Guest Assistant",
    accent: "#0077b6",
  },
};

const getConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.guest;

// ── Render markdown-style bold and newlines ───────────────────────────────────
function FormattedText({ text }) {
  return (
    <span>
      {text.split("\n").map((line, li, arr) => (
        <span key={li}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, pi) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={pi}>{part.slice(2, -2)}</strong>
            ) : (
              <span key={pi}>{part}</span>
            )
          )}
          {li < arr.length - 1 && <br />}
        </span>
      ))}
    </span>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}

function ChatMessage({ msg, isNew }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 mb-4 ${isUser ? "justify-end" : "justify-start"} ${isNew ? "animate-fadeIn" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0077b6] to-[#00b4d8] flex items-center justify-center shadow-md flex-shrink-0 mb-0.5">
          <FaLeaf className="text-white w-3.5 h-3.5" />
        </div>
      )}
      <div className="flex flex-col gap-1 max-w-[78%]">
        <span className={`text-[10px] font-medium tracking-wide ${isUser ? "text-right text-[#0077b6]" : "text-[#00b4d8]"}`}>
          {isUser ? "You" : "EcoBot"}
        </span>
        <div className={`px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-[#0077b6] to-[#00b4d8] text-white rounded-2xl rounded-br-sm"
            : "bg-white text-gray-700 rounded-2xl rounded-bl-sm border border-[#e0f7fa]"
        }`}>
          <FormattedText text={msg.content} />
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#03045e] to-[#0077b6] flex items-center justify-center shadow-md flex-shrink-0 mb-0.5">
          <span className="text-white text-[10px] font-bold">YOU</span>
        </div>
      )}
    </div>
  );
}

// ── Main Chatbot component ────────────────────────────────────────────────────
export default function Chatbot() {
  const { currentUser } = useGlobal();
  const role   = currentUser?.role || "guest";
  const config = getConfig(role);

  const makeWelcome = (user) => ({
    role: "assistant",
    content: getConfig(user?.role || "guest").welcome(user?.name),
  });

  const [open,       setOpen]     = useState(false);
  const [messages,   setMessages] = useState([makeWelcome(currentUser)]);
  const [input,      setInput]    = useState("");
  const [loading,    setLoading]  = useState(false);
  const [newMsgIdx,  setNewIdx]   = useState(null);
  const prevUserRef  = useRef(currentUser);
  const bottomRef    = useRef(null);
  const inputRef     = useRef(null);

  // Reset chat whenever user logs in, logs out, or role changes
  useEffect(() => {
    const prev = prevUserRef.current;
    const curr = currentUser;
    const changed = prev?.id !== curr?.id || prev?.role !== curr?.role;
    if (changed) {
      setMessages([makeWelcome(curr)]);
      setInput("");
      setNewIdx(null);
      setOpen(false);
    }
    prevUserRef.current = curr;
  }, [currentUser]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const next    = [...messages, userMsg];
    setMessages(next);
    setNewIdx(next.length - 1);
    setInput("");
    setLoading(true);

    // Build API history — skip the local welcome message
    const apiMessages = next.slice(1).map(({ role, content }) => ({ role, content }));

    // Inject role context into first user message so the backend routes correctly
    if (apiMessages.length > 0 && apiMessages[0].role === "user") {
      const tag = `[Context: user is a ${role} on EcoBazaarX eco-marketplace] `;
      apiMessages[0] = { ...apiMessages[0], content: tag + apiMessages[0].content };
    }

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setMessages((prev) => {
        const updated = [...prev, { role: "assistant", content: data.reply }];
        setNewIdx(updated.length - 1);
        return updated;
      });
    } catch {
      setMessages((prev) => {
        const updated = [...prev, {
          role: "assistant",
          content: "⚠️ Connection issue. Please try again in a moment.",
        }];
        setNewIdx(updated.length - 1);
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const resetChat = () => {
    setMessages([makeWelcome(currentUser)]);
    setInput("");
    setNewIdx(null);
  };

  const accent = config.accent;
  const showSuggestions = messages.length === 1 && !loading;

  return (
    <>
      <style>{`
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .animate-fadeIn  { animation: fadeIn  0.25s ease forwards }
        .animate-slideUp { animation: slideUp 0.28s cubic-bezier(.22,1,.36,1) forwards }
        .chat-scroll::-webkit-scrollbar       { width: 4px }
        .chat-scroll::-webkit-scrollbar-track { background: transparent }
        .chat-scroll::-webkit-scrollbar-thumb { background: #bae6fd; border-radius: 99px }
      `}</style>

      {/* ── Floating Toggle Button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${accent}, #00b4d8)` }}
        title={open ? "Close EcoBot" : "Chat with EcoBot"}
      >
        {open ? (
          <FiX size={22} strokeWidth={2.5} />
        ) : (
          <>
            <FaLeaf size={20} />
            <span className="absolute w-full h-full rounded-full border-2 border-[#00b4d8] animate-ping opacity-40" />
          </>
        )}
      </button>

      {/* ── Chat Panel ── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] flex flex-col rounded-2xl overflow-hidden border border-[#e0f7fa] animate-slideUp"
          style={{ height: "530px", background: "#f0f9ff", boxShadow: "0 8px 40px rgba(0,119,182,0.22)" }}
        >
          {/* Header */}
          <div
            className="px-4 py-3.5 flex items-center justify-between flex-shrink-0"
            style={{ background: `linear-gradient(90deg, #03045e, ${accent}, #00b4d8)` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-inner">
                <FaLeaf className="text-white w-4 h-4" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">EcoBot</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-[#90e0ef] text-[11px]">EcoBazaarX · Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetChat}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center text-white/80 hover:text-white transition-all"
                title="Reset conversation"
              >
                <FiRefreshCw size={13} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center text-white/80 hover:text-white transition-all"
                title="Close"
              >
                <FiX size={15} />
              </button>
            </div>
          </div>

          {/* Sub-bar with role badge */}
          <div
            className="px-4 py-1.5 flex items-center justify-between flex-shrink-0 border-b border-[#90e0ef]/30"
            style={{ background: "linear-gradient(90deg,#caf0f8,#ade8f4)" }}
          >
            <div className="flex items-center gap-1.5">
              <FaLeaf className="text-[#0077b6] w-3 h-3" />
              <span className="text-[#0077b6] text-[10px] font-medium tracking-wide">Powered by Groq · Llama 3.3 70B</span>
            </div>
            <span
              className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}
            >
              {config.badge}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 chat-scroll">
            {messages.map((msg, i) => (
              <ChatMessage key={i} msg={msg} isNew={i === newMsgIdx} />
            ))}
            {loading && (
              <div className="flex items-end gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0077b6] to-[#00b4d8] flex items-center justify-center shadow-md flex-shrink-0">
                  <FaLeaf className="text-white w-3.5 h-3.5" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm border border-[#e0f7fa] px-4 py-3 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Role-aware Quick Suggestions */}
          {showSuggestions && (
            <div className="px-4 py-2 flex flex-wrap gap-2 flex-shrink-0">
              {config.suggestions.map(({ emoji, text }) => (
                <button
                  key={text}
                  onClick={() => sendMessage(text)}
                  className="flex items-center gap-1.5 text-[11px] font-medium bg-white border border-[#90e0ef] rounded-full px-3 py-1.5 shadow-sm transition-all duration-150"
                  style={{ color: accent }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = accent;
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.borderColor = accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.color = accent;
                    e.currentTarget.style.borderColor = "#90e0ef";
                  }}
                >
                  <span>{emoji}</span>{text}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="bg-white border-t border-[#e0f7fa] px-3 py-3 flex items-end gap-2 flex-shrink-0">
            <div className="flex-1 flex items-end bg-[#f0f9ff] border border-[#bae6fd] rounded-xl overflow-hidden focus-within:border-[#0077b6] focus-within:ring-2 focus-within:ring-[#00b4d8]/30 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask EcoBot anything…"
                rows={1}
                className="flex-1 resize-none bg-transparent px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none max-h-24"
                style={{ lineHeight: "1.5" }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-150"
              style={{ background: `linear-gradient(135deg, ${accent}, #00b4d8)` }}
            >
              <FiSend size={15} strokeWidth={2.5} />
            </button>
          </div>

          {/* Footer */}
          <div className="bg-white px-4 pb-2 text-center flex-shrink-0">
            <p className="text-[10px] text-gray-400">🌿 EcoBazaarX · Questions answered based on platform features only</p>
          </div>
        </div>
      )}
    </>
  );
}