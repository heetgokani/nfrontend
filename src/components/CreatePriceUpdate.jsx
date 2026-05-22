import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaSearch,
  FaCheckSquare,
  FaRegSquare,
  FaBolt,
  FaFilter,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreatePriceUpdate = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Update Settings
  const [action, setAction] = useState("increase"); // "increase", "decrease"
  const [updateType, setUpdateType] = useState("percentage"); // "percentage", "amount"
  const [updateValue, setUpdateValue] = useState("");

  const loadData = async () => {
    setFetching(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get("http://localhost:5000/api/products/"),
        axios.get("http://localhost:5000/api/category/all"),
      ]);

      const baseProducts = prodRes.data;
      setCategories(catRes.data);

      // Fetch deep variant details just like ViewProducts
      const productsWithVariants = await Promise.all(
        baseProducts.map(async (p) => {
          try {
            const detailRes = await axios.get(
              `http://localhost:5000/api/products/${p._id}`
            );
            return { ...p, variants: detailRes.data.variants || [] };
          } catch (e) {
            return { ...p, variants: [] };
          }
        })
      );

      setProducts(productsWithVariants);
      setFilteredProducts(productsWithVariants);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Apply Search & Category Filters
  useEffect(() => {
    let result = products;

    if (selectedCategory) {
      result = result.filter(
        (p) =>
          p.category?._id === selectedCategory ||
          p.category === selectedCategory
      );
    }

    if (search) {
      const lowerQ = search.toLowerCase();
      result = result.filter((p) => {
        const titleMatch = p.title?.toLowerCase().includes(lowerQ);
        const brandMatch = (p.brand?.name || "").toLowerCase().includes(lowerQ);
        return titleMatch || brandMatch;
      });
    }

    setFilteredProducts(result);
  }, [search, selectedCategory, products]);

  // Checkbox Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]); // Deselect all
    } else {
      setSelectedIds(filteredProducts.map((p) => p._id)); // Select all visible
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Helper to show explicit prices for the Admin
  const getExplicitPriceData = (product) => {
    if (!product.variants || product.variants.length === 0)
      return { orig: "N/A", disc: "N/A", hasDiscount: false };

    const origPrices = product.variants.map((v) => Number(v.price) || 0);
    const discPrices = product.variants.map(
      (v) => Number(v.discountPrice) || 0
    );

    const minO = Math.min(...origPrices);
    const maxO = Math.max(...origPrices);
    const minD = Math.min(...discPrices);
    const maxD = Math.max(...discPrices);

    return {
      orig: minO === maxO ? `₹${minO}` : `₹${minO} - ₹${maxO}`,
      disc: minD === maxD ? `₹${minD}` : `₹${minD} - ₹${maxD}`,
      hasDiscount: maxD > 0,
    };
  };

  // The Bulk Update Engine
  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0)
      return toast.warn("Please select at least one product.");
    if (!updateValue || isNaN(updateValue) || Number(updateValue) < 0) {
      return toast.warn("Please enter a valid positive number.");
    }

    const confirmMsg = `Are you sure you want to update ${selectedIds.length} products? This affects BOTH Original and Discount prices across all variants.`;
    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    let successCount = 0;
    const val = Number(updateValue);

    for (const id of selectedIds) {
      const product = products.find((p) => p._id === id);
      if (!product) continue;

      // 1. Re-calculate BOTH prices for all variants
      const updatedVariants = product.variants.map((v) => {
        // Use basePriceWithoutTax to prevent tax inflation loops if universal inclusive tax is active
        let currentOriginal = Number(
          v.basePriceWithoutTax || v.price || v.originalPrice || 0
        );
        let currentDiscount = Number(
          v.baseDiscountWithoutTax || v.discountPrice || 0
        );

        let newOriginal = currentOriginal;
        let newDiscount = currentDiscount;

        if (action === "increase") {
          newOriginal =
            updateType === "amount"
              ? currentOriginal + val
              : currentOriginal + currentOriginal * (val / 100);
          newDiscount =
            updateType === "amount"
              ? currentDiscount + val
              : currentDiscount + currentDiscount * (val / 100);
        } else if (action === "decrease") {
          newOriginal =
            updateType === "amount"
              ? currentOriginal - val
              : currentOriginal - currentOriginal * (val / 100);
          newDiscount =
            updateType === "amount"
              ? currentDiscount - val
              : currentDiscount - currentDiscount * (val / 100);
        }

        // Keep INR clean without decimals
        newOriginal = Math.round(newOriginal);
        newDiscount = Math.round(newDiscount);

        if (newOriginal < 0) newOriginal = 0;
        if (newDiscount < 0) newDiscount = 0;

        return {
          title: v.title,
          sku: v.sku,
          attributes: v.attributes || [],
          originalPrice: newOriginal,
          discountPrice: newDiscount,
          stock: v.stock,
          sgst: v.sgst,
          cgst: v.cgst,
          tag: v.tag?._id || v.tag || "",
          isDefault: v.isDefault || false,
          existingImages: v.images || [], // Feed existing paths directly back to backend
        };
      });

      // 2. Format FormData strictly for your updateProduct route
      const formData = new FormData();
      formData.append("title", product.title);
      if (product.brand?._id) formData.append("brand", product.brand._id);
      if (product.category?._id)
        formData.append("category", product.category._id);
      if (product.subcategory?._id)
        formData.append("subcategory", product.subcategory._id);
      formData.append("vendor", product.vendor || "");
      formData.append("status", product.status || "Active");
      formData.append("description", product.description || "");

      const formattedAttrs = (product.productAttributes || []).map((pa) => ({
        attribute: pa.attribute?._id || pa.attribute,
        selectedTerms: pa.selectedTerms || [],
      }));
      formData.append("productAttributes", JSON.stringify(formattedAttrs));
      formData.append("variants", JSON.stringify(updatedVariants));

      // 3. Send Request
      try {
        await axios.put(
          `http://localhost:5000/api/products/update/${product._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        successCount++;
      } catch (err) {
        console.error(`Failed updating product ${product._id}`, err);
      }
    }

    setLoading(false);
    toast.success(`Successfully updated prices for ${successCount} products!`);
    setSelectedIds([]);
    setUpdateValue("");
    loadData(); // Refresh the list to show new prices
  };

  const s = {
    wrapper: {
      maxWidth: "1400px",
      margin: "0 auto",
      fontFamily: "'Inter', sans-serif",
      color: "#334155",
      padding: "20px",
    },
    headerCard: {
      background: "#fff",
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      marginBottom: "20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    title: {
      fontSize: "22px",
      fontWeight: "800",
      margin: "0 0 15px 0",
      color: "#0f172a",
    },
    filterGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "15px",
      marginBottom: "20px",
    },
    input: {
      padding: "10px 15px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      fontSize: "14px",
      width: "100%",
      outline: "none",
      boxSizing: "border-box",
      background: "#f8fafc",
    },
    updatePanel: {
      background: "#f1f5f9",
      padding: "20px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
    },
    updateGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr) auto",
      gap: "15px",
      alignItems: "end",
    },
    label: {
      fontSize: "12px",
      fontWeight: "700",
      color: "#64748b",
      marginBottom: "6px",
      display: "block",
      textTransform: "uppercase",
    },
    btn: {
      background: "var(--mern-admin-primary, #3b82f6)",
      color: "white",
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      fontWeight: "700",
      cursor: "pointer",
      height: "40px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      whiteSpace: "nowrap",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "#fff",
      borderRadius: "8px",
      overflow: "hidden",
    },
    th: {
      textAlign: "left",
      padding: "15px",
      borderBottom: "2px solid #e2e8f0",
      color: "#64748b",
      fontSize: "13px",
    },
    td: {
      padding: "12px 15px",
      borderBottom: "1px solid #e2e8f0",
      verticalAlign: "middle",
      fontSize: "14px",
    },
    img: {
      width: "40px",
      height: "40px",
      borderRadius: "6px",
      objectFit: "cover",
      border: "1px solid #e2e8f0",
    },
    checkBtn: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#94a3b8",
      fontSize: "18px",
      padding: 0,
    },
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 900px) {
            .responsive-update-grid { grid-template-columns: 1fr 1fr !important; }
            .responsive-update-btn { grid-column: span 2 !important; width: 100%; justify-content: center; }
          }
          @media (max-width: 600px) {
            .responsive-filter-grid { grid-template-columns: 1fr !important; }
            .responsive-update-grid { grid-template-columns: 1fr !important; }
            .responsive-update-btn { grid-column: span 1 !important; }
            .hide-mobile { display: none !important; }
          }
        `}
      </style>

      <div style={s.wrapper}>
        <ToastContainer position="top-right" autoClose={2000} />

        <div style={s.headerCard}>
          <h2 style={s.title}>
            <FaBolt color="#eab308" style={{ marginRight: "8px" }} />
            Bulk Price Update
          </h2>

          {/* Filters */}
          <div style={s.filterGrid} className="responsive-filter-grid">
            <div>
              <label style={s.label}>Search Products</label>
              <div style={{ position: "relative" }}>
                <FaSearch
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "13px",
                    color: "#94a3b8",
                  }}
                />
                <input
                  style={{ ...s.input, paddingLeft: "35px" }}
                  placeholder="Search by Name or Brand..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label style={s.label}>Filter by Category</label>
              <div style={{ position: "relative" }}>
                <FaFilter
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "13px",
                    color: "#94a3b8",
                  }}
                />
                <select
                  style={{ ...s.input, paddingLeft: "35px" }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Update Engine Panel */}
          <div style={s.updatePanel}>
            <div style={s.updateGrid} className="responsive-update-grid">
              <div>
                <label style={s.label}>Action</label>
                <select
                  style={s.input}
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                >
                  <option value="increase">Increase (+)</option>
                  <option value="decrease">Decrease (-)</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Update Type</label>
                <select
                  style={s.input}
                  value={updateType}
                  onChange={(e) => setUpdateType(e.target.value)}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="amount">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Value</label>
                <input
                  style={s.input}
                  type="number"
                  placeholder="e.g. 10"
                  value={updateValue}
                  onChange={(e) => setUpdateValue(e.target.value)}
                  min="0"
                />
              </div>
              <button
                style={{
                  ...s.btn,
                  opacity: loading || selectedIds.length === 0 ? 0.6 : 1,
                }}
                onClick={handleBulkUpdate}
                disabled={loading || selectedIds.length === 0}
                className="responsive-update-btn"
              >
                {loading
                  ? "Updating..."
                  : `Apply to ${selectedIds.length} Selected`}
              </button>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
          }}
        >
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: "40px", textAlign: "center" }}>
                  <button onClick={toggleSelectAll} style={s.checkBtn}>
                    {filteredProducts.length > 0 &&
                    selectedIds.length === filteredProducts.length ? (
                      <FaCheckSquare color="#3b82f6" />
                    ) : (
                      <FaRegSquare />
                    )}
                  </button>
                </th>
                <th style={{ ...s.th, width: "60px" }}>Image</th>
                <th style={s.th}>Product Title</th>
                <th style={s.th} className="hide-mobile">
                  Category
                </th>
                <th style={s.th} className="hide-mobile">
                  Variants
                </th>
                <th style={s.th}>Min - Max Variant Prices</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#94a3b8",
                    }}
                  >
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#94a3b8",
                    }}
                  >
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isSelected = selectedIds.includes(p._id);
                  const firstVariant = p.variants?.[0] || {};
                  const displayImg = firstVariant.images?.[0]
                    ? `http://localhost:5000${firstVariant.images[0]}`
                    : p.thumbnail
                    ? `http://localhost:5000${p.thumbnail}`
                    : "https://via.placeholder.com/40";

                  const priceData = getExplicitPriceData(p);

                  return (
                    <tr
                      key={p._id}
                      style={{
                        background: isSelected ? "#eff6ff" : "transparent",
                      }}
                    >
                      <td style={{ ...s.td, textAlign: "center" }}>
                        <button
                          onClick={() => toggleSelect(p._id)}
                          style={s.checkBtn}
                        >
                          {isSelected ? (
                            <FaCheckSquare color="#3b82f6" />
                          ) : (
                            <FaRegSquare />
                          )}
                        </button>
                      </td>
                      <td style={s.td}>
                        <img src={displayImg} style={s.img} alt="Product" />
                      </td>
                      <td
                        style={{ ...s.td, fontWeight: "600", color: "#0f172a" }}
                      >
                        {p.title}
                      </td>
                      <td style={s.td} className="hide-mobile">
                        {p.category?.title || "—"}
                      </td>
                      <td style={s.td} className="hide-mobile">
                        {p.variants?.length || 0}
                      </td>
                      <td style={{ ...s.td, fontSize: "13px" }}>
                        <div>
                          <span
                            style={{
                              color: "#64748b",
                              fontWeight: "600",
                              display: "inline-block",
                              width: "60px",
                              marginRight: "8px",
                            }}
                          >
                            Original:
                          </span>
                          <span style={{ color: "#10b981", fontWeight: "700" }}>
                            {priceData.orig}
                          </span>
                        </div>
                        {priceData.hasDiscount && (
                          <div style={{ marginTop: "4px" }}>
                            <span
                              style={{
                                color: "#64748b",
                                fontWeight: "600",
                                display: "inline-block",
                                width: "60px",
                                marginRight: "10px",
                              }}
                            >
                              Discount:
                            </span>
                            <span
                              style={{ color: "#3b82f6", fontWeight: "700" }}
                            >
                              {priceData.disc}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CreatePriceUpdate;
