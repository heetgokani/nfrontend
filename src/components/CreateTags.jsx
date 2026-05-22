import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
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

const CreateTags = () => {
  const { auth } = useAuth();
  const permissions = auth?.user?.role?.permissions?.tags;

  const canAdd = permissions?.add;
  const canEdit = permissions?.edit;
  const canDelete = permissions?.delete;

  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchTags = async () => {
    try {
      const res = await axios.get(
        "https://demo-backend-k0yn.onrender.com/api/tags"
      );
      setTags(res.data);
    } catch (err) {
      toast.error("Failed to fetch tags");
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.warn("Tag name is required");

    setLoading(true);
    try {
      if (editId) {
        if (!canEdit) return toast.error("You don't have permission to edit.");
        await axios.put(
          `https://demo-backend-k0yn.onrender.com/api/tags/${editId}`,
          { name }
        );
        toast.success("Tag updated!");
        setEditId(null);
      } else {
        if (!canAdd) return toast.error("You don't have permission to add.");
        await axios.post("https://demo-backend-k0yn.onrender.com/api/tags", {
          name,
        });
        toast.success("Tag created!");
      }
      setName("");
      fetchTags();
    } catch (err) {
      toast.error(editId ? "Error updating tag" : "Error creating tag");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tag) => {
    if (!canEdit) return;
    setEditId(tag._id);
    setName(tag.name || tag.title);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!canDelete) return toast.error("You don't have permission to delete.");
    if (!window.confirm("Are you sure you want to delete this tag?")) return;
    try {
      await axios.delete(
        `https://demo-backend-k0yn.onrender.com/api/tags/${id}`
      );
      toast.success("Tag deleted successfully!");
      if (editId === id) {
        setEditId(null);
        setName("");
      }
      fetchTags();
    } catch (err) {
      toast.error("Error deleting tag");
    }
  };

  const filteredTags = tags.filter((t) =>
    (t.name || t.title || "").toLowerCase().includes(searchTerm.toLowerCase())
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
    tagCard: {
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
            .responsive-tag-card {
              padding: 12px 15px !important;
            }
            /* Adjust button padding slightly so it isn't overly huge */
            .responsive-btn {
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
            <FaTags color="var(--mern-admin-primary)" /> Manage Tags
          </h2>
        </div>

        {(canAdd || (canEdit && editId)) && (
          <div style={s.section} className="responsive-section">
            <div style={s.sectionHeader}>
              <FaTag color="var(--mern-admin-primary)" />{" "}
              {editId ? "1. Edit Tag" : "1. Add New Tag"}
            </div>
            <form onSubmit={handleSubmit}>
              <div style={s.inputGroup}>
                <label style={s.label}>Tag Name</label>
                <input
                  style={s.input}
                  placeholder="e.g., Best Seller, New Arrival, Sale"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                style={s.submitBtn}
                disabled={loading}
                className="responsive-btn"
              >
                {loading
                  ? "Saving to Database..."
                  : editId
                  ? "Update Tag"
                  : "Save Tag"}
              </button>
              {editId && (
                <button
                  type="button"
                  style={s.cancelBtn}
                  className="responsive-btn"
                  onClick={() => {
                    setEditId(null);
                    setName("");
                  }}
                >
                  Cancel Editing
                </button>
              )}
            </form>
          </div>
        )}

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
              <FaList color="var(--mern-admin-primary)" /> 2. Existing Tags
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
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredTags.length === 0 ? (
            <p
              style={{
                color: "#64748b",
                fontSize: "14px",
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              {searchTerm
                ? "No tags match your search."
                : "No tags found. Create one above!"}
            </p>
          ) : (
            <div style={s.grid} className="responsive-grid">
              {filteredTags.map((tag) => (
                <div
                  key={tag._id}
                  style={s.tagCard}
                  className="responsive-tag-card"
                >
                  <span>{tag.name || tag.title}</span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {canEdit && (
                      <button
                        onClick={() => handleEdit(tag)}
                        style={{
                          ...s.actionBtn,
                          color: "var(--mern-admin-primary)",
                        }}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(tag._id)}
                        style={{
                          ...s.actionBtn,
                          color: "var(--mern-admin-danger)",
                        }}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    )}
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

export default CreateTags;
