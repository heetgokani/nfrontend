import React, { useState, useEffect, useMemo, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { IoHeartCircleOutline, IoHeartCircle } from "react-icons/io5";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const getCssColor = (colorName) => {
  if (!colorName) return "transparent";
  const lower = String(colorName).toLowerCase();
  if (lower === "navy blue") return "#000080";
  if (lower === "light pink") return "#FFB6C1";
  return lower.replace(/\s/g, "");
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // --- RESPONSIVE STATE ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initialVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    return product.variants.find((v) => v.isDefault) || product.variants[0];
  }, [product]);

  const [selectedVariant, setSelectedVariant] = useState(initialVariant);
  const [isHovered, setIsHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);

  const [ratingInfo, setRatingInfo] = useState({ average: 0, count: 0 });

  useEffect(() => {
    if (selectedVariant?._id) {
      const fetchRating = async () => {
        try {
          const res = await axios.get(
            `https://demo-backend-k0yn.onrender.com/api/reviews/${selectedVariant._id}`
          );
          setRatingInfo({
            average: res.data.averageRating || 0,
            count: res.data.count || 0,
          });
        } catch (err) {
          console.error("Error fetching card rating", err);
        }
      };
      fetchRating();
    }
  }, [selectedVariant?._id]);

  useEffect(() => {
    if (user && product?._id) {
      axios
        .get("https://demo-backend-k0yn.onrender.com/api/wishlist", {
          withCredentials: true,
        })
        .then((res) => {
          const items = res.data?.items || [];
          const foundItem = items.find(
            (item) =>
              (item.product?._id === product._id ||
                item.product === product._id) &&
              (!selectedVariant ||
                item.variant?._id === selectedVariant._id ||
                item.variant === selectedVariant._id)
          );

          if (foundItem) {
            setWishlisted(true);
            setWishlistItemId(foundItem._id);
          } else {
            setWishlisted(false);
            setWishlistItemId(null);
          }
        })
        .catch((err) => console.error("Wishlist check error", err));
    } else {
      setWishlisted(false);
    }
  }, [user, product?._id, selectedVariant?._id]);

  const renderStars = (rating) => {
    const stars = [];
    const starSize = isMobile ? 10 : 12; // Smaller stars on mobile
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} size={starSize} color="#ffc107" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<FaStarHalfAlt key={i} size={starSize} color="#ffc107" />);
      } else {
        stars.push(<FaRegStar key={i} size={starSize} color="#ffc107" />);
      }
    }
    return stars;
  };

  const colorOptions = useMemo(() => {
    if (!product?.variants) return [];
    const colors = new Map();
    product.variants.forEach((v) => {
      const colorAttr = v.attributes?.find(
        (a) => a.name.toLowerCase() === "color"
      );
      if (colorAttr && !colors.has(colorAttr.value)) {
        colors.set(colorAttr.value, v);
      }
    });
    return Array.from(colors.entries()).map(([color, variant]) => ({
      color,
      variant,
    }));
  }, [product]);

  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/300";
    if (path.startsWith("http")) return path;
    return `https://demo-backend-k0yn.onrender.com${path}`;
  };

  const originalPrice = Number(
    selectedVariant?.price ||
      selectedVariant?.originalPrice ||
      product?.price ||
      0
  );

  const discountPrice = Number(selectedVariant?.discountPrice || 0);
  const isSale = discountPrice > 0 && discountPrice < originalPrice;
  const currentPrice = isSale ? discountPrice : originalPrice;

  const displayImg = getImageUrl(
    selectedVariant?.images?.[0] || product?.thumbnail
  );

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        "https://demo-backend-k0yn.onrender.com/api/cart/add",
        {
          productId: product._id,
          variantId: selectedVariant?._id || null,
          quantity: 1,
        },
        { withCredentials: true }
      );
      toast.success("Added to Cart!");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      toast.error("Error adding to cart");
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      if (!wishlisted) {
        const res = await axios.post(
          "https://demo-backend-k0yn.onrender.com/api/wishlist/add",
          {
            productId: product._id,
            variantId: selectedVariant?._id || null,
          },
          { withCredentials: true }
        );
        setWishlisted(true);
        const newItem = res.data.wishlist?.items?.find(
          (i) => i.product === product._id && i.variant === selectedVariant?._id
        );
        if (newItem) setWishlistItemId(newItem._id);

        toast.success("Added to Wishlist!");
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        if (wishlistItemId) {
          await axios.delete(
            `https://demo-backend-k0yn.onrender.com/api/wishlist/remove/${wishlistItemId}`,
            { withCredentials: true }
          );
          setWishlisted(false);
          setWishlistItemId(null);
          toast.info("Removed from Wishlist");
          window.dispatchEvent(new Event("wishlistUpdated"));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating wishlist");
    }
  };

  return (
    <div
      className="product-card"
      style={{
        borderRadius: isMobile ? "12px" : "20px",
        border: "1px solid #e0e0e0",
        boxShadow: isHovered
          ? "0 12px 30px rgba(0,0,0,0.08)"
          : "0 4px 15px rgba(0,0,0,0.03)",
        overflow: "hidden",
        background: "#fff",
        transition: "0.3s",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NavLink
        to={`/product/${product?._id}`}
        style={{
          height: isMobile ? "160px" : "220px", // Smaller image area on mobile
          padding: isMobile ? "10px" : "15px",
          flexShrink: 0,
        }}
      >
        <img
          src={displayImg}
          alt={product?.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain", // CHANGED TO CONTAIN SO SHOE IS NOT CUT
            borderRadius: isMobile ? "8px" : "14px",
            backgroundColor: "#f6f6f6", // Added slight background to frame contain mode well
          }}
        />
      </NavLink>

      <div
        style={{
          padding: isMobile ? "10px" : "15px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: "4px",
            visibility: ratingInfo.count === 0 ? "hidden" : "visible",
          }}
        >
          <div style={{ display: "flex" }}>
            {renderStars(ratingInfo.average)}
          </div>
          <span
            style={{
              fontSize: isMobile ? "10px" : "12px",
              color: "#555",
              fontWeight: "600",
            }}
          >
            {Number(ratingInfo.average).toFixed(1)}
          </span>
        </div>

        <NavLink
          to={`/product/${product?._id}`}
          style={{
            fontSize: isMobile ? "13px" : "16px", // Smaller title on mobile
            fontWeight: "600",
            color: "#111",
            textDecoration: "none",
            marginBottom: "4px",
            wordWrap: "break-word",
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
            overflow: "hidden", // Ensures long titles don't break layout
          }}
        >
          {product?.title}
        </NavLink>

        <div
          style={{
            fontSize: isMobile ? "9px" : "11px",
            color: "#888",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          {product?.brand?.name || product?.brand}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: isMobile ? "4px" : "8px",
            marginBottom: isMobile ? "6px" : "10px",
          }}
        >
          <span
            style={{
              fontSize: isMobile ? "14px" : "17px",
              fontWeight: "700",
            }}
          >
            ₹{currentPrice.toFixed(2)}
          </span>
          {isSale && (
            <span
              style={{
                fontSize: isMobile ? "10px" : "12px",
                textDecoration: "line-through",
                color: "#999",
              }}
            >
              ₹{originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {colorOptions.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginBottom: isMobile ? "8px" : "10px",
            }}
          >
            {colorOptions.map(({ color, variant }, idx) => {
              const isSelected = selectedVariant?._id === variant._id;
              const cssColor = variant.colorHex || getCssColor(color);
              const isWhite =
                cssColor === "white" ||
                cssColor === "#ffffff" ||
                cssColor === "#fff";
              const dotSize = isMobile ? "14px" : "18px"; // Smaller dots on mobile
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedVariant(variant)}
                  style={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: "50%",
                    backgroundColor: cssColor,
                    cursor: "pointer",
                    border: isWhite
                      ? "1px solid #ccc"
                      : "1px solid transparent",
                    boxShadow: isSelected
                      ? "0 0 0 2px #fff, 0 0 0 3px #000"
                      : "none",
                  }}
                  title={color}
                />
              );
            })}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: isMobile ? "4px" : "8px",
            marginTop: "auto",
            width: "100%",
            alignItems: "center",
          }}
        >
          <button
            onClick={handleWishlist}
            style={{
              width: isMobile ? "32px" : "42px", // Smaller button on mobile
              height: isMobile ? "32px" : "42px",
              flexShrink: 0,
              borderRadius: "5px",
              background: "#fff",
              border: "1px solid #ddd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
          >
            {wishlisted ? (
              <IoHeartCircle size={isMobile ? 22 : 28} color="#de433f" />
            ) : (
              <IoHeartCircleOutline size={isMobile ? 22 : 28} color="#999" />
            )}
          </button>

          <button
            onClick={handleAddToCart}
            disabled={selectedVariant?.stock === 0}
            style={{
              flex: 1,
              height: isMobile ? "32px" : "42px", // Smaller button on mobile
              borderRadius: "5px",
              border: "none",
              background: "#de433f",
              color: "#fff",
              fontWeight: "600",
              fontSize: isMobile ? "11px" : "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "0.2s",
              cursor: selectedVariant?.stock === 0 ? "not-allowed" : "pointer",
              opacity: selectedVariant?.stock === 0 ? 0.7 : 1,
              padding: "0 5px", // Prevents text cutoff
            }}
          >
            {selectedVariant?.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
