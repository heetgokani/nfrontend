import React, { useState, useEffect, useMemo, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiLock,
  FiTruck,
  FiShield,
  FiChevronRight,
  FiAlertCircle,
  FiShoppingBag,
  FiCheck,
  FiMapPin,
} from "react-icons/fi";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
// Custom Unstackable Toast
import { bntToast as toast } from "../components/BntToastify";

const ProductSection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [currentImage, setCurrentImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [globalAttributes, setGlobalAttributes] = useState([]);

  // Review State
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    averageRating: 0,
    count: 0,
    ratingStats: {},
  });

  // City Delivery Check States
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [deliveryMsg, setDeliveryMsg] = useState("");

  // Toast Style Declarations Mapping
  const toastStyles = {
    success: {
      style: {
        background: "#f2f7f2",
        color: "#0a2612",
        border: "1px solid rgba(64, 126, 24, 0.2)",
        borderRadius: "50px",
        padding: "12px 24px",
        fontSize: "15px",
        fontFamily: "var(--font-sans, 'Poppins', sans-serif)",
        fontWeight: "600",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      },
    },
    error: {
      style: {
        background: "#fff3f3",
        color: "#8c1d1d",
        border: "1px solid rgba(222, 67, 63, 0.2)",
        borderRadius: "50px",
        padding: "12px 24px",
        fontSize: "15px",
        fontFamily: "var(--font-sans, 'Poppins', sans-serif)",
        fontWeight: "600",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      },
    },
    info: {
      style: {
        background: "#f4f4f5",
        color: "#18181b",
        border: "1px solid rgba(24, 24, 27, 0.15)",
        borderRadius: "50px",
        padding: "12px 24px",
        fontSize: "15px",
        fontFamily: "var(--font-sans, 'Poppins', sans-serif)",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      },
    },
    warning: {
      style: {
        background: "#fffbf0",
        color: "#856404",
        border: "1px solid rgba(255, 238, 186, 0.5)",
        borderRadius: "50px",
        padding: "12px 24px",
        fontSize: "15px",
        fontFamily: "var(--font-sans, 'Poppins', sans-serif)",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      },
    },
  };

  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/600";
    if (path.startsWith("http")) return path;
    return `https://nikam-ecom-backend.onrender.com${path}`;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} />);
      } else if (i - 0.5 <= rating) {
        stars.push(<FaStarHalfAlt key={i} />);
      } else {
        stars.push(<FaRegStar key={i} />);
      }
    }
    return stars;
  };

  // FETCH SHIPPING DATA
  useEffect(() => {
    axios
      .get("https://nikam-ecom-backend.onrender.com/api/shipping/all")
      .then((res) => setShippingMethods(res.data.methods || []))
      .catch((err) => console.error("Error fetching shipping methods", err));
  }, []);

  // FETCH SPECIFIC PRODUCT DETAILS
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);

        const [res, attrRes] = await Promise.all([
          axios.get(
            `https://nikam-ecom-backend.onrender.com/api/products/${id}`
          ),
          axios.get(`https://nikam-ecom-backend.onrender.com/api/attributes`),
        ]);

        setGlobalAttributes(attrRes.data);
        const { product: prodData, variants: varData } = res.data;
        const fullProduct = { ...prodData, variants: varData };
        setProduct(fullProduct);

        if (varData && varData.length > 0) {
          const defVar = varData.find((v) => v.isDefault) || varData[0];
          setSelectedVariant(defVar);
          const initialAttrs = {};
          (defVar.attributes || []).forEach((attr) => {
            initialAttrs[attr.name] = attr.value;
          });
          setSelectedAttributes(initialAttrs);
          const variantImages = defVar.images?.filter((img) => img) || [];
          setCurrentImage(
            variantImages.length > 0 ? variantImages[0] : prodData.thumbnail
          );
        } else {
          setCurrentImage(prodData.thumbnail);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching specific product:", error);
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  // FETCH VARIANT SPECIFIC REVIEWS
  useEffect(() => {
    if (selectedVariant?._id) {
      const fetchReviews = async () => {
        try {
          const res = await axios.get(
            `https://nikam-ecom-backend.onrender.com/api/reviews/${selectedVariant._id}`
          );
          setReviewsData(res.data);
        } catch (err) {
          console.error("Error fetching reviews", err);
        }
      };
      fetchReviews();
    }
  }, [selectedVariant?._id]);

  const availableOptions = useMemo(() => {
    const options = {};
    if (!product?.variants) return options;
    product.variants.forEach((v) => {
      (v.attributes || []).forEach((attr) => {
        if (!options[attr.name]) options[attr.name] = new Set();
        options[attr.name].add(attr.value);
      });
    });
    Object.keys(options).forEach((k) => {
      options[k] = Array.from(options[k]);
      if (k.toLowerCase() === "size") {
        options[k].sort((a, b) => {
          const numA = parseFloat(a);
          const numB = parseFloat(b);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return String(a).localeCompare(String(b));
        });
      }
    });
    return options;
  }, [product]);

  const getHexForColor = (colorName) => {
    if (!product?.variants) return colorName;
    const variant = product.variants.find((v) =>
      v.attributes?.some(
        (a) => a.name.toLowerCase() === "color" && a.value === colorName
      )
    );
    if (variant?.colorHex) return variant.colorHex;
    const lower = String(colorName).toLowerCase();
    if (lower === "navy blue") return "#000080";
    if (lower === "light pink") return "#FFB6C1";
    return lower.replace(/\s/g, "");
  };

  const handleAttributeSelect = (attrName, attrValue) => {
    const newAttrs = { ...selectedAttributes, [attrName]: attrValue };
    setSelectedAttributes(newAttrs);
    setQuantity(1);
    const matchingVariant = product.variants.find((v) => {
      return Object.entries(newAttrs).every(([key, val]) =>
        v.attributes.some((a) => a.name === key && a.value === val)
      );
    });
    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      const variantImages = matchingVariant.images?.filter((img) => img) || [];
      if (variantImages.length > 0) setCurrentImage(variantImages[0]);
      else if (product.thumbnail) setCurrentImage(product.thumbnail);
    }
  };

  const availableStock = selectedVariant?.stock || 0;

  const handleQuantity = (type) => {
    if (type === "inc") {
      if (quantity < availableStock) {
        setQuantity((prev) => prev + 1);
      } else {
        toast.warning(
          <>
            <FaTimesCircle size={18} />
            <span>Max limit reached</span>
          </>,
          toastStyles.warning
        );
      }
    }
    if (type === "dec" && quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error(
        <>
          <FaTimesCircle size={18} />
          <span>Please login to add to cart!</span>
        </>,
        toastStyles.error
      );
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        "https://nikam-ecom-backend.onrender.com/api/cart/add",
        {
          productId: product._id,
          variantId: selectedVariant?._id || null,
          quantity: quantity,
        },
        { withCredentials: true }
      );
      toast.success(
        <>
          <FaCheckCircle size={18} color="var(--green-dark)" />
          <span>Added to cart successfully!</span>
        </>,
        toastStyles.success
      );
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      toast.error(
        <>
          <FaTimesCircle size={18} color="#8c1d1d" />
          <span>{err.response?.data?.message || "Failed to add to cart"}</span>
        </>,
        toastStyles.error
      );
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error(
        <>
          <FaTimesCircle size={18} />
          <span>Please login to purchase items!</span>
        </>,
        toastStyles.error
      );
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        "https://nikam-ecom-backend.onrender.com/api/cart/add",
        {
          productId: product._id,
          variantId: selectedVariant?._id || null,
          quantity: quantity,
        },
        { withCredentials: true }
      );
      window.dispatchEvent(new Event("cartUpdated"));
      navigate("/checkout");
    } catch (err) {
      toast.error(
        <>
          <FaTimesCircle size={18} color="#8c1d1d" />
          <span>
            {err.response?.data?.message || "Failed to process Buy Now"}
          </span>
        </>,
        toastStyles.error
      );
    }
  };

  const handleDeliveryCheck = () => {
    if (!selectedCity) {
      return toast.warning(
        <>
          <FaTimesCircle size={18} />
          <span>Please select a city first</span>
        </>,
        toastStyles.warning
      );
    }
    setDeliveryStatus("checking");

    setTimeout(() => {
      const matched = shippingMethods.find(
        (item) => item.city === selectedCity
      );
      if (matched && matched.isAvailable) {
        setDeliveryStatus("available");
        const priceText =
          matched.shippingPrice > 0
            ? `₹${matched.shippingPrice}`
            : "Free Delivery";
        setDeliveryMsg(
          `Delivery expected in ${
            matched.deliveryDuration || "3-5 days"
          } (${priceText})`
        );
      } else {
        setDeliveryStatus("unavailable");
        setDeliveryMsg(
          "Sorry, standard delivery is currently unavailable for this area."
        );
      }
    }, 400);
  };

  if (loading) {
    return (
      <div
        style={{
          height: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "3rem",
            height: "3rem",
            border: "3px solid var(--green-light, #e8f3e8)",
            borderTopColor: "var(--green-dark)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px 20px",
          fontFamily: "var(--font-sans)",
        }}
      >
        <FiAlertCircle
          size={50}
          color="#de433f"
          style={{ marginBottom: "16px" }}
        />
        <h2
          style={{
            fontWeight: 700,
            color: "var(--text-main)",
            fontSize: "24px",
          }}
        >
          Product Not Found
        </h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          The requested item may have been removed or updated.
        </p>
      </div>
    );
  }

  const brandName =
    product.brand?.name ||
    product.brand?.title ||
    (typeof product.brand === "string" ? product.brand : "");
  const categoryTitle = product.category?.title || "";
  const subCategoryTitle = product.subcategory?.title || "";
  const fullCategory = subCategoryTitle
    ? `${categoryTitle} › ${subCategoryTitle}`
    : categoryTitle;

  const originalPrice =
    Number(
      selectedVariant?.originalPrice || selectedVariant?.price || product?.price
    ) || 0;
  const discountPrice = Number(selectedVariant?.discountPrice) || 0;
  const isSale = discountPrice > 0 && discountPrice < originalPrice;
  const price = isSale ? discountPrice : originalPrice;

  const variantImages = selectedVariant?.images?.filter((img) => img) || [];
  const displayableImages =
    variantImages.length > 0
      ? variantImages
      : [product.thumbnail, ...(product.gallery || [])].filter(Boolean);
  const uniqueImages = displayableImages
    .filter((img, index, self) => img && self.indexOf(img) === index)
    .slice(0, 5);

  return (
    <div
      className="universal-container sw-product-template"
      style={{
        fontFamily: "var(--font-sans)",
        color: "var(--text-main)",
        paddingBlock: "40px",
        boxSizing: "border-box", // Prevents overflow from paddings
        overflowX: "hidden", // Completely blocks horizontal page scroll
      }}
    >
      {/* COMPACT BREADCRUMBS */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          color: "var(--text-muted)",
          marginBottom: "24px",
        }}
      >
        <span
          style={{ cursor: "pointer", transition: "color 0.2s" }}
          className="sw-breadcrumb-link"
          onClick={() => navigate("/shop")}
        >
          Shop
        </span>
        <FiChevronRight size={12} style={{ opacity: 0.6 }} />
        <span style={{ cursor: "pointer" }} className="sw-breadcrumb-link">
          {categoryTitle || "Catalog"}
        </span>
        {subCategoryTitle && (
          <>
            <FiChevronRight size={12} style={{ opacity: 0.6 }} />
            <span style={{ cursor: "pointer" }} className="sw-breadcrumb-link">
              {subCategoryTitle}
            </span>
          </>
        )}
      </nav>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: "40px",
          boxSizing: "border-box",
        }}
        className="product-grid-layout"
      >
        {/* LEFT COMPONENT: PROPORTIONAL GALLERY */}
        <div
          style={{ display: "flex", gap: "16px", boxSizing: "border-box" }}
          className="gallery-flex-container"
        >
          {/* Vertical Thumb Stripe */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "70px",
              boxSizing: "border-box",
            }}
            className="thumb-strip"
          >
            {uniqueImages.map((img, idx) => {
              const isSelected = currentImage === img;
              return (
                <div
                  key={idx}
                  onClick={() => setCurrentImage(img)}
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    cursor: "pointer",
                    backgroundColor: "var(--bg-off-white)",
                    border: isSelected
                      ? "2px solid var(--green-dark)"
                      : "1px solid #eaeaea",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                  }}
                  className="sw-gallery-thumb"
                >
                  <img
                    src={getImageUrl(img)}
                    alt="Thumbnail"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* REDESIGNED MAIN DISPLAY WINDOW */}
          <div
            style={{
              flex: 1,
              background: "#ffffff", // Pure white background
              borderRadius: "16px", // Softer rounded corners for desktop
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "400px",
              boxSizing: "border-box",
              overflow: "hidden", // Ensures no overflowing if image is large
            }}
            className="main-display-window"
          >
            {isSale && (
              <span
                style={{
                  position: "absolute",
                  top: "20px",
                  left: "20px",
                  background: "var(--green-dark)", // Changed from #111 to Green
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  zIndex: 10,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Subtle modern shadow
                }}
              >
                -
                {Math.round(
                  ((originalPrice - discountPrice) / originalPrice) * 100
                )}
                %
              </span>
            )}
            <img
              src={getImageUrl(currentImage)}
              alt={product.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain", // Safely fits image without cutting ANY part of it
                borderRadius: "16px", // Smooth rounded corners for the image itself
              }}
              className="sw-main-image-render"
            />
          </div>
        </div>

        {/* RIGHT COMPONENT: METADATA SELECTION CONTROL PANEL */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            textAlign: "left",
            width: "100%",
            boxSizing: "border-box",
          }}
          className="details-panel"
        >
          {brandName && (
            <span
              style={{
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--green-dark)",
                marginBottom: "8px",
              }}
            >
              {brandName}
            </span>
          )}

          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              lineHeight: "1.2",
              marginBottom: "12px",
              color: "var(--text-main)",
            }}
            className="sw-title-text"
          >
            {product.title}
          </h1>

          {/* Clean Rating Logic */}
          {reviewsData.count > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "2px",
                  color: "#FFB800",
                  fontSize: "14px",
                }}
              >
                {renderStars(reviewsData.averageRating)}
              </div>
              <span style={{ fontWeight: 600, fontSize: "14px" }}>
                {reviewsData.averageRating}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                •
              </span>
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => setActiveTab("reviews")}
              >
                {reviewsData.count} Reviews
              </span>
            </div>
          )}

          {/* PRICING STRUCTURE: STRICTLY ALIGNED */}
          <div
            className="sw-price-container"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              width: "100%",
              paddingBottom: "16px",
              borderBottom: "1px solid #eaeaea",
              marginBottom: "20px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "10px",
                flexWrap: "wrap",
                width: "100%",
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "var(--text-main)",
                }}
                className="sw-price-text"
              >
                ₹{price.toLocaleString()}
              </span>

              {isSale && (
                <span
                  style={{
                    fontSize: "16px",
                    color: "var(--text-muted)",
                    textDecoration: "line-through",
                    opacity: 0.8,
                  }}
                  className="sw-price-cut"
                >
                  M.R.P: ₹{originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Taxes displayed below the price sequence */}
            {isSale && (
              <span
                style={{
                  color: "var(--green-dark)",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginTop: "4px",
                }}
              >
                (Inclusive of all taxes)
              </span>
            )}
          </div>

          {/* CUSTOM ATTRIBUTE MANAGEMENT ENGINE */}
          {Object.keys(availableOptions).map((attrName, idx) => {
            const isColor = attrName.toLowerCase() === "color";
            const globalAttr = globalAttributes.find(
              (a) => a.name.toLowerCase() === attrName.toLowerCase()
            );
            const isDropdown = globalAttr?.displayAsDropdown || false;

            return (
              <div
                key={idx}
                style={{
                  marginBottom: "20px",
                  width: "100%",
                  textAlign: "left",
                  boxSizing: "border-box",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text-main)",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                  }}
                >
                  {attrName}:{" "}
                  <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                    {selectedAttributes[attrName]}
                  </span>
                </span>

                {isDropdown && !isColor ? (
                  <div style={{ position: "relative", maxWidth: "250px" }}>
                    <select
                      value={selectedAttributes[attrName] || ""}
                      onChange={(e) =>
                        handleAttributeSelect(attrName, e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1px solid #dcdfdc",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: 500,
                        background: "#fff",
                        color: "var(--text-main)",
                        outline: "none",
                        appearance: "none",
                        cursor: "pointer",
                      }}
                    >
                      {availableOptions[attrName].map((val, i) => (
                        <option key={i} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                    <div
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        fontSize: "10px",
                      }}
                    >
                      ▼
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "flex-start",
                      gap: "8px",
                    }}
                  >
                    {availableOptions[attrName].map((val, i) => {
                      const isSelected = selectedAttributes[attrName] === val;
                      if (isColor) {
                        const hexValue = getHexForColor(val);
                        const isWhite =
                          hexValue.toLowerCase() === "#ffffff" ||
                          hexValue.toLowerCase() === "white";
                        return (
                          <div
                            key={i}
                            onClick={() => handleAttributeSelect(attrName, val)}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              cursor: "pointer",
                              padding: "2px",
                              border: isSelected
                                ? "2px solid var(--text-main)"
                                : "1px solid transparent",
                              transition: "all 0.2s ease",
                            }}
                            title={val}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                backgroundColor: hexValue,
                                borderRadius: "50%",
                                border: isWhite
                                  ? "1px solid #ccc"
                                  : "1px solid rgba(0,0,0,0.05)",
                              }}
                            ></div>
                          </div>
                        );
                      } else {
                        return (
                          <button
                            key={i}
                            onClick={() => handleAttributeSelect(attrName, val)}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: isSelected
                                ? "var(--text-main)"
                                : "#fff",
                              color: isSelected ? "#fff" : "var(--text-main)",
                              border: isSelected
                                ? "1px solid var(--text-main)"
                                : "1px solid #eaeaea",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: 500,
                              transition: "all 0.2s",
                            }}
                          >
                            {val}
                          </button>
                        );
                      }
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div
            style={{
              marginVertical: "5px",
              fontSize: "13px",
              fontWeight: 600,
              color: availableStock > 0 ? "var(--green-dark)" : "#de433f",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "16px",
            }}
          >
            {availableStock > 0 ? (
              <>
                <FiCheck size={14} /> In Stock
              </>
            ) : (
              <>
                <FiAlertCircle size={14} /> Out of Stock
              </>
            )}
          </div>

          {/* QUANTITY SELECTOR */}
          {availableStock > 0 && (
            <div
              style={{
                marginBottom: "16px",
                width: "100%",
                textAlign: "left",
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-main)",
                  marginBottom: "8px",
                }}
              >
                Quantity
              </span>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: "1px solid #eaeaea",
                  borderRadius: "8px",
                  overflow: "hidden",
                  height: "44px",
                  width: "120px",
                  background: "#fff",
                }}
              >
                <button
                  onClick={() => handleQuantity("dec")}
                  style={{
                    flex: 1,
                    height: "100%",
                    background: "transparent",
                    border: "none",
                    fontSize: "18px",
                    cursor: "pointer",
                    color: "var(--text-main)",
                  }}
                >
                  -
                </button>
                <input
                  type="text"
                  value={quantity}
                  readOnly
                  style={{
                    width: "40px",
                    height: "100%",
                    border: "none",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "15px",
                    color: "var(--text-main)",
                    background: "transparent",
                  }}
                />
                <button
                  onClick={() => handleQuantity("inc")}
                  style={{
                    flex: 1,
                    height: "100%",
                    background: "transparent",
                    border: "none",
                    fontSize: "18px",
                    cursor: "pointer",
                    color: "var(--text-main)",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* STRUCTURED SIDE-BY-SIDE BUTTONS */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "30px",
              width: "100%",
              boxSizing: "border-box",
            }}
            className="sw-action-buttons"
          >
            <button
              onClick={handleAddToCart}
              disabled={availableStock === 0}
              style={{
                flex: 1,
                height: "48px",
                backgroundColor: "#fff",
                color: "var(--text-main)",
                border: "2px solid var(--text-main)",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: availableStock === 0 ? "not-allowed" : "pointer",
                opacity: availableStock === 0 ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <FiShoppingBag size={16} /> Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              disabled={availableStock === 0}
              style={{
                flex: 1,
                height: "48px",
                backgroundColor: "var(--green-dark)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: availableStock === 0 ? "not-allowed" : "pointer",
                opacity: availableStock === 0 ? 0.5 : 1,
              }}
            >
              Buy Now
            </button>
          </div>

          {/* CLEAN, LARGE IMAGE PAYMENT BOX */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "30px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <FiShield size={16} color="var(--green-dark)" />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                100% Secure Checkout
              </span>
            </div>
            <img
              src="/assets/img/paymentlogo.png"
              alt="Supported Payments via Razorpay"
              style={{
                width: "100%",
                maxWidth: "350px",
                height: "auto",
                objectFit: "contain",
                margin: "0 auto",
                display: "block",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          {/* GEOLOCATION CHECKER */}
          <div
            style={{
              padding: "20px",
              border: "1px solid #eaeaea",
              borderRadius: "12px",
              marginBottom: "30px",
              width: "100%",
              textAlign: "left",
              boxSizing: "border-box",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "12px",
                color: "var(--text-main)",
              }}
            >
              <FiTruck size={16} /> Delivery Options
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  border: "1px solid #eaeaea",
                  borderRadius: "8px",
                  background: "#fff",
                  fontSize: "13px",
                  outline: "none",
                  minWidth: 0, // fixes select overflow
                }}
              >
                <option value="">Select city...</option>
                {shippingMethods.map((method) => (
                  <option key={method._id || method.city} value={method.city}>
                    {method.city}
                  </option>
                ))}
              </select>
              <button
                onClick={handleDeliveryCheck}
                style={{
                  padding: "0 20px",
                  background: "var(--text-main)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Check
              </button>
            </div>

            {deliveryStatus && (
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color:
                    deliveryStatus === "available"
                      ? "var(--green-dark)"
                      : deliveryStatus === "unavailable"
                      ? "#de433f"
                      : "#666",
                }}
              >
                {deliveryStatus === "checking"
                  ? "Checking availability..."
                  : deliveryMsg}
              </div>
            )}
          </div>

          {/* TABS SECTION */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              gap: "24px",
              borderBottom: "1px solid #eaeaea",
              marginBottom: "20px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <button
              onClick={() => setActiveTab("description")}
              style={{
                paddingBottom: "12px",
                background: "none",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                color:
                  activeTab === "description"
                    ? "var(--text-main)"
                    : "var(--text-muted)",
                borderBottom:
                  activeTab === "description"
                    ? "2px solid var(--text-main)"
                    : "2px solid transparent",
                cursor: "pointer",
                marginBottom: "-1px",
              }}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              style={{
                paddingBottom: "12px",
                background: "none",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                color:
                  activeTab === "reviews"
                    ? "var(--text-main)"
                    : "var(--text-muted)",
                borderBottom:
                  activeTab === "reviews"
                    ? "2px solid var(--text-main)"
                    : "2px solid transparent",
                cursor: "pointer",
                marginBottom: "-1px",
              }}
            >
              Reviews ({reviewsData.count})
            </button>
          </div>

          {/* TAB CONTENT */}
          <div
            style={{
              minHeight: "150px",
              width: "100%",
              textAlign: "left",
              boxSizing: "border-box",
            }}
          >
            {activeTab === "description" && (
              <div
                style={{
                  lineHeight: "1.8",
                  fontSize: "16px",
                  color: "var(--text-gray)",
                  fontFamily: "'Lato', sans-serif",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                }}
              >
                {product.description ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p>No description available for this product.</p>
                )}

                <div
                  style={{
                    marginTop: "24px",
                    padding: "16px",
                    background: "#fafafa",
                    borderRadius: "8px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    fontSize: "13px",
                    border: "1px solid #eaeaea",
                  }}
                >
                  <div>
                    <strong>Category:</strong>
                    <br />
                    {fullCategory || "Standard"}
                  </div>
                  <div>
                    <strong>SKU:</strong>
                    <br />
                    <span style={{ color: "var(--text-muted)" }}>
                      {selectedVariant?.sku || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {reviewsData.reviews.length > 0 ? (
                  reviewsData.reviews.map((rev) => (
                    <div
                      key={rev._id}
                      style={{
                        paddingBottom: "20px",
                        borderBottom: "1px solid #eaeaea",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "var(--text-main)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            fontSize: "14px",
                          }}
                        >
                          {rev.user?.name?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: "14px",
                              color: "var(--text-main)",
                            }}
                          >
                            {rev.user?.name || "Customer"}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              color: "#FFB800",
                              fontSize: "11px",
                              marginTop: "2px",
                            }}
                          >
                            {renderStars(rev.rating)}
                          </div>
                        </div>
                      </div>
                      <p
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "14px",
                          margin: "8px 0",
                          lineHeight: "1.5",
                        }}
                      >
                        {rev.comment}
                      </p>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#999",
                        }}
                      >
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                    No reviews yet. Be the first to review this product!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* Global CSS Reset for this component to prevent horizontal cutoffs */
        .sw-product-template * {
           box-sizing: border-box !important;
        }

        .sw-breadcrumb-link:hover { color: var(--text-main) !important; }
        
        /* TABLET RESPONSIVENESS */
        @media (max-width: 992px) {
          .product-grid-layout { grid-template-columns: 1fr !important; gap: 30px !important; }
        }

        /* MOBILE RESPONSIVENESS */
        @media (max-width: 768px) {
          .gallery-flex-container { flex-direction: column-reverse !important; gap: 12px !important; }
          .thumb-strip { flex-direction: row !important; width: 100% !important; overflow-x: auto !important; padding-bottom: 5px; display: flex; }
          
          /* Mobile optimized sizes */
          .sw-gallery-thumb { width: 60px !important; height: 60px !important; flex-shrink: 0 !important; border-radius: 8px !important; }
          .main-display-window { height: 320px !important; padding: 0 !important; border-radius: 12px !important; }
          .sw-title-text { font-size: 24px !important; margin-bottom: 8px !important; }
          .sw-price-text { font-size: 24px !important; }
          
          /* Keeping buttons strictly side-by-side on mobile */
          .sw-action-buttons { flex-direction: row !important; }
        }

        /* 400px MICRO SCREEN COMPATIBILITY */
        @media (max-width: 400px) {
          /* Keep buttons strictly side-by-side with smaller gaps so they fit 320px screens perfectly */
          .sw-action-buttons { gap: 8px !important; }
          .sw-action-buttons button { font-size: 12px !important; padding: 0 4px !important; height: 44px !important; white-space: nowrap; }
          
          .main-display-window { height: 260px !important; }
          .sw-title-text { font-size: 22px !important; }
        }
        
        /* EXACT 320PX EXTREME EDGE CASE */
        @media (max-width: 340px) {
           .sw-action-buttons button { font-size: 11px !important; }
           .sw-price-text { font-size: 24px !important; }
           .sw-price-cut { font-size: 14px !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductSection;
