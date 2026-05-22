import React, { useState, useEffect, useMemo, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiLock } from "react-icons/fi";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext, useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";

const ProductSection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products: contextProducts } = useAuth();
  const { user } = useContext(AuthContext); // GET USER FROM CONTEXT TO CHECK LOGIN STATUS

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [currentImage, setCurrentImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [globalAttributes, setGlobalAttributes] = useState([]);

  // State for Review Data
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    averageRating: 0,
    count: 0,
    ratingStats: {},
  });

  // NEW: Pincode Check States
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState(null); // null, 'available', 'unavailable', 'checking'
  const [pincodeMsg, setPincodeMsg] = useState("");

  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/600";
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} color="#ffc107" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<FaStarHalfAlt key={i} color="#ffc107" />);
      } else {
        stars.push(<FaRegStar key={i} color="#ffc107" />);
      }
    }
    return stars;
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);

        const [res, attrRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/products/${id}`),
          axios.get(`http://localhost:5000/api/attributes`),
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

        const currentCatId = prodData.category?._id || prodData.category;
        const currentCatTitle = prodData.category?.title;
        const currentBrandId = prodData.brand?._id || prodData.brand;
        const currentBrandName =
          prodData.brand?.name ||
          prodData.brand?.title ||
          (typeof prodData.brand === "string" ? prodData.brand : "");

        const related = contextProducts.filter((p) => {
          if (p._id === prodData._id || p.status === "Inactive") return false;
          const pCatId = p.category?._id || p.category;
          const pCatTitle = p.category?.title;
          let categoryMatch = false;
          if (currentCatId && pCatId) {
            categoryMatch = currentCatId.toString() === pCatId.toString();
          } else if (currentCatTitle && pCatTitle) {
            categoryMatch = currentCatTitle === pCatTitle;
          }
          const pBrandId = p.brand?._id || p.brand;
          const pBrandName =
            p.brand?.name ||
            p.brand?.title ||
            (typeof p.brand === "string" ? p.brand : "");
          let brandMatch = false;
          if (currentBrandId && pBrandId) {
            brandMatch = currentBrandId.toString() === pBrandId.toString();
          } else if (currentBrandName && pBrandName) {
            brandMatch =
              currentBrandName.toLowerCase() === pBrandName.toLowerCase();
          }
          return categoryMatch && brandMatch;
        });

        setRelatedProducts(related);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching specific product:", error);
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id, contextProducts]);

  useEffect(() => {
    if (selectedVariant?._id) {
      const fetchReviews = async () => {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/reviews/${selectedVariant._id}`
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
        toast.warning("Max limit reached", {
          position: "bottom-center",
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
    }
    if (type === "dec" && quantity > 1) setQuantity((prev) => prev - 1);
  };

  // --- NEW: Add to Cart (Requires Login) ---
  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart!");
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/cart/add",
        {
          productId: product._id,
          variantId: selectedVariant?._id || null,
          quantity: quantity,
        },
        { withCredentials: true }
      );
      toast.success("Added to cart successfully!");
      window.dispatchEvent(new Event("cartUpdated")); // Update Header cart count
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  // --- NEW: Buy Now (Requires Login) ---
  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Please login to purchase items!");
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/cart/add",
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
      toast.error(err.response?.data?.message || "Failed to process Buy Now");
    }
  };

  // --- NEW: Pincode Check ---
  const handlePincodeCheck = async () => {
    if (!pincode || pincode.length < 6)
      return toast.warn("Enter a valid 6-digit pincode");
    setPincodeStatus("checking");
    try {
      const res = await axios.get("http://localhost:5000/api/shipping/all");
      const matched = res.data.methods?.find(
        (item) => item.pincode === pincode
      );
      if (matched && matched.isAvailable) {
        setPincodeStatus("available");
        setPincodeMsg(
          `Available! Expected delivery in ${
            matched.deliveryDuration || "3-5 Days"
          }`
        );
      } else {
        setPincodeStatus("unavailable");
        setPincodeMsg("Not available for this location.");
      }
    } catch (err) {
      setPincodeStatus("unavailable");
      setPincodeMsg("Failed to verify pincode.");
    }
  };

  if (loading)
    return (
      <div className="text-center p-5 mt-5">
        <div className="spinner-border text-secondary"></div>
      </div>
    );
  if (!product)
    return (
      <div className="text-center mt-5 py-5">
        <h3>Product Not Found</h3>
      </div>
    );

  const brandName =
    product.brand?.name ||
    product.brand?.title ||
    (typeof product.brand === "string" ? product.brand : "");
  const categoryTitle = product.category?.title || "";
  const subCategoryTitle = product.subcategory?.title || "";
  const fullCategory = subCategoryTitle
    ? `${categoryTitle} > ${subCategoryTitle}`
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
    .slice(0, 6);

  return (
    <div
      className="product-page-wrapper"
      style={{ backgroundColor: "#fff", fontFamily: "Arial, sans-serif" }}
    >
      <main className="container mt-4">
        <div className="row g-4">
          <div className="col-lg-5 col-md-12">
            <div
              className="d-flex flex-column-reverse flex-lg-row gap-3 position-sticky"
              style={{ top: "20px" }}
            >
              <div
                className="d-flex flex-lg-column gap-2 overflow-auto"
                style={{ minWidth: "60px", scrollbarWidth: "none" }}
              >
                {uniqueImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentImage(img)}
                    style={{
                      cursor: "pointer",
                      width: "50px",
                      height: "50px",
                      borderRadius: "4px",
                      overflow: "hidden",
                      flexShrink: 0,
                      border:
                        currentImage === img
                          ? "2px solid #000000"
                          : "1px solid #a2a6ac",
                      boxShadow:
                        currentImage === img
                          ? "0 0 3px rgba(0,0,0,.5)"
                          : "none",
                    }}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt="thumb"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
              </div>
              <div
                className="flex-grow-1 text-center bg-white"
                style={{ borderRadius: "8px" }}
              >
                <img
                  src={getImageUrl(currentImage)}
                  alt={product.title}
                  className="img-fluid"
                  style={{
                    objectFit: "contain",
                    maxHeight: "500px",
                    width: "100%",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-12">
            <div className="product-details-content">
              <h1
                className="fw-normal mt-1 mb-1 text-capitalize"
                style={{
                  fontSize: "24px",
                  color: "#0F1111",
                  lineHeight: "1.3",
                }}
              >
                {product.title}
              </h1>

              {/* RATING DISPLAY: VISIBILITY HIDDEN IF COUNT IS 0 SO MARGIN STAYS INTACT */}
              <div
                className="d-flex align-items-center gap-2 mb-2"
                style={{
                  visibility: reviewsData.count > 0 ? "visible" : "hidden",
                  minHeight: "24px",
                }}
              >
                <div className="d-flex">
                  {renderStars(reviewsData.averageRating)}
                </div>
                <span
                  style={{
                    color: "#007185",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveTab("reviews")}
                >
                  {reviewsData.averageRating} rating ({reviewsData.count}{" "}
                  reviews)
                </span>
              </div>

              <hr className="my-3" style={{ opacity: "0.15" }} />

              <div className="price-block mb-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-baseline gap-2">
                  {isSale && (
                    <span className="text-muted text-decoration-line-through fs-5">
                      ₹{originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span
                    className="fw-bold"
                    style={{
                      fontSize: "28px",
                      color: "#0F1111",
                      lineHeight: "1",
                    }}
                  >
                    ₹{price.toLocaleString()}
                  </span>
                </div>
                {isSale && (
                  <span
                    className="fw-bold"
                    style={{
                      backgroundColor: "#ffebee",
                      color: "#c62828",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "14px",
                    }}
                  >
                    {Math.round(
                      ((originalPrice - discountPrice) / originalPrice) * 100
                    )}{" "}
                    % OFF
                  </span>
                )}
              </div>

              <hr className="my-3" style={{ opacity: "0.15" }} />

              {Object.keys(availableOptions).map((attrName, idx) => {
                const isColor = attrName.toLowerCase() === "color";
                const globalAttr = globalAttributes.find(
                  (a) => a.name.toLowerCase() === attrName.toLowerCase()
                );
                let isDropdown = globalAttr?.displayAsDropdown || false;

                return (
                  <div key={idx} className="mb-4">
                    <label
                      className="d-block small mb-2"
                      style={{ color: "#565959" }}
                    >
                      {attrName}:{" "}
                      <span className="fw-bold text-dark">
                        {selectedAttributes[attrName]}
                      </span>
                    </label>
                    {isDropdown && !isColor ? (
                      <select
                        value={selectedAttributes[attrName] || ""}
                        onChange={(e) =>
                          handleAttributeSelect(attrName, e.target.value)
                        }
                        className="form-select shadow-none"
                        style={{
                          width: "100%",
                          maxWidth: "350px",
                          padding: "10px 14px",
                          borderRadius: "4px",
                          border: "1px solid #000000",
                          fontSize: "14px",
                          color: "#0F1111",
                          cursor: "pointer",
                          backgroundColor: "#fff",
                        }}
                      >
                        {availableOptions[attrName].map((val, i) => (
                          <option key={i} value={val}>
                            {val}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="d-flex flex-wrap gap-2 ">
                        {availableOptions[attrName].map((val, i) => {
                          const isSelected =
                            selectedAttributes[attrName] === val;
                          if (isColor) {
                            const hexValue = getHexForColor(val);
                            const isWhite =
                              hexValue.toLowerCase() === "#ffffff" ||
                              hexValue.toLowerCase() === "white";
                            return (
                              <div
                                key={i}
                                onClick={() =>
                                  handleAttributeSelect(attrName, val)
                                }
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "50%",
                                  cursor: "pointer",
                                  padding: "3px",
                                  border: isSelected
                                    ? "2px solid #000000"
                                    : "2px solid transparent",
                                  transition: "border-color 0.2s ease",
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
                                      : "1px solid rgba(0,0,0,0.1)",
                                  }}
                                ></div>
                              </div>
                            );
                          } else {
                            return (
                              <button
                                key={i}
                                onClick={() =>
                                  handleAttributeSelect(attrName, val)
                                }
                                style={{
                                  padding: "8px 14px",
                                  backgroundColor: isSelected
                                    ? "#f3f3f3"
                                    : "#fff",
                                  color: "#0F1111",
                                  border: isSelected
                                    ? "2px solid #000000"
                                    : "1px solid #000000",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  fontWeight: isSelected ? "700" : "400",
                                  minWidth: "55px",
                                  outline: "none",
                                  transition: "all 0.1s ease-in-out",
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

              <hr className="my-3" style={{ opacity: "0.15" }} />

              <div className="mt-3 text-dark small">
                <div className="row mb-2">
                  <div className="col-4 fw-bold">Brand</div>
                  <div className="col-8">{brandName || "N/A"}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-4 fw-bold">Category</div>
                  <div className="col-8">{fullCategory || "N/A"}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-4 fw-bold">Vendor</div>
                  <div className="col-8">{product.vendor || "N/A"}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-4 fw-bold">SKU</div>
                  <div className="col-8">{selectedVariant?.sku || "N/A"}</div>
                </div>
              </div>

              {/* NEW: PINCODE CHECKER COMPONENT */}
              <div
                className="pincode-checker mt-4 p-3 border rounded shadow-sm"
                style={{ backgroundColor: "#f9f9f9" }}
              >
                <label
                  className="d-block small mb-2 fw-bold"
                  style={{ color: "#333" }}
                >
                  <FaMapMarkerAlt className="me-1" color="#de433f" /> CHECK
                  DELIVERY AVAILABILITY
                </label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm shadow-none"
                    placeholder="Enter 6-digit Pincode"
                    value={pincode}
                    onChange={(e) =>
                      setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    style={{
                      maxWidth: "180px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  />
                  <button
                    className="btn btn-sm shadow-none px-3"
                    onClick={handlePincodeCheck}
                    style={{
                      borderRadius: "4px",
                      backgroundColor: "#de433f",
                      color: "#fff",
                      fontWeight: "bold",
                      border: "none",
                      transition: "0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#c83c39")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "#de433f")
                    }
                  >
                    Check
                  </button>
                </div>
                {pincodeStatus === "checking" && (
                  <div className="mt-2 small text-muted">Verifying...</div>
                )}
                {pincodeStatus === "available" && (
                  <div
                    className="mt-2 small d-flex align-items-center gap-1 fw-bold"
                    style={{ color: "#007600" }}
                  >
                    <FaCheckCircle /> {pincodeMsg}
                  </div>
                )}
                {pincodeStatus === "unavailable" && (
                  <div
                    className="mt-2 small d-flex align-items-center gap-1 fw-bold"
                    style={{ color: "#B12704" }}
                  >
                    <FaTimesCircle /> {pincodeMsg}
                  </div>
                )}
              </div>
              {/* END PINCODE CHECKER */}
            </div>
          </div>

          <div className="col-lg-3 col-md-12">
            <div
              className="border rounded p-3"
              style={{ borderColor: "#D5D9D9", backgroundColor: "#fff" }}
            >
              <div className="fw-bold fs-5 mb-3" style={{ color: "#0F1111" }}>
                ₹{price.toLocaleString()}
              </div>
              <h5
                className="fs-6 fw-bold mb-3"
                style={{ color: availableStock > 0 ? "#007600" : "#B12704" }}
              >
                {availableStock > 0 ? "In stock." : "Currently unavailable."}
              </h5>
              {availableStock > 0 && (
                <div className="mb-4">
                  <label className="small text-muted mb-1 d-block">
                    Quantity
                  </label>
                  <div
                    className="d-inline-flex align-items-center border rounded"
                    style={{
                      borderColor: "#D5D9D9",
                      backgroundColor: "#F0F2F2",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => handleQuantity("dec")}
                      className="btn shadow-none px-3 py-1 border-end border-0"
                      style={{
                        borderRight: "1px solid #D5D9D9",
                        borderRadius: "0",
                      }}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={quantity}
                      readOnly
                      className="border-0 bg-transparent text-center fw-bold"
                      style={{
                        width: "45px",
                        outline: "none",
                        fontSize: "14px",
                      }}
                    />
                    <button
                      onClick={() => handleQuantity("inc")}
                      className="btn shadow-none px-3 py-1 border-start border-0"
                      style={{
                        borderLeft: "1px solid #D5D9D9",
                        borderRadius: "0",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
              <div className="d-flex flex-column gap-2 mb-3">
                <button
                  onClick={handleAddToCart}
                  className="btn w-100 rounded-pill shadow-sm"
                  style={{
                    background:
                      "linear-gradient(180deg, #e85653 0%, #de433f 100%)",
                    borderColor: "#c93c38",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                  disabled={availableStock === 0}
                >
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  className="btn w-100 rounded-pill shadow-sm"
                  style={{
                    background:
                      "linear-gradient(180deg, #de433f 0%, #bd3734 100%)",
                    borderColor: "#a6302d",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                  disabled={availableStock === 0}
                >
                  Buy Now
                </button>
              </div>
              <div className="d-flex align-items-center gap-2 small text-muted">
                <FiLock /> Secure transaction
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-top">
          <ul
            className="nav nav-tabs mb-3"
            style={{ borderBottom: "1px solid #dee2e6" }}
          >
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "description" ? "active fw-bold" : ""
                }`}
                onClick={() => setActiveTab("description")}
                style={{
                  color: activeTab === "description" ? "#de433f" : "#495057",
                  border:
                    activeTab === "description" ? "1px solid #dee2e6" : "none",
                  borderBottomColor:
                    activeTab === "description" ? "#fff" : "transparent",
                  backgroundColor:
                    activeTab === "description" ? "#fff" : "transparent",
                  marginBottom: "-1px",
                }}
              >
                Description
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "reviews" ? "active fw-bold" : ""
                }`}
                onClick={() => setActiveTab("reviews")}
                style={{
                  color: activeTab === "reviews" ? "#de433f" : "#495057",
                  border:
                    activeTab === "reviews" ? "1px solid #dee2e6" : "none",
                  borderBottomColor:
                    activeTab === "reviews" ? "#fff" : "transparent",
                  backgroundColor:
                    activeTab === "reviews" ? "#fff" : "transparent",
                  marginBottom: "-1px",
                }}
              >
                Reviews ({reviewsData.count})
              </button>
            </li>
          </ul>

          <div className="tab-content">
            {activeTab === "description" && (
              <div
                className="text-dark m-0 p-0"
                style={{ lineHeight: "1.6", fontSize: "15px" }}
              >
                {product.description ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p className="text-muted m-0">
                    No description available for this product.
                  </p>
                )}
              </div>
            )}
            {activeTab === "reviews" && (
              <div
                className="text-dark m-0 p-0"
                style={{ lineHeight: "1.6", fontSize: "15px" }}
              >
                {reviewsData.reviews.length > 0 ? (
                  <div className="d-flex flex-column gap-4">
                    {reviewsData.reviews.map((rev) => (
                      <div key={rev._id} className="pb-3 border-bottom">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <div
                            className="bg-light rounded-circle d-flex align-items-center justify-content-center fw-bold"
                            style={{
                              width: "32px",
                              height: "32px",
                              fontSize: "12px",
                              color: "#555",
                            }}
                          >
                            {rev.user?.name?.charAt(0).toUpperCase() || "G"}
                          </div>
                          <span className="fw-bold small">
                            {rev.user?.name || "Guest User"}
                          </span>
                        </div>
                        <div className="d-flex gap-1 mb-1">
                          {renderStars(rev.rating)}
                        </div>
                        <p className="m-0 text-dark small">{rev.comment}</p>
                        <span
                          className="text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          Reviewed on{" "}
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted m-0">
                    No reviews yet for this variant.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-top">
          <h3 className="fw-bold mb-4 fs-5" style={{ color: "#de433f" }}>
            Customers who viewed this item also viewed
          </h3>
          <div className="row g-3 mb-5">
            {relatedProducts.map((p) => (
              <div key={p._id} className="col-xl-3 col-lg-4 col-md-4 col-6">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductSection;
