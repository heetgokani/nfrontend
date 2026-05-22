import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FiMessageSquare,
  FiX,
  FiMaximize,
  FiMinimize,
  FiSend,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const API_URL = "https://demo-backend-k0yn.onrender.com";

const ChatBot = () => {
  const { auth, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [chatLog, setChatLog] = useState([]);
  const [inputText, setInputText] = useState("");
  const [inputMode, setInputMode] = useState("none");
  const [activeTicket, setActiveTicket] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const messagesEndRef = useRef(null);

  // Use a ref to track if we already auto-opened the chat to prevent annoyance
  const hasAutoOpened = useRef(false);

  const toggleChat = () => {
    if (!isOpen && !auth?.user) {
      window.location.href = "/login";
      return;
    }
    setIsOpen(!isOpen);
    // If they manually open, mark as auto-opened so it doesn't glitch later
    hasAutoOpened.current = true;
  };

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  // Core Sync Function for Polling & Updating Chat State
  const syncTickets = async () => {
    if (!auth?.user) return;
    try {
      const { data } = await axios.get(`${API_URL}/api/chats/my-tickets`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      const openTicket = data.tickets.find((t) => t.status === "Open");

      if (openTicket) {
        // Format messages for the UI
        let hasAdminJoined = false;
        const formattedMessages = [];

        openTicket.messages.forEach((m, index) => {
          const isAdmin = m.sender.toLowerCase() === "admin";

          // Inject "Joined the chat" message on first Admin reply
          if (isAdmin && !hasAdminJoined) {
            hasAdminJoined = true;
            formattedMessages.push({
              sender: "system",
              text: "Sneakerwala Support has joined the chat",
            });
          }

          // Push the actual message (User or Admin)
          formattedMessages.push({
            sender: isAdmin ? "bot" : "user",
            text: m.text,
            name: isAdmin ? "Sneakerwala Support" : "",
          });

          // THE FIX: Inject the automated Ticket Confirmation exactly after the first user message
          // This prevents the polling from erasing it since the DB doesn't save bot auto-replies.
          if (index === 0) {
            formattedMessages.push({
              sender: "bot",
              text: `Our agent will reply to you within 2-3 business working days. Thanks for contacting us.\n\nThis is your ticket no: **${openTicket.ticketId}**`,
            });
          }
        });

        setChatLog(formattedMessages);
        setActiveTicket(openTicket.ticketId);

        // ALWAYS allow the user to keep typing while a ticket is open
        setInputMode("chatting");

        // Check who sent the last message to trigger auto-popup
        const lastMsg = openTicket.messages[openTicket.messages.length - 1];
        const isAdminLast = lastMsg?.sender === "Admin";

        if (isAdminLast) {
          if (!hasAutoOpened.current && !isOpen) {
            setIsOpen(true);
            hasAutoOpened.current = true;
          }
        }
      } else {
        // No open ticket found. Check if a ticket was JUST closed.
        if (activeTicket) {
          setActiveTicket(null);
          setInputMode("none");
          setSelectedOrder(null); // Clear selected order to prevent bugs
          setChatLog((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "The agent has closed this ticket. Is there anything else I can help you with?",
              options: ["Main Menu"],
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Chat sync error:", error);
    }
  };

  // Setup Polling every 5 seconds
  useEffect(() => {
    syncTickets();
    const interval = setInterval(syncTickets, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [auth, token, activeTicket]);

  // Trigger Welcome Menu ONLY on fresh open with no tickets
  useEffect(() => {
    if (isOpen && !activeTicket && chatLog.length === 0 && auth?.user) {
      showMainMenu(
        `Welcome ${auth.user.name}, what may I help you with today?`
      );
    }
  }, [isOpen, activeTicket, chatLog.length, auth]);

  const showMainMenu = (greeting) => {
    setChatLog((prev) => [
      ...prev,
      {
        sender: "bot",
        text: greeting,
        options: [
          "Account",
          "Order",
          "Payment",
          "Product",
          "Query",
          "Chat History",
        ],
      },
    ]);
    setInputMode("none");
    setActiveTicket(null);
    setSelectedOrder(null);
  };

  const handleOptionClick = async (option) => {
    setChatLog((prev) => [...prev, { sender: "user", text: option }]);

    if (option === "Main Menu") {
      showMainMenu("What else can I help you with?");
      return;
    }

    if (option === "Chat History") {
      try {
        const { data } = await axios.get(`${API_URL}/api/chats/my-tickets`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!data.tickets || data.tickets.length === 0) {
          setChatLog((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "You have no previous support tickets.",
              options: ["Main Menu"],
            },
          ]);
        } else {
          const ticketTexts = data.tickets
            .map((t) => `🎫 ${t.ticketId} [${t.status}]`)
            .join("\n");
          setChatLog((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `Your Tickets:\n${ticketTexts}`,
              options: ["Main Menu"],
            },
          ]);
        }
      } catch (err) {
        setChatLog((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "No previous support tickets found.",
            options: ["Main Menu"],
          },
        ]);
      }
      return;
    }

    if (option === "Order") {
      try {
        const { data } = await axios.get(`${API_URL}/api/orders/myorders`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!data.orders || data.orders.length === 0) {
          setChatLog((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "You have no previous orders.",
              options: ["Main Menu"],
            },
          ]);
        } else {
          const orderOptions = data.orders.map(
            (o) => o.orderNumber || o._id.substring(0, 8)
          );
          setChatLog((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `You have ${data.orders.length} order(s). Please select the order you need help with:`,
              options: [...orderOptions, "Main Menu"],
            },
          ]);
          setInputMode("SelectOrder");
        }
      } catch (err) {
        setChatLog((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Could not fetch orders.",
            options: ["Main Menu"],
          },
        ]);
      }
      return;
    }

    if (inputMode === "SelectOrder" && option !== "Main Menu") {
      setSelectedOrder(option);
      setChatLog((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `You selected Order ${option}. Please type your issue regarding this order.`,
          options: ["Main Menu"],
        },
      ]);
      setInputMode("OrderIssue");
      return;
    }

    if (option === "Account") {
      setChatLog((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Account Details:\nName: ${auth?.user?.name}\nEmail: ${auth?.user?.email}\n\nWhat is your issue?`,
          options: ["Main Menu"],
        },
      ]);
      setInputMode("Account");
      return;
    }

    // Grouping the rest
    const simpleModes = ["Payment", "Product", "Query"];
    if (simpleModes.includes(option)) {
      setChatLog((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Describe your ${option} issue:`,
          options: ["Main Menu"],
        },
      ]);
      setInputMode(option);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText;
    setInputText("");

    // If ticket is already active, just send a reply to that existing ticket
    if (activeTicket) {
      try {
        await axios.post(
          `${API_URL}/api/chats/${activeTicket}/message`,
          { text: userMessage, sender: "User" },
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Do NOT set inputMode to waiting. Let the user keep typing.
        syncTickets(); // Fetch immediate update
      } catch (err) {
        setChatLog((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Failed to send message. Chat might be closed.",
            options: ["Main Menu"],
          },
        ]);
      }
      return;
    }

    // Creating a brand NEW ticket
    let categoryToSend = inputMode;
    let finalMessage = userMessage;

    if (inputMode === "OrderIssue") {
      categoryToSend = "Order";
      finalMessage = `[Order ID: ${selectedOrder}]\n${userMessage}`;
    }

    const validCategories = ["Account", "Order", "Payment", "Product", "Query"];

    if (validCategories.includes(categoryToSend)) {
      try {
        const { data } = await axios.post(
          `${API_URL}/api/chats/ticket`,
          { category: categoryToSend, message: finalMessage },
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        hasAutoOpened.current = true; // Mark to prevent random reopening
        setActiveTicket(data.ticket.ticketId);
        setInputMode("chatting"); // Allow them to keep typing

        // Show initial success message instantly
        setChatLog((prev) => [
          ...prev,
          { sender: "user", text: userMessage },
          {
            sender: "bot",
            text: `Our agent will reply to you within 2-3 business working days. Thanks for contacting us.\n\nThis is your ticket no: **${data.ticket.ticketId}**`,
          },
        ]);

        syncTickets();
      } catch (err) {
        setChatLog((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Failed to generate ticket. Please try again.",
            options: ["Main Menu"],
          },
        ]);
      }
    }
  };

  return (
    <>
      <style>
        {`
          .chat-fab { position: fixed; bottom: 24px; right: 24px; background-color: #de433f; color: white; border: none; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(222, 67, 63, 0.4); cursor: pointer; z-index: 9999; transition: 0.3s ease; }
          .chat-fab:hover { transform: translateY(-5px); box-shadow: 0 12px 28px rgba(222, 67, 63, 0.5); }
          .chat-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.2); backdrop-filter: blur(2px); z-index: 9998; opacity: 1; animation: fadeIn 0.3s ease; }
          .hide-overlay { display: none; }
          .chat-window { position: fixed; bottom: 24px; right: 24px; width: 380px; height: 600px; max-height: 85vh; background-color: #ffffff; border-radius: 16px; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15); display: flex; flex-direction: column; z-index: 10000; transform: translateY(20px); opacity: 0; pointer-events: none; transition: all 0.3s; overflow: hidden; }
          .chat-window.open { transform: translateY(0); opacity: 1; pointer-events: all; }
          .chat-window.fullscreen { bottom: 0; right: 0; width: 100vw; height: 100vh; max-height: 100vh; border-radius: 0; }
          .chat-header { background-color: #de433f; color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
          .chat-header-info { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 1.1rem; }
          .chat-header-actions { display: flex; gap: 12px; }
          .chat-header-actions button { background: none; border: none; color: white; cursor: pointer; opacity: 0.8; transition: opacity 0.2s; display: flex; align-items: center; }
          .chat-header-actions button:hover { opacity: 1; }
          .chat-body { flex: 1; padding: 20px; background-color: #f8f9fa; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
          .chat-message { max-width: 85%; padding: 12px 16px; border-radius: 12px; font-size: 0.95rem; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word; }
          .chat-message.bot { background-color: white; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); color: #333; }
          .chat-message.user { background-color: #de433f; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
          
          .quick-replies { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
          .quick-reply-btn { background: #fff; border: 1px solid #de433f; color: #de433f; padding: 8px 14px; border-radius: 50px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; }
          .quick-reply-btn:hover { background: #de433f; color: white; }

          .chat-footer { padding: 16px; background-color: white; border-top: 1px solid #eaeaea; display: flex; align-items: center; gap: 12px; }
          .chat-footer input { flex: 1; padding: 12px 16px; border: 1px solid #ddd; border-radius: 24px; outline: none; font-size: 0.95rem; transition: border-color 0.2s; }
          .chat-footer input:focus { border-color: #de433f; }
          .send-btn { background-color: #de433f; color: white; border: none; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
          .send-btn:hover { background-color: #c53b38; transform: scale(1.05); }
          .send-btn:disabled { background-color: #ccc; cursor: not-allowed; transform: none; }
          
          @media (max-width: 480px) {
            .chat-window { width: 100vw; height: 100vh; max-height: 100vh; bottom: 0; right: 0; border-radius: 0; }
            .desktop-only-btn { display: none !important; }
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}
      </style>

      {isOpen && (
        <div
          className={`chat-overlay ${isFullScreen ? "hide-overlay" : ""}`}
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {!isOpen && (
        <button className="chat-fab" onClick={toggleChat}>
          <FiMessageSquare size={24} />
        </button>
      )}

      <div
        className={`chat-window ${isOpen ? "open" : ""} ${
          isFullScreen ? "fullscreen" : ""
        }`}
      >
        <div className="chat-header">
          <div className="chat-header-info">
            <FiMessageSquare size={20} />
            <span>Support Chat</span>
          </div>
          <div className="chat-header-actions">
            <button
              className="desktop-only-btn"
              onClick={toggleFullScreen}
              title={isFullScreen ? "Minimize" : "Expand"}
            >
              {isFullScreen ? (
                <FiMinimize size={18} />
              ) : (
                <FiMaximize size={18} />
              )}
            </button>
            <button onClick={() => setIsOpen(false)} title="Close">
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="chat-body">
          {chatLog.map((msg, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
              {msg.sender === "system" ? (
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "12px",
                    color: "#64748b",
                    margin: "10px 0",
                    fontWeight: "600",
                  }}
                >
                  {msg.text}
                </div>
              ) : (
                <div className={`chat-message ${msg.sender}`}>
                  {msg.name === "Sneakerwala Support" && (
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        marginBottom: "4px",
                        opacity: 0.8,
                      }}
                    >
                      {msg.name}
                    </div>
                  )}
                  {msg.text}
                </div>
              )}
              {msg.options && msg.sender === "bot" && (
                <div className="quick-replies">
                  {msg.options.map((opt, i) => (
                    <button
                      key={i}
                      className="quick-reply-btn"
                      onClick={() => handleOptionClick(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-footer">
          <input
            type="text"
            placeholder={
              inputMode === "SelectOrder" || inputMode === "none"
                ? "Select an option above..."
                : "Type your message..."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={inputMode === "SelectOrder" || inputMode === "none"}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={
              !inputText.trim() ||
              inputMode === "SelectOrder" ||
              inputMode === "none"
            }
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
