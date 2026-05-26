import React, { useEffect, useState } from "react";
import axios from "axios";

const ShippingSection = () => {
  const [shippingAddress, setShippingAddress] = useState({});
  const [billingAddress, setBillingAddress] = useState({});
  const [deliveryDuration, setDeliveryDuration] = useState("");

  useEffect(() => {
    // Load the saved addresses from the Checkout step
    const savedShipping = localStorage.getItem("shippingAddress");
    const savedBilling = localStorage.getItem("billingAddress");

    if (savedShipping) {
      const parsedShipping = JSON.parse(savedShipping);
      setShippingAddress(parsedShipping);

      // Fetch the delivery duration and MATCH BY CITY instead of PIN Code
      axios
        .get("https://nikam-ecom-backend.onrender.com/api/shipping/all")
        .then((res) => {
          const methods = res.data.methods || [];
          const matchedRule = methods.find(
            (r) =>
              r.city?.toLowerCase().trim() ===
              parsedShipping.city?.toLowerCase().trim()
          );
          if (matchedRule && matchedRule.deliveryDuration) {
            setDeliveryDuration(matchedRule.deliveryDuration);
          }
        })
        .catch((err) => console.error(err));
    }

    if (savedBilling) setBillingAddress(JSON.parse(savedBilling));
  }, []);

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
            <li style={{ color: "#407e18", fontWeight: "600" }}>Shipping</li>
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
                    <h2 className="section-heading">Shipping Method</h2>
                  </div>

                  <div className="checkout-progress overflow-hidden">
                    <ol className="checkout-bar px-0">
                      <li className="progress-step step-done">
                        <a href="/cart">Cart</a>
                      </li>
                      <li className="progress-step step-done">
                        <a href="/checkout">Your Details</a>
                      </li>
                      <li className="progress-step step-active">
                        <a href="/shipping">Shipping</a>
                      </li>
                      <li className="progress-step step-todo">
                        <a href="/payment">Payment</a>
                      </li>
                      <li className="progress-step step-todo">
                        <a href="/review">Review</a>
                      </li>
                    </ol>
                  </div>

                  {/* Read-Only Shipping Address Preview */}
                  <div className="shipping-address-area mt-4 mb-4">
                    <h2 className="shipping-address-heading pb-1">
                      Shipping Address Preview
                    </h2>
                    <div
                      className="p-4 rounded mt-3"
                      style={{
                        border: "1px solid #eaeaea",
                        backgroundColor: "#fff",
                      }}
                    >
                      {shippingAddress.firstName ? (
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <strong style={{ color: "#555" }}>Name:</strong>{" "}
                            <br />
                            {shippingAddress.firstName}{" "}
                            {shippingAddress.lastName}
                          </div>
                          <div className="col-md-6 mb-3">
                            <strong style={{ color: "#555" }}>Email:</strong>{" "}
                            <br />
                            {shippingAddress.email}
                          </div>
                          <div className="col-md-6 mb-3">
                            <strong style={{ color: "#555" }}>Phone:</strong>{" "}
                            <br />
                            {shippingAddress.phone}
                          </div>
                          <div className="col-md-12 mb-3">
                            <strong style={{ color: "#555" }}>
                              Address 1:
                            </strong>{" "}
                            <br />
                            {shippingAddress.address1}
                          </div>
                          {shippingAddress.address2 && (
                            <div className="col-md-12 mb-3">
                              <strong style={{ color: "#555" }}>
                                Address 2:
                              </strong>{" "}
                              <br />
                              {shippingAddress.address2}
                            </div>
                          )}
                          <div className="col-md-4 mb-3">
                            <strong style={{ color: "#555" }}>City:</strong>{" "}
                            <br />
                            {shippingAddress.city}
                          </div>
                          <div className="col-md-4 mb-3">
                            <strong style={{ color: "#555" }}>Country:</strong>{" "}
                            <br />
                            {shippingAddress.country}
                          </div>
                          <div className="col-md-4 mb-3">
                            <strong style={{ color: "#555" }}>ZIP Code:</strong>{" "}
                            <br />
                            {shippingAddress.zip}
                          </div>

                          {/* Delivery Duration Added Here */}
                          {deliveryDuration && (
                            <div className="col-md-12 mt-2">
                              <div
                                style={{
                                  padding: "10px",
                                  background: "#f0fdf4",
                                  border: "1px solid #bbf7d0",
                                  borderRadius: "6px",
                                }}
                              >
                                <strong style={{ color: "#166534" }}>
                                  Expected Delivery Duration:
                                </strong>{" "}
                                <span
                                  style={{
                                    color: "#15803d",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {deliveryDuration}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted mb-0">
                          No shipping address found. Please go back to checkout.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Read-Only Billing Address Preview */}
                  <div className="shipping-address-area mt-4 mb-4">
                    <h2 className="shipping-address-heading pb-1">
                      Billing Address Preview
                    </h2>
                    <div
                      className="p-4 rounded mt-3"
                      style={{
                        border: "1px solid #eaeaea",
                        backgroundColor: "#fff",
                      }}
                    >
                      {billingAddress.firstName ? (
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <strong style={{ color: "#555" }}>Name:</strong>{" "}
                            <br />
                            {billingAddress.firstName} {billingAddress.lastName}
                          </div>
                          <div className="col-md-6 mb-3">
                            <strong style={{ color: "#555" }}>Email:</strong>{" "}
                            <br />
                            {billingAddress.email}
                          </div>
                          <div className="col-md-6 mb-3">
                            <strong style={{ color: "#555" }}>Phone:</strong>{" "}
                            <br />
                            {billingAddress.phone}
                          </div>
                          <div className="col-md-12 mb-3">
                            <strong style={{ color: "#555" }}>
                              Address 1:
                            </strong>{" "}
                            <br />
                            {billingAddress.address1}
                          </div>
                          {billingAddress.address2 && (
                            <div className="col-md-12 mb-3">
                              <strong style={{ color: "#555" }}>
                                Address 2:
                              </strong>{" "}
                              <br />
                              {billingAddress.address2}
                            </div>
                          )}
                          <div className="col-md-4 mb-3">
                            <strong style={{ color: "#555" }}>City:</strong>{" "}
                            <br />
                            {billingAddress.city}
                          </div>
                          <div className="col-md-4 mb-3">
                            <strong style={{ color: "#555" }}>Country:</strong>{" "}
                            <br />
                            {billingAddress.country}
                          </div>
                          <div className="col-md-4 mb-3">
                            <strong style={{ color: "#555" }}>ZIP Code:</strong>{" "}
                            <br />
                            {billingAddress.zip}
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted mb-0">
                          No billing address found. Please go back to checkout.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shipping-address-area billing-area mt-5">
                    <div className="minicart-btn-area d-flex align-items-center justify-content-between flex-wrap">
                      <a
                        href="/checkout"
                        className="checkout-page-btn minicart-btn btn-secondary"
                      >
                        BACK TO DETAILS
                      </a>
                      <a
                        href="/payment"
                        className="checkout-page-btn minicart-btn btn-primary"
                        style={{
                          backgroundColor: "#407e18",
                          borderColor: "#407e18",
                          color: "#fff",
                        }}
                      >
                        PROCEED TO PAYMENT
                      </a>
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

export default ShippingSection;
