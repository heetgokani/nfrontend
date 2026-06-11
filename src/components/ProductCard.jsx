import React, { useState, useEffect, useMemo, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  IoHeartOutline,
  IoHeart,
  IoEyeOutline,
  IoCartOutline,
  IoCheckmarkCircle,
  IoInformationCircle,
  IoCloseCircle,
} from "react-icons/io5";
import axios from "axios";
// ✅ CHANGED: Swapped react-toastify for your custom un-stackable toast
import { bntToast as toast } from "../components/BntToastify";
import { AuthContext } from "../context/AuthContext";

// --- RESPONSIVE CSS INJECTION ---
// This ensures media queries work perfectly without needing an external CSS file.
let stylesInjected = false;
const injectStyles = () => {
  if (typeof window !== "undefined" && !stylesInjected) {
    const style = document.createElement("style");
    style.innerHTML = `
      .nikam-pc-wrapper {
        background: #fff;
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 12px;
        border: 1px solid #eaeaea;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      }
      .nikam-pc-img-container {
        position: relative;
        aspect-ratio: 1 / 1;
        width: 100%;
        margin-bottom: 12px;
        background: #f8f8f8;
        border-radius: 6px;
        overflow: hidden;
      }
      .nikam-pc-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }
      .nikam-pc-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        background: #3c7d24;
        color: #fff;
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 700;
        border-radius: 4px;
        z-index: 2;
      }
      .nikam-pc-actions {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 2;
      }
      .nikam-pc-btn {
        background: #fff;
        border: none;
        padding: 8px;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #1a201a;
        font-size: 20px; /* Controls icon size */
        transition: transform 0.2s ease;
      }
      .nikam-pc-btn:hover {
        transform: scale(1.05);
      }
      .nikam-pc-info {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .nikam-pc-title {
        font-size: 15px;
        font-weight: 600;
        color: #1a201a;
        margin-bottom: 8px;
        line-height: 1.3;
      }
      .nikam-pc-price-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: auto;
        flex-wrap: wrap;
      }
      .nikam-pc-current-price {
        font-size: 17px;
        font-weight: 700;
        color: #3c7d24;
      }
      .nikam-pc-old-price {
        font-size: 13px;
        text-decoration: line-through;
        color: #999;
      }

      /* --- MOBILE RESPONSIVENESS --- */
      @media (max-width: 576px) {
        .nikam-pc-wrapper {
          padding: 8px; /* Tighter padding on mobile to maximize card space */
        }
        .nikam-pc-img-container {
          aspect-ratio: 4 / 5; /* Taller aspect ratio makes the image noticeably larger on narrow screens */
          margin-bottom: 8px;
        }
        .nikam-pc-badge {
          top: 6px;
          left: 6px;
          padding: 3px 5px;
          font-size: 9px;
        }
        .nikam-pc-actions {
          top: 6px;
          right: 6px;
          gap: 5px;
        }
        .nikam-pc-btn {
          padding: 6px; /* Shrinks the button padding */
          font-size: 15px; /* Shrinks the icons cleanly */
        }
        .nikam-pc-title {
          font-size: 13px; /* Scales down title */
          margin-bottom: 4px;
        }
        .nikam-pc-current-price {
          font-size: 14px; /* Scales down price */
        }
        .nikam-pc-old-price {
          font-size: 11px;
        }
        .nikam-pc-price-row {
          gap: 4px;
        }
      }
    `;
    document.head.appendChild(style);
    stylesInjected = true;
  }
};

