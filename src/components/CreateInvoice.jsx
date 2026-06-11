import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaFileDownload, FaFilter } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateInvoice = () => {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // Advanced Filters
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });

  const loadOrders = async () => {
    try {
      const res = await axios.get(
        "https://nbackend-31lg.onrender.com/api/orders/admin/all",
        {
          withCredentials: true,
        }
      );
      setOrders(res.data.orders || []);
      setFiltered(res.data.orders || []);
    } catch (err) {
      toast.error("Failed to load orders/invoices");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter Logic (Runs whenever search, date, price, or orders change)
  useEffect(() => {
    let result = orders;

    // 1. Search Filter (ID, Name, Email)
    if (search) {
      const lowerQ = search.toLowerCase();
      result = result.filter((o) => {
        const idMatch = o.orderNumber?.toLowerCase().includes(lowerQ);
        const nameMatch =
          o.shippingAddress?.firstName?.toLowerCase().includes(lowerQ) ||
          o.shippingAddress?.lastName?.toLowerCase().includes(lowerQ);
        const emailMatch = o.shippingAddress?.email
          ?.toLowerCase()
          .includes(lowerQ);
        return idMatch || nameMatch || emailMatch;
      });
    }

    // 2. Date Filter
    if (dateFilter.start) {
      const startDate = new Date(dateFilter.start);
      startDate.setHours(0, 0, 0, 0);
      result = result.filter((o) => new Date(o.createdAt) >= startDate);
    }
    if (dateFilter.end) {
      const endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter((o) => new Date(o.createdAt) <= endDate);
    }

    // 3. Price Filter
    if (priceFilter.min) {
      result = result.filter((o) => o.totalPrice >= Number(priceFilter.min));
    }
    if (priceFilter.max) {
      result = result.filter((o) => o.totalPrice <= Number(priceFilter.max));
    }

    setFiltered(result);
  }, [search, dateFilter, priceFilter, orders]);

  const handleDownloadInvoice = async (orderId, orderNumber) => {
    try {
      setDownloadingId(orderId);

      const response = await axios.get(
        `https://nbackend-31lg.onrender.com/api/orders/${orderId}/invoice`,
        {
          withCredentials: true,
          responseType: "blob", // Important for receiving binary PDF data
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const invoiceNumber = orderNumber
        ? orderNumber.replace("#SW", "INV")
        : `INV-${orderId.substring(0, 8)}`;
      link.setAttribute("download", `${invoiceNumber}.pdf`);

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download invoice");
      console.error(error);
    } finally {
      setDownloadingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDateFilter({ start: "", end: "" });
    setPriceFilter({ min: "", max: "" });
  };

  // Styles matching your ViewProducts component + root variables
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
      flexWrap: "wrap",
      gap: "15px",
    },
    title: { fontSize: "24px", fontWeight: "700", margin: 0 },
    filterBar: {
      display: "flex",
      gap: "15px",
      flexWrap: "wrap",
      alignItems: "center",
      background: "#fff",
      padding: "15px",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      marginBottom: "20px",
    },
    input: {
      padding: "8px 15px",
      borderRadius: "6px",
      border: "1px solid var(--mern-admin-border)",
      outline: "none",
      fontSize: "13px",
    },
    downloadBtn: {
      background: "var(--mern-admin-primary)",
      color: "var(--mern-admin-text-white)",
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      display: "inline-flex",
      gap: "8px",
      alignItems: "center",
      transition: "0.2s",
      fontSize: "13px",
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
      verticalAlign: "middle",
      fontSize: "14px",
    },
    productTitle: {
      fontWeight: "700",
      color: "var(--mern-admin-primary)",
      margin: "0 0 5px 0",
      fontSize: "15px",
    },
    badge: (status) => {
      let bg = "#f1f5f9";
      let col = "#475569";
      if (status === "Delivered") {
        bg = "#d1fae5";
        col = "#065f46";
      }
      if (status === "Cancelled") {
        bg = "#fee2e2";
        col = "var(--mern-admin-danger)";
      }
      return {
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600",
        background: bg,
        color: col,
        display: "inline-block",
      };
    },
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .responsive-wrapper { padding: 10px !important; }
            
            .responsive-header {
              flex-direction: column !important;
              align-items: flex-start !important;
            }
            
            .responsive-filter-bar {
              flex-direction: column !important;
              align-items: stretch !important;
            }
            .responsive-filter-bar input { width: 100% !important; }
            .filter-group { display: flex; gap: 10px; width: 100%; }
            .filter-group input { flex: 1; }

            /* Convert Table to Cards */
            .responsive-table, .responsive-table tbody, .responsive-table tr, .responsive-table td {
              display: block !important;
              width: 100% !important;
            }
            .responsive-table thead { display: none !important; }
            .responsive-table tr {
              margin-bottom: 15px !important;
              border: 1px solid #e2e8f0 !important;
              border-radius: 8px !important;
              padding: 15px !important;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
            }
            .responsive-table td {
              border: none !important;
              padding: 8px 0 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              text-align: right !important;
              border-bottom: 1px dashed #f1f5f9 !important;
            }
            .responsive-table td:last-child { border-bottom: none !important; }
            
            /* Insert column labels via CSS before the data */
            .responsive-table td::before {
              content: attr(data-label);
              font-weight: 700 !important;
              color: #64748b !important;
              text-transform: uppercase !important;
              font-size: 11px !important;
              margin-right: 15px !important;
            }
            
            .responsive-download-btn {
              width: 100% !important;
              justify-content: center !important;
              margin-top: 10px;
            }
          }
        `}
      </style>

      <div style={s.wrapper} className="responsive-wrapper">
        <ToastContainer position="top-right" autoClose={2000} />

        <div style={s.header} className="responsive-header">
          <h2 style={s.title}>Invoices & Billing</h2>
        </div>

        {/* --- FILTER BAR --- */}
        <div style={s.filterBar} className="responsive-filter-bar">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#f8fafc",
              padding: "8px 15px",
              borderRadius: "6px",
              border: "1px solid var(--mern-admin-border)",
              flex: 1,
              minWidth: "250px",
            }}
          >
            <FaSearch color="#94a3b8" style={{ marginRight: "10px" }} />
            <input
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                width: "100%",
                fontSize: "13px",
              }}
              placeholder="Search ID, Name, Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <input
              type="date"
              style={s.input}
              title="Start Date"
              value={dateFilter.start}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, start: e.target.value })
              }
            />
            <input
              type="date"
              style={s.input}
              title="End Date"
              value={dateFilter.end}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, end: e.target.value })
              }
            />
          </div>

          <div className="filter-group">
            <input
              type="number"
              style={s.input}
              placeholder="Min Price (₹)"
              value={priceFilter.min}
              onChange={(e) =>
                setPriceFilter({ ...priceFilter, min: e.target.value })
              }
            />
            <input
              type="number"
              style={s.input}
              placeholder="Max Price (₹)"
              value={priceFilter.max}
              onChange={(e) =>
                setPriceFilter({ ...priceFilter, max: e.target.value })
              }
            />
          </div>

          <button
            onClick={clearFilters}
            style={{
              ...s.input,
              background: "#f8fafc",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <FaFilter color="#64748b" /> Clear
          </button>
        </div>

        {/* --- INVOICES TABLE --- */}
        <table style={s.table} className="responsive-table">
          <thead>
            <tr>
              <th style={s.th}>Invoice ID</th>
              <th style={s.th}>Customer</th>
              <th style={s.th}>Date</th>
              <th style={s.th}>Amount</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#64748b",
                  }}
                >
                  No invoices found matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map((order) => {
                const isHovered = hoveredRow === order._id;
                const invoiceNum = order.orderNumber
                  ? order.orderNumber.replace("#SW", "INV")
                  : "N/A";

                return (
                  <tr
                    key={order._id}
                    onMouseEnter={() => setHoveredRow(order._id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      background: isHovered ? "#f8fafc" : "#fff",
                      transition: "0.2s",
                    }}
                  >
                    <td style={s.td} data-label="Invoice ID">
                      <p style={s.productTitle}>{invoiceNum}</p>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Order: {order.orderNumber}
                      </span>
                    </td>
                    <td style={s.td} data-label="Customer">
                      <div
                        style={{
                          fontWeight: "600",
                          color: "var(--mern-admin-text-main)",
                        }}
                      >
                        {order.shippingAddress?.firstName}{" "}
                        {order.shippingAddress?.lastName}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {order.shippingAddress?.email}
                      </div>
                    </td>
                    <td style={s.td} data-label="Date">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={s.td} data-label="Amount">
                      <strong style={{ color: "var(--mern-admin-primary)" }}>
                        ₹{order.totalPrice?.toFixed(2)}
                      </strong>
                    </td>
                    <td style={s.td} data-label="Status">
                      <span style={s.badge(order.orderStatus)}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td style={s.td} data-label="Action">
                      <button
                        style={{
                          ...s.downloadBtn,
                          opacity: downloadingId === order._id ? 0.7 : 1,
                        }}
                        className="responsive-download-btn"
                        onClick={() =>
                          handleDownloadInvoice(order._id, order.orderNumber)
                        }
                        disabled={downloadingId === order._id}
                      >
                        <FaFileDownload />
                        {downloadingId === order._id
                          ? "Processing..."
                          : "Download PDF"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CreateInvoice;
