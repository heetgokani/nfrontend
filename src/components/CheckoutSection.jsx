import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000";

const CheckoutSection = () => {
  const [cartData, setCartData] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  // --- NEW SHIPPING API STATES ---
  const [allShippingRules, setAllShippingRules] = useState([]);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [pinError, setPinError] = useState("");
  const [isShippingAvailable, setIsShippingAvailable] = useState(false);

  // Form States
  const defaultForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "India",
    city: "",
    zip: "",
    address1: "",
    address2: "",
  };

  const [shippingForm, setShippingForm] = useState({ ...defaultForm });
  const [billingForm, setBillingForm] = useState({ ...defaultForm });
  const [sameAsShipping, setSameAsShipping] = useState(false);

  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState({
    code: null,
    discountAmount: 0,
  });

  useEffect(() => {
    // 1. Fetch Cart Data
    const fetchCart = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/cart`, {
          withCredentials: true,
        });
        setCartData(data || { items: [] });
      } catch (error) {
        toast.error("Failed to load cart items.");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();

    // 2. Fetch Shipping Rules from DB
    const fetchShippingRules = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/shipping/all`);
        setAllShippingRules(data.methods || []);
      } catch (error) {
        console.error("Failed to load shipping rules", error);
      }
    };
    fetchShippingRules();

    // 3. Pre-fill form if navigating back
    const savedShipping = localStorage.getItem("shippingAddress");
    const savedBilling = localStorage.getItem("billingAddress");
    const savedSameAsShipping = localStorage.getItem("sameAsShipping");

    if (savedShipping) setShippingForm(JSON.parse(savedShipping));
    if (savedBilling) setBillingForm(JSON.parse(savedBilling));
    if (savedSameAsShipping) setSameAsShipping(JSON.parse(savedSameAsShipping));
  }, []);

  // --- PINCODE VALIDATION EFFECT ---
  useEffect(() => {
    if (
      shippingForm.zip &&
      shippingForm.zip.length >= 6 &&
      allShippingRules.length > 0
    ) {
      const matchedRule = allShippingRules.find(
        (r) => r.pincode === shippingForm.zip
      );

      if (matchedRule && matchedRule.isAvailable) {
        setShippingForm((prev) => ({
          ...prev,
          city: matchedRule.city,
          country: "India",
        }));
        if (sameAsShipping) {
          setBillingForm((prev) => ({
            ...prev,
            city: matchedRule.city,
            country: "India",
          }));
        }
        setShippingPrice(matchedRule.shippingPrice);
        setPinError("");
        setIsShippingAvailable(true);
      } else {
        if (pinError !== "Shipping not available in this pincode") {
          setPinError("Shipping not available in this pincode");
          toast.error("Shipping not available in this pincode");
        }
        setShippingPrice(0);
        setIsShippingAvailable(false);
      }
    } else {
      setPinError("");
      setShippingPrice(0);
      setIsShippingAvailable(false);
    }
  }, [shippingForm.zip, allShippingRules, sameAsShipping]);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (sameAsShipping) setBillingForm(updated);
      return updated;
    });
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setSameAsShipping(isChecked);
    if (isChecked) {
      setBillingForm({ ...shippingForm });
    }
  };

  // --- MATH & GST CALCULATIONS ---
  const calculateTotals = () => {
    let baseSubtotal = 0;
    let baseSGST = 0;
    let baseCGST = 0;

    cartData.items.forEach((item) => {
      const price = item.variant?.price || item.product?.price || 0;
      const itemTotalBase = price * item.quantity;

      const sgstPercentage = item.variant?.sgst || 0;
      const cgstPercentage = item.variant?.cgst || 0;

      const itemSGST = (itemTotalBase * sgstPercentage) / 100;
      const itemCGST = (itemTotalBase * cgstPercentage) / 100;

      baseSubtotal += itemTotalBase;
      baseSGST += itemSGST;
      baseCGST += itemCGST;
    });

    return { baseSubtotal, baseSGST, baseCGST };
  };

  const { baseSubtotal, baseSGST, baseCGST } = calculateTotals();

  // 1. Calculate how much percentage of the cart is discounted
  const discountAmount = appliedCoupon.discountAmount || 0;
  const discountRatio = baseSubtotal > 0 ? discountAmount / baseSubtotal : 0;

  // Cap the ratio at 1 (100%) so we don't get negative taxes
  const safeDiscountRatio = Math.min(discountRatio, 1);

  // 2. Reduce the GST by the exact same ratio as the discount
  const finalSGST = baseSGST * (1 - safeDiscountRatio);
  const finalCGST = baseCGST * (1 - safeDiscountRatio);

  // 3. Dynamic Shipping Price
  const shipping = baseSubtotal > 0 ? shippingPrice : 0;

  // 4. Final Total = (Subtotal - Discount) + Adjusted GST + Shipping
  const total =
    Math.max(0, baseSubtotal - discountAmount) +
    finalSGST +
    finalCGST +
    shipping;

  // --- COUPON LOGIC ---
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return toast.warning("Please enter a coupon code.");
    try {
      const formattedCartItems = cartData.items.map((item) => {
        const pId = item.product?._id || item.product;
        const cId = item.product?.category?._id || item.product?.category;

        return {
          productId: pId ? pId.toString() : null,
          categoryId: cId ? cId.toString() : null,
          price: item.variant?.price || item.product?.price || 0,
          quantity: item.quantity,
        };
      });

      // Send the baseSubtotal so min order checks match the raw product value
      const response = await axios.post(`${API_URL}/api/coupons/validate`, {
        code: promoCode,
        cartItems: formattedCartItems,
        subtotal: baseSubtotal,
      });

      if (response.data.success) {
        setAppliedCoupon({
          code: response.data.couponCode,
          discountAmount: response.data.discount,
        });
        toast.success(`Coupon applied! You saved ₹${response.data.discount}`);
      }
    } catch (error) {
      setAppliedCoupon({ code: null, discountAmount: 0 });
      toast.error(
        error.response?.data?.message || "Invalid or expired coupon code."
      );
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon({ code: null, discountAmount: 0 });
    setPromoCode("");
    toast.info("Coupon removed.");
  };

  // --- SAVE BOTH ADDRESSES AND REDIRECT ---
  const handleProceedToShipping = (e) => {
    e.preventDefault();

    if (!isShippingAvailable) {
      return toast.error(
        "Please enter a valid pincode where shipping is available."
      );
    }

    if (
      !shippingForm.firstName ||
      !shippingForm.lastName ||
      !shippingForm.email ||
      !shippingForm.phone ||
      !shippingForm.address1 ||
      !shippingForm.city ||
      !shippingForm.zip
    ) {
      return toast.error("Please fill out all required shipping fields.");
    }

    if (
      !sameAsShipping &&
      (!billingForm.firstName ||
        !billingForm.lastName ||
        !billingForm.email ||
        !billingForm.phone ||
        !billingForm.address1 ||
        !billingForm.city ||
        !billingForm.zip)
    ) {
      return toast.error("Please fill out all required billing fields.");
    }

    const finalBillingForm = sameAsShipping ? shippingForm : billingForm;

    localStorage.setItem("shippingAddress", JSON.stringify(shippingForm));
    localStorage.setItem("billingAddress", JSON.stringify(finalBillingForm));
    localStorage.setItem("sameAsShipping", JSON.stringify(sameAsShipping));

    // Save the REDUCED GST to database
    localStorage.setItem(
      "checkoutTotals",
      JSON.stringify({
        subtotal: baseSubtotal,
        sgst: finalSGST,
        cgst: finalCGST,
        shippingPrice: shipping,
        discountAmount: appliedCoupon.discountAmount,
        totalPrice: total,
        couponCodeApplied: appliedCoupon.code,
      })
    );

    window.location.href = "/shipping";
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
            <li style={{ color: "#de433f", fontWeight: "600" }}>Checkout</li>
          </ul>
        </div>
      </div>

      <main id="MainContent" className="content-for-layout">
        <div className="checkout-page mt-100 mb-100">
          <div className="container">
            <div className="checkout-page-wrapper">
              <div className="row">
                {/* --- LEFT FORM SECTION --- */}
                <div className="col-xl-9 col-lg-8 col-md-12 col-12">
                  <div className="section-header mb-3">
                    <h2 className="section-heading">Check out</h2>
                  </div>

                  <div className="checkout-progress overflow-hidden">
                    <ol className="checkout-bar px-0">
                      <li className="progress-step step-done">
                        <a href="/cart">Cart</a>
                      </li>
                      <li className="progress-step step-active">
                        <a href="/checkout">Your Details</a>
                      </li>
                      <li className="progress-step step-todo">
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

                  <div className="shipping-address-area mt-4">
                    <h2 className="shipping-address-heading pb-1">
                      Shipping address
                    </h2>
                    <div className="shipping-address-form-wrapper">
                      <form className="shipping-address-form common-form">
                        <div className="row">
                          <div className="col-lg-6 col-md-12 col-12">
                            <fieldset>
                              <label className="label">First name</label>
                              <input
                                type="text"
                                name="firstName"
                                value={shippingForm.firstName}
                                onChange={handleShippingChange}
                              />
                            </fieldset>
                          </div>
                          <div className="col-lg-6 col-md-12 col-12">
                            <fieldset>
                              <label className="label">Last name</label>
                              <input
                                type="text"
                                name="lastName"
                                value={shippingForm.lastName}
                                onChange={handleShippingChange}
                              />
                            </fieldset>
                          </div>
                          <div className="col-lg-6 col-md-12 col-12">
                            <fieldset>
                              <label className="label">Email address</label>
                              <input
                                type="email"
                                name="email"
                                value={shippingForm.email}
                                onChange={handleShippingChange}
                              />
                            </fieldset>
                          </div>
                          <div className="col-lg-6 col-md-12 col-12">
                            <fieldset>
                              <label className="label">Phone number</label>
                              <input
                                type="text"
                                name="phone"
                                value={shippingForm.phone}
                                onChange={handleShippingChange}
                              />
                            </fieldset>
                          </div>
                          <div className="col-lg-6 col-md-12 col-12">
                            <fieldset>
                              <label className="label">Pin code</label>
                              <input
                                type="text"
                                name="zip"
                                value={shippingForm.zip}
                                onChange={handleShippingChange}
                                style={pinError ? { borderColor: "red" } : {}}
                              />
                              {pinError && (
                                <div
                                  style={{
                                    color: "red",
                                    fontSize: "12px",
                                    marginTop: "5px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {pinError}
                                </div>
                              )}
                            </fieldset>
                          </div>
                          <div className="col-lg-6 col-md-12 col-12">
                            <fieldset>
                              <label className="label">Country</label>
                              <select
                                className="form-select"
                                name="country"
                                value={shippingForm.country}
                                onChange={handleShippingChange}
                              >
                                <option value="India">India</option>
                              </select>
                            </fieldset>
                          </div>
                          <div className="col-lg-6 col-md-12 col-12">
                            <fieldset>
                              <label className="label">City</label>
                              <input
                                type="text"
                                name="city"
                                value={shippingForm.city}
                                onChange={handleShippingChange}
                              />
                            </fieldset>
                          </div>

                          <div className="col-lg-6 col-md-12 col-12">
                            <fieldset>
                              <label className="label">Address 1</label>
                              <input
                                type="text"
                                name="address1"
                                value={shippingForm.address1}
                                onChange={handleShippingChange}
                              />
                            </fieldset>
                          </div>
                          <div className="col-lg-6 col-md-12 col-12">
                            <fieldset>
                              <label className="label">Address 2</label>
                              <input
                                type="text"
                                name="address2"
                                value={shippingForm.address2}
                                onChange={handleShippingChange}
                              />
                            </fieldset>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>

                  <div className="shipping-address-area billing-area mt-4">
                    <h2 className="shipping-address-heading pb-1">
                      Billing address
                    </h2>
                    <div className="form-checkbox d-flex align-items-center mt-4 mb-4">
                      <input
                        className="form-check-input mt-0"
                        type="checkbox"
                        checked={sameAsShipping}
                        onChange={handleCheckboxChange}
                        id="sameAsShipping"
                      />
                      <label
                        className="form-check-label ms-2"
                        htmlFor="sameAsShipping"
                      >
                        Same as shipping address
                      </label>
                    </div>

                    {!sameAsShipping && (
                      <div className="shipping-address-form-wrapper">
                        <form className="shipping-address-form common-form">
                          <div className="row">
                            <div className="col-lg-6 col-md-12 col-12">
                              <fieldset>
                                <label className="label">First name</label>
                                <input
                                  type="text"
                                  name="firstName"
                                  value={billingForm.firstName}
                                  onChange={handleBillingChange}
                                />
                              </fieldset>
                            </div>
                            <div className="col-lg-6 col-md-12 col-12">
                              <fieldset>
                                <label className="label">Last name</label>
                                <input
                                  type="text"
                                  name="lastName"
                                  value={billingForm.lastName}
                                  onChange={handleBillingChange}
                                />
                              </fieldset>
                            </div>
                            <div className="col-lg-6 col-md-12 col-12">
                              <fieldset>
                                <label className="label">Email address</label>
                                <input
                                  type="email"
                                  name="email"
                                  value={billingForm.email}
                                  onChange={handleBillingChange}
                                />
                              </fieldset>
                            </div>
                            <div className="col-lg-6 col-md-12 col-12">
                              <fieldset>
                                <label className="label">Phone number</label>
                                <input
                                  type="text"
                                  name="phone"
                                  value={billingForm.phone}
                                  onChange={handleBillingChange}
                                />
                              </fieldset>
                            </div>
                            <div className="col-lg-6 col-md-12 col-12">
                              <fieldset>
                                <label className="label">Pin code</label>
                                <input
                                  type="text"
                                  name="zip"
                                  value={billingForm.zip}
                                  onChange={handleBillingChange}
                                />
                              </fieldset>
                            </div>
                            <div className="col-lg-6 col-md-12 col-12">
                              <fieldset>
                                <label className="label">Country</label>
                                <select
                                  className="form-select"
                                  name="country"
                                  value={billingForm.country}
                                  onChange={handleBillingChange}
                                >
                                  <option value="India">India</option>
                                  <option value="Canada">Canada</option>
                                  <option value="USA">USA</option>
                                  <option value="Australia">Australia</option>
                                  <option value="Mexico">Mexico</option>
                                </select>
                              </fieldset>
                            </div>
                            <div className="col-lg-6 col-md-12 col-12">
                              <fieldset>
                                <label className="label">City</label>
                                <input
                                  type="text"
                                  name="city"
                                  value={billingForm.city}
                                  onChange={handleBillingChange}
                                />
                              </fieldset>
                            </div>

                            <div className="col-lg-6 col-md-12 col-12">
                              <fieldset>
                                <label className="label">Address 1</label>
                                <input
                                  type="text"
                                  name="address1"
                                  value={billingForm.address1}
                                  onChange={handleBillingChange}
                                />
                              </fieldset>
                            </div>
                            <div className="col-lg-6 col-md-12 col-12">
                              <fieldset>
                                <label className="label">Address 2</label>
                                <input
                                  type="text"
                                  name="address2"
                                  value={billingForm.address2}
                                  onChange={handleBillingChange}
                                />
                              </fieldset>
                            </div>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>

                  <div className="shipping-address-area billing-area d-none d-lg-block mt-4">
                    <div className="minicart-btn-area d-flex align-items-center justify-content-between flex-wrap">
                      <a
                        href="/cart"
                        className="checkout-page-btn minicart-btn btn-secondary"
                      >
                        BACK TO CART
                      </a>
                      <button
                        onClick={handleProceedToShipping}
                        disabled={!isShippingAvailable}
                        className="checkout-page-btn minicart-btn btn-primary"
                        style={{
                          backgroundColor: "#de433f",
                          borderColor: "#de433f",
                          color: "#fff",
                          cursor: isShippingAvailable
                            ? "pointer"
                            : "not-allowed",
                          opacity: isShippingAvailable ? 1 : 0.6,
                        }}
                      >
                        PROCEED TO SHIPPING
                      </button>
                    </div>
                  </div>
                </div>

                {/* --- RIGHT ORDER SUMMARY SECTION --- */}
                <div className="col-xl-3 col-lg-4 col-md-12 col-12 mt-4 mt-lg-0">
                  <div
                    className="cart-total-area checkout-summary-area"
                    style={{
                      border: "1px solid #eaeaea",
                      borderRadius: "12px",
                      padding: "25px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <h3
                      className="mb-4 text-center heading_24"
                      style={{ fontWeight: "bold" }}
                    >
                      Order summary
                    </h3>
                    <div
                      style={{
                        maxHeight: "350px",
                        overflowY: "auto",
                        paddingRight: "10px",
                      }}
                    >
                      {loading ? (
                        <p className="text-center">Loading items...</p>
                      ) : (
                        cartData.items.map((item, index) => {
                          const title = item.product?.title || "Product";
                          const imgPath =
                            item.variant?.images?.[0] ||
                            item.product?.thumbnail ||
                            "";
                          const displayImg = imgPath.startsWith("http")
                            ? imgPath
                            : `${API_URL}${imgPath}`;
                          const price =
                            item.variant?.price || item.product?.price || 0;
                          const originalPrice =
                            item.variant?.originalPrice ||
                            item.product?.originalPrice ||
                            price * 1.25;

                          return (
                            <div
                              className="minicart-item d-flex py-3"
                              key={item._id}
                              style={{
                                borderBottom:
                                  index !== cartData.items.length - 1
                                    ? "1px solid #f0f0f0"
                                    : "none",
                              }}
                            >
                              <div
                                className="mini-img-wrapper"
                                style={{
                                  minWidth: "60px",
                                  marginRight: "15px",
                                }}
                              >
                                <img
                                  className="mini-img"
                                  src={displayImg}
                                  alt={title}
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    backgroundColor: "#f9f9f9",
                                  }}
                                />
                              </div>
                              <div className="product-info flex-grow-1">
                                <h2
                                  className="product-title m-0"
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    lineHeight: "1.3",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {title}
                                </h2>
                                <div
                                  className="price-info"
                                  style={{
                                    color: "#de433f",
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                    marginBottom: "4px",
                                  }}
                                >
                                  <span
                                    style={{
                                      textDecoration: "line-through",
                                      color: "#999",
                                      marginRight: "6px",
                                      fontSize: "12px",
                                      fontWeight: "normal",
                                    }}
                                  >
                                    ₹{originalPrice.toFixed(2)}
                                  </span>
                                  ₹{price.toFixed(2)}
                                </div>
                                <p
                                  className="product-vendor m-0"
                                  style={{ fontSize: "13px", color: "#777" }}
                                >
                                  Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="cart-total-box mt-3 bg-transparent p-0 border-top pt-4">
                      <div className="subtotal-item subtotal-box d-flex justify-content-between mb-2">
                        <h4
                          className="subtotal-title m-0"
                          style={{ fontSize: "14px", color: "#555" }}
                        >
                          Subtotal
                        </h4>
                        <p
                          className="subtotal-value m-0"
                          style={{ fontSize: "14px", fontWeight: "500" }}
                        >
                          ₹{baseSubtotal.toFixed(2)}
                        </p>
                      </div>

                      {finalSGST > 0 && (
                        <div className="subtotal-item subtotal-box d-flex justify-content-between mb-2">
                          <h4
                            className="subtotal-title m-0"
                            style={{ fontSize: "14px", color: "#555" }}
                          >
                            SGST
                          </h4>
                          <p
                            className="subtotal-value m-0"
                            style={{ fontSize: "14px", fontWeight: "500" }}
                          >
                            ₹{finalSGST.toFixed(2)}
                          </p>
                        </div>
                      )}

                      {finalCGST > 0 && (
                        <div className="subtotal-item subtotal-box d-flex justify-content-between mb-2">
                          <h4
                            className="subtotal-title m-0"
                            style={{ fontSize: "14px", color: "#555" }}
                          >
                            CGST
                          </h4>
                          <p
                            className="subtotal-value m-0"
                            style={{ fontSize: "14px", fontWeight: "500" }}
                          >
                            ₹{finalCGST.toFixed(2)}
                          </p>
                        </div>
                      )}

                      <div className="subtotal-item shipping-box d-flex justify-content-between mb-2">
                        <h4
                          className="subtotal-title m-0"
                          style={{ fontSize: "14px", color: "#555" }}
                        >
                          Shipping
                        </h4>
                        <p
                          className="subtotal-value m-0"
                          style={{ fontSize: "14px", fontWeight: "500" }}
                        >
                          ₹{shipping.toFixed(2)}
                        </p>
                      </div>

                      {appliedCoupon.discountAmount > 0 && (
                        <div
                          className="subtotal-item discount-box d-flex justify-content-between mb-2"
                          style={{ color: "#16a34a" }}
                        >
                          <h4
                            className="subtotal-title m-0"
                            style={{ fontSize: "14px", fontWeight: "600" }}
                          >
                            Discount ({appliedCoupon.code})
                          </h4>
                          <p
                            className="subtotal-value m-0"
                            style={{ fontSize: "14px", fontWeight: "700" }}
                          >
                            - ₹{appliedCoupon.discountAmount.toFixed(2)}
                          </p>
                        </div>
                      )}

                      <hr
                        style={{ margin: "15px 0", borderColor: "#f0f0f0" }}
                      />

                      <div className="subtotal-item discount-box d-flex justify-content-between align-items-center">
                        <h4
                          className="subtotal-title m-0"
                          style={{ fontWeight: "bold", fontSize: "16px" }}
                        >
                          Total
                        </h4>
                        <p
                          className="subtotal-value m-0"
                          style={{
                            fontWeight: "bold",
                            fontSize: "18px",
                            color: "#de433f",
                          }}
                        >
                          ₹{total.toFixed(2)}
                        </p>
                      </div>

                      {/* PREMIUM COUPON SECTION (UPDATED UI) */}
                      <div className="mt-4 checkout-promo-code">
                        {appliedCoupon.code ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "12px",
                              padding: "15px",
                              backgroundColor: "#fff5f5",
                              border: "1px dashed #de433f",
                              borderRadius: "6px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <span style={{ fontSize: "20px" }}>🎟️</span>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <span
                                  style={{
                                    color: "#de433f",
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  '{appliedCoupon.code}' APPLIED!
                                </span>
                                <span
                                  style={{
                                    color: "#333",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    marginTop: "2px",
                                  }}
                                >
                                  You saved ₹
                                  {appliedCoupon.discountAmount.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveCoupon}
                              style={{
                                backgroundColor: "#de433f",
                                color: "#fff",
                                border: "none",
                                padding: "10px 16px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "12px",
                                textTransform: "uppercase",
                                transition: "0.2s",
                                width: "100%",
                                marginTop: "4px",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#c83c39")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "#de433f")
                              }
                            >
                              Remove Coupon
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleApplyCoupon}>
                            <input
                              className="input-promo-code"
                              type="text"
                              placeholder="Have a promo code?"
                              value={promoCode}
                              onChange={(e) =>
                                setPromoCode(e.target.value.toUpperCase())
                              }
                              style={{
                                width: "100%",
                                padding: "12px 15px",
                                marginBottom: "12px",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                                fontSize: "14px",
                                outline: "none",
                                transition: "border-color 0.2s",
                              }}
                              onFocus={(e) =>
                                (e.target.style.borderColor = "#de433f")
                              }
                              onBlur={(e) =>
                                (e.target.style.borderColor = "#e5e7eb")
                              }
                            />
                            <button
                              type="submit"
                              style={{
                                backgroundColor: "#de433f",
                                color: "#fff",
                                padding: "12px",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                width: "100%",
                                textTransform: "uppercase",
                                transition: "0.3s",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#c83c39")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "#de433f")
                              }
                            >
                              Apply Promo Code
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shipping-address-area billing-area d-block d-lg-none mt-4">
                    <div className="d-flex flex-column gap-2">
                      <button
                        onClick={handleProceedToShipping}
                        disabled={!isShippingAvailable}
                        className="checkout-page-btn minicart-btn btn-primary w-100 text-center"
                        style={{
                          backgroundColor: "#de433f",
                          borderColor: "#de433f",
                          color: "#fff",
                          padding: "14px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          cursor: isShippingAvailable
                            ? "pointer"
                            : "not-allowed",
                          border: "none",
                          opacity: isShippingAvailable ? 1 : 0.6,
                        }}
                      >
                        PROCEED TO SHIPPING
                      </button>
                      <a
                        href="/cart"
                        className="checkout-page-btn minicart-btn btn-secondary w-100 text-center mt-2"
                        style={{
                          padding: "14px",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                          color: "#333",
                          fontWeight: "bold",
                          backgroundColor: "#fff",
                        }}
                      >
                        BACK TO CART
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

export default CheckoutSection;
