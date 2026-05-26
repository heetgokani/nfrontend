import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Added for redirection
import { useAuth } from "../context/AuthContext"; // Added for auth check
// ADDED FiDownload TO THIS IMPORT
import { FiStar, FiX, FiCheckCircle, FiDownload } from "react-icons/fi";

const API_URL = "http://localhost:5000";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // --- AUTH HOOKS ---
  const { auth } = useAuth();
  const navigate = useNavigate();

  // --- FORCE REDIRECT IF NOT LOGGED IN ---
  useEffect(() => {
    if (!auth) {
      navigate("/login");
    }
  }, [auth, navigate]);

  // Track reviewed items to prevent duplicate reviews in the same session
  const [reviewedItems, setReviewedItems] = useState(new Set());

  // --- REVIEW STATES ---
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewData, setReviewData] = useState({
    variantId: "",
    productName: "",
    rating: 0,
    comment: "",
  });

  // --- NEW: INVOICE STATE ---
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    // Only fetch if authenticated
    if (!auth) return;

    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/orders/myorders`, {
          withCredentials: true,
        });
        setOrders(data.orders);
      } catch (error) {
        toast.error("Failed to fetch order history");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [auth]);

  // --- NEW: INVOICE DOWNLOAD HANDLER ---
  const handleDownloadInvoice = async (orderId, orderNumber) => {
    try {
      setDownloadingId(orderId);

      const response = await axios.get(
        `${API_URL}/api/orders/${orderId}/invoice`,
        {
          withCredentials: true,
          responseType: "blob", // Important for binary PDF data
        },
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

  // --- REVIEW SUBMIT HANDLER ---
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewData.rating === 0)
      return toast.error("Please select a star rating");

    try {
      // Clean the ID by removing anything after a colon (e.g., stripping ":1")
      const cleanVariantId = reviewData.variantId.split(":")[0];

      const response = await axios.post(
        `${API_URL}/api/reviews/${cleanVariantId}`, // Use the cleaned ID here
        {
          rating: reviewData.rating,
          comment: reviewData.comment,
        },
        { withCredentials: true },
      );

      if (response.data.success) {
        toast.success("Review submitted for approval!");

        // Mark as reviewed to disable the button using the original ID
        setReviewedItems((prev) => new Set(prev).add(reviewData.variantId));

        setShowReviewModal(false);
        setReviewData({
          variantId: "",
          productName: "",
          rating: 0,
          comment: "",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting review");
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#f0ad4e";
      case "Approved":
        return "#17a2b8";
      case "Shipped":
        return "#007bff";
      case "Out for Delivery":
        return "#17a2b8";
      case "Delivered":
        return "#28a745";
      case "Cancelled":
        return "#de433f";
      default:
        return "#6c757d";
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/60?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  return (
    <>
      <ToastContainer />

      <style>
        {`
          /* Desktop Table View */
          .desktop-table-wrapper {
            width: 100%;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            display: none;
          }
          .custom-table th, .custom-table td {
            white-space: nowrap;
            padding: 16px;
            vertical-align: middle;
          }
          
          /* Nice Desktop Button */
          .view-details-btn-desktop {
            border: 1px solid #407e18;
            color: #407e18;
            background-color: #fff;
            padding: 6px 16px;
            border-radius: 4px;
            font-weight: 600;
            transition: 0.3s;
          }
          .view-details-btn-desktop:hover {
            background-color: #407e18;
            color: #fff;
          }

          /* Mobile Card View */
          .mobile-order-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .mobile-order-card {
            background: #fff;
            border: 1px solid #eaeaea;
            border-radius: 10px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          }
          .mobile-order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 12px;
            margin-bottom: 12px;
          }
          
          /* Premium Mobile Button */
          .view-details-btn-mobile {
            width: 100%;
            background-color: #407e18;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: 0.3s;
            box-shadow: 0 4px 10px rgba(100, 222, 63, 0.2);
          }
          .view-details-btn-mobile:hover {
            background-color: #407e18;
          }

          /* RATE PRODUCT BUTTON STYLE */
          .rate-product-btn {
            background: rgba(222, 67, 63, 0.05);
            border: 1px solid #407e18;
            color: #407e18;
            font-size: 11px;
            font-weight: 700;
            padding: 6px 14px;
            border-radius: 20px;
            margin-top: 8px;
            transition: 0.3s;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .rate-product-btn:hover {
            background: #407e18;
            color: #fff;
            box-shadow: 0 3px 8px rgba(9, 128, 39, 0.3);
          }
          
          .rate-product-btn:disabled {
            background: #f5f5f5;
            border-color: #ddd;
            color: #aaa;
            cursor: not-allowed;
          }

          .reviewed-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            color: #28a745;
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
          }

          /* STAR RATING STYLES */
          .star-container { display: flex; gap: 8px; justify-content: center; margin: 15px 0; }
          .star-btn { background: none; border: none; cursor: pointer; padding: 0; }
          .star-icon { color: #ccc; transition: 0.2s; }
          .star-icon.filled { color: #407e18; fill: #407e18; }
          .review-textarea { width: 100%; border: 1px solid #eee; border-radius: 8px; padding: 12px; min-height: 100px; outline: none; }
          
          /* Responsive Toggles */
          @media (min-width: 768px) {
            .desktop-table-wrapper { display: block; }
            .mobile-order-list { display: none; }
          }
          
          /* Modal Overlay & Animation */
          .order-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);
            z-index: 9999; display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.2s ease-out; padding: 20px;
          }
          .order-modal-content {
            background: #fff; width: 100%; max-width: 850px; max-height: 90vh;
            border-radius: 12px; overflow-y: auto; overflow-x: hidden;
            box-shadow: 0 20px 50px rgba(0,0,0,0.2); display: flex; flex-direction: column;
            animation: slideUp 0.3s ease-out;
          }
          
          /* Modal Header */
          .order-modal-header {
            padding: 20px 24px; border-bottom: 1px solid #eee;
            display: flex; justify-content: space-between; align-items: center;
            position: sticky; top: 0; background: #fff; z-index: 10;
          }
          .close-modal-btn {
            background: none; border: none; font-size: 28px;
            line-height: 1; cursor: pointer; color: #555; transition: color 0.2s;
          }
          .close-modal-btn:hover { color: #407e18; }

          /* Modal Body Grid */
          .order-modal-body {
            padding: 24px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 30px;
          }
          .order-section-title {
            font-size: 16px; font-weight: 600; margin-bottom: 16px;
            color: #333; border-bottom: 2px solid #407e18;
            padding-bottom: 8px; display: inline-block;
          }
          
          /* Product Cards */
          .order-item-card {
            display: flex; align-items: center; padding: 16px;
            background: #fcfcfc; border: 1px solid #eee;
            border-radius: 8px; margin-bottom: 12px;
          }
          .order-item-img {
            width: 70px; height: 70px; object-fit: cover;
            border-radius: 6px; margin-right: 16px;
            background: #fff; border: 1px solid #eaeaea;
          }
          
          /* Fixed Address Cards */
          .address-card {
            background: #f9f9f9; padding: 16px;
            border-radius: 8px; border: 1px solid #eaeaea; margin-bottom: 20px;
          }
          .address-row {
            display: flex;
            align-items: flex-start;
            margin-bottom: 8px;
            font-size: 14px;
            color: #444;
          }
          .address-row span.label {
            font-weight: 600; color: #222; 
            width: 80px; min-width: 80px; /* Fixed width prevents squishing */
            margin-right: 8px;
          }
          .address-row span.value {
            flex: 1;
            /* This is the magic line that fixes your long testing strings */
            overflow-wrap: anywhere; 
            word-break: break-word;
          }

          /* Summary Box */
          .summary-box {
            background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eaeaea;
          }
          
          @media (max-width: 768px) {
            .order-modal-body { grid-template-columns: 1fr; }
            .order-modal-overlay { padding: 10px; }
          }
          
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}
      </style>

      <main
        id="MainContent"
        className="content-for-layout"
        style={{ minHeight: "80vh" }}
      >
        <div className="container mt-5 mb-5">
          <h2
            className="section-heading mb-4 text-center"
            style={{ color: "#333", fontWeight: "700" }}
          >
            My Order History
          </h2>

          {loading ? (
            <div className="text-center py-5">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-5 border rounded bg-white">
              <h4 className="mb-3">You haven't placed any orders yet.</h4>
              <a
                href="/shop"
                className="btn text-white px-4 py-2"
                style={{ backgroundColor: "#407e18", borderRadius: "4px" }}
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <>
              {/* DESKTOP VIEW: TABLE */}
              <div className="desktop-table-wrapper border">
                <table className="table custom-table table-hover align-middle mb-0">
                  <thead style={{ backgroundColor: "#f8f9fa" }}>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td className="fw-bold text-secondary">
                          {order.orderNumber || order._id.substring(0, 8)}
                        </td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="fw-semibold">
                            {order.orderItems?.length || 0} item(s)
                          </span>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#888",
                              marginTop: "4px",
                            }}
                          >
                            {order.orderItems?.[0]?.title ||
                              order.orderItems?.[0]?.name ||
                              "Product"}
                            {order.orderItems?.length > 1 &&
                              ` +${order.orderItems.length - 1} more`}
                          </div>
                        </td>
                        <td
                          className="fw-bold"
                          style={{ color: "#407e18", fontSize: "16px" }}
                        >
                          ₹{order.totalPrice?.toFixed(2)}
                        </td>
                        <td>
                          <span
                            className="badge rounded-pill px-3 py-2 text-white"
                            style={{
                              backgroundColor: getStatusColor(
                                order.orderStatus,
                              ),
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {order.orderStatus || "Pending"}
                          </span>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <button
                              className="view-details-btn-desktop"
                              onClick={() => setSelectedOrder(order)}
                            >
                              View Details
                            </button>

                            <button
                              onClick={() =>
                                handleDownloadInvoice(
                                  order._id,
                                  order.orderNumber,
                                )
                              }
                              disabled={downloadingId === order._id}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#198754",
                                cursor: "pointer",
                                padding: "4px",
                                display: "flex",
                                alignItems: "center",
                                opacity: downloadingId === order._id ? 0.5 : 1,
                              }}
                              title="Download Invoice"
                            >
                              <FiDownload size={22} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE/TABLET VIEW: CARDS */}
              <div className="mobile-order-list">
                {orders.map((order) => (
                  <div className="mobile-order-card" key={order._id}>
                    <div className="mobile-order-header">
                      <div>
                        <span
                          className="d-block text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          Order ID
                        </span>
                        <strong className="text-secondary">
                          {order.orderNumber || order._id.substring(0, 8)}
                        </strong>
                      </div>
                      <div className="text-end">
                        <span
                          className="d-block text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          Date
                        </span>
                        <strong>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </strong>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <div className="fw-semibold">
                          {order.orderItems?.length || 0} item(s)
                        </div>
                        <div style={{ fontSize: "12px", color: "#888" }}>
                          {order.orderItems?.[0]?.title ||
                            order.orderItems?.[0]?.name ||
                            "Product"}
                        </div>
                      </div>
                      <div className="text-end">
                        <div
                          className="fw-bold"
                          style={{ color: "#407e18", fontSize: "18px" }}
                        >
                          ₹{order.totalPrice?.toFixed(2)}
                        </div>
                        <span
                          className="badge rounded-pill mt-1 text-white"
                          style={{
                            backgroundColor: getStatusColor(order.orderStatus),
                          }}
                        >
                          {order.orderStatus || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        className="view-details-btn-mobile"
                        style={{ flex: 1 }}
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
                      </button>

                      <button
                        onClick={() =>
                          handleDownloadInvoice(order._id, order.orderNumber)
                        }
                        disabled={downloadingId === order._id}
                        style={{
                          width: "48px",
                          backgroundColor: "#f8fafc",
                          color: "#17a2b8",
                          border: "1px solid #17a2b8",
                          borderRadius: "6px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          cursor: "pointer",
                          opacity: downloadingId === order._id ? 0.5 : 1,
                        }}
                        title="Download Invoice"
                      >
                        <FiDownload size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* FULL ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div
          className="order-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="order-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-modal-header">
              <h4 className="m-0" style={{ color: "#333", fontWeight: "700" }}>
                Order{" "}
                <span style={{ color: "#407e18" }}>
                  {selectedOrder.orderNumber ||
                    selectedOrder._id.substring(0, 8)}
                </span>
              </h4>
              <button
                className="close-modal-btn"
                onClick={() => setSelectedOrder(null)}
              >
                &times;
              </button>
            </div>

            <div className="order-modal-body">
              {/* LEFT COLUMN: Products */}
              <div>
                <h5 className="order-section-title">Items Ordered</h5>
                {selectedOrder.orderItems?.map((item, index) => {
                  const originalPrice = item.originalPrice || item.price * 1.3;
                  const itemId = item.variant || item._id;
                  const isReviewed = reviewedItems.has(itemId);

                  return (
                    <div className="order-item-card" key={index}>
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.title || item.name}
                        className="order-item-img"
                      />
                      <div style={{ flex: 1 }}>
                        <h6
                          className="m-0 mb-1"
                          style={{
                            fontSize: "15px",
                            fontWeight: "600",
                            color: "#222",
                          }}
                        >
                          {item.title || item.name}
                        </h6>
                        <div style={{ fontSize: "13px", color: "#666" }}>
                          Qty: <strong>{item.quantity}</strong>
                        </div>

                        {/* UPDATED: LOGIC TO HANDLE MULTIPLE PRODUCTS & PREVENT RE-REVIEWING */}
                        {isReviewed ? (
                          <div className="reviewed-badge">
                            <FiCheckCircle /> Reviewed
                          </div>
                        ) : (
                          <button
                            className="rate-product-btn"
                            disabled={selectedOrder.orderStatus !== "Delivered"}
                            onClick={() => {
                              setReviewData({
                                ...reviewData,
                                variantId: itemId,
                                productName: item.title || item.name,
                              });
                              setShowReviewModal(true);
                            }}
                          >
                            {selectedOrder.orderStatus === "Delivered"
                              ? "Rate Product"
                              : "Review available after delivery"}
                          </button>
                        )}
                      </div>
                      <div className="text-end">
                        <div
                          style={{
                            fontSize: "12px",
                            textDecoration: "line-through",
                            color: "#999",
                          }}
                        >
                          ₹{(originalPrice * item.quantity).toFixed(2)}
                        </div>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: "#407e18",
                          }}
                        >
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT COLUMN: Addresses & Summary */}
              <div>
                <h5 className="order-section-title">Shipping Address</h5>
                <div className="address-card">
                  {selectedOrder.shippingAddress ? (
                    <div>
                      <div className="address-row">
                        <span className="label">Name:</span>
                        <span className="value">
                          {selectedOrder.shippingAddress.firstName}{" "}
                          {selectedOrder.shippingAddress.lastName}
                        </span>
                      </div>
                      <div className="address-row">
                        <span className="label">Email:</span>
                        <span className="value">
                          {selectedOrder.shippingAddress.email}
                        </span>
                      </div>
                      <div className="address-row">
                        <span className="label">Phone:</span>
                        <span className="value">
                          {selectedOrder.shippingAddress.phone}
                        </span>
                      </div>
                      <div className="address-row">
                        <span className="label">Address 1:</span>
                        <span className="value">
                          {selectedOrder.shippingAddress.address1}
                        </span>
                      </div>
                      {selectedOrder.shippingAddress.address2 && (
                        <div className="address-row">
                          <span className="label">Address 2:</span>
                          <span className="value">
                            {selectedOrder.shippingAddress.address2}
                          </span>
                        </div>
                      )}
                      <div className="address-row">
                        <span className="label">City:</span>
                        <span className="value">
                          {selectedOrder.shippingAddress.city}
                        </span>
                      </div>
                      <div className="address-row">
                        <span className="label">Zip:</span>
                        <span className="value">
                          {selectedOrder.shippingAddress.zip}
                        </span>
                      </div>
                      <div className="address-row">
                        <span className="label">Country:</span>
                        <span className="value">
                          {selectedOrder.shippingAddress.country}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p>No shipping details available.</p>
                  )}
                </div>

                <h5 className="order-section-title mt-2">Billing Address</h5>
                <div className="address-card">
                  {selectedOrder.billingAddress ? (
                    <div>
                      <div className="address-row">
                        <span className="label">Name:</span>
                        <span className="value">
                          {selectedOrder.billingAddress.firstName}{" "}
                          {selectedOrder.billingAddress.lastName}
                        </span>
                      </div>
                      <div className="address-row">
                        <span className="label">Email:</span>
                        <span className="value">
                          {selectedOrder.billingAddress.email}
                        </span>
                      </div>
                      <div className="address-row">
                        <span className="label">Phone:</span>
                        <span className="value">
                          {selectedOrder.billingAddress.phone}
                        </span>
                      </div>
                      <div className="address-row">
                        <span className="label">Address 1:</span>
                        <span className="value">
                          {selectedOrder.billingAddress.address1}
                        </span>
                      </div>
                      {selectedOrder.billingAddress.address2 && (
                        <div className="address-row">
                          <span className="label">Address 2:</span>
                          <span className="value">
                            {selectedOrder.billingAddress.address2}
                          </span>
                        </div>
                      )}
                      <div className="address-row">
                        <span className="label">City:</span>
                        <span className="value">
                          {selectedOrder.billingAddress.city}
                        </span>
                      </div>
                      <div className="address-row">
                        <span className="label">Zip:</span>
                        <span className="value">
                          {selectedOrder.billingAddress.zip}
                        </span>
                      </div>
                      <div className="address-row">
                        <span className="label">Country:</span>
                        <span className="value">
                          {selectedOrder.billingAddress.country}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: "#666", fontStyle: "italic" }}>
                      Same as shipping address
                    </p>
                  )}
                </div>

                <h5 className="order-section-title mt-2">Order Summary</h5>
                <div className="summary-box">
                  <div
                    className="d-flex justify-content-between mb-2"
                    style={{ fontSize: "14px", color: "#555" }}
                  >
                    <span>Subtotal</span>
                    <span>
                      ₹
                      {(
                        selectedOrder.totalPrice -
                        (selectedOrder.shippingPrice || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div
                    className="d-flex justify-content-between mb-3"
                    style={{ fontSize: "14px", color: "#555" }}
                  >
                    <span>Shipping Fee</span>
                    <span>
                      ₹{(selectedOrder.shippingPrice || 0).toFixed(2)}
                    </span>
                  </div>
                  <hr style={{ borderColor: "#eee", margin: "12px 0" }} />
                  <div className="d-flex justify-content-between align-items-center">
                    <strong style={{ fontSize: "16px", color: "#333" }}>
                      Total Amount
                    </strong>
                    <strong style={{ fontSize: "20px", color: "#407e18" }}>
                      ₹{selectedOrder.totalPrice?.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD REVIEW MODAL --- */}
      {showReviewModal && (
        <div className="order-modal-overlay" style={{ zIndex: 10000 }}>
          <div
            className="order-modal-content"
            style={{ maxWidth: "450px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-modal-header">
              <h5 className="m-0">
                Rate{" "}
                <span style={{ color: "#407e18" }}>
                  {reviewData.productName}
                </span>
              </h5>
              <button
                className="close-modal-btn"
                onClick={() => setShowReviewModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-4">
              <p className="text-center text-muted mb-0">
                How would you rate this item?
              </p>
              <div className="star-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="star-btn"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() =>
                      setReviewData({ ...reviewData, rating: star })
                    }
                  >
                    <FiStar
                      size={35}
                      className={`star-icon ${
                        (hoverRating || reviewData.rating) >= star
                          ? "filled"
                          : ""
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                className="review-textarea"
                placeholder="Write your feedback here..."
                value={reviewData.comment}
                onChange={(e) =>
                  setReviewData({ ...reviewData, comment: e.target.value })
                }
                required
              />
              <button
                type="submit"
                className="view-details-btn-mobile mt-4"
                style={{ width: "100%" }}
              >
                SUBMIT REVIEW
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderHistory;
