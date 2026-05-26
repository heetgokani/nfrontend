import React from "react";
import { useLocation, Navigate } from "react-router-dom";

const ReviewSection = () => {
  const location = useLocation();
  const order = location.state?.order;

  // Protect the route: if no order exists in state, bounce them back to shop
  if (!order) {
    return <Navigate to="/shop" />;
  }

  return (
    <>
      <div
        className="breadcrumb"
        style={{ padding: "15px 0", background: "#f9f9f9" }}
      >
        <div className="container">
          <ul
            className="list-unstyled d-flex align-items-center m-0"
            style={{ fontSize: "14px" }}
          >
            <li>
              <a href="/" style={{ color: "#000", textDecoration: "none" }}>
                Home
              </a>
            </li>
            <li className="d-flex align-items-center">
              <svg
                width="10"
                height="10"
                viewBox="0 0 64 64"
                style={{ margin: "0 10px", opacity: 0.5 }}
              >
                <path
                  d="M25.9375 8.5625L23.0625 11.4375L43.625 32L23.0625 52.5625L25.9375 55.4375L47.9375 33.4375L49.3125 32L47.9375 30.5625L25.9375 8.5625Z"
                  fill="#000"
                />
              </svg>
            </li>
            <li style={{ color: "#3c7d24", fontWeight: "600" }}>Review</li>
          </ul>
        </div>
      </div>

      <main id="MainContent" className="content-for-layout">
        <div className="checkout-page mt-100 mb-100">
          <div className="container text-center">
            <div className="checkout-progress overflow-hidden mb-5">
              <ol className="checkout-bar px-0">
                <li className="progress-step step-done">Cart</li>
                <li className="progress-step step-done">Your Details</li>
                <li className="progress-step step-done">Shipping</li>
                <li className="progress-step step-done">Payment</li>
                <li className="progress-step step-active">Review</li>
              </ol>
            </div>

            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="thank-you-area p-5 border rounded bg-white">
                  <div className="success-icon mb-4">
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#28a745"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h2 className="heading_34 mb-3">
                    Order Placed Successfully!
                  </h2>
                  <p style={{ fontSize: "16px" }}>
                    Your order <strong>{order.orderNumber}</strong> has been
                    confirmed.
                  </p>
                  <p className="text-muted">
                    Transaction ID: {order.paymentInfo.transactionId}
                  </p>

                  <div
                    className="order-summary-box mt-4 p-4 text-start"
                    style={{ backgroundColor: "#f9f9f9", borderRadius: "8px" }}
                  >
                    <h4
                      className="mb-3"
                      style={{
                        borderBottom: "1px solid #ddd",
                        paddingBottom: "10px",
                      }}
                    >
                      Order Items
                    </h4>
                    {order.orderItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="d-flex justify-content-between mb-2"
                      >
                        <span>
                          {item.quantity}x {item.title}
                        </span>
                        <span className="fw-bold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div
                      className="d-flex justify-content-between mt-3 pt-3"
                      style={{ borderTop: "1px dashed #ddd" }}
                    >
                      <span className="fw-bold text-dark">Total Paid:</span>
                      <span
                        className="fw-bold"
                        style={{ color: "#3c7d24", fontSize: "18px" }}
                      >
                        ₹{order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 d-flex justify-content-center gap-3">
                    <a
                      href="/shop"
                      className="btn-secondary text-uppercase p-3 px-4 rounded"
                      style={{
                        textDecoration: "none",
                        border: "1px solid #ddd",
                        color: "#333",
                        fontWeight: "600",
                      }}
                    >
                      CONTINUE SHOPPING
                    </a>
                    <a
                      href="/orders"
                      className="btn-primary text-uppercase p-3 px-4 rounded"
                      style={{
                        textDecoration: "none",
                        backgroundColor: "#3c7d24",
                        color: "#fff",
                        fontWeight: "600",
                      }}
                    >
                      VIEW ORDER HISTORY
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ReviewSection;
