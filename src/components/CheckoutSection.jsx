import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "https://nbackend-31lg.onrender.com";

const CheckoutSection = () => {
  const [cartData, setCartData] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const hasZeroPriceItem = cartData.items.some((item) => {
    const p = item.product || {};
    const v = item.variant || {};
    const originalPrice = Number(v.price) || Number(p.price) || 0;
    let sellingPrice =
      Number(v.discountPrice) || Number(p.discountPrice) || originalPrice;

    if (sellingPrice === 0 && originalPrice > 0) {
      sellingPrice = originalPrice;
    }

    return sellingPrice <= 0;
  });
  // --- NEW SHIPPING API STATES ---
  const [allShippingRules, setAllShippingRules] = useState([]);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [cityError, setCityError] = useState("");
  const [isShippingAvailable, setIsShippingAvailable] = useState(false);

  // --- CUSTOM DROPDOWN STATES ---
  const [isShippingCityOpen, setIsShippingCityOpen] = useState(false);
  const [shippingCitySearch, setShippingCitySearch] = useState("");
  const [isBillingCityOpen, setIsBillingCityOpen] = useState(false);
  const [billingCitySearch, setBillingCitySearch] = useState("");

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

  // --- CITY VALIDATION EFFECT ---
  useEffect(() => {
    if (shippingForm.city && allShippingRules.length > 0) {
      const matchedRule = allShippingRules.find(
        (r) =>
          r.city?.toLowerCase().trim() ===
          shippingForm.city.toLowerCase().trim()
      );

      if (matchedRule && matchedRule.isAvailable) {
        setShippingPrice(matchedRule.shippingPrice);
        setCityError("");
        setIsShippingAvailable(true);
      } else {
        if (cityError !== "Shipping not available in this city") {
          setCityError("Shipping not available in this city");
          toast.error("Shipping not available in this city");
        }
        setShippingPrice(0);
        setIsShippingAvailable(false);
      }
    } else {
      setCityError("");
      setShippingPrice(0);
      setIsShippingAvailable(false);
    }
  }, [shippingForm.city, allShippingRules]);

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

  // --- CRITICAL FIX: MATH & GST CALCULATIONS BASE ON SELLING PRICE ---
  // Inside calculateTotals in CheckoutSection.jsx
  const calculateTotals = () => {
    let baseSubtotal = 0;
    let baseSGST = 0;
    let baseCGST = 0;

    cartData.items.forEach((item) => {
      // FIX: Always use discountPrice if it exists
      const sellingPrice =
        item.variant?.discountPrice > 0
          ? item.variant.discountPrice
          : item.variant?.price || item.product?.price || 0;

      const itemTotalBase = sellingPrice * item.quantity;
      const sgstPercentage = item.variant?.sgst || 0;
      const cgstPercentage = item.variant?.cgst || 0;

      baseSubtotal += itemTotalBase;
      baseSGST += (itemTotalBase * sgstPercentage) / 100;
      baseCGST += (itemTotalBase * cgstPercentage) / 100;
    });
    return { baseSubtotal, baseSGST, baseCGST };
  };

  const { baseSubtotal, baseSGST, baseCGST } = calculateTotals();

  const discountAmount = appliedCoupon.discountAmount || 0;
  const discountRatio = baseSubtotal > 0 ? discountAmount / baseSubtotal : 0;
  const safeDiscountRatio = Math.min(discountRatio, 1);

  const finalSGST = baseSGST * (1 - safeDiscountRatio);
  const finalCGST = baseCGST * (1 - safeDiscountRatio);
  const shipping = baseSubtotal > 0 ? shippingPrice : 0;

  // FIX: Do not add finalSGST and finalCGST to the total.
  // The price already includes GST (Universal Pricing).
  const total = Math.max(0, baseSubtotal - discountAmount) + shipping;
  // --- COUPON LOGIC ---
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return toast.warning("Please enter a coupon code.");
    try {
      const formattedCartItems = cartData.items.map((item) => {
        const pId = item.product?._id || item.product;
        const cId = item.product?.category?._id || item.product?.category;

        // Ensure coupon validation payload uses the exact selling price
        const sellingPrice =
          item.variant?.discountPrice > 0
            ? item.variant.discountPrice
            : item.variant?.price || item.product?.price || 0;

        return {
          productId: pId ? pId.toString() : null,
          categoryId: cId ? cId.toString() : null,
          price: sellingPrice,
          quantity: item.quantity,
        };
      });

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

  const handleProceedToShipping = (e) => {
    e.preventDefault();

    if (!isShippingAvailable) {
      return toast.error(
        "Please select a valid City where shipping is available."
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

  const availableCities = Array.from(
    new Set(allShippingRules.filter((r) => r.isAvailable).map((r) => r.city))
  );

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
            <li style={{ color: " #407e18", fontWeight: "600" }}>Checkout</li>
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
                              />
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

                          {/* --- CUSTOM SHIPPING CITY DROPDOWN --- */}
                          <div className="col-lg-6 col-md-12 col-12">
                            <fieldset style={{ position: "relative" }}>
                              <label className="label">City</label>
                              <div
                                onClick={() =>
                                  setIsShippingCityOpen(!isShippingCityOpen)
                                }
                                style={{
                                  border: `1px solid ${
                                    cityError ? "red" : "#e5e7eb"
                                  }`,
                                  padding: "12px 15px",
                                  borderRadius: "6px",
                                  backgroundColor: "#fff",
                                  cursor: "pointer",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  fontSize: "14px",
                                  color: shippingForm.city ? "#000" : "#777",
                                }}
                              >
                                {shippingForm.city || "Select a City"}
                                <span
                                  style={{ fontSize: "12px", color: "#999" }}
                                >
                                  ▼
                                </span>
                              </div>

                              {isShippingCityOpen && (
                                <>
                                  <div
                                    style={{
                                      position: "fixed",
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      zIndex: 99,
                                    }}
                                    onClick={() => setIsShippingCityOpen(false)}
                                  />
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: "100%",
                                      left: 0,
                                      right: 0,
                                      backgroundColor: "#fff",
                                      border: "1px solid #e5e7eb",
                                      borderRadius: "6px",
                                      marginTop: "4px",
                                      maxHeight: "220px",
                                      overflowY: "auto",
                                      zIndex: 100,
                                      boxShadow:
                                        "0 4px 12px rgba(0, 0, 0, 0.1)",
                                    }}
                                  >
                                    <div
                                      style={{
                                        padding: "8px",
                                        position: "sticky",
                                        top: 0,
                                        backgroundColor: "#fff",
                                        borderBottom: "1px solid #eee",
                                      }}
                                    >
                                      <input
                                        type="text"
                                        placeholder="Search city..."
                                        value={shippingCitySearch}
                                        onChange={(e) =>
                                          setShippingCitySearch(e.target.value)
                                        }
                                        style={{
                                          width: "100%",
                                          padding: "8px",
                                          border: "1px solid #ddd",
                                          borderRadius: "4px",
                                          outline: "none",
                                          fontSize: "14px",
                                        }}
                                      />
                                    </div>
                                    {availableCities
                                      .filter((city) =>
                                        city
                                          .toLowerCase()
                                          .includes(
                                            shippingCitySearch.toLowerCase()
                                          )
                                      )
                                      .map((city, index) => (
                                        <div
                                          key={index}
                                          onClick={() => {
                                            handleShippingChange({
                                              target: {
                                                name: "city",
                                                value: city,
                                              },
                                            });
                                            setIsShippingCityOpen(false);
                                            setShippingCitySearch("");
                                          }}
                                          style={{
                                            padding: "10px 15px",
                                            cursor: "pointer",
                                            borderBottom: "1px solid #f9f9f9",
                                            fontSize: "14px",
                                          }}
                                          onMouseEnter={(e) =>
                                            (e.target.style.backgroundColor =
                                              "#f3f4f6")
                                          }
                                          onMouseLeave={(e) =>
                                            (e.target.style.backgroundColor =
                                              "#fff")
                                          }
                                        >
                                          {city}
                                        </div>
                                      ))}
                                    {availableCities.filter((c) =>
                                      c
                                        .toLowerCase()
                                        .includes(
                                          shippingCitySearch.toLowerCase()
                                        )
                                    ).length === 0 && (
                                      <div
                                        style={{
                                          padding: "10px 15px",
                                          fontSize: "13px",
                                          color: "#999",
                                          textAlign: "center",
                                        }}
                                      >
                                        No cities found
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                              {cityError && (
                                <div
                                  style={{
                                    color: "red",
                                    fontSize: "12px",
                                    marginTop: "5px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {cityError}
                                </div>
                              )}
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
                                </select>
                              </fieldset>
                            </div>

                            {/* --- CUSTOM BILLING CITY DROPDOWN --- */}
                            <div className="col-lg-6 col-md-12 col-12">
                              <fieldset style={{ position: "relative" }}>
                                <label className="label">City</label>
                                <div
                                  onClick={() =>
                                    setIsBillingCityOpen(!isBillingCityOpen)
                                  }
                                  style={{
                                    border: "1px solid #e5e7eb",
                                    padding: "12px 15px",
                                    borderRadius: "6px",
                                    backgroundColor: "#fff",
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    fontSize: "14px",
                                    color: billingForm.city ? "#000" : "#777",
                                  }}
                                >
                                  {billingForm.city || "Select a City"}
                                  <span
                                    style={{ fontSize: "12px", color: "#999" }}
                                  >
                                    ▼
                                  </span>
                                </div>
                                {isBillingCityOpen && (
                                  <>
                                    <div
                                      style={{
                                        position: "fixed",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        zIndex: 99,
                                      }}
                                      onClick={() =>
                                        setIsBillingCityOpen(false)
                                      }
                                    />
                                    <div
                                      style={{
                                        position: "absolute",
                                        top: "100%",
                                        left: 0,
                                        right: 0,
                                        backgroundColor: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "6px",
                                        marginTop: "4px",
                                        maxHeight: "220px",
                                        overflowY: "auto",
                                        zIndex: 100,
                                        boxShadow:
                                          "0 4px 12px rgba(0, 0, 0, 0.1)",
                                      }}
                                    >
                                      <div
                                        style={{
                                          padding: "8px",
                                          position: "sticky",
                                          top: 0,
                                          backgroundColor: "#fff",
                                          borderBottom: "1px solid #eee",
                                        }}
                                      >
                                        <input
                                          type="text"
                                          placeholder="Search city..."
                                          value={billingCitySearch}
                                          onChange={(e) =>
                                            setBillingCitySearch(e.target.value)
                                          }
                                          style={{
                                            width: "100%",
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px",
                                            outline: "none",
                                            fontSize: "14px",
                                          }}
                                        />
                                      </div>
                                      {availableCities
                                        .filter((city) =>
                                          city
                                            .toLowerCase()
                                            .includes(
                                              billingCitySearch.toLowerCase()
                                            )
                                        )
                                        .map((city, index) => (
                                          <div
                                            key={index}
                                            onClick={() => {
                                              handleBillingChange({
                                                target: {
                                                  name: "city",
                                                  value: city,
                                                },
                                              });
                                              setIsBillingCityOpen(false);
                                              setBillingCitySearch("");
                                            }}
                                            style={{
                                              padding: "10px 15px",
                                              cursor: "pointer",
                                              borderBottom: "1px solid #f9f9f9",
                                              fontSize: "14px",
                                            }}
                                            onMouseEnter={(e) =>
                                              (e.target.style.backgroundColor =
                                                "#f3f4f6")
                                            }
                                            onMouseLeave={(e) =>
                                              (e.target.style.backgroundColor =
                                                "#fff")
                                            }
                                          >
                                            {city}
                                          </div>
                                        ))}
                                      {availableCities.filter((c) =>
                                        c
                                          .toLowerCase()
                                          .includes(
                                            billingCitySearch.toLowerCase()
                                          )
                                      ).length === 0 && (
                                        <div
                                          style={{
                                            padding: "10px 15px",
                                            fontSize: "13px",
                                            color: "#999",
                                            textAlign: "center",
                                          }}
                                        >
                                          No cities found
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
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
                        disabled={!isShippingAvailable || hasZeroPriceItem}
                        className="checkout-page-btn minicart-btn btn-primary"
                        style={{
                          backgroundColor: hasZeroPriceItem
                            ? "#cccccc"
                            : "#407e18",
                          borderColor: hasZeroPriceItem ? "#cccccc" : "#407e18",
                          color: "#fff",
                          cursor:
                            !isShippingAvailable || hasZeroPriceItem
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            !isShippingAvailable || hasZeroPriceItem ? 0.6 : 1,
                        }}
                      >
                        {hasZeroPriceItem
                          ? "REMOVE ₹0.00 ITEMS"
                          : "PROCEED TO SHIPPING"}
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

                          // CRITICAL FIX: Pricing
                          const sellingPrice =
                            item.variant?.discountPrice > 0
                              ? item.variant.discountPrice
                              : item.variant?.price || item.product?.price || 0;
                          const originalPrice =
                            item.variant?.price || item.product?.price || 0;

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
                                    color: " #407e18",
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {originalPrice > sellingPrice && (
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
                                  )}
                                  ₹{sellingPrice.toFixed(2)}
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

                      {finalCGST > 0 && (
                        <div className="subtotal-item subtotal-box d-flex justify-content-between mb-2">
                          <h4
                            className="subtotal-title m-0"
                            style={{ fontSize: "14px", color: "#555" }}
                          >
                            GST
                          </h4>
                          <p
                            className="subtotal-value m-0"
                            style={{ fontSize: "14px", fontWeight: "500" }}
                          >
                            Included
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
                            color: " #407e18",
                          }}
                        >
                          ₹{total.toFixed(2)}
                        </p>
                      </div>

                      <div className="mt-4 checkout-promo-code">
                        {appliedCoupon.code ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "12px",
                              padding: "15px",
                              backgroundColor: "#fff5f5",
                              border: "1px dashed  #407e18",
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
                                    color: " #407e18",
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
                                backgroundColor: " #407e18",
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
                                (e.target.style.borderColor = " #407e18")
                              }
                              onBlur={(e) =>
                                (e.target.style.borderColor = "#e5e7eb")
                              }
                            />
                            <button
                              type="submit"
                              style={{
                                backgroundColor: " #407e18",
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
                        disabled={!isShippingAvailable || hasZeroPriceItem}
                        className="w-100 text-center"
                        style={{
                          backgroundColor: hasZeroPriceItem
                            ? "#cccccc"
                            : "#407e18",
                          color: "#fff",
                          padding: "14px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          border: "none",
                          cursor:
                            !isShippingAvailable || hasZeroPriceItem
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            !isShippingAvailable || hasZeroPriceItem ? 0.6 : 1,
                          width: "100%",
                          transition: "0.3s",
                          display: "block",
                          fontSize: "16px",
                        }}
                      >
                        {hasZeroPriceItem
                          ? "REMOVE ₹0.00 ITEMS"
                          : "PROCEED TO SHIPPING"}
                      </button>
                      <a
                        href="/cart"
                        className="w-100 text-center"
                        style={{
                          padding: "14px",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                          color: "#333",
                          fontWeight: "bold",
                          backgroundColor: "#407e18", // No !important needed now
                          color: "#fff",
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
