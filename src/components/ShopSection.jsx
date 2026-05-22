import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import {
  FiFilter,
  FiCheck,
  FiPlus,
  FiX,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import ProductCard from "./ProductCard";

const ShopSection = () => {
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]); // ADDED: Brand State

  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]); // ADDED: Selected Brands State
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [maxPriceLimit, setMaxPriceLimit] = useState(100000);

  const [loading, setLoading] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(6);

  const [expandedCats, setExpandedCats] = useState([]);

  const sidebarRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get("https://demo-backend-k0yn.onrender.com/api/category/all"),
          axios.get("https://demo-backend-k0yn.onrender.com/api/products/"),
        ]);
        setCategoriesList(catRes.data);
        const activeProducts = prodRes.data.filter(
          (p) => p.status !== "Inactive"
        );
        setProducts(activeProducts);

        let highestPrice = 0;
        const colorsSet = new Set();
        const sizesSet = new Set();
        const brandsSet = new Set(); // ADDED: Brand Set

        activeProducts.forEach((p) => {
          // ADDED: Extract Brands safely (handles string or object)
          if (p.brand) {
            const brandName =
              typeof p.brand === "string"
                ? p.brand
                : p.brand.name || p.brand.title;
            if (brandName) brandsSet.add(brandName);
          }

          p.variants?.forEach((v) => {
            const basePrice = v.price || v.originalPrice || 0;
            const price = v.discountPrice > 0 ? v.discountPrice : basePrice;

            if (price > highestPrice) highestPrice = price;

            if (v.colorHex) colorsSet.add(v.colorHex);

            // FIX: Brought back the attribute extraction so colors populate again!
            v.attributes?.forEach((attr) => {
              const name = attr.name?.toLowerCase();
              if (name === "color") colorsSet.add(attr.value);
              if (name === "size") sizesSet.add(attr.value);
            });
          });
        });

        highestPrice = Math.ceil(highestPrice);
        setMaxPriceLimit(highestPrice);
        setPriceRange({ min: 0, max: highestPrice });
        setAvailableColors([...colorsSet]);
        setAvailableSizes([...sizesSet]);
        setAvailableBrands([...brandsSet].filter(Boolean)); // ADDED: Set Brands
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 50 >=
        document.documentElement.offsetHeight
      ) {
        setVisibleLimit((prev) => prev + 6);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const baseFilteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCats.length > 0) {
        let pIdsAndTitles = [];
        if (product.category) {
          if (typeof product.category === "string")
            pIdsAndTitles.push(product.category);
          if (product.category._id)
            pIdsAndTitles.push(product.category._id.toString());
          if (product.category.title)
            pIdsAndTitles.push(product.category.title);
        }

        if (product.subcategory) {
          if (typeof product.subcategory === "string")
            pIdsAndTitles.push(product.subcategory);
          if (product.subcategory._id)
            pIdsAndTitles.push(product.subcategory._id.toString());
          if (product.subcategory.title)
            pIdsAndTitles.push(product.subcategory.title);
        }

        if (
          typeof product.category === "string" &&
          product.category.includes(",")
        ) {
          pIdsAndTitles.push(
            ...product.category.split(",").map((c) => c.trim())
          );
        }

        const pIdsLower = pIdsAndTitles.map((id) => id?.toLowerCase() || "");
        const matchesCategory = selectedCats.some((sel) =>
          pIdsLower.includes(sel.toLowerCase())
        );

        if (!matchesCategory) return false;
      }

      // ADDED: Brand Filtering Logic
      if (selectedBrands.length > 0) {
        const pBrand =
          typeof product.brand === "string"
            ? product.brand
            : product.brand?.name || product.brand?.title || "";
        if (!selectedBrands.includes(pBrand)) return false;
      }

      // FIX: Ensure both hex and text colors are checked during filtering
      if (selectedColors.length > 0) {
        const pColors = product.variants
          ?.flatMap((v) => [
            v.colorHex,
            ...(v.attributes
              ?.filter((a) => a.name?.toLowerCase() === "color")
              .map((a) => a.value) || []),
          ])
          .filter(Boolean);

        if (!selectedColors.some((sel) => pColors?.includes(sel))) return false;
      }

      if (selectedSizes.length > 0) {
        const pSizes = product.variants
          ?.flatMap((v) =>
            v.attributes
              ?.filter((a) => a.name?.toLowerCase() === "size")
              .map((a) => a.value)
          )
          .filter(Boolean);

        if (!selectedSizes.some((sel) => pSizes?.includes(sel))) return false;
      }

      return true;
    });
  }, [products, selectedCats, selectedBrands, selectedColors, selectedSizes]); // ADDED: selectedBrands to dependency array

  useEffect(() => {
    if (products.length === 0) return;

    let dynamicMax = 0;
    baseFilteredProducts.forEach((product) => {
      const defaultVar =
        product.variants?.find((v) => v.isDefault) || product.variants?.[0];
      if (defaultVar) {
        const basePrice = defaultVar.price || defaultVar.originalPrice || 0;
        const price =
          defaultVar.discountPrice > 0 ? defaultVar.discountPrice : basePrice;
        if (price > dynamicMax) dynamicMax = price;
      }
    });

    dynamicMax = Math.ceil(dynamicMax) || 0;

    setMaxPriceLimit(dynamicMax);
    setPriceRange((prev) => ({ ...prev, max: dynamicMax }));
  }, [baseFilteredProducts, products]);

  const filteredProducts = useMemo(() => {
    return baseFilteredProducts.filter((product) => {
      const defaultVar =
        product.variants?.find((v) => v.isDefault) || product.variants?.[0];
      if (defaultVar) {
        const basePrice = defaultVar.price || defaultVar.originalPrice || 0;
        const price =
          defaultVar.discountPrice > 0 ? defaultVar.discountPrice : basePrice;

        const minVal = priceRange.min === "" ? 0 : Number(priceRange.min);
        const maxVal =
          priceRange.max === "" ? Infinity : Number(priceRange.max);

        if (price < minVal || price > maxVal) return false;
      }
      return true;
    });
  }, [baseFilteredProducts, priceRange]);

  const toggleFilter = (list, setList, item) => {
    setList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
    setVisibleLimit(6);
  };

  const toggleExpand = (e, catId) => {
    e.stopPropagation();
    setExpandedCats((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId]
    );
  };

  // FIX: Helper to safely render complex color names in pure CSS
  const getCssColor = (colorName) => {
    const lower = colorName.toLowerCase();
    if (lower === "navy blue") return "#000080";
    if (lower === "light pink") return "#FFB6C1";
    // Strips spaces so "Light Blue" becomes "lightblue" (which CSS understands)
    return lower.replace(/\s/g, "");
  };

  return (
    <div className="shop-section position-relative">
      <div
        className={`sidebar-overlay ${showMobileSidebar ? "open" : ""}`}
        onClick={() => setShowMobileSidebar(false)}
      ></div>

      <div className="container mt-4">
        <div className="row g-4">
          <div
            ref={sidebarRef}
            className={`col-lg-3 filter-wrapper ${
              showMobileSidebar ? "open" : ""
            }`}
          >
            <div className="sidebar-sticky">
              <div className="filter-card shadow-sm">
                <div className="filter-main-header d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <FiFilter size={18} color="#de433f" />
                    <h5 className="m-0 fw-bold text-uppercase">
                      Browse Filters
                    </h5>
                  </div>
                  <button
                    className="close-filter-btn d-lg-none"
                    onClick={() => setShowMobileSidebar(false)}
                  >
                    <FiX size={24} color="#333" />
                  </button>
                </div>

                <div className="accordion" id="shopFilters">
                  {/* CATEGORIES */}
                  <div className="filter-section">
                    <div
                      className="section-header"
                      data-bs-toggle="collapse"
                      data-bs-target="#cats"
                    >
                      <span>Categories</span>
                      <div className="d-flex align-items-center gap-2">
                        {selectedCats.length > 0 && (
                          <span className="active-badge">
                            {selectedCats.length} active
                          </span>
                        )}
                        <FiPlus />
                      </div>
                    </div>
                    <div id="cats" className="collapse show">
                      <div className="section-body">
                        {categoriesList.map((cat) => (
                          <div key={cat._id} className="mb-2">
                            <div
                              className="filter-row d-flex align-items-center justify-content-between"
                              onClick={() =>
                                toggleFilter(
                                  selectedCats,
                                  setSelectedCats,
                                  cat._id
                                )
                              }
                            >
                              <div className="d-flex align-items-center gap-2">
                                {cat.subcategories &&
                                cat.subcategories.length > 0 ? (
                                  <span
                                    onClick={(e) => toggleExpand(e, cat._id)}
                                    style={{
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      width: "18px",
                                      height: "18px",
                                      background: expandedCats.includes(cat._id)
                                        ? "#de433f"
                                        : "#f1f5f9",
                                      color: expandedCats.includes(cat._id)
                                        ? "#fff"
                                        : "#333",
                                      borderRadius: "4px",
                                      transition: "0.2s",
                                    }}
                                  >
                                    {expandedCats.includes(cat._id) ? (
                                      <FiChevronDown size={14} />
                                    ) : (
                                      <FiChevronRight size={14} />
                                    )}
                                  </span>
                                ) : (
                                  <span style={{ width: "18px" }}></span>
                                )}
                                <span
                                  className={
                                    selectedCats.includes(cat._id)
                                      ? "text-danger fw-bold text-uppercase"
                                      : "text-uppercase"
                                  }
                                  style={{ fontSize: "13px" }}
                                >
                                  {cat.title}
                                </span>
                              </div>
                              <div
                                className={`custom-check ${
                                  selectedCats.includes(cat._id)
                                    ? "checked"
                                    : ""
                                }`}
                              >
                                {selectedCats.includes(cat._id) && (
                                  <FiCheck size={12} />
                                )}
                              </div>
                            </div>

                            {cat.subcategories &&
                              cat.subcategories.length > 0 &&
                              expandedCats.includes(cat._id) && (
                                <div className="mt-1 ms-4 ps-2 border-start">
                                  {cat.subcategories.map((sub) => (
                                    <div
                                      key={sub._id}
                                      className="filter-row py-1 d-flex align-items-center justify-content-between"
                                      onClick={() =>
                                        toggleFilter(
                                          selectedCats,
                                          setSelectedCats,
                                          sub._id
                                        )
                                      }
                                    >
                                      <span
                                        className={
                                          selectedCats.includes(sub._id)
                                            ? "text-danger fw-bold"
                                            : "text-muted"
                                        }
                                        style={{ fontSize: "12.5px" }}
                                      >
                                        {sub.title}
                                      </span>
                                      <div
                                        className={`custom-check ${
                                          selectedCats.includes(sub._id)
                                            ? "checked"
                                            : ""
                                        }`}
                                        style={{
                                          width: "14px",
                                          height: "14px",
                                        }}
                                      >
                                        {selectedCats.includes(sub._id) && (
                                          <FiCheck size={10} />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ADDED: BRANDS FILTER */}
                  <div className="filter-section">
                    <div
                      className="section-header"
                      data-bs-toggle="collapse"
                      data-bs-target="#brands"
                    >
                      <span>Brands</span>
                      <div className="d-flex align-items-center gap-2">
                        {selectedBrands.length > 0 && (
                          <span className="active-badge">
                            {selectedBrands.length} active
                          </span>
                        )}
                        <FiPlus />
                      </div>
                    </div>
                    <div id="brands" className="collapse">
                      <div className="section-body pb-3">
                        {availableBrands.map((brand, idx) => (
                          <div
                            key={idx}
                            className="filter-row d-flex align-items-center justify-content-between"
                            onClick={() =>
                              toggleFilter(
                                selectedBrands,
                                setSelectedBrands,
                                brand
                              )
                            }
                          >
                            <span
                              className={
                                selectedBrands.includes(brand)
                                  ? "text-danger fw-bold text-capitalize"
                                  : "text-muted text-capitalize"
                              }
                              style={{ fontSize: "13px" }}
                            >
                              {brand}
                            </span>
                            <div
                              className={`custom-check ${
                                selectedBrands.includes(brand) ? "checked" : ""
                              }`}
                            >
                              {selectedBrands.includes(brand) && (
                                <FiCheck size={12} />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* COLORS */}
                  <div className="filter-section">
                    <div
                      className="section-header"
                      data-bs-toggle="collapse"
                      data-bs-target="#colors"
                    >
                      <span>Colors</span>
                      <div className="d-flex align-items-center gap-2">
                        {selectedColors.length > 0 && (
                          <span className="active-badge">
                            {selectedColors.length} active
                          </span>
                        )}
                        <FiPlus />
                      </div>
                    </div>
                    <div id="colors" className="collapse">
                      <div className="section-body d-flex flex-wrap gap-2 pb-3">
                        {availableColors.map((color, idx) => {
                          const cssColor = getCssColor(color);
                          const isWhite =
                            cssColor === "white" || cssColor === "#ffffff";

                          return (
                            <div
                              key={idx}
                              className={`color-box ${
                                selectedColors.includes(color) ? "active" : ""
                              }`}
                              style={{
                                backgroundColor: cssColor,
                                border: isWhite
                                  ? "1px solid #ccc"
                                  : "1px solid #eee",
                              }}
                              onClick={() =>
                                toggleFilter(
                                  selectedColors,
                                  setSelectedColors,
                                  color
                                )
                              }
                            >
                              {selectedColors.includes(color) && (
                                <FiCheck
                                  color={isWhite ? "#000" : "#fff"}
                                  size={14}
                                  style={{
                                    filter: isWhite
                                      ? "none"
                                      : "drop-shadow(0 0 2px rgba(0,0,0,0.5))",
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SIZES */}
                  <div className="filter-section">
                    <div
                      className="section-header"
                      data-bs-toggle="collapse"
                      data-bs-target="#sizes"
                    >
                      <span>Sizes</span>
                      <div className="d-flex align-items-center gap-2">
                        {selectedSizes.length > 0 && (
                          <span className="active-badge">
                            {selectedSizes.length} active
                          </span>
                        )}
                        <FiPlus />
                      </div>
                    </div>
                    <div id="sizes" className="collapse">
                      <div className="section-body d-flex flex-wrap gap-2 pb-3">
                        {availableSizes.map((size, idx) => (
                          <div
                            key={idx}
                            className={`size-pill ${
                              selectedSizes.includes(size) ? "active" : ""
                            }`}
                            onClick={() =>
                              toggleFilter(
                                selectedSizes,
                                setSelectedSizes,
                                size
                              )
                            }
                          >
                            {size}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* PRICE RANGE */}
                  <div className="filter-section">
                    <div
                      className="section-header"
                      data-bs-toggle="collapse"
                      data-bs-target="#price"
                    >
                      <span>Price Range</span>
                      <div className="d-flex align-items-center gap-2">
                        <FiPlus />
                      </div>
                    </div>
                    <div id="price" className="collapse">
                      <div className="section-body pb-3">
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="number"
                            className="price-input"
                            placeholder="Min"
                            value={priceRange.min}
                            onChange={(e) =>
                              setPriceRange({
                                ...priceRange,
                                min: e.target.value,
                              })
                            }
                          />
                          <span className="text-muted">To</span>
                          <input
                            type="number"
                            className="price-input"
                            placeholder="Max"
                            value={priceRange.max}
                            onChange={(e) =>
                              setPriceRange({
                                ...priceRange,
                                max: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="clear-all-btn"
                  onClick={() => {
                    setSelectedCats([]);
                    setSelectedBrands([]); // ADDED: Clear Brands
                    setSelectedColors([]);
                    setSelectedSizes([]);
                    setPriceRange({ min: 0, max: maxPriceLimit });
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* PRODUCTS GRID */}
          <div className="col-lg-9">
            <div className="d-flex align-items-end mb-4 border-bottom pb-4">
              <h2
                className="fw-bold m-0"
                style={{ color: "#333", fontSize: "24px" }}
              >
                All products
              </h2>
              <span className="ms-2 text-muted" style={{ fontSize: "14px" }}>
                ({filteredProducts.length} results)
              </span>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger mb-3"></div>
                <h6 className="text-muted fw-bold">Loading products...</h6>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-5">
                <h4>No products found</h4>
              </div>
            ) : (
              <>
                <div className="row g-4 mb-4">
                  {filteredProducts.slice(0, visibleLimit).map((p) => (
                    <div key={p._id} className="col-md-4 col-6">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>

                {/* INFINITE SCROLL LOADING TEXT */}
                {visibleLimit < filteredProducts.length && (
                  <div className="text-center py-4 text-muted fw-bold">
                    Loading products...
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* FIX: Added Bootstrap d-lg-none class to absolutely kill it on desktop */}
      <button
        className="mobile-filter-btn d-lg-none d-flex"
        onClick={() => setShowMobileSidebar(true)}
      >
        <FiFilter size={18} /> Filters
      </button>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .sidebar-sticky { position: sticky; top: 100px; }
        .filter-card { background: #fff; border-radius: 8px; border: 1px solid #eee; }
        .filter-main-header { padding: 15px 20px; border-bottom: 1px solid #f0f0f0; }
        .filter-main-header h5 { font-size: 14px; color: #333; }
        .filter-section { border-bottom: 1px solid #f8f8f8; }
        .section-header { padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-size: 14px; font-weight: 600; color: #444; }
        .section-body { padding: 0 20px 12px 20px; }
        .filter-row { display: flex; align-items: center; padding: 6px 0; cursor: pointer; font-size: 13px; transition: 0.2s; }
        .filter-row:hover { color: #de433f; }
        .active-badge { background: #de433f; color: #fff; font-size: 9px; padding: 1px 6px; border-radius: 4px; }
        .custom-check { width: 16px; height: 16px; border: 1px solid #ddd; border-radius: 3px; display: flex; align-items: center; justify-content: center; color: #fff; }
        .custom-check.checked { background: #de433f; border-color: #de433f; }
        .price-input { width: 100%; border: 1px solid #eee; border-radius: 4px; padding: 6px 10px; font-size: 12px; outline: none; }
        .price-input:focus { border-color: #de433f; }
        .clear-all-btn { width: calc(100% - 40px); margin: 15px 20px; padding: 8px; border: 1px solid #de433f; background: #de433f; color: #fff; border-radius: 6px; font-size: 12px; font-weight: 700; transition: 0.3s; }
        .clear-all-btn:hover { background: #fff; color: #de433f; }
        .text-danger { color: #de433f !important; }
        .color-box { width: 24px; height: 24px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .color-box.active { transform: scale(1.1); box-shadow: 0 0 0 2px #fff, 0 0 0 2px #de433f !important; border-color: transparent !important; }
        .size-pill { padding: 4px 10px; border: 1px solid #eee; border-radius: 4px; cursor: pointer; font-size: 12px; transition: 0.2s; }
        .size-pill.active { background: #de433f; color: #fff; border-color: #de433f; }
        
        @media (max-width: 1000px) {
          .filter-wrapper {
            position: fixed;
            top: 0;
            left: -350px;
            width: 300px;
            max-width: 85vw;
            height: 100vh;
            background: #fff;
            z-index: 9999;
            transition: left 0.3s ease-in-out;
            overflow-y: auto;
            padding: 0 !important;
            margin: 0 !important;
          }
          .filter-wrapper.open { left: 0; }
          .sidebar-overlay { display: none; }
          .sidebar-overlay.open {
            display: block; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 9998;
          }
          .filter-card { border: none; border-radius: 0; box-shadow: none !important; }
          .sidebar-sticky { position: static; }
          .close-filter-btn { display: block; background: none; border: none; padding: 0; }
          
          .mobile-filter-btn {
            align-items: center; justify-content: center; gap: 8px; position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #de433f; color: #fff; border: none; padding: 12px 28px; border-radius: 50px; font-size: 16px; font-weight: 700; z-index: 9990; box-shadow: 0 4px 12px rgba(222, 67, 63, 0.4); cursor: pointer; transition: 0.2s ease;
          }
        }
      `,
        }}
      />
    </div>
  );
};

export default ShopSection;
