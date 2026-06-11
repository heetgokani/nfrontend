import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FaTrash, FaPen, FaSave, FaPercentage, FaGlobe } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ==========================================
// 🎨 BEAUTIFUL & FULLY RESPONSIVE CUSTOM DROPDOWN
// ==========================================
const CustomDropdown = ({ value, options, onChange, disabled, isGlobal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  return (
    <div
      ref={selectRef}
      style={{ position: "relative", width: "100%", boxSizing: "border-box" }}
    >
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          padding: "12px 15px",
          borderRadius: "8px",
          border: isGlobal
            ? "2px solid var(--mern-admin-primary)"
            : "1px solid #cbd5e1",
          background: disabled ? "#f1f5f9" : "#fff",
          color: disabled ? "#94a3b8" : "#1e293b",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: isGlobal ? "bold" : "normal",
          boxShadow:
            isOpen && !disabled ? "0 0 0 3px rgba(112, 0, 255, 0.15)" : "none",
          transition: "all 0.2s ease",
          userSelect: "none",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <span
          className="dropdown-text"
          style={{
            flex: 1,
            paddingRight: "10px",
            wordBreak: "break-word",
            whiteSpace: "normal",
            lineHeight: "1.4",
            textAlign: "left",
          }}
        >
          {selectedOption ? selectedOption.label : "Select..."}
        </span>
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 448 512"
          style={{
            flexShrink: 0,
            width: "14px",
            height: "14px",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        >
          <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path>
        </svg>
      </div>

      {isOpen && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "8px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            zIndex: 9999,
            overflow: "hidden",
            boxSizing: "border-box",
            width: "100%",
          }}
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              className="dropdown-option"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              onMouseEnter={(e) => {
                if (opt.value !== value)
                  e.target.style.backgroundColor = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                if (opt.value !== value)
                  e.target.style.backgroundColor = "transparent";
              }}
              style={{
                padding: "12px 15px",
                color:
                  opt.value === value ? "var(--mern-admin-primary)" : "#334155",
                background: opt.value === value ? "#f3e8ff" : "transparent",
                fontWeight: opt.value === value ? "600" : "normal",
                cursor: "pointer",
                transition: "background 0.2s ease",
                whiteSpace: "normal",
                wordBreak: "break-word",
                lineHeight: "1.4",
                textAlign: "left",
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
// ==========================================

const CreateGst = () => {
  const { auth } = useAuth();
  const permissions = auth?.user?.role?.permissions?.gst;

  const canAdd = permissions?.add;
  const canEdit = permissions?.edit;
  const canDelete = permissions?.delete;

  const [gstRates, setGstRates] = useState([]);
  const [globalTaxRule, setGlobalTaxRule] = useState("Exclusive");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const API_URL = "https://nbackend-31lg.onrender.com/api/gst";

  const initialState = {
    taxType: "SGST",
    rate: "",
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    fetchGstRates();
    fetchGlobalRule();
  }, []);

  const fetchGlobalRule = async () => {
    try {
      const res = await axios.get(`${API_URL}/universal`, {
        withCredentials: true,
      });
      setGlobalTaxRule(res.data.value || "Exclusive");
    } catch (err) {
      console.error("Failed to fetch global setting");
    }
  };

  const handleGlobalRuleChange = async (val) => {
    try {
      setGlobalTaxRule(val);
      await axios.post(
        `${API_URL}/universal`,
        { value: val },
        { withCredentials: true }
      );
      toast.success(
        `System set to: ${val === "Inclusive" ? "Include GST" : "Exclude GST"}`
      );
    } catch (err) {
      toast.error("Failed to update global setting");
    }
  };

  const fetchGstRates = async () => {
    try {
      const res = await axios.get(API_URL, { withCredentials: true });
      setGstRates(res.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (gst) => {
    if (!canEdit) return;
    setEditingId(gst._id);
    setFormData({
      taxType: gst.taxType,
      rate: gst.rate,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(initialState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = { withCredentials: true };

      if (editingId) {
        if (!canEdit) return toast.error("You don't have permission to edit.");
        await axios.put(`${API_URL}/${editingId}`, formData, config);
        toast.success("GST Rate Updated!");
      } else {
        if (!canAdd) return toast.error("You don't have permission to add.");
        await axios.post(API_URL, formData, config);
        toast.success("GST Rate Created!");
      }

      setFormData(initialState);
      setEditingId(null);
      fetchGstRates();
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.message || "Operation failed";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!canDelete) return toast.error("You don't have permission to delete.");
    if (!window.confirm("Are you sure you want to delete this GST rate?"))
      return;
    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      toast.success("Deleted successfully");
      fetchGstRates();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const s = {
    wrapper: {
      maxWidth: "1200px",
      margin: "0 auto",
      fontFamily: "'Inter', sans-serif",
      color: "var(--mern-admin-text-main)",
      padding: "20px",
      width: "100%",
      boxSizing: "border-box",
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
      width: "100%",
      boxSizing: "border-box",
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
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
      marginBottom: "20px",
      width: "100%",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      width: "100%",
      boxSizing: "border-box",
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
      transition: "border 0.2s, box-shadow 0.2s",
      width: "100%",
      boxSizing: "border-box",
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
    }),
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
    },
    cancelBtn: {
      background: "transparent",
      color: "#64748b",
      border: "1px solid #cbd5e1",
      padding: "10px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
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
    badge: (type) => ({
      background: type === "SGST" ? "#e0e7ff" : "#dcfce7",
      color: type === "SGST" ? "#3730a3" : "#166534",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: "bold",
      display: "inline-block",
    }),
  };

  return (
    <>
      <style>
        {`
          /* STRICT BOX SIZING PREVENTS MOBILE OVERFLOW */
          .responsive-wrapper * { box-sizing: border-box !important; }
          
          .custom-focus:focus {
            border-color: var(--mern-admin-primary) !important;
            box-shadow: 0 0 0 3px rgba(112, 0, 255, 0.15) !important;
            background-color: #fff !important;
          }

          .dropdown-text { font-size: 14px; }
          .dropdown-option { font-size: 14px; }

          /* TABLET RESPONSIVE FIXES (Under 768px) */
          @media (max-width: 768px) {
            .responsive-wrapper { padding: 15px !important; overflow-x: hidden; width: 100% !important; max-width: 100vw; }
            .responsive-card { padding: 20px 15px !important; width: 100% !important; }
            .responsive-card-header { flex-direction: column !important; align-items: flex-start !important; gap: 15px !important; }
            .responsive-input-grid { grid-template-columns: 1fr !important; gap: 15px !important; width: 100% !important; }
            
            /* Button Fixes */
            .submit-btn-wrapper { width: 100% !important; }
            .responsive-submit-btn { width: 100% !important; padding: 14px !important; }
            .responsive-cancel-btn { width: 100% !important; text-align: center !important; }
            
            /* Convert Table to Stacked Cards */
            .responsive-table, .responsive-table tbody, .responsive-table tr, .responsive-table td { display: block !important; width: 100% !important; }
            .responsive-table thead { display: none !important; }
            .responsive-table tr { margin-bottom: 15px !important; border: 1px solid #e2e8f0 !important; border-radius: 8px !important; padding: 12px !important; background: #fff !important; }
            .responsive-table td { border: none !important; padding: 10px 0 !important; display: flex !important; align-items: center !important; justify-content: space-between !important; text-align: right !important; border-bottom: 1px dashed #f1f5f9 !important; gap: 10px !important; }
            .responsive-table td:last-child { border-bottom: none !important; }
            .responsive-table td::before { content: attr(data-label); font-weight: 700 !important; color: #64748b !important; text-transform: uppercase !important; font-size: 11px !important; flex-shrink: 0; }
          }

          /* ULTRA SMALL MOBILE FIXES (Below 480px - Fixes the squishing) */
          @media (max-width: 480px) {
            .responsive-wrapper { padding: 10px !important; }
            .responsive-card { padding: 15px 12px !important; }
            
            .dropdown-text { font-size: 13px !important; }
            .dropdown-option { font-size: 13px !important; }
            
            /* Stack Table Rows Completely Vertically */
            .responsive-table td { 
              flex-direction: column !important; 
              align-items: flex-start !important; 
              text-align: left !important;
              gap: 8px !important; 
            }
            .responsive-table td::before { margin-bottom: 2px; }
            .actions-div { justify-content: flex-start !important; width: 100% !important; margin-top: 5px; }
          }
        `}
      </style>

      <div style={s.wrapper} className="responsive-wrapper">
        <ToastContainer position="top-right" autoClose={2000} />

        <div style={s.header}>
          <div>
            <h2 style={s.title}>GST Management</h2>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#64748b",
                marginTop: "4px",
              }}
            >
              Configure tax display for your store
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "25px",
            width: "100%",
          }}
        >
          {/* UNIVERSAL GLOBAL SETTING BOX */}
          <div
            style={{
              ...s.card,
              background: "#f8fafc",
              border: "2px solid #cbd5e1",
            }}
            className="responsive-card"
          >
            <div
              style={{
                ...s.sectionHeader,
                color: "#1e293b",
                marginBottom: "10px",
              }}
            >
              <FaGlobe color="var(--mern-admin-primary)" /> GST Setting
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "20px",
                lineHeight: "1.5",
              }}
            >
              Choose your gst rates and gst rates will be included in price from
              where you create your products.
            </p>
          </div>

          {(canAdd || (canEdit && editingId)) && (
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
                <div style={{ margin: 0, ...s.sectionHeader, marginBottom: 0 }}>
                  <FaPercentage color="var(--mern-admin-primary)" />
                  <span>
                    {editingId ? "Edit GST Rate" : "Add New GST Rate"}
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

              <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <div style={s.inputGrid} className="responsive-input-grid">
                  <div style={s.inputGroup}>
                    <label style={s.label}>Tax Type</label>
                    <CustomDropdown
                      disabled={editingId !== null}
                      value={formData.taxType}
                      onChange={(val) =>
                        handleInputChange({
                          target: { name: "taxType", value: val },
                        })
                      }
                      options={[
                        { value: "SGST", label: "SGST" },
                        { value: "CGST", label: "CGST" },
                      ]}
                    />
                  </div>
                  <div style={s.inputGroup}>
                    <label style={s.label}>Rate (%)</label>
                    <input
                      className="custom-focus"
                      style={s.input}
                      type="number"
                      step="0.01"
                      name="rate"
                      placeholder="e.g. 1.5, 9"
                      value={formData.rate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div
                  className="submit-btn-wrapper"
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    marginTop: "10px",
                    width: "100%",
                  }}
                >
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      ...s.submitBtn,
                      width: "100%", // Forces 100% on mobile automatically via wrapper
                      maxWidth: "200px", // Keeps it nice on desktop
                      padding: "16px",
                      margin: 0,
                    }}
                    className="responsive-submit-btn"
                  >
                    {loading ? (
                      "Processing..."
                    ) : (
                      <>
                        <FaSave /> {editingId ? "Update Rate" : "Save Rate"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={s.card} className="responsive-card">
            <div style={s.sectionHeader}>
              <FaPercentage color="var(--mern-admin-secondary)" />
              <span>Configured GST Rates</span>
            </div>

            <div style={{ overflowX: "auto", width: "100%" }}>
              <table style={s.table} className="responsive-table">
                <thead>
                  <tr>
                    <th style={s.th}>Tax Type</th>
                    <th style={s.th}>Rate (%)</th>
                    {(canEdit || canDelete) && (
                      <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {gstRates.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        style={{
                          ...s.td,
                          textAlign: "center",
                          color: "#94a3b8",
                          padding: "30px",
                        }}
                      >
                        No GST rates found.
                      </td>
                    </tr>
                  ) : (
                    gstRates.map((gst) => (
                      <tr key={gst._id}>
                        <td style={s.td} data-label="Tax Type">
                          <span style={s.badge(gst.taxType)}>
                            {gst.taxType}
                          </span>
                        </td>
                        <td
                          style={{ ...s.td, fontWeight: "600" }}
                          data-label="Rate (%)"
                        >
                          {gst.rate}%
                        </td>
                        {(canEdit || canDelete) && (
                          <td
                            style={{ ...s.td, textAlign: "right" }}
                            data-label="Actions"
                          >
                            <div
                              className="actions-div"
                              style={{
                                display: "flex",
                                gap: "10px",
                                justifyContent: "flex-end",
                              }}
                            >
                              {canEdit && (
                                <button
                                  onClick={() => handleEdit(gst)}
                                  style={s.iconBtn("var(--mern-admin-primary)")}
                                  title="Edit"
                                >
                                  <FaPen />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(gst._id)}
                                  style={s.iconBtn("var(--mern-admin-danger)")}
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
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

export default CreateGst;
