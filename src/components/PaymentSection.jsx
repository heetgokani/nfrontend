import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "https://demo-backend-k0yn.onrender.com";

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

    const fetchCart = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/cart`, {
          withCredentials: true,
        });
        setCartData(data);
      } catch (error) {
        toast.error("Failed to load cart items.");
      }
    };
    fetchCart();
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!cartData || cartData.items.length === 0) {
      return toast.error("Your cart is empty.");
    }
    if (!shippingAddress || !billingAddress) {
      return toast.error("Address information is missing. Please go back.");
    }

    setProcessing(true);

    try {
      const orderItems = cartData.items.map((item) => ({
        product: item.product._id,
        variant: item.variant?._id || null,
        title: item.product.title,
        quantity: item.quantity,
        price: item.variant?.price || item.product?.price || 0,
        image: item.variant?.images?.[0] || item.product?.thumbnail || "",
      }));

      const payload = {
        orderItems,
        shippingAddress,
        billingAddress, // Now explicitly sending the verified billing address
        ...totals,
      };

      const { data } = await axios.post(`${API_URL}/api/orders`, payload, {
        withCredentials: true,
      });

      if (data.success) {
        toast.success("Order Placed Successfully!");

        localStorage.removeItem("checkoutTotals");
        localStorage.removeItem("shippingAddress");
        localStorage.removeItem("billingAddress");
        localStorage.removeItem("sameAsShipping");

        setTimeout(() => {
          navigate("/review", { state: { order: data.order } });
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order.");
      setProcessing(false);
    }
  };

  return (
    <>
      <ToastContainer />
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
                style={{ margin: "0 10px", opacity: 0.5 }}
              >
                <path
                  d="M25.9375 8.5625L23.0625 11.4375L43.625 32L23.0625 52.5625L25.9375 55.4375L47.9375 33.4375L49.3125 32L47.9375 30.5625L25.9375 8.5625Z"
                  fill="#000"
                />
              </svg>
            </li>
            <li style={{ color: "#de433f", fontWeight: "600" }}>Payment</li>
          </ul>
        </div>
      </div>

      <main id="MainContent" className="content-for-layout">
        <div className="checkout-page mt-100 mb-100">
          <div className="container">
            <div className="checkout-page-wrapper">
              {/* Keeping row left-aligned exactly as requested */}
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
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                          <input
                            type="radio"
                            name="payment"
                            id="cod"
                            checked
                            readOnly
                            style={{ accentColor: "#de433f" }}
                          />
                          <label
                            htmlFor="cod"
                            className="ms-3 mb-0 fw-bold"
                            style={{ fontSize: "16px" }}
                          >
                            Cash on Delivery (COD)
                          </label>
                        </div>
                        <span
                          className="fw-bold"
                          style={{ fontSize: "18px", color: "#de433f" }}
                        >
                          ₹{totals.totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <p
                        className="text-muted ms-4 mb-0"
                        style={{ fontSize: "14px" }}
                      >
                        Pay with cash upon delivery. Ensure you have the exact
                        amount ready.
                      </p>
                    </div>
                  </div>

                  <div className="shipping-address-area billing-area mt-5">
                    <div className="minicart-btn-area d-flex align-items-center justify-content-between flex-wrap">
                      <a
                        href="/shipping"
                        className="checkout-page-btn minicart-btn btn-secondary"
                      >
                        BACK TO SHIPPING
                      </a>
                      <button
                        onClick={handlePayment}
                        className="checkout-page-btn minicart-btn btn-primary border-0"
                        disabled={processing}
                        style={{
                          backgroundColor: "#de433f",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        {processing ? "PROCESSING ORDER..." : "PLACE ORDER"}
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
