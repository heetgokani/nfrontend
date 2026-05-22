import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlus,
  FaTrash,
  FaLayerGroup,
  FaPen,
  FaSave,
  FaTimes,
  FaSortNumericDown,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // --- FIX: Point directly to Backend Port 5000 ---
  const API_URL = "http://localhost:5000/api/category";

  // Initial Form State
  const initialState = {
    title: "",
    order: 0,
    subcategories: [],
  };

  const [formData, setFormData] = useState(initialState);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/all`, { withCredentials: true });
      const sortedData = res.data.sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
      setCategories(sortedData);
    } catch (err) {
      console.error("Fetch error:", err);
      // Don't toast on load to avoid spamming if server is down
    }
  };

  // --- FORM HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Subcategory Handlers
  const handleSubChange = (index, value) => {
    const subs = [...formData.subcategories];
    subs[index].title = value;
    setFormData({ ...formData, subcategories: subs });
  };

  const addSub = () => {
    setFormData({
      ...formData,
      subcategories: [...formData.subcategories, { title: "" }],
    });
  };

  const removeSub = (index) => {
    const subs = formData.subcategories.filter((_, i) => i !== index);
    setFormData({ ...formData, subcategories: subs });
  };

  // Edit Mode Setup
  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setFormData({
      title: cat.title,
      order: cat.order || 0,
      subcategories: cat.subcategories || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(initialState);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up subcategories (remove empty ones)
      const cleanedData = {
        ...formData,
        subcategories: formData.subcategories.filter(
          (sub) => sub.title.trim() !== ""
        ),
      };

      // Axios Config to match your Server CORS
      const config = { withCredentials: true };

      if (editingId) {
        await axios.put(`${API_URL}/update/${editingId}`, cleanedData, config);
        toast.success("Category Updated!");
      } else {
        await axios.post(`${API_URL}/add`, cleanedData, config);
        toast.success("Category Created!");
      }

      setFormData(initialState);
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      // Improved Error Message Handling
      const errMsg =
        err.response?.data?.message || err.message || "Operation failed";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      await axios.delete(`${API_URL}/delete/${id}`, { withCredentials: true });
      toast.success("Deleted successfully");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  // --- STYLES ---
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
    inputGrid: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
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
    },
    subList: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      background: "#f8fafc",
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid var(--mern-admin-border)",
    },
    subItem: {
      display: "flex",
      gap: "10px",
      alignItems: "center",
    },
    iconBtn: (color) => ({
      background: "transparent",
      border: "none",
      color: color,
      cursor: "pointer",
      padding: "8px",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }),
    addBtn: {
      background: "var(--mern-admin-secondary)",
      color: "var(--mern-admin-text-white)",
      padding: "8px 16px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontWeight: "600",
      fontSize: "13px",
      width: "fit-content",
      whiteSpace: "nowrap",
      flexShrink: 0,
    },
    submitBtn: {
      width: "100%",
      padding: "16px",
      borderRadius: "12px",
      background: "var(--mern-admin-primary)",
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: "700",
      border: "none",
      cursor: "pointer",
      marginTop: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    cancelBtn: {
      background: "transparent",
      color: "#64748b",
      border: "1px solid #cbd5e1",
      padding: "10px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      whiteSpace: "nowrap",
      flexShrink: 0,
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
    },
    badge: {
      background: "#e2e8f0",
      color: "#475569",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: "bold",
      marginRight: "5px",
    },
  };

  return (
    <>
      <style>
        {`
          /* Universally force border-box within this component to prevent horizontal scroll overflow */
          .responsive-wrapper * {
            box-sizing: border-box !important;
          }

          @media (max-width: 768px) {
            .responsive-wrapper { 
              padding: 10px !important; 
              overflow-x: hidden; /* Hard stop to any edge bleed */
            }
            .responsive-card { padding: 15px !important; }
            .responsive-input-grid { 
              grid-template-columns: 1fr !important; 
              gap: 15px !important; 
            }
            .responsive-sub-list {
              padding: 12px !important;
            }
            .responsive-cancel-btn { 
              width: 100% !important; 
              text-align: center !important; 
              padding: 12px !important;
            }
            
            /* Stack card headers cleanly */
            .responsive-card-header {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 15px !important;
            }
            
            /* Allow subcategories header to wrap if screen is extremely small */
            .responsive-sub-header {
              flex-wrap: wrap !important;
              gap: 10px !important;
            }
            
            /* Convert Table to Cards */
            .responsive-table, .responsive-table tbody, .responsive-table tr, .responsive-table td {
              display: block !important;
              width: 100% !important;
            }
            .responsive-table thead { display: none !important; }
            .responsive-table tr {
              margin-bottom: 15px !important;
              border: 1px solid #e2e8f0 !important;
              border-radius: 8px !important;
              padding: 12px !important;
            }
            .responsive-table td {
              border: none !important;
              padding: 8px 0 !important;
              display: flex !important;
              align-items: flex-start !important; /* Allow wrapping text to align nicely */
              justify-content: space-between !important;
              text-align: right !important;
              word-break: break-word !important;
            }
            
            /* Insert column labels via CSS before the data */
            .responsive-table td::before {
              content: attr(data-label);
              font-weight: 700 !important;
              color: #64748b !important;
              text-transform: uppercase !important;
              font-size: 11px !important;
              margin-right: 15px !important;
              flex-shrink: 0;
            }

            /* Push Subcategories and Actions to the right on mobile */
            .responsive-subcats {
              justify-content: flex-end !important;
              max-width: 65%; /* Ensure pills don't push the label off screen */
            }
            .responsive-actions {
              justify-content: flex-end !important;
            }
          }
        `}
      </style>

      <div style={s.wrapper} className="responsive-wrapper">
        <ToastContainer position="top-right" autoClose={2000} />

        {/* HEADER */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>Category Management</h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
              Create and manage product categories & subcategories
            </p>
          </div>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "30px" }}
        >
          {/* --- LEFT: FORM SECTION --- */}
          <div style={s.card} className="responsive-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
              className="responsive-card-header"
            >
              <div style={{ ...s.sectionHeader, margin: 0 }}>
                <FaLayerGroup
                  color="var(--mern-admin-primary)"
                  style={{ flexShrink: 0 }}
                />
                <span>
                  {editingId ? "Edit Category" : "Create New Category"}
                </span>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  style={s.cancelBtn}
                  className="responsive-cancel-btn"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={s.inputGrid} className="responsive-input-grid">
                <div style={s.inputGroup}>
                  <label style={s.label}>Category Title</label>
                  <input
                    style={s.input}
                    type="text"
                    name="title"
                    placeholder="e.g. Men's Fashion"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div style={s.inputGroup}>
                  <label style={s.label}>Display Order</label>
                  <input
                    style={s.input}
                    type="number"
                    name="order"
                    placeholder="0"
                    value={formData.order}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div style={s.inputGroup}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  className="responsive-sub-header"
                >
                  <label style={s.label}>Subcategories</label>
                  <button type="button" onClick={addSub} style={s.addBtn}>
                    <FaPlus size={10} /> Add Sub
                  </button>
                </div>

                <div style={s.subList} className="responsive-sub-list">
                  {formData.subcategories.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "13px",
                        color: "#94a3b8",
                        fontStyle: "italic",
                      }}
                    >
                      No subcategories added yet.
                    </div>
                  )}

                  {formData.subcategories.map((sub, index) => (
                    <div key={index} style={s.subItem}>
                      <FaSortNumericDown
                        color="#cbd5e1"
                        style={{ flexShrink: 0 }}
                      />
                      <input
                        style={{ ...s.input, width: "100%" }}
                        type="text"
                        placeholder="Subcategory Name"
                        value={sub.title}
                        onChange={(e) => handleSubChange(index, e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeSub(index)}
                        style={s.iconBtn("var(--mern-admin-danger)")}
                        title="Remove Subcategory"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} style={s.submitBtn}>
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <FaSave /> {editingId ? "Update Category" : "Save Category"}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* --- BOTTOM: LIST SECTION --- */}
          <div style={s.card} className="responsive-card">
            <div style={s.sectionHeader}>
              <FaLayerGroup
                color="var(--mern-admin-secondary)"
                style={{ flexShrink: 0 }}
              />
              <span>Existing Categories</span>
            </div>

            <div style={{ overflowX: "auto", width: "100%" }}>
              <table style={s.table} className="responsive-table">
                <thead>
                  <tr>
                    <th style={s.th}>Order</th>
                    <th style={s.th}>Category Name</th>
                    <th style={s.th}>Subcategories</th>
                    <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          ...s.td,
                          textAlign: "center",
                          color: "#94a3b8",
                          padding: "30px",
                        }}
                      >
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat._id}>
                        <td style={s.td} data-label="Order">
                          <span style={s.badge}>#{cat.order}</span>
                        </td>
                        <td
                          style={{ ...s.td, fontWeight: "600" }}
                          data-label="Category Name"
                        >
                          {cat.title}
                        </td>
                        <td style={s.td} data-label="Subcategories">
                          {cat.subcategories?.length > 0 ? (
                            <div
                              className="responsive-subcats"
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "5px",
                              }}
                            >
                              {cat.subcategories.map((sub, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: "11px",
                                    border: "1px solid #e2e8f0",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    background: "#f8fafc",
                                  }}
                                >
                                  {sub.title}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span
                              style={{ color: "#cbd5e1", fontSize: "12px" }}
                            >
                              None
                            </span>
                          )}
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
                              onClick={() => handleEdit(cat)}
                              style={s.iconBtn("var(--mern-admin-primary)")}
                              title="Edit"
                            >
                              <FaPen />
                            </button>
                            <button
                              onClick={() => handleDelete(cat._id)}
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
      </div>
    </>
  );
};

export default CreateCategory;
