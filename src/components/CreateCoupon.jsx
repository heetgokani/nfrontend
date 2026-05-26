import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlus,
  FaTrash,
  FaPercent,
  FaCalendarAlt,
  FaBoxOpen,
  FaList,
  FaTag,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "Percentage",
    discountValue: "",
    minOrderAmount: 0,
    maxDiscountAmount: "",
    expiryDate: "",
    applyTo: "All Products",
    selectedCategories: [],
    selectedProducts: [],
    status: "Active",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [couponRes, catRes, prodRes] = await Promise.all([
        axios.get("https://nikam-ecom-backend.onrender.com/api/coupons/all"),
        axios.get("https://nikam-ecom-backend.onrender.com/api/category/all"),
        axios.get("https://nikam-ecom-backend.onrender.com/api/products"),
      ]);
      setCoupons(couponRes.data);
      setCategories(catRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      toast.error("Error loading data");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelection = (id, type) => {
    const key = type === "category" ? "selectedCategories" : "selectedProducts";
    setFormData((prev) => {
      const current = prev[key];
      const updated = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      return { ...prev, [key]: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await axios.put(
          `https://nikam-ecom-backend.onrender.com/api/coupons/update/${editId}`,
          formData
        );
        toast.success("Coupon Updated");
      } else {
        await axios.post(
          "https://nikam-ecom-backend.onrender.com/api/coupons/create",
          formData
        );
        toast.success("Coupon Created");
      }
      resetForm();
      fetchInitialData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving coupon");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({
      code: "",
      description: "",
      discountType: "Percentage",
      discountValue: "",
      minOrderAmount: 0,
      maxDiscountAmount: "",
      expiryDate: "",
      applyTo: "All Products",
      selectedCategories: [],
      selectedProducts: [],
      status: "Active",
    });
  };

  const handleEdit = (coupon) => {
    setEditId(coupon._id);
    setFormData({
      ...coupon,
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split("T")[0] : "",
      selectedCategories: coupon.selectedCategories?.map((c) => c._id) || [],
      selectedProducts: coupon.selectedProducts?.map((p) => p._id) || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await axios.delete(
        `https://nikam-ecom-backend.onrender.com/api/coupons/delete/${id}`
      );
      toast.success("Deleted");
      fetchInitialData();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // --- STYLES SYSTEM ---
  const s = {
    wrapper: {
      maxWidth: "1200px",
      margin: "0 auto",
      fontFamily: "'Inter', sans-serif",
      color: "var(--mern-admin-text-main)",
      padding: "20px",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
      marginBottom: "30px",
      borderBottom: "1px solid var(--mern-admin-border)",
      paddingBottom: "20px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "800",
      color: "var(--mern-admin-text-main)",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    card: {
      background: "#ffffff",
      borderRadius: "16px",
      border: "1px solid var(--mern-admin-border)",
      padding: "30px",
      marginBottom: "25px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    },
    sectionHeader: {
      fontSize: "18px",
      fontWeight: "700",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      color: "var(--mern-admin-secondary)",
    },
    inputGrid3: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      marginBottom: "20px",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#64748b",
      textTransform: "uppercase",
    },
    input: {
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid var(--mern-admin-border)",
      fontSize: "14px",
      outline: "none",
      background: "#f8fafc",
      color: "var(--mern-admin-text-main)",
      transition: "border 0.2s",
      width: "100%",
      boxSizing: "border-box",
    },
    selectionBox: {
      maxHeight: "180px",
      overflowY: "auto",
      border: "1px solid var(--mern-admin-border)",
      borderRadius: "8px",
      padding: "15px",
      background: "#f8fafc",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "12px",
    },
    checkboxLabel: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "14px",
      color: "#334155",
      cursor: "pointer",
      fontWeight: "500",
    },
    checkboxInput: {
      width: "16px",
      height: "16px",
      cursor: "pointer",
      accentColor: "var(--mern-admin-primary)",
    },
    submitBtn: {
      padding: "14px 24px",
      borderRadius: "8px",
      background: "var(--mern-admin-primary)",
      color: "#ffffff",
      fontSize: "15px",
      fontWeight: "700",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      flex: 1,
    },
    cancelBtn: {
      background: "transparent",
      color: "#64748b",
      border: "1px solid #cbd5e1",
      padding: "14px 24px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "10px",
    },
    th: {
      textAlign: "left",
      padding: "15px",
      borderBottom: "2px solid var(--mern-admin-border)",
      color: "#64748b",
      fontSize: "12px",
      textTransform: "uppercase",
    },
    td: {
      padding: "15px",
      borderBottom: "1px solid var(--mern-admin-border)",
      color: "var(--mern-admin-text-main)",
      verticalAlign: "middle",
      fontSize: "14px",
    },
    badge: {
      background: "#e2e8f0",
      color: "#475569",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: "bold",
    },
    badgeSuccess: {
      background: "#dcfce7",
      color: "#166534",
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "bold",
    },
    badgeDanger: {
      background: "#fee2e2",
      color: "#991b1b",
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "bold",
    },
    iconBtn: (color) => ({
      background: "transparent",
      border: "none",
      color: color,
      cursor: "pointer",
      padding: "8px",
      fontSize: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }),
  };

  return (
    <>
      <style>
        {`
          .responsive-wrapper * { box-sizing: border-box !important; }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

          @media (max-width: 768px) {
            .responsive-wrapper { padding: 10px !important; overflow-x: hidden; }
            .responsive-card { padding: 15px !important; }
            .responsive-input-grid { grid-template-columns: 1fr !important; gap: 15px !important; }
            .responsive-btn-group { flex-direction: column !important; }

            /* Convert Table to Cards */
            .responsive-table, .responsive-table tbody, .responsive-table tr, .responsive-table td {
              display: block !important; width: 100% !important;
            }
            .responsive-table thead { display: none !important; }
            .responsive-table tr {
              margin-bottom: 15px !important;
              border: 1px solid #e2e8f0 !important;
              border-radius: 8px !important;
              padding: 12px !important;
              background: #fff !important;
            }
            .responsive-table td {
              border: none !important;
              padding: 8px 0 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              text-align: right !important;
              border-bottom: 1px solid #f1f5f9 !important;
              gap: 15px !important;
            }
            .responsive-table td:last-child { border-bottom: none !important; }
            .responsive-table td::before {
              content: attr(data-label);
              font-weight: 700 !important;
              color: #64748b !important;
              text-transform: uppercase !important;
              font-size: 11px !important;
              flex-shrink: 0;
            }
            .responsive-actions { justify-content: flex-end !important; }
          }
        `}
      </style>

      <div style={s.wrapper} className="responsive-wrapper">
        <ToastContainer position="top-right" autoClose={2000} />

        {/* HEADER */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>
              <FaPercent color="var(--mern-admin-primary)" /> Manage Coupons
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#64748b",
                marginTop: "5px",
              }}
            >
              Create and manage promotional discount codes
            </p>
          </div>
        </div>

        {/* FORM SECTION */}
        <div style={s.card} className="responsive-card">
          <div style={s.sectionHeader}>
            <FaTag color="var(--mern-admin-primary)" />
            <span>{editId ? "Edit Coupon" : "Create New Coupon"}</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={s.inputGrid3} className="responsive-input-grid">
              <div style={s.inputGroup}>
                <label style={s.label}>Coupon Code *</label>
                <input
                  style={s.input}
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g. SUMMER50"
                  required
                />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Discount Type *</label>
                <select
                  style={s.input}
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                >
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Fixed Amount">Fixed Amount (₹)</option>
                </select>
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Discount Value *</label>
                <input
                  style={s.input}
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  placeholder="e.g. 20"
                  required
                />
              </div>
            </div>

            <div style={s.inputGrid3} className="responsive-input-grid">
              <div style={s.inputGroup}>
                <label style={s.label}>Min Order Amount (₹)</label>
                <input
                  style={s.input}
                  type="number"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Max Discount Amount (₹)</label>
                <input
                  style={s.input}
                  type="number"
                  name="maxDiscountAmount"
                  value={formData.maxDiscountAmount}
                  onChange={handleInputChange}
                  placeholder="Leave empty for no limit"
                />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Expiry Date</label>
                <input
                  style={s.input}
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div style={{ ...s.inputGroup, marginBottom: "20px" }}>
              <label style={s.label}>Apply To *</label>
              <select
                style={s.input}
                name="applyTo"
                value={formData.applyTo}
                onChange={handleInputChange}
              >
                <option value="All Products">All Products</option>
                <option value="Specific Categories">Specific Categories</option>
                <option value="Specific Products">Specific Products</option>
              </select>
            </div>

            {/* Conditional Category Selection */}
            {formData.applyTo === "Specific Categories" && (
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{ ...s.label, marginBottom: "8px", display: "block" }}
                >
                  Select Categories
                </label>
                <div style={s.selectionBox} className="custom-scrollbar">
                  {categories.map((cat) => (
                    <label key={cat._id} style={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        style={s.checkboxInput}
                        checked={formData.selectedCategories.includes(cat._id)}
                        onChange={() => handleSelection(cat._id, "category")}
                      />
                      {cat.title}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Conditional Product Selection */}
            {formData.applyTo === "Specific Products" && (
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{ ...s.label, marginBottom: "8px", display: "block" }}
                >
                  Select Products
                </label>
                <div style={s.selectionBox} className="custom-scrollbar">
                  {products.map((prod) => (
                    <label key={prod._id} style={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        style={s.checkboxInput}
                        checked={formData.selectedProducts.includes(prod._id)}
                        onChange={() => handleSelection(prod._id, "product")}
                      />
                      {prod.title}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{ display: "flex", gap: "15px" }}
              className="responsive-btn-group"
            >
              <button type="submit" style={s.submitBtn} disabled={loading}>
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <FaSave /> {editId ? "Update Coupon" : "Save Coupon"}
                  </>
                )}
              </button>
              {editId && (
                <button type="button" onClick={resetForm} style={s.cancelBtn}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LIST SECTION */}
        <div style={s.card} className="responsive-card">
          <div style={s.sectionHeader}>
            <FaList color="var(--mern-admin-secondary)" />
            <span>Active Coupons</span>
          </div>

          <div style={{ overflowX: "auto", width: "100%" }}>
            <table style={s.table} className="responsive-table">
              <thead>
                <tr>
                  <th style={s.th}>Code</th>
                  <th style={s.th}>Discount</th>
                  <th style={s.th}>Applies To</th>
                  <th style={s.th}>Expiry Date</th>
                  <th style={s.th}>Status</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        ...s.td,
                        textAlign: "center",
                        color: "#94a3b8",
                        padding: "30px",
                      }}
                    >
                      No coupons found.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td
                        style={{
                          ...s.td,
                          fontWeight: "800",
                          color: "var(--mern-admin-primary)",
                        }}
                        data-label="Code"
                      >
                        {coupon.code}
                      </td>
                      <td
                        style={{ ...s.td, fontWeight: "600" }}
                        data-label="Discount"
                      >
                        {coupon.discountType === "Percentage"
                          ? `${coupon.discountValue}% OFF`
                          : `₹${coupon.discountValue} OFF`}
                      </td>
                      <td style={s.td} data-label="Applies To">
                        <span style={s.badge}>{coupon.applyTo}</span>
                      </td>
                      <td style={s.td} data-label="Expiry Date">
                        {coupon.expiryDate
                          ? new Date(coupon.expiryDate).toLocaleDateString()
                          : "No Expiry"}
                      </td>
                      <td style={s.td} data-label="Status">
                        <span
                          style={
                            coupon.status === "Active"
                              ? s.badgeSuccess
                              : s.badgeDanger
                          }
                        >
                          {coupon.status}
                        </span>
                      </td>
                      <td
                        style={{ ...s.td, textAlign: "right" }}
                        data-label="Actions"
                      >
                        <div
                          className="responsive-actions"
                          style={{
                            display: "flex",
                            gap: "10px",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() => handleEdit(coupon)}
                            style={s.iconBtn("#3b82f6")}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            style={s.iconBtn("var(--mern-admin-danger)")}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCoupon;
