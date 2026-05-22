import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaTrash, FaStar } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);

  const loadReviews = async () => {
    try {
      // ⚠️ IMPORTANT: This backend route MUST exist and use .populate()
      // to get the user and product details, otherwise the table will be empty!
      const res = await axios.get(
        "http://localhost:5000/api/reviews/admin/all"
      );
      setReviews(res.data.reviews || []);
      setFiltered(res.data.reviews || []);
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    if (search) {
      const lowerQ = search.toLowerCase();
      setFiltered(
        reviews.filter((r) => {
          const productMatch = r.variant?.productId?.title
            ?.toLowerCase()
            .includes(lowerQ);
          const userMatch = r.user?.name?.toLowerCase().includes(lowerQ);
          const commentMatch = r.comment?.toLowerCase().includes(lowerQ);
          return productMatch || userMatch || commentMatch;
        })
      );
    } else {
      setFiltered(reviews);
    }
  }, [search, reviews]);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/reviews/${id}/status`, {
        status: newStatus,
      });
      toast.success(`Review ${newStatus} successfully`);
      loadReviews();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await axios.delete(`http://localhost:5000/api/reviews/${id}`);
        toast.success("Review deleted successfully");
        loadReviews();
      } catch (err) {
        toast.error("Failed to delete review");
      }
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} size={12} color={i < rating ? "#ffc107" : "#e2e8f0"} />
    ));
  };

  const s = {
    wrapper: {
      maxWidth: "1400px",
      margin: "0 auto",
      fontFamily: "'Inter', sans-serif",
      color: "var(--mern-admin-text-main)",
      background: "var(--mern-admin-bg)",
      padding: "20px",
      borderRadius: "8px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    title: { fontSize: "24px", fontWeight: "700", margin: 0 },
    search: {
      padding: "8px 15px",
      borderRadius: "6px",
      border: "1px solid var(--mern-admin-border)",
      width: "250px",
      outline: "none",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "#fff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      borderRadius: "8px",
      overflow: "hidden",
    },
    th: {
      textAlign: "left",
      padding: "15px",
      borderBottom: "2px solid var(--mern-admin-border)",
      color: "#64748b",
      fontWeight: "600",
      fontSize: "14px",
    },
    td: {
      padding: "15px",
      borderBottom: "1px solid var(--mern-admin-border)",
      verticalAlign: "top",
      fontSize: "14px",
    },
    imgBox: {
      width: "50px",
      height: "50px",
      borderRadius: "6px",
      objectFit: "cover",
      border: "1px solid var(--mern-admin-border)",
    },
    productTitle: {
      fontWeight: "700",
      color: "var(--mern-admin-primary)",
      margin: "0 0 5px 0",
      fontSize: "14px",
    },
    badge: (status) => ({
      padding: "4px 8px",
      borderRadius: "12px",
      fontSize: "11px",
      fontWeight: "700",
      textTransform: "uppercase",
      background:
        status === "Approved"
          ? "#d1fae5"
          : status === "Rejected"
          ? "#fee2e2"
          : "#fef3c7",
      color:
        status === "Approved"
          ? "#065f46"
          : status === "Rejected"
          ? "#991b1b"
          : "#b45309",
    }),
    btn: (color, bg) => ({
      background: bg,
      color: color,
      border: "none",
      padding: "6px 10px",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
    }),
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .responsive-wrapper { padding: 10px !important; }
            
            
            .responsive-search-container {
              width: 100% !important;
              flex-direction: column !important;
              gap: 10px !important;
            }
            .responsive-search-input { width: 100% !important; }
            
            .responsive-table, .responsive-table tbody, .responsive-table tr, .responsive-table td { display: block !important; width: 100% !important; }
            .responsive-table thead { display: none !important; }
            .responsive-table tr { margin-bottom: 15px !important; border: 1px solid var(--mern-admin-border) !important; border-radius: 8px !important; padding: 15px !important; box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important; }
            .responsive-table td { border: none !important; padding: 8px 0 !important; display: flex !important; flex-direction: column !important; align-items: flex-start !important; text-align: left !important; gap: 5px; }
            
            .responsive-table td::before { content: attr(data-label); font-weight: 700 !important; color: #64748b !important; text-transform: uppercase !important; font-size: 11px !important; margin-bottom: 4px !important; }
            .action-buttons { width: 100%; display: flex; gap: 10px; margin-top: 10px; }
            .action-buttons button { flex: 1; justify-content: center; }
          }
        `}
      </style>

      <div style={s.wrapper} className="responsive-wrapper">
        <ToastContainer position="top-right" autoClose={2000} />

        <div style={s.header} className="responsive-header">
          <h2 style={s.title}>Manage Reviews</h2>
          {/* Wrapped input to match ViewProducts structure */}
          <div
            style={{ display: "flex", gap: "15px" }}
            className="responsive-search-container"
          >
            <input
              style={s.search}
              className="responsive-search-input"
              placeholder="Search by product, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table style={s.table} className="responsive-table">
          <thead>
            <tr>
              <th style={s.th}>Product</th>
              <th style={s.th}>User & Rating</th>
              <th style={s.th}>Review</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((rev) => {
              const p = rev.variant?.productId || {};
              const v = rev.variant || {};
              const displayImg = v.images?.[0]
                ? `http://localhost:5000${v.images[0]}`
                : p.thumbnail
                ? `http://localhost:5000${p.thumbnail}`
                : "https://via.placeholder.com/50";
              const isHovered = hoveredRow === rev._id;

              return (
                <tr
                  key={rev._id}
                  onMouseEnter={() => setHoveredRow(rev._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    background: isHovered ? "var(--mern-admin-bg)" : "#fff",
                    transition: "0.2s",
                  }}
                >
                  <td style={s.td} data-label="Product">
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <img src={displayImg} style={s.imgBox} alt="product" />
                      <div>
                        <p style={s.productTitle}>
                          {p.title || "Unknown Product"}
                        </p>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          {v.attributes
                            ?.map((a) => `${a.name}: ${a.value}`)
                            .join(" | ")}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={s.td} data-label="User & Rating">
                    <div
                      style={{
                        fontWeight: "600",
                        color: "var(--mern-admin-text-main)",
                        marginBottom: "4px",
                      }}
                    >
                      {rev.user?.name || "Guest"}
                    </div>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {renderStars(rev.rating)}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#888",
                        marginTop: "4px",
                      }}
                    >
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  <td
                    data-label="Review"
                    style={{ ...s.td, maxWidth: "300px" }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#444",
                        lineHeight: "1.4",
                      }}
                    >
                      {rev.comment}
                    </p>
                  </td>

                  <td style={s.td} data-label="Status">
                    <span style={s.badge(rev.status || "Pending")}>
                      {rev.status || "Pending"}
                    </span>
                  </td>

                  <td style={s.td} data-label="Actions">
                    <div
                      className="action-buttons"
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {rev.status !== "Approved" && (
                        <button
                          style={s.btn("#065f46", "#d1fae5")}
                          onClick={() => updateStatus(rev._id, "Approved")}
                        >
                          <FaCheck /> Approve
                        </button>
                      )}
                      {rev.status !== "Rejected" && (
                        <button
                          style={s.btn("#991b1b", "#fee2e2")}
                          onClick={() => updateStatus(rev._id, "Rejected")}
                        >
                          <FaTimes /> Reject
                        </button>
                      )}
                      <button
                        style={s.btn("#fff", "var(--mern-admin-danger)")}
                        onClick={() => handleDelete(rev._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#888",
                  }}
                >
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ManageReviews;
