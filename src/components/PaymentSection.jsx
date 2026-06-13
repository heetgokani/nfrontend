import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "https://nbackend-31lg.onrender.com";

const PaymentSection = () => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [cartData, setCartData] = useState(null);
  const [totals, setTotals] = useState({ totalPrice: 0 });
  const [shippingAddress, setShippingAddress] = useState(null);
  const [billingAddress, setBillingAddress] = useState(null);

  useEffect(() => {
    const savedTotals = JSON.parse(localStorage.getItem("checkoutTotals"));
    const savedShipping = JSON.parse(localStorage.getItem("shippingAddress"));
    const savedBilling = JSON.parse(localStorage.getItem("billingAddress"));

    if (savedTotals) setTotals(savedTotals);
    if (savedShipping) setShippingAddress(savedShipping);
    if (savedBilling) setBillingAddress(savedBilling);

    // CRITICAL iOS FIX: Add timestamp to bypass Safari's aggressive caching
    // and explicitly pass token in case the global interceptor fails on mobile mount
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${API_URL}/api/cart?timestamp=${new Date().getTime()}`,
          {
            withCredentials: true,
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        setCartData(data);
      } catch (error) {
        console.error("Cart fetch error:", error);
        toast.error("Failed to load cart items. Please refresh.");
      }
    };
    fetchCart();
  }, []);

  // Helper to load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!cartData || !cartData.items || cartData.items.length === 0) {
      return toast.error("Your cart is empty.");
    }
    if (!shippingAddress || !billingAddress) {
      return toast.error("Address information is missing. Please go back.");
    }

    setProcessing(true);

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        setProcessing(false);
        return toast.error("Razorpay SDK failed to load. Are you online?");
      }

      // Format order items with exact selling prices
      const orderItems = cartData.items.map((item) => {
        const sellingPrice =
          item.variant?.discountPrice > 0
            ? item.variant.discountPrice
            : item.variant?.price || item.product?.price || 0;

        return {
          product: item.product._id,
          variant: item.variant?._id || null,
          title: item.product.title,
          quantity: item.quantity,
          price: sellingPrice,
          image: item.variant?.images?.[0] || item.product?.thumbnail || "",
        };
      });

      const payload = {
        orderItems,
        shippingAddress,
        billingAddress,
        ...totals,
        totalAmount: totals.totalPrice,
      };

      // 1. Initialize Order in Backend (Validates stock & creates Razorpay Order)
      const initResponse = await axios.post(
        `${API_URL}/api/orders/init-payment`,
        payload,
        {
          withCredentials: true,
        }
      );

      if (!initResponse.data.success)
        throw new Error("Failed to initialize payment");

      const { razorpayOrder, keyId } = initResponse.data;

      // 2. Open Razorpay Popup
      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Nikam Organic",
        description: "Complete your order",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          // 3. Verify Signature & Save Order in Backend
          try {
            const verifyPayload = {
              ...payload,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            };

            const finalRes = await axios.post(
              `${API_URL}/api/orders`,
              verifyPayload,
              {
                withCredentials: true,
              }
            );

            if (finalRes.data.success) {
              toast.success("Payment Successful! Order Placed.");
              localStorage.removeItem("checkoutTotals");
              localStorage.removeItem("shippingAddress");
              localStorage.removeItem("billingAddress");
              localStorage.removeItem("sameAsShipping");

              setTimeout(() => {
                navigate("/review", { state: { order: finalRes.data.order } });
              }, 1500);
            }
          } catch (err) {
            toast.error(
              err.response?.data?.message || "Payment verification failed."
            );
          }
        },
        prefill: {
          name: `${billingAddress.firstName} ${billingAddress.lastName}`,
          email: billingAddress.email,
          contact: billingAddress.phone,
        },
        theme: {
          color: "#407e18",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            toast.error("Payment cancelled.");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to initialize payment."
      );
      setProcessing(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" style={{ marginTop: "60px" }} />
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
                fill="none"
                style={{ margin: "0 10px", opacity: 0.5 }}
              >
                <path
                  d="M25.9375 8.5625L23.0625 11.4375L43.625 32L23.0625 52.5625L25.9375 55.4375L47.9375 33.4375L49.3125 32L47.9375 30.5625L25.9375 8.5625Z"
                  fill="#000"
                />
              </svg>
            </li>
            <li>
              <a href="/cart" style={{ color: "#000", textDecoration: "none" }}>
                Cart
              </a>
            </li>
            <li className="d-flex align-items-center">
              <svg
                width="10"
                height="10"
                viewBox="0 0 64 64"
                fill="none"
                style={{ margin: "0 10px", opacity: 0.5 }}
              >
                <path
                  d="M25.9375 8.5625L23.0625 11.4375L43.625 32L23.0625 52.5625L25.9375 55.4375L47.9375 33.4375L49.3125 32L47.9375 30.5625L25.9375 8.5625Z"
                  fill="#000"
                />
              </svg>
            </li>
            <li>
              <a
                href="/checkout"
                style={{ color: "#000", textDecoration: "none" }}
              >
                Checkout
              </a>
            </li>
            <li className="d-flex align-items-center">
              <svg
                width="10"
                height="10"
                viewBox="0 0 64 64"
                fill="none"
                style={{ margin: "0 10px", opacity: 0.5 }}
              >
                <path
                  d="M25.9375 8.5625L23.0625 11.4375L43.625 32L23.0625 52.5625L25.9375 55.4375L47.9375 33.4375L49.3125 32L47.9375 30.5625L25.9375 8.5625Z"
                  fill="#000"
                />
              </svg>
            </li>
            <li>
              <a
                href="/shipping"
                style={{ color: "#000", textDecoration: "none" }}
              >
                Shipping
              </a>
            </li>
            <li className="d-flex align-items-center">
              <svg
                width="10"
                height="10"
                viewBox="0 0 64 64"
                fill="none"
                style={{ margin: "0 10px", opacity: 0.5 }}
              >
                <path
                  d="M25.9375 8.5625L23.0625 11.4375L43.625 32L23.0625 52.5625L25.9375 55.4375L47.9375 33.4375L49.3125 32L47.9375 30.5625L25.9375 8.5625Z"
                  fill="#000"
                />
              </svg>
            </li>
            <li style={{ color: "#407e18", fontWeight: "600" }}>Payment</li>
          </ul>
        </div>
      </div>

      <main id="MainContent" className="content-for-layout">
        <div className="checkout-page mt-100 mb-100">
          <div className="container">
            <div className="checkout-page-wrapper">
              <div className="row">
                <div className="col-xl-9 col-lg-8 col-md-12 col-12">
                  <div className="section-header mb-3">
                    <h2 className="section-heading">Payment</h2>
                  </div>

                  <div className="checkout-progress overflow-hidden">
                    <ol className="checkout-bar px-0">
                      <li className="progress-step step-done">
                        <a href="/cart">Cart</a>
                      </li>
                      <li className="progress-step step-done">
                        <a href="/checkout">Your Details</a>
                      </li>
                      <li className="progress-step step-done">
                        <a href="/shipping">Shipping</a>
                      </li>
                      <li className="progress-step step-active">Payment</li>
                      <li className="progress-step step-todo">Review</li>
                    </ol>
                  </div>

                  <div className="shipping-address-area mt-4">
                    <h2 className="shipping-address-heading pb-1">
                      Payment Method
                    </h2>

                    <div className="payment-form common-form mt-4 p-4 border rounded bg-white">
                      {/* CRITICAL UI FIX: Exact requested column structure */}
                      <div className="d-flex align-items-start">
                        {/* Left Column: Radio Button & Price */}
                        <div className="d-flex flex-column align-items-center me-3 flex-shrink-0">
                          <input
                            type="radio"
                            name="payment"
                            id="razorpay"
                            checked
                            readOnly
                            style={{
                              accentColor: "#407e18",
                              width: "20px",
                              height: "20px",
                              marginBottom: "8px",
                            }}
                          />
                          <span
                            className="fw-bold"
                            style={{ fontSize: "16px", color: "#407e18" }}
                          >
                            ₹
                            {totals?.totalPrice
                              ? totals.totalPrice.toFixed(2)
                              : "0.00"}
                          </span>
                        </div>

                        {/* Right Column: Title & Description */}
                        <div className="d-flex flex-column justify-content-start">
                          <label
                            htmlFor="razorpay"
                            className="mb-1 fw-bold"
                            style={{ fontSize: "16px", lineHeight: "1.4" }}
                          >
                            Razorpay (UPI, Cards, NetBanking)
                          </label>
                          <p
                            className="text-muted mb-0 mt-1"
                            style={{ fontSize: "13px", lineHeight: "1.5" }}
                          >
                            Pay securely using Razorpay's encrypted payment
                            gateway.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="shipping-address-area billing-area mt-5">
                    <div className="minicart-btn-area d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <a
                        href="/shipping"
                        className="checkout-page-btn minicart-btn btn-secondary text-center w-sm-auto w-100"
                      >
                        BACK TO SHIPPING
                      </a>
                      <button
                        onClick={handlePayment}
                        className="checkout-page-btn minicart-btn btn-primary border-0 text-center w-sm-auto w-100"
                        disabled={processing}
                        style={{
                          backgroundColor: "#407e18",
                          color: "#fff",
                          cursor: processing ? "not-allowed" : "pointer",
                          opacity: processing ? 0.7 : 1,
                        }}
                      >
                        {processing
                          ? "PROCESSING PAYMENT..."
                          : "PAY & PLACE ORDER"}
                      </button>
                    </div>
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

export default PaymentSection;
