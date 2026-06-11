import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoCloseOutline } from "react-icons/io5";

const API_URL = "https://nbackend-31lg.onrender.com";

const CartSection = () => {
  const [cartData, setCartData] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  // State to prevent rapid double-clicking race conditions
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // SECURITY CHECK: Returns true if any item calculates to 0
  const hasZeroPriceItem = cartData.items.some((item) => {
    if (!item || !item.product) return false;
    const p = item.product || {};
    const v = item.variant || {};
    const originalPrice = Number(v.price) || Number(p.price) || 0;
    let sellingPrice =
      Number(v.discountPrice) || Number(p.discountPrice) || originalPrice;

    // Failsafe fallback
    if (sellingPrice === 0 && originalPrice > 0) {
      sellingPrice = originalPrice;
    }

    return sellingPrice <= 0;
  });

  // 🛡️ HELPER: Grab token explicitly for iOS bypass
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCart = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/cart`, {
        headers: getAuthHeader(), // 🛡️ Explicit Token Injection
        withCredentials: true,
      });
      setCartData(data || { items: [] });
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId, action, currentQty, maxStock) => {
    // 1. Prevent incrementing beyond stock limit
    if (action === "increment" && currentQty >= maxStock) {
      return;
    }

    // 2. Prevent decrementing below 1
    if (action === "decrement" && currentQty <= 1) {
      return;
    }

    try {
      setUpdatingItemId(itemId);
      await axios.put(
        `${API_URL}/api/cart/update/${itemId}`,
        { action },
        {
          headers: getAuthHeader(), // 🛡️ Explicit Token Injection
          withCredentials: true,
        }
      );
      await fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Failed to update quantity", error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      setUpdatingItemId(itemId);
      await axios.delete(`${API_URL}/api/cart/remove/${itemId}`, {
        headers: getAuthHeader(), // 🛡️ Explicit Token Injection
        withCredentials: true,
      });
      await fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Failed to remove item", error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  // CRITICAL FIX: Calculate subtotal using the exact DISCOUNTED selling price
  const calculateSubtotal = () => {
    return cartData.items.reduce((total, item) => {
      // Skip calculating deleted/ghost products
      if (!item || !item.product) return total;

      const sellingPrice =
        item.variant?.discountPrice > 0
          ? item.variant.discountPrice
          : item.variant?.price || item.product?.price || 0;
      return total + sellingPrice * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const total = subtotal;

  return (
    <>
      <style>
        {`
          /* Custom CSS for Mobile Cart Cards */
          .mobile-cart-card {
            background: #fff;
            border: 1px solid #eaeaea;
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.03);
            position: relative;
          }
          .mobile-remove-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            color: #999;
            font-size: 22px;
            cursor: pointer;
            transition: 0.2s;
          }
          .mobile-remove-btn:hover {
            color: #407e18;
          }
          .quantity-pill {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border: 1px solid #ddd;
            border-radius: 50px;
            padding: 4px 10px;
            background-color: #fff;
            width: 90px;
          }
          .quantity-pill button {
            background: none;
            border: none;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            color: #333;
          }
          .quantity-pill button:disabled {
            color: #ccc;
            cursor: not-allowed;
          }
          
          /* Hide table on mobile, show cards. Hide cards on desktop, show table. */
          @media (max-width: 768px) {
            .desktop-cart-table { display: none; }
            .mobile-cart-view { display: block; }
          }
          @media (min-width: 769px) {
            .desktop-cart-table { display: block; }
            .mobile-cart-view { display: none; }
          }
        `}
      </style>

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
            <li style={{ color: "#777" }}>Cart</li>
          </ul>
        </div>
      </div>

      <main id="MainContent" className="content-for-layout">
        <div className="cart-page mt-100 mb-100">
          <div className="container">
            {loading ? (
              <div className="text-center py-5">Loading Cart...</div>
            ) : cartData.items.length === 0 ? (
              <div className="text-center py-5">
                <h3 className="mb-4">Your cart is empty</h3>
                <a
                  href="/shop"
                  className="btn-primary text-uppercase px-5 py-3"
                  style={{
                    textDecoration: "none",
                    backgroundColor: "#407e18",
                    color: "#fff",
                    borderRadius: "5px",
                    fontWeight: "600",
                    transition: "0.3s",
                  }}
                >
                  Continue Shopping
                </a>
              </div>
            ) : (
              <div className="cart-page-wrapper">
                <div className="row">
                  <div className="col-lg-7 col-md-12 col-12">
                    {/* --- DESKTOP TABLE VIEW --- */}
                    <div className="desktop-cart-table">
                      <table className="cart-table w-100">
                        <thead>
                          <tr>
                            <th
                              className="cart-caption heading_18"
                              style={{ width: "50px" }}
                            ></th>
                            <th className="cart-caption heading_18">Product</th>
                            <th className="cart-caption heading_18"></th>
                            <th className="cart-caption text-center heading_18 d-none d-md-table-cell">
                              Quantity
                            </th>
                            <th className="cart-caption text-end heading_18">
                              Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartData.items.map((item) => {
                            if (!item || !item._id || !item.product)
                              return null;
                            const title = item.product?.title || "Product";
                            const variantTitle = item.variant
                              ? item.variant.title
                              : "";
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
                                : item.variant?.price ||
                                  item.product?.price ||
                                  0;
                            const originalPrice =
                              item.variant?.price || item.product?.price || 0;

                            const maxStock =
                              item.variant?.stock || item.product?.stock || 0;
                            const currentQty = item.quantity;
                            const isUpdating = updatingItemId === item._id;

                            return (
                              <tr className="cart-item" key={item._id}>
                                <td
                                  className="cart-item-remove"
                                  style={{ verticalAlign: "middle" }}
                                >
                                  <button
                                    onClick={() => handleRemove(item._id)}
                                    disabled={isUpdating}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "#999",
                                      transition: "0.3s",
                                      fontSize: "22px",
                                      display: "flex",
                                      alignItems: "center",
                                      cursor: isUpdating
                                        ? "not-allowed"
                                        : "pointer",
                                      opacity: isUpdating ? 0.5 : 1,
                                    }}
                                    onMouseOver={(e) =>
                                      !isUpdating &&
                                      (e.currentTarget.style.color = "#407e18")
                                    }
                                    onMouseOut={(e) =>
                                      !isUpdating &&
                                      (e.currentTarget.style.color = "#999")
                                    }
                                  >
                                    <IoCloseOutline />
                                  </button>
                                </td>
                                <td className="cart-item-media">
                                  <div
                                    className="mini-img-wrapper"
                                    style={{
                                      width: "80px",
                                      height: "80px",
                                      overflow: "hidden",
                                      borderRadius: "8px",
                                    }}
                                  >
                                    <img
                                      className="mini-img"
                                      src={displayImg}
                                      alt="img"
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </div>
                                </td>
                                <td className="cart-item-details">
                                  <h2
                                    className="product-title"
                                    style={{
                                      fontSize: "16px",
                                      marginBottom: "5px",
                                    }}
                                  >
                                    <a
                                      href={`/product/${item.product?._id}`}
                                      style={{
                                        color: "#111",
                                        textDecoration: "none",
                                      }}
                                    >
                                      {title}
                                    </a>
                                  </h2>
                                  <p
                                    className="product-vendor"
                                    style={{
                                      fontSize: "13px",
                                      color: "#888",
                                      margin: 0,
                                    }}
                                  >
                                    {variantTitle}
                                  </p>
                                </td>
                                <td className="cart-item-quantity text-center">
                                  <div
                                    className="quantity d-flex align-items-center justify-content-between mx-auto"
                                    style={{
                                      maxWidth: "100px",
                                      border: "1px solid #ddd",
                                      borderRadius: "50px",
                                      padding: "5px 10px",
                                      backgroundColor: "#fff",
                                    }}
                                  >
                                    <button
                                      onClick={() =>
                                        handleUpdateQuantity(
                                          item._id,
                                          "decrement",
                                          currentQty,
                                          maxStock
                                        )
                                      }
                                      disabled={currentQty <= 1 || isUpdating}
                                      style={{
                                        background: "none",
                                        border: "none",
                                        cursor:
                                          currentQty <= 1 || isUpdating
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity:
                                          currentQty <= 1 || isUpdating
                                            ? 0.4
                                            : 1,
                                      }}
                                    >
                                      -
                                    </button>
                                    <span
                                      style={{
                                        fontWeight: "600",
                                        minWidth: "20px",
                                        textAlign: "center",
                                        opacity: isUpdating ? 0.5 : 1,
                                      }}
                                    >
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleUpdateQuantity(
                                          item._id,
                                          "increment",
                                          currentQty,
                                          maxStock
                                        )
                                      }
                                      disabled={
                                        currentQty >= maxStock || isUpdating
                                      }
                                      style={{
                                        background: "none",
                                        border: "none",
                                        cursor:
                                          currentQty >= maxStock || isUpdating
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity:
                                          currentQty >= maxStock || isUpdating
                                            ? 0.4
                                            : 1,
                                      }}
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="cart-item-price text-end">
                                  <div className="product-price fw-bold text-dark">
                                    {originalPrice > sellingPrice && (
                                      <span
                                        style={{
                                          textDecoration: "line-through",
                                          color: "#999",
                                          marginRight: "6px",
                                          fontSize: "14px",
                                          fontWeight: "normal",
                                        }}
                                      >
                                        ₹
                                        {(
                                          originalPrice * item.quantity
                                        ).toFixed(2)}
                                      </span>
                                    )}
                                    ₹{(sellingPrice * item.quantity).toFixed(2)}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* --- MOBILE CARD VIEW --- */}
                    <div className="mobile-cart-view">
                      {cartData.items.map((item) => {
                        if (!item || !item._id || !item.product) return null;
                        const title = item.product?.title || "Product";
                        const variantTitle = item.variant
                          ? item.variant.title
                          : "";
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
                            : item.product?.discountPrice > 0 // Added product-level discount check
                            ? item.product.discountPrice
                            : item.variant?.price || item.product?.price || 0;
                        const originalPrice =
                          item.variant?.price || item.product?.price || 0;

                        const maxStock =
                          item.variant?.stock || item.product?.stock || 0;
                        const currentQty = item.quantity;
                        const isUpdating = updatingItemId === item._id;

                        return (
                          <div
                            className="mobile-cart-card"
                            key={`mobile-${item._id}`}
                          >
                            <button
                              className="mobile-remove-btn"
                              onClick={() => handleRemove(item._id)}
                              disabled={isUpdating}
                              style={{
                                opacity: isUpdating ? 0.5 : 1,
                                cursor: isUpdating ? "not-allowed" : "pointer",
                              }}
                            >
                              <IoCloseOutline />
                            </button>
                            <div className="d-flex align-items-center">
                              <img
                                src={displayImg}
                                alt="img"
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                }}
                              />
                              <div className="ms-3 flex-grow-1 pe-3">
                                <a
                                  href={`/product/${item.product?._id}`}
                                  style={{
                                    color: "#111",
                                    textDecoration: "none",
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    display: "block",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {title}
                                </a>
                                <p
                                  style={{
                                    fontSize: "12px",
                                    color: "#888",
                                    margin: "0 0 10px 0",
                                  }}
                                >
                                  {variantTitle}
                                </p>

                                <div className="d-flex justify-content-between align-items-center">
                                  <div
                                    className="quantity-pill"
                                    style={{ opacity: isUpdating ? 0.6 : 1 }}
                                  >
                                    <button
                                      onClick={() =>
                                        handleUpdateQuantity(
                                          item._id,
                                          "decrement",
                                          currentQty,
                                          maxStock
                                        )
                                      }
                                      disabled={currentQty <= 1 || isUpdating}
                                    >
                                      -
                                    </button>
                                    <span
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: "600",
                                      }}
                                    >
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleUpdateQuantity(
                                          item._id,
                                          "increment",
                                          currentQty,
                                          maxStock
                                        )
                                      }
                                      disabled={
                                        currentQty >= maxStock || isUpdating
                                      }
                                    >
                                      +
                                    </button>
                                  </div>
                                  <div
                                    className="fw-bold"
                                    style={{
                                      color: "#407e18",
                                      fontSize: "16px",
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
                                          display: "block",
                                          textAlign: "right",
                                        }}
                                      >
                                        ₹
                                        {(
                                          originalPrice * item.quantity
                                        ).toFixed(2)}
                                      </span>
                                    )}
                                    ₹{(sellingPrice * item.quantity).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="col-lg-5 col-md-12 col-12">
                    <div className="cart-total-area shadow-sm p-4 rounded bg-white">
                      <h3 className="cart-total-title mb-4 pb-3 border-bottom">
                        Cart Totals
                      </h3>
                      <div className="cart-total-box mt-4">
                        <div className="subtotal-item d-flex justify-content-between mb-3">
                          <h4
                            className="subtotal-title m-0"
                            style={{ fontSize: "16px" }}
                          >
                            Subtotals:
                          </h4>
                          <p className="subtotal-value m-0 fw-bold">
                            ₹{subtotal.toFixed(2)}
                          </p>
                        </div>

                        <hr />
                        <div className="subtotal-item d-flex justify-content-between mb-4">
                          <h4
                            className="subtotal-title m-0"
                            style={{
                              fontSize: "18px",
                              fontWeight: "800",
                              color: "#407e18",
                            }}
                          >
                            Total:
                          </h4>
                          <p
                            className="subtotal-value m-0"
                            style={{
                              fontSize: "18px",
                              fontWeight: "800",
                              color: "#407e18",
                            }}
                          >
                            ₹{total.toFixed(2)}
                          </p>
                        </div>
                        <p
                          className="shipping_text text-muted text-center"
                          style={{ fontSize: "12px" }}
                        >
                          Shipping & taxes calculated at checkout
                        </p>
                        <div className="d-flex justify-content-center mt-4">
                          <a
                            href={hasZeroPriceItem ? "#" : "/checkout"}
                            onClick={(e) => {
                              if (hasZeroPriceItem) {
                                e.preventDefault();
                                alert(
                                  "Checkout is disabled because an item in your cart has a ₹0.00 price. Please remove it to proceed."
                                );
                              }
                            }}
                            className="btn btn-primary w-100 py-3 text-uppercase"
                            style={{
                              backgroundColor: hasZeroPriceItem
                                ? "#cccccc"
                                : "#407e18",
                              border: "none",
                              borderRadius: "50px",
                              fontWeight: "600",
                              cursor: hasZeroPriceItem
                                ? "not-allowed"
                                : "pointer",
                            }}
                          >
                            Proceed to Checkout
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default CartSection;
