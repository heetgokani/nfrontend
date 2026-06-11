import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlus,
  FaTags,
  FaTrash,
  FaEdit,
  FaSearch,
  FaTag,
  FaList,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateBrand = () => {
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchBrands = async () => {
    try {
      const res = await axios.get(
        "https://nbackend-31lg.onrender.com/api/brands"
      );
      setBrands(res.data);
    } catch (err) {
      toast.error("Failed to fetch brands");
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.warn("Brand name is required");

    setLoading(true);
    try {
      if (editId) {
        await axios.put(
          `https://nbackend-31lg.onrender.com/api/brands/${editId}`,
          { name }
        );
        toast.success("Brand updated!");
        setEditId(null);
      } else {
        await axios.post(
          "https://nbackend-31lg.onrender.com/api/brands/create",
          { name }
        );
        toast.success("Brand created!");
      }
      setName("");
      fetchBrands();
    } catch (err) {
      toast.error(editId ? "Error updating brand" : "Error creating brand");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (brand) => {
    setEditId(brand._id);
    setName(brand.name || brand.title);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) return;
    try {
      await axios.delete(`https://nbackend-31lg.onrender.com/api/brands/${id}`);
      toast.success("Brand deleted successfully!");
      if (editId === id) {
        setEditId(null);
        setName("");
      }
      fetchBrands();
    } catch (err) {
      toast.error("Error deleting brand");
    }
  };

  const filteredBrands = brands.filter((b) =>
    (b.name || b.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const s = {
    wrapper: {
      maxWidth: "1200px",
      margin: "0 auto",
      fontFamily: "'Inter', sans-serif",
      color: "#334155",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
      marginBottom: "30px",
      borderBottom: "1px solid #e2e8f0",
      paddingBottom: "20px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "800",
      color: "#1e293b",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    section: {
      background: "white",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      padding: "25px",
      marginBottom: "20px",
    },
    sectionHeader: {
      fontSize: "18px",
      fontWeight: "700",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      color: "#0f172a",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      marginBottom: "20px",
    },
    label: {
      fontSize: "12px",
      fontWeight: "700",
      color: "#64748b",
      textTransform: "uppercase",
    },
    input: {
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      fontSize: "14px",
      outline: "none",
      background: "#f8fafc",
      width: "100%",
      boxSizing: "border-box",
    },
    submitBtn: {
      width: "100%",
      padding: "18px",
      borderRadius: "8px",
      background: "var(--mern-admin-primary)",
      color: "white",
      fontSize: "16px",
      fontWeight: "700",
      border: "none",
      cursor: "pointer",
    },
    cancelBtn: {
      width: "100%",
      padding: "18px",
      borderRadius: "8px",
      background: "#f1f5f9",
      color: "#64748b",
      fontSize: "16px",
      fontWeight: "700",
      border: "1px solid #cbd5e1",
      cursor: "pointer",
      marginTop: "10px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "15px",
    },
    brandCard: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 20px",
      background: "#f8fafc",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      fontWeight: "600",
      color: "#334155",
    },
    actionBtn: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "16px",
      padding: "5px",
    },
  };

  return (
    <>
      {/* CSS injected for mobile/tablet responsiveness ONLY */}
      <style>
        {`
          @media (max-width: 768px) {
            .responsive-wrapper {
              padding: 10px !important;
            }
            .responsive-section {
              padding: 15px !important;
            }
            /* Stack header elements and make search full width */
            .responsive-existing-header {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 15px !important;
            }
            .responsive-search {
              width: 100% !important;
            }
            /* Prevent grid from breaking on very small mobile screens */
            .responsive-grid {
              grid-template-columns: 1fr !important;
            }
            /* Slightly tighter padding for cards on small screens */
            .responsive-brand-card {
              padding: 12px 15px !important;
            }
            /* Adjust button padding slightly so it isn't overly huge */
            .responsive-submit-btn, .responsive-cancel-btn {
              padding: 14px !important;
              font-size: 15px !important;
            }
          }
        `}
      </style>

      <div style={s.wrapper} className="responsive-wrapper">
        <ToastContainer position="top-right" />

        <div style={s.header}>
          <h2 style={s.title}>
            <FaTags color="var(--mern-admin-primary)" /> Manage Brands
          </h2>
        </div>

        <div style={s.section} className="responsive-section">
          <div style={s.sectionHeader}>
            <FaTag color="var(--mern-admin-primary)" />{" "}
            {editId ? "1. Edit Brand" : "1. Add New Brand"}
          </div>
          <form onSubmit={handleSubmit}>
            <div style={s.inputGroup}>
              <label style={s.label}>Brand Name</label>
              <input
                style={s.input}
                placeholder="e.g., Nike, Adidas, Puma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              style={s.submitBtn}
              disabled={loading}
              className="responsive-submit-btn"
            >
              {loading
                ? "Saving to Database..."
                : editId
                ? "Update Brand"
                : "Save Brand"}
            </button>
            {editId && (
              <button
                type="button"
                style={s.cancelBtn}
                onClick={() => {
                  setEditId(null);
                  setName("");
                }}
                className="responsive-cancel-btn"
              >
                Cancel Editing
              </button>
            )}
          </form>
        </div>

        <div style={s.section} className="responsive-section">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "10px",
            }}
            className="responsive-existing-header"
          >
            <div style={{ ...s.sectionHeader, marginBottom: 0 }}>
              <FaList color="var(--mern-admin-primary)" /> 2. Existing Brands
            </div>

            <div
              style={{ position: "relative", width: "300px" }}
              className="responsive-search"
            >
              <FaSearch
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "12px",
                  color: "#94a3b8",
                }}
              />
              <input
                style={{ ...s.input, paddingLeft: "35px" }}
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredBrands.length === 0 ? (
            <p
              style={{
                color: "#64748b",
                fontSize: "14px",
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              {searchTerm
                ? "No brands match your search."
                : "No brands found. Create one above!"}
            </p>
          ) : (
            <div style={s.grid} className="responsive-grid">
              {filteredBrands.map((brand) => (
                <div
                  key={brand._id}
                  style={s.brandCard}
                  className="responsive-brand-card"
                >
                  <span>{brand.name || brand.title}</span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleEdit(brand)}
                      style={{ ...s.actionBtn, color: "#3b82f6" }}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(brand._id)}
                      style={{
                        ...s.actionBtn,
                        color: "red",
                      }}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateBrand;
