import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaBoxOpen,
  FaSearch,
  FaEye,
  FaTimes,
  FaMapMarkerAlt,
  FaCreditCard,
  FaReceipt,
  FaShoppingBag,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://localhost:5000";

const CreateOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);

  // State for the "View Details" Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/orders/admin/all`, {
        withCredentials: true,
      });
      setOrders(res.data.orders || []);
      setFiltered(res.data.orders || []);
    } catch (err) {
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (search) {
      const lowerQ = search.toLowerCase();
      setFiltered(
        orders.filter((o) => {
          const orderIdMatch = o.orderNumber?.toLowerCase().includes(lowerQ);
          const nameMatch =
            o.shippingAddress?.firstName?.toLowerCase().includes(lowerQ) ||
            o.shippingAddress?.lastName?.toLowerCase().includes(lowerQ);
          const emailMatch = o.shippingAddress?.email
            ?.toLowerCase()
            .includes(lowerQ);
          return orderIdMatch || nameMatch || emailMatch;
        }),
      );
    } else {
      setFiltered(orders);
    }
  }, [search, orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_BASE}/api/orders/admin/${orderId}/status`,
        { status: newStatus },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );
      toast.success(`Order marked as ${newStatus}`);
      loadOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err) {
      toast.error("Failed to update order status");
    }
  };

  const getStatusStyle = (status) => {
    let bg = "#f8fafc";
    let color = "#475569";
    let border = "#cbd5e1";

    switch (status) {
      case "Pending":
        bg = "#f8fafc";
        color = "#475569";
        border = "#cbd5e1";
        break;
      case "Approved":
        bg = "#eff6ff";
        color = "#2563eb";
        border = "#bfdbfe";
        break;
      case "Shipped":
      case "Out for Delivery":
        bg = "#f0fdfa";
        color = "#0d9488";
        border = "#ccfbf1";
        break;
      case "Delivered":
        bg = "#f0fdf4";
        color = "#16a34a";
        border = "#bbf7d0";
        break;
      case "Cancelled":
        bg = "#fef2f2";
        color = "#e11d48";
        border = "#fecaca";
        break;
      default:
        break;
    }

    return {
      padding: "6px 14px",
      borderRadius: "50px",
      fontSize: "12px",
      fontWeight: "700",
      cursor: "pointer",
      background: bg,
      color: color,
      border: `1px solid ${border}`,
      outline: "none",
      width: "100%",
      maxWidth: "150px",
    };
  };

  const getImgUrl = (path) => {
    if (!path) return "https://via.placeholder.com/50";
    return path.startsWith("http") ? path : `${API_BASE}${path}`;
  };

  return (
    <>
      <style>
        {`
          /* Custom Scrollbar for Modal */
          .custom-scroll::-webkit-scrollbar { width: 6px; }
          .custom-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
          .custom-scroll::-webkit-scrollbar-thumb { background: var(--mern-admin-primary); border-radius: 10px; }

          .break-text {
            word-break: break-word;
            overflow-wrap: break-word;
            white-space: pre-wrap;
          }

          /* Default Desktop Layout */
          .admin-page-wrapper {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Inter', sans-serif;
            color: var(--mern-admin-text-main);
          }

          .admin-header-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fff;
            padding: 20px 25px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            margin-bottom: 25px;
          }

          .admin-search-box {
            display: flex;
            align-items: center;
            background: #f8fafc;
            border: 1px solid var(--mern-admin-border);
            border-radius: 8px;
            padding: 10px 16px;
            width: 350px;
            transition: all 0.2s;
          }
          
          .admin-search-box:focus-within {
            border-color: var(--mern-admin-primary);
            box-shadow: 0 0 0 3px rgba(181, 23, 224, 0.1);
          }

          .admin-table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            border-radius: 12px;
            overflow: hidden;
          }

          .admin-table th {
            text-align: left;
            padding: 18px 24px;
            background: #f8fafc;
            border-bottom: 1px solid var(--mern-admin-border);
            color: #64748b;
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .admin-table td {
            padding: 18px 24px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
            font-size: 14px;
          }

          /* Ensure flex column alignment in table cells */
          .col-stack {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          /* Modal Body Adjustments */
          .modal-body-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          /* ==============================================================
             STRICT MOBILE RESPONSIVENESS
             ============================================================== */
          @media (max-width: 768px) {
            .admin-page-wrapper { padding: 10px !important; }
            
            .admin-header-card { 
              flex-direction: column; 
              align-items: stretch !important; 
              gap: 15px; 
              padding: 15px;
            }
            .admin-search-box { width: 100% !important; }

            /* Table to Card View for Mobile */
            .admin-table, .admin-table tbody, .admin-table tr, .admin-table td {
              display: block !important; width: 100% !important;
            }
            .admin-table thead { display: none !important; }
            
            .admin-table tr {
              margin-bottom: 16px !important;
              border: 1px solid var(--mern-admin-border) !important;
              border-radius: 12px !important;
              padding: 15px !important;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05) !important;
              background: #fff !important;
            }

            .admin-table td {
              border: none !important;
              padding: 12px 0 !important;
              display: flex !important;
              flex-direction: row !important;
              align-items: center !important;
              justify-content: space-between !important;
              border-bottom: 1px dashed #f1f5f9 !important;
            }
            
            .admin-table td:last-child {
              border-bottom: none !important;
              padding-bottom: 0 !important;
            }
            .admin-table td:first-child {
              padding-top: 0 !important;
            }

            .admin-table td::before {
              content: attr(data-label);
              font-weight: 700 !important;
              color: #64748b !important;
              text-transform: uppercase !important;
              font-size: 11px !important;
              letter-spacing: 0.5px !important;
              margin-right: 15px !important;
              flex-shrink: 0 !important;
            }

            /* Align content to right on mobile cards */
            .col-stack { 
              align-items: flex-end !important; 
              text-align: right !important; 
            }
            
            .item-cluster-wrapper {
               justify-content: flex-end !important;
            }

            /* Modal Mobile Fixes */
            .modal-content-wrapper {
              padding: 20px !important;
            }
            .modal-header-top {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 15px;
            }
            .modal-close-btn {
              position: absolute;
              top: 15px;
              right: 15px;
            }
            .modal-body-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      <div className="admin-page-wrapper">
        <ToastContainer position="top-right" autoClose={2000} />

        {/* HEADER SECTION */}
        <div className="admin-header-card">
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "800",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "var(--mern-admin-text-main)",
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
              <FaBoxOpen size={20} />
            </div>
            Manage Orders
          </h2>
          <div className="admin-search-box">
            <FaSearch color="#94a3b8" />
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
              placeholder="Search Order ID, Customer, Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* DESKTOP TABLE / MOBILE CARDS */}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const isHovered = hoveredRow === order._id;

              return (
                <tr
                  key={order._id}
                  onMouseEnter={() => setHoveredRow(order._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    background: isHovered ? "#f8fafc" : "#fff",
                    transition: "all 0.2s ease",
                  }}
                >
                  <td data-label="Order ID">
                    <div
                      className="col-stack"
                      style={{ alignItems: "flex-start", textAlign: "left" }}
                    >
                      <span
                        style={{
                          fontWeight: "800",
                          color: "var(--mern-admin-primary)",
                          fontSize: "14px",
                        }}
                      >
                        {order.orderNumber}
                      </span>
                      <span style={{ color: "#64748b", fontSize: "12px" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </td>

                  <td data-label="Customer">
                    <div
                      className="col-stack"
                      style={{ alignItems: "flex-start", textAlign: "left" }}
                    >
                      <span
                        style={{
                          fontWeight: "700",
                          color: "var(--mern-admin-text-main)",
                          fontSize: "14px",
                          textTransform: "capitalize",
                        }}
                      >
                        {order.shippingAddress?.firstName}{" "}
                        {order.shippingAddress?.lastName}
                      </span>
                      <span style={{ color: "#64748b", fontSize: "12px" }}>
                        {order.shippingAddress?.email}
                      </span>
                    </div>
                  </td>

                  <td data-label="Items">
                    <div
                      className="col-stack"
                      style={{ alignItems: "flex-start", textAlign: "left" }}
                    >
                      <div
                        className="item-cluster-wrapper"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          paddingLeft: "10px",
                        }}
                      >
                        {order.orderItems?.slice(0, 3).map((item, idx) => (
                          <img
                            key={idx}
                            src={getImgUrl(item.image)}
                            alt="item"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "2px solid #fff",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                              marginLeft: idx === 0 ? "0" : "-12px",
                              zIndex: 10 - idx,
                            }}
                            title={item.title}
                          />
                        ))}
                        {order.orderItems?.length > 3 && (
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              border: "2px solid #fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#e2e8f0",
                              color: "#475569",
                              fontSize: "11px",
                              fontWeight: "bold",
                              marginLeft: "-12px",
                              zIndex: 0,
                            }}
                          >
                            +{order.orderItems.length - 3}
                          </div>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          fontWeight: "600",
                          marginTop: "4px",
                        }}
                      >
                        {order.orderItems?.length} Product(s)
                      </span>
                    </div>
                  </td>

                  <td data-label="Amount">
                    <div
                      className="col-stack"
                      style={{ alignItems: "flex-start", textAlign: "left" }}
                    >
                      <span
                        style={{
                          fontWeight: "800",
                          color: "var(--mern-admin-text-main)",
                          fontSize: "15px",
                        }}
                      >
                        ₹{order.totalPrice?.toFixed(2)}
                      </span>
                      <span
                        style={{
                          background: "#e2e8f0",
                          color: "#475569",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: "800",
                          textTransform: "uppercase",
                        }}
                      >
                        {order.paymentInfo?.method}
                      </span>
                    </div>
                  </td>

                  <td data-label="Status">
                    <div
                      className="col-stack"
                      style={{ alignItems: "flex-start", textAlign: "left" }}
                    >
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        style={getStatusStyle(order.orderStatus)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">
                          Out for Delivery
                        </option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>

                  <td data-label="Action">
                    <div
                      className="col-stack"
                      style={{ alignItems: "flex-end", textAlign: "right" }}
                    >
                      <button
                        style={{
                          background: "var(--mern-admin-primary)",
                          color: "#fff",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "opacity 0.2s",
                          opacity:
                            isHovered || window.innerWidth <= 768 ? 1 : 0.8,
                        }}
                        onClick={() => setSelectedOrder(order)}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = 1)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = 0.8)
                        }
                      >
                        <FaEye /> View
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    padding: "60px",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: "15px",
                    background: "#f8fafc",
                  }}
                >
                  <FaBoxOpen
                    size={40}
                    style={{ marginBottom: "15px", opacity: 0.5 }}
                  />
                  <br />
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===================== PREMIUM VIEW DETAILS MODAL ===================== */}
      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "900px",
              maxHeight: "90vh",
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Modal Header */}
            <div
              className="modal-header-top"
              style={{
                padding: "24px 30px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fff",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "22px",
                      color: "var(--mern-admin-text-main)",
                      fontWeight: "800",
                    }}
                  >
                    Order {selectedOrder.orderNumber}
                  </h3>
                  <span
                    style={{
                      ...getStatusStyle(selectedOrder.orderStatus),
                      padding: "4px 12px",
                      fontSize: "11px",
                      pointerEvents: "none",
                      margin: 0,
                    }}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <span
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  Placed on{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString("en-US", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </span>
              </div>

              <button
                className="modal-close-btn"
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#475569",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e2e8f0";
                  e.currentTarget.style.color = "#0f172a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f1f5f9";
                  e.currentTarget.style.color = "#475569";
                }}
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div
              className="custom-scroll modal-content-wrapper"
              style={{
                padding: "30px",
                overflowY: "auto",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "30px",
                background: "#f8fafc",
              }}
            >
              {/* Addresses Grid */}
              <div className="modal-body-grid">
                {/* Shipping Card */}
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "15px",
                      color: "var(--mern-admin-text-main)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: "800",
                    }}
                  >
                    <div
                      style={{
                        padding: "6px",
                        background: "#f1f5f9",
                        borderRadius: "6px",
                        color: "var(--mern-admin-primary)",
                      }}
                    >
                      <FaMapMarkerAlt />
                    </div>
                    Shipping Address
                  </h4>
                  <div
                    className="break-text"
                    style={{
                      fontSize: "14px",
                      color: "#475569",
                      lineHeight: "1.6",
                      textTransform: "capitalize",
                    }}
                  >
                    <strong
                      style={{
                        color: "var(--mern-admin-text-main)",
                        fontSize: "15px",
                      }}
                    >
                      {selectedOrder.shippingAddress?.firstName}{" "}
                      {selectedOrder.shippingAddress?.lastName}
                    </strong>
                    <br />
                    {selectedOrder.shippingAddress?.address1}
                    <br />
                    {selectedOrder.shippingAddress?.address2 && (
                      <>
                        {selectedOrder.shippingAddress?.address2}
                        <br />
                      </>
                    )}
                    {selectedOrder.shippingAddress?.city},{" "}
                    {selectedOrder.shippingAddress?.zip}
                    <br />
                    {selectedOrder.shippingAddress?.country}
                    <br />
                    <div
                      style={{
                        marginTop: "16px",
                        paddingTop: "16px",
                        borderTop: "1px dashed #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        textTransform: "none",
                      }}
                    >
                      <span>
                        <strong
                          style={{ color: "var(--mern-admin-text-main)" }}
                        >
                          Email:
                        </strong>{" "}
                        {selectedOrder.shippingAddress?.email}
                      </span>
                      <span>
                        <strong
                          style={{ color: "var(--mern-admin-text-main)" }}
                        >
                          Phone:
                        </strong>{" "}
                        {selectedOrder.shippingAddress?.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Billing Card */}
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "15px",
                      color: "var(--mern-admin-text-main)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: "800",
                    }}
                  >
                    <div
                      style={{
                        padding: "6px",
                        background: "#f1f5f9",
                        borderRadius: "6px",
                        color: "var(--mern-admin-primary)",
                      }}
                    >
                      <FaReceipt />
                    </div>
                    Billing Address
                  </h4>
                  {selectedOrder.billingAddress &&
                  selectedOrder.billingAddress.firstName ? (
                    <div
                      className="break-text"
                      style={{
                        fontSize: "14px",
                        color: "#475569",
                        lineHeight: "1.6",
                        textTransform: "capitalize",
                      }}
                    >
                      <strong
                        style={{
                          color: "var(--mern-admin-text-main)",
                          fontSize: "15px",
                        }}
                      >
                        {selectedOrder.billingAddress?.firstName}{" "}
                        {selectedOrder.billingAddress?.lastName}
                      </strong>
                      <br />
                      {selectedOrder.billingAddress?.address1}
                      <br />
                      {selectedOrder.billingAddress?.address2 && (
                        <>
                          {selectedOrder.billingAddress?.address2}
                          <br />
                        </>
                      )}
                      {selectedOrder.billingAddress?.city},{" "}
                      {selectedOrder.billingAddress?.zip}
                      <br />
                      {selectedOrder.billingAddress?.country}
                      <br />
                      <div
                        style={{
                          marginTop: "16px",
                          paddingTop: "16px",
                          borderTop: "1px dashed #e2e8f0",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          textTransform: "none",
                        }}
                      >
                        <span>
                          <strong
                            style={{ color: "var(--mern-admin-text-main)" }}
                          >
                            Email:
                          </strong>{" "}
                          {selectedOrder.billingAddress?.email}
                        </span>
                        <span>
                          <strong
                            style={{ color: "var(--mern-admin-text-main)" }}
                          >
                            Phone:
                          </strong>{" "}
                          {selectedOrder.billingAddress?.phone}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100px",
                        color: "#94a3b8",
                        fontSize: "14px",
                        fontWeight: "600",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px dashed #cbd5e1",
                      }}
                    >
                      Same as Shipping Address
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 20px 0",
                    fontSize: "16px",
                    color: "var(--mern-admin-text-main)",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaShoppingBag color="var(--mern-admin-primary)" /> Ordered
                  Items
                </h4>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {selectedOrder.orderItems?.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "16px 0",
                        gap: "20px",
                        borderBottom:
                          idx !== selectedOrder.orderItems.length - 1
                            ? "1px solid #f1f5f9"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          padding: "4px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "10px",
                        }}
                      >
                        <img
                          src={getImgUrl(item.image)}
                          alt={item.title}
                          style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "6px",
                            objectFit: "cover",
                            background: "#f8fafc",
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: "700",
                            color: "var(--mern-admin-text-main)",
                            fontSize: "15px",
                            marginBottom: "6px",
                          }}
                        >
                          {item.title}
                        </div>
                        <div
                          style={{
                            display: "inline-block",
                            background: "#f1f5f9",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            color: "#475569",
                            fontSize: "12px",
                            fontWeight: "700",
                          }}
                        >
                          Qty: {item.quantity}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#94a3b8",
                            fontWeight: "600",
                            marginBottom: "4px",
                          }}
                        >
                          ₹{item.price.toFixed(2)} each
                        </div>
                        <div
                          style={{
                            fontWeight: "800",
                            color: "var(--mern-admin-primary)",
                            fontSize: "16px",
                          }}
                        >
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Totals Summary */}
              <div className="modal-body-grid">
                {/* Payment Info */}
                <div
                  style={{
                    background: "#fff",
                    padding: "24px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "15px",
                      color: "var(--mern-admin-text-main)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: "800",
                    }}
                  >
                    <div
                      style={{
                        padding: "6px",
                        background: "#f1f5f9",
                        borderRadius: "6px",
                        color: "var(--mern-admin-primary)",
                      }}
                    >
                      <FaCreditCard />
                    </div>
                    Payment Info
                  </h4>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#475569",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px dashed #f1f5f9",
                        paddingBottom: "8px",
                      }}
                    >
                      <span>Method:</span>{" "}
                      <strong
                        style={{
                          color: "var(--mern-admin-text-main)",
                          textTransform: "uppercase",
                        }}
                      >
                        {selectedOrder.paymentInfo?.method}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px dashed #f1f5f9",
                        paddingBottom: "8px",
                      }}
                    >
                      <span>Status:</span>
                      <strong
                        style={{
                          color:
                            selectedOrder.paymentInfo?.status === "Completed"
                              ? "#16a34a"
                              : "#d97706",
                        }}
                      >
                        {selectedOrder.paymentInfo?.status}
                      </strong>
                    </div>
                    <div
                      className="break-text"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "20px",
                      }}
                    >
                      <span>Txn ID:</span>{" "}
                      <strong
                        style={{
                          fontSize: "13px",
                          color: "var(--mern-admin-text-main)",
                          textAlign: "right",
                        }}
                      >
                        {selectedOrder.paymentInfo?.transactionId || "N/A"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div
                  style={{
                    padding: "24px",
                    borderRadius: "12px",
                    border: "2px solid var(--mern-admin-primary)",
                    background: "#fff",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "15px",
                      color: "var(--mern-admin-primary)",
                      fontWeight: "800",
                    }}
                  >
                    Order Summary
                  </h4>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#475569",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Subtotal:</span>{" "}
                      <strong style={{ color: "var(--mern-admin-text-main)" }}>
                        ₹{selectedOrder.subtotal?.toFixed(2)}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Shipping:</span>{" "}
                      <strong style={{ color: "var(--mern-admin-text-main)" }}>
                        + ₹{selectedOrder.shippingPrice?.toFixed(2)}
                      </strong>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          color: "#16a34a",
                          background: "#f0fdf4",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          margin: "4px -10px",
                        }}
                      >
                        <span>
                          Discount{" "}
                          {selectedOrder.couponCodeApplied
                            ? `(${selectedOrder.couponCodeApplied})`
                            : ""}
                          :
                        </span>
                        <strong>
                          - ₹{selectedOrder.discountAmount?.toFixed(2)}
                        </strong>
                      </div>
                    )}
                    <div
                      style={{
                        borderTop: "2px dashed #e2e8f0",
                        margin: "8px 0",
                      }}
                    ></div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "800",
                          color: "var(--mern-admin-text-main)",
                        }}
                      >
                        Total Paid:
                      </span>
                      <span
                        style={{
                          fontSize: "24px",
                          color: "var(--mern-admin-primary)",
                          fontWeight: "900",
                        }}
                      >
                        ₹{selectedOrder.totalPrice?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateOrder;
