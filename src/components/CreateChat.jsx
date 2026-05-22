import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiSend,
  FiCheckCircle,
  FiArrowLeft,
  FiMessageSquare,
  FiSearch,
  FiUser,
  FiClock,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const API_URL = "https://demo-backend-k0yn.onrender.com";

const CreateChat = () => {
  const { token } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");

  const messagesEndRef = useRef(null);

  // Fetch all tickets for Admin
  const fetchAllTickets = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/chats/all`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedTickets = data.tickets || [];
      setTickets(fetchedTickets);

      // THE FIX: Use prevTicket to ensure we never overwrite newly clicked tickets
      // with stale data from an old interval fetch.
      setSelectedTicket((prevTicket) => {
        if (!prevTicket) return null;
        const updatedTicket = fetchedTickets.find(
          (t) => t.ticketId === prevTicket.ticketId
        );
        return updatedTicket || prevTicket;
      });
    } catch (err) {
      console.error("Failed to load tickets", err);
    }
  };

  // Initial load and polling setup
  useEffect(() => {
    fetchAllTickets();
    const interval = setInterval(fetchAllTickets, 5000);
    return () => clearInterval(interval);
    // THE FIX: Removed selectedTicket from here so the interval doesn't constantly reset
  }, [token]);

  // Search filter effect
  useEffect(() => {
    if (search) {
      const lowerQ = search.toLowerCase();
      setFiltered(
        tickets.filter((t) => {
          const idMatch = t.ticketId?.toLowerCase().includes(lowerQ);
          const emailMatch = t.user?.email?.toLowerCase().includes(lowerQ);
          const nameMatch = t.user?.name?.toLowerCase().includes(lowerQ);
          const statusMatch = t.status?.toLowerCase().includes(lowerQ);
          return idMatch || emailMatch || nameMatch || statusMatch;
        })
      );
    } else {
      setFiltered(tickets);
    }
  }, [search, tickets]);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages]);

  const handleAdminReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    try {
      await axios.post(
        `${API_URL}/api/chats/${selectedTicket.ticketId}/message`,
        {
          text: replyText,
          sender: "Admin",
        },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReplyText("");
      fetchAllTickets(); // Instant refresh after sending
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reply");
    }
  };

  const handleEndChat = async () => {
    if (!selectedTicket) return;
    try {
      await axios.put(
        `${API_URL}/api/chats/${selectedTicket.ticketId}/close`,
        {},
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Ticket ${selectedTicket.ticketId} Closed`);

      // Clear selection upon close so it drops back to the list
      setSelectedTicket(null);
      fetchAllTickets();
    } catch (err) {
      toast.error("Failed to close ticket");
    }
  };

  const getStatusBadge = (status) => {
    const isOpen = status === "Open";
    return (
      <span
        style={{
          background: isOpen ? "#f0fdf4" : "var(--mern-admin-bg)",
          color: isOpen ? "#16a34a" : "#64748b",
          padding: "4px 10px",
          borderRadius: "50px",
          fontSize: "11px",
          fontWeight: "700",
          border: `1px solid ${
            isOpen ? "#bbf7d0" : "var(--mern-admin-border)"
          }`,
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {!isOpen && <FiCheckCircle size={10} />}
        {status}
      </span>
    );
  };

  return (
    <>
      <style>
        {`
          /* Custom Scrollbar for Chat & Sidebar */
          .custom-scroll::-webkit-scrollbar { width: 6px; }
          .custom-scroll::-webkit-scrollbar-track { background: var(--mern-admin-bg); border-radius: 10px; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

          .admin-page-wrapper {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Inter', sans-serif;
            color: var(--mern-admin-text-main);
            height: calc(100vh - 80px);
            display: flex;
            flex-direction: column;
          }

          /* Header Styling */
          .admin-header-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fff;
            padding: 20px 25px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            margin-bottom: 20px;
            flex-shrink: 0;
          }

          .admin-search-box {
            display: flex;
            align-items: center;
            background: var(--mern-admin-bg);
            border: 1px solid var(--mern-admin-border);
            border-radius: 8px;
            padding: 10px 16px;
            width: 350px;
            transition: all 0.2s;
          }
          
          .admin-search-box:focus-within {
            border-color: var(--mern-admin-primary);
            box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
          }

          /* Main Grid Layout */
          .admin-chat-grid {
            display: grid;
            grid-template-columns: 360px 1fr;
            gap: 20px;
            flex: 1;
            min-height: 0; /* Important for inner scrolling */
          }

          /* ---------------- Sidebar Styling ---------------- */
          .ticket-list-container {
            background: #fff;
            border-radius: 12px;
            border: 1px solid var(--mern-admin-border);
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .ticket-list-header {
            padding: 16px 20px;
            border-bottom: 1px solid var(--mern-admin-border);
            background: var(--mern-admin-bg);
            font-weight: 800;
            color: var(--mern-admin-text-main);
            font-size: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .ticket-list-body {
            flex: 1;
            overflow-y: auto;
            background: #fff;
          }

          .ticket-item {
            padding: 18px 20px;
            border-bottom: 1px solid var(--mern-admin-bg);
            cursor: pointer;
            transition: all 0.2s ease;
            border-left: 4px solid transparent;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .ticket-item:hover {
            background: var(--mern-admin-bg);
          }

          .ticket-item.active {
            background: #faf5ff; 
            border-left-color: var(--mern-admin-primary);
          }

          /* ---------------- Chat Area Styling ---------------- */
          .chat-area-container {
            background: #fff;
            border-radius: 12px;
            border: 1px solid var(--mern-admin-border);
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .chat-header-area {
            padding: 18px 24px;
            border-bottom: 1px solid var(--mern-admin-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fff;
          }

          .chat-messages-area {
            flex: 1;
            background: var(--mern-admin-bg);
            padding: 24px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .msg-bubble {
            max-width: 75%;
            padding: 14px 18px;
            border-radius: 14px;
            font-size: 14px;
            line-height: 1.5;
            position: relative;
            word-wrap: break-word;
            white-space: pre-wrap;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }

          .msg-bubble.user {
            background: #fff;
            color: var(--mern-admin-text-main);
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            border: 1px solid var(--mern-admin-border);
          }

          .msg-bubble.admin {
            background: var(--mern-admin-primary);
            color: #fff;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
          }

          .msg-time {
            font-size: 11px;
            margin-top: 6px;
            display: block;
            opacity: 0.7;
          }

          .chat-input-area {
            padding: 20px 24px;
            background: #fff;
            border-top: 1px solid var(--mern-admin-border);
            display: flex;
            gap: 12px;
            align-items: center;
          }

          .chat-input {
            flex: 1;
            padding: 14px 20px;
            border: 1px solid #cbd5e1;
            border-radius: 50px;
            font-size: 14px;
            outline: none;
            transition: all 0.2s;
            background: var(--mern-admin-bg);
            color: var(--mern-admin-text-main);
          }

          .chat-input:focus {
            border-color: var(--mern-admin-primary);
            background: #fff;
          }

          .send-btn {
            background: var(--mern-admin-primary);
            color: white;
            border: none;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 0.2s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            flex-shrink: 0;
          }

          .send-btn:hover:not(:disabled) {
            transform: scale(1.05);
            opacity: 0.9;
          }

          .send-btn:disabled {
            background: #cbd5e1;
            cursor: not-allowed;
            box-shadow: none;
          }

          .mobile-back-btn {
            display: none;
            background: var(--mern-admin-bg);
            border: none;
            color: var(--mern-admin-text-main);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            margin-right: 12px;
          }

          @media (max-width: 768px) {
            .admin-page-wrapper { padding: 10px; height: calc(100vh - 60px); }
            
            .admin-header-card { 
              flex-direction: column; 
              align-items: stretch; 
              gap: 15px; 
              padding: 15px;
            }
            .admin-search-box { width: 100%; }

            .admin-chat-grid {
              display: flex;
              flex-direction: column;
            }

            .ticket-list-container {
              display: var(--show-list, flex);
              height: 100%;
            }

            .chat-area-container {
              display: var(--show-chat, none);
              height: 100%;
            }

            .mobile-back-btn {
              display: flex;
            }
            
            .chat-header-area { padding: 15px; }
            .chat-input-area { padding: 15px; }
          }
        `}
      </style>

      <div
        className="admin-page-wrapper"
        style={{
          "--show-list": selectedTicket ? "none" : "flex",
          "--show-chat": selectedTicket ? "flex" : "none",
        }}
      >
        <ToastContainer position="top-right" autoClose={2000} />

        <div className="admin-header-card">
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "800",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: "var(--mern-admin-primary)",
                color: "#fff",
                padding: "10px",
                borderRadius: "10px",
                display: "flex",
              }}
            >
              <FiMessageSquare size={20} />
            </div>
            Support Desk
          </h2>
          <div className="admin-search-box">
            <FiSearch color="#94a3b8" />
            <input
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                width: "100%",
                marginLeft: "10px",
                fontSize: "14px",
                color: "var(--mern-admin-text-main)",
              }}
              placeholder="Search Tickets, Users, Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-chat-grid">
          <div className="ticket-list-container">
            <div className="ticket-list-header">
              <span>Active Tickets</span>
              <span
                style={{
                  background: "var(--mern-admin-primary)",
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontSize: "12px",
                }}
              >
                {filtered.length}
              </span>
            </div>

            <div className="ticket-list-body custom-scroll">
              {filtered.length === 0 ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                >
                  <FiMessageSquare
                    size={40}
                    style={{ opacity: 0.3, marginBottom: "15px" }}
                  />
                  <p>No tickets found.</p>
                </div>
              ) : (
                filtered.map((ticket) => (
                  <div
                    key={ticket._id}
                    className={`ticket-item ${
                      selectedTicket?.ticketId === ticket.ticketId
                        ? "active"
                        : ""
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "800",
                          color: "var(--mern-admin-text-main)",
                          fontSize: "14px",
                        }}
                      >
                        {ticket.ticketId}
                      </span>
                      {getStatusBadge(ticket.status)}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      <FiUser size={14} />
                      <span
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {ticket.user?.name ||
                          ticket.user?.email ||
                          "Unknown User"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "4px",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--mern-admin-primary)",
                          fontSize: "12px",
                          fontWeight: "700",
                          background: "var(--mern-admin-bg)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {ticket.category}
                      </span>

                      <span
                        style={{
                          fontSize: "11px",
                          color: "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FiClock size={10} />
                        {new Date(ticket.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="chat-area-container">
            {selectedTicket ? (
              <>
                <div className="chat-header-area">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <button
                      className="mobile-back-btn"
                      onClick={() => setSelectedTicket(null)}
                    >
                      <FiArrowLeft size={18} />
                    </button>
                    <div>
                      <h3
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "18px",
                          fontWeight: "800",
                          color: "var(--mern-admin-text-main)",
                        }}
                      >
                        {selectedTicket.ticketId}
                      </h3>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#64748b",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontWeight: "600" }}>
                          {selectedTicket.user?.name}
                        </span>
                        <span>•</span>
                        <span>{selectedTicket.user?.email}</span>
                      </div>
                    </div>
                  </div>

                  {selectedTicket.status === "Open" ? (
                    <button
                      onClick={handleEndChat}
                      style={{
                        background: "#fef2f2",
                        color: "var(--mern-admin-danger, #ef4444)",
                        border: "1px solid #fecaca",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "var(--mern-admin-danger, #ef4444)";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fef2f2";
                        e.currentTarget.style.color =
                          "var(--mern-admin-danger, #ef4444)";
                      }}
                    >
                      Close Ticket
                    </button>
                  ) : (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#64748b",
                        fontWeight: "700",
                        fontSize: "14px",
                      }}
                    >
                      <FiCheckCircle /> Closed
                    </span>
                  )}
                </div>

                <div className="chat-messages-area custom-scroll">
                  {selectedTicket.messages.map((msg, idx) => {
                    const isAdmin = msg.sender === "Admin";
                    return (
                      <div
                        key={idx}
                        className={`msg-bubble ${isAdmin ? "admin" : "user"}`}
                      >
                        <div
                          style={{
                            fontWeight: "700",
                            fontSize: "11px",
                            marginBottom: "4px",
                            opacity: isAdmin ? 0.9 : 0.6,
                          }}
                        >
                          {isAdmin
                            ? "Support Agent"
                            : selectedTicket.user?.name || "User"}
                        </div>
                        {msg.text}
                        <span
                          className="msg-time"
                          style={{ textAlign: isAdmin ? "right" : "left" }}
                        >
                          {new Date(
                            msg.createdAt || Date.now()
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder={
                      selectedTicket.status === "Closed"
                        ? "This ticket is closed."
                        : "Type your reply to the user..."
                    }
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={selectedTicket.status === "Closed"}
                    onKeyPress={(e) => e.key === "Enter" && handleAdminReply()}
                  />
                  <button
                    className="send-btn"
                    onClick={handleAdminReply}
                    disabled={
                      selectedTicket.status === "Closed" || !replyText.trim()
                    }
                  >
                    <FiSend
                      size={20}
                      style={{ marginLeft: "-2px", marginTop: "2px" }}
                    />
                  </button>
                </div>
              </>
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--mern-admin-bg)",
                  color: "#94a3b8",
                }}
              >
                <FiMessageSquare
                  size={60}
                  style={{ opacity: 0.2, marginBottom: "20px" }}
                />
                <h3
                  style={{
                    margin: 0,
                    color: "var(--mern-admin-text-main)",
                    fontWeight: "700",
                  }}
                >
                  No Ticket Selected
                </h3>
                <p style={{ marginTop: "8px" }}>
                  Select a ticket from the list to view or reply.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateChat;