const ProductCard = ({ product }) => {
  injectStyles(); // Ensures CSS is loaded

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const initialVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    return product.variants.find((v) => v.isDefault) || product.variants[0];
  }, [product]);

  const [selectedVariant] = useState(initialVariant);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);

  // Price Logic
  const originalPrice = Number(selectedVariant?.price || product?.price || 0);
  const discountPrice = Number(selectedVariant?.discountPrice || 0);
  const isSale = discountPrice > 0 && discountPrice < originalPrice;
  const discountPercent = isSale
    ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    : 0;
  const currentPrice = isSale ? discountPrice : originalPrice;

  // --- LOCAL INLINE TOAST STYLES ---
  const baseToastOptions = {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: true,
    closeButton: false,
    icon: false,
  };

  const toastStyles = {
    success: {
      style: {
        background: "#f2f7f2",
        color: "#0a2612",
        border: "1px solid rgba(64, 126, 24, 0.2)",
        borderRadius: "50px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
        padding: "10px 20px",
        minHeight: "44px",
        fontFamily: "'Outfit', sans-serif",
        fontSize: "14px",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
      },
    },
    info: {
      style: {
        background: "#f4f4f5",
        color: "#18181b",
        border: "1px solid rgba(24, 24, 27, 0.15)",
        borderRadius: "50px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
        padding: "10px 20px",
        minHeight: "44px",
        fontFamily: "'Outfit', sans-serif",
        fontSize: "14px",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
      },
    },
    error: {
      style: {
        background: "#fff3f3",
        color: "#8c1d1d",
        border: "1px solid rgba(222, 67, 63, 0.2)",
        borderRadius: "50px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
        padding: "10px 20px",
        minHeight: "44px",
        fontFamily: "'Outfit', sans-serif",
        fontSize: "14px",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
      },
    },
  };

  // --- WISH LIST LOGIC ---
  useEffect(() => {
    if (user && product?._id) {
      axios
        .get("http://localhost:5000/api/wishlist", {
          withCredentials: true,
        })
        .then((res) => {
          const items = res.data?.items || [];
          const foundItem = items.find(
            (item) =>
              item.product?._id === product?._id ||
              item.product === product?._id,
          );
          if (foundItem) {
            setWishlisted(true);
            setWishlistItemId(foundItem._id);
          } else {
            setWishlisted(false);
            setWishlistItemId(null);
          }
        })
        .catch(console.error);
    }
  }, [user, product?._id]);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      if (!wishlisted) {
        const res = await axios.post(
          "http://localhost:5000/api/wishlist/add",
          { productId: product?._id, variantId: selectedVariant?._id || null },
          { withCredentials: true },
        );
        setWishlisted(true);
        const newItem = res.data.wishlist?.items?.find(
          (i) => i.product === product?._id,
        );
        if (newItem) setWishlistItemId(newItem._id);

        toast.success(
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IoCheckmarkCircle size={18} color="#3c7d24" />
            <span>Added to Wishlist!</span>
          </div>,
          { ...baseToastOptions, ...toastStyles.success },
        );
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        if (wishlistItemId) {
          await axios.delete(
            `http://localhost:5000/api/wishlist/remove/${wishlistItemId}`,
            { withCredentials: true },
          );
          setWishlisted(false);
          setWishlistItemId(null);

          toast.info(
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IoInformationCircle size={18} color="#18181b" />
              <span>Removed from Wishlist</span>
            </div>,
            { ...baseToastOptions, ...toastStyles.info },
          );
          window.dispatchEvent(new Event("wishlistUpdated"));
        }
      }
    } catch (err) {
      toast.error(
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IoCloseCircle size={18} color="#de433f" />
          <span>Error updating wishlist</span>
        </div>,
        { ...baseToastOptions, ...toastStyles.error },
      );
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/cart/add",
        {
          productId: product?._id,
          variantId: selectedVariant?._id || null,
          quantity: 1,
        },
        { withCredentials: true },
      );

      toast.success(
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IoCheckmarkCircle size={18} color="#3c7d24" />
          <span>Added to Cart!</span>
        </div>,
        { ...baseToastOptions, ...toastStyles.success },
      );
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      toast.error(
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IoCloseCircle size={18} color="#de433f" />
          <span>Error adding to cart</span>
        </div>,
        { ...baseToastOptions, ...toastStyles.error },
      );
    }
  };

  const getImageUrl = (path) =>
    !path
      ? "https://via.placeholder.com/400"
      : path.startsWith("http")
        ? path
        : `http://localhost:5000${path}`;

  return (
    <div className="nikam-pc-wrapper">
      {/* Image Area */}
      <div className="nikam-pc-img-container">
        <NavLink
          to={`/product/${product?._id}`}
          style={{ display: "block", height: "100%" }}
        >
          <img
            src={getImageUrl(
              selectedVariant?.images?.[0] || product?.thumbnail,
            )}
            alt={product?.title}
            className="nikam-pc-img"
          />
        </NavLink>

        {isSale && <div className="nikam-pc-badge">{discountPercent}% OFF</div>}

        {/* Action Buttons */}
        <div className="nikam-pc-actions">
          <button onClick={handleAddToCart} className="nikam-pc-btn">
            {/* size prop removed - inherits from CSS font-size */}
            <IoCartOutline />
          </button>

          <button onClick={handleWishlist} className="nikam-pc-btn">
            {wishlisted ? <IoHeart color="#de433f" /> : <IoHeartOutline />}
          </button>

          <NavLink to={`/product/${product?._id}`} className="nikam-pc-btn">
            <IoEyeOutline />
          </NavLink>
        </div>
      </div>

      {/* Product Info */}
      <div className="nikam-pc-info">
        <div className="nikam-pc-title">{product?.title}</div>
        <div className="nikam-pc-price-row">
          <span className="nikam-pc-current-price">
            ₹{currentPrice.toFixed(2)}
          </span>
          {isSale && (
            <span className="nikam-pc-old-price">
              ₹{originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
