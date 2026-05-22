import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTrash,
  FaEnvelopeOpenText,
  FaUser,
  FaPhone,
  FaCalendarAlt,
  FaSearch,
  FaInbox,
  FaFilter,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const CreateContact = () => {
  const { auth } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const permissions = auth?.user?.role?.permissions?.contact;

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        "https://demo-backend-k0yn.onrender.com/api/contact/all",
        {
          withCredentials: true,
        }
      );
      setMessages(res.data);
    } catch (err) {
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Move this inquiry to trash?")) return;
    try {
      await axios.delete(
        `https://demo-backend-k0yn.onrender.com/api/contact/${id}`,
        {
          withCredentials: true,
        }
      );
      toast.success("Inquiry Deleted");
      setMessages(messages.filter((msg) => msg._id !== id));
    } catch (err) {
      toast.error("Action unauthorized");
    }
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="contact-premium-wrapper">
      <style>{`
        .contact-premium-wrapper { font-family: 'Inter', sans-serif; animation: fadeIn 0.5s ease; }
        
        /* Header & Search Bar */
        .page-action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; gap: 20px; flex-wrap: wrap; }
        .search-container { position: relative; flex: 1; max-width: 400px; }
        .search-input { width: 100%; padding: 12px 15px 12px 45px; border-radius: 12px; border: 1px solid var(--mern-admin-border); background: #fff; outline: none; transition: 0.3s; }
        .search-input:focus { border-color: var(--mern-admin-primary); box-shadow: 0 0 0 4px rgba(181, 23, 224, 0.1); }
        .search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; }

        /* Desktop Table View */
        .table-container-glass { background: #fff; border-radius: 20px; border: 1px solid var(--mern-admin-border); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        .pro-table { width: 100%; border-collapse: collapse; }
        .pro-table thead { background: #f8fafc; }
        .pro-table th { padding: 18px 20px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; border-bottom: 1px solid var(--mern-admin-border); }
        .pro-table tr { transition: 0.2s; }
        .pro-table tr:hover { background-color: #fdfaff; }
        .pro-table td { padding: 18px 20px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

        /* Sender UI */
        .sender-box { display: flex; align-items: center; gap: 12px; }
        .avatar-circle { width: 40px; height: 40px; border-radius: 10px; background: var(--mern-admin-bg); color: var(--mern-admin-primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
        .sender-details { display: flex; flex-direction: column; }
        .sender-name { font-weight: 600; color: var(--mern-admin-text-main); font-size: 14px; }
        .sender-email { font-size: 12px; color: #64748b; }

        /* Message Bubble */
        .message-preview { font-size: 13px; color: #475569; line-height: 1.6; max-width: 350px; background: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid #f1f5f9; }

        /* Delete Button */
        .delete-btn-pro { width: 35px; height: 35px; border-radius: 8px; border: none; background: #fff1f2; color: var(--mern-admin-danger); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
        .delete-btn-pro:hover { background: var(--mern-admin-danger); color: #fff; transform: scale(1.1); }

        /* Mobile Layout - Cards */
        @media (max-width: 992px) {
          .table-container-glass { background: transparent; border: none; box-shadow: none; }
          .pro-table thead { display: none; }
          .pro-table, .pro-table tbody, .pro-table tr, .pro-table td { display: block; width: 100%; }
          .pro-table tr { background: #fff; border: 1px solid var(--mern-admin-border); border-radius: 16px; margin-bottom: 15px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
          .pro-table td { border: none; padding: 8px 0; display: flex; justify-content: space-between; align-items: flex-start; text-align: right; }
          .pro-table td::before { content: attr(data-label); font-weight: 700; font-size: 10px; text-transform: uppercase; color: #94a3b8; }
          .message-preview { max-width: 100%; text-align: left; margin-top: 5px; width: 100%; }
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header Info */}
      <div className="page-action-bar">
        <div>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "800",
              color: "var(--mern-admin-text-main)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: 0,
            }}
          >
            <FaInbox color="var(--mern-admin-primary)" /> Message Center
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "5px 0 0" }}>
            Manage customer inquiries and feedback
          </p>
        </div>

        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search name, email or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "100px",
            color: "var(--mern-admin-primary)",
          }}
        >
          <div className="spinner-border" role="status"></div>
          <p style={{ marginTop: "15px", fontWeight: "600" }}>
            Fetching Inquiries...
          </p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px",
            background: "#fff",
            borderRadius: "20px",
            border: "1px dashed #cbd5e1",
          }}
        >
          <FaEnvelopeOpenText size={50} color="#e2e8f0" />
          <p style={{ marginTop: "15px", color: "#94a3b8", fontWeight: "500" }}>
            No messages found matching your search.
          </p>
        </div>
      ) : (
        <div className="table-container-glass">
          <table className="pro-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Subject & Date</th>
                <th>Content</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((msg) => (
                <tr key={msg._id}>
                  <td data-label="Sender">
                    <div className="sender-box">
                      <div className="avatar-circle">
                        {msg.fullName.charAt(0)}
                      </div>
                      <div className="sender-details">
                        <span className="sender-name">{msg.fullName}</span>
                        <span className="sender-email">{msg.email}</span>
                        <span
                          style={{
                            fontSize: "10px",
                            color: "#94a3b8",
                            marginTop: "2px",
                          }}
                        >
                          <FaPhone size={8} /> {msg.phone}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td data-label="Subject & Date">
                    <div
                      style={{
                        fontWeight: "600",
                        color: "var(--mern-admin-primary)",
                        fontSize: "13px",
                      }}
                    >
                      {msg.subject}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        marginTop: "5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <FaCalendarAlt size={10} />{" "}
                      {new Date(msg.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td data-label="Content">
                    <div className="message-preview">{msg.message}</div>
                  </td>
                  <td data-label="Actions" style={{ textAlign: "right" }}>
                    <div
                      style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      {permissions?.delete ? (
                        <button
                          className="delete-btn-pro"
                          onClick={() => handleDelete(msg._id)}
                          title="Delete Message"
                        >
                          <FaTrash size={14} />
                        </button>
                      ) : (
                        <span style={{ fontSize: "10px", color: "#cbd5e1" }}>
                          View Only
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CreateContact;
