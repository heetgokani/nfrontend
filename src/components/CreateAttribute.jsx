import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlus,
  FaTrash,
  FaLayerGroup,
  FaImage,
  FaTag,
  FaList,
  FaEdit,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateAttribute = () => {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);

  // ADDED: State to track if we are in edit mode
  const [editId, setEditId] = useState(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("button");

  // ADDED: State for Display as Dropdown
  const [displayAsDropdown, setDisplayAsDropdown] = useState(false);

  const [terms, setTerms] = useState([
    {
      name: "",
      value: "",
      colorCode: "#000000",
      imageFile: null,
      imagePreview: "",
      label: "",
      image: "", // ADDED: to retain existing image path during edit
    },
  ]);

  const fetchAttributes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/attributes");
      setAttributes(res.data);
    } catch (err) {
      toast.error("Failed to fetch attributes");
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleTermChange = (index, field, val) => {
    const updated = [...terms];
    updated[index][field] = val;
    if (field === "name")
      updated[index].value = val.toLowerCase().replace(/\s+/g, "-");
    setTerms(updated);
  };

  const handleImageUpload = (index, file) => {
    const updated = [...terms];
    updated[index].imageFile = file;
    updated[index].imagePreview = URL.createObjectURL(file);
    setTerms(updated);
  };

  const addTerm = () =>
    setTerms([
      ...terms,
      {
        name: "",
        value: "",
        colorCode: "#000000",
        imageFile: null,
        imagePreview: "",
        label: "",
        image: "",
      },
    ]);

  const removeTerm = (index) => setTerms(terms.filter((_, i) => i !== index));

  // ADDED: Function to load attribute data into form for editing
  const handleEditSetup = (attr) => {
    setEditId(attr._id);
    setName(attr.name);
    setType(attr.type);
    setDisplayAsDropdown(attr.displayAsDropdown || false); // Set dropdown state from DB
    setTerms(
      attr.terms.map((t) => ({
        name: t.name || "",
        value: t.value || "",
        colorCode: t.colorCode || "#000000",
        imageFile: null,
        imagePreview: t.image ? `http://localhost:5000${t.image}` : "",
        image: t.image || "",
        label: t.label || "",
      }))
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ADDED: Function to cancel editing
  const cancelEdit = () => {
    setEditId(null);
    setName("");
    setType("button");
    setDisplayAsDropdown(false); // Reset dropdown state
    setTerms([
      {
        name: "",
        value: "",
        colorCode: "#000000",
        imageFile: null,
        imagePreview: "",
        label: "",
        image: "",
      },
    ]);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.warn("Attribute Name is required");

    const validTerms = terms.filter((t) => t.name.trim() !== "");
    if (validTerms.length === 0) return toast.warn("Add at least one term.");

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);

    // Append displayAsDropdown only if the type is button
    formData.append(
      "displayAsDropdown",
      type === "button" ? displayAsDropdown : false
    );

    const termsDataForBackend = validTerms.map((t) => ({
      name: t.name,
      value: t.value,
      colorCode: type === "color" ? t.colorCode : undefined,
      label: type === "radio" ? t.label : undefined,
      image: type === "image" ? t.image : undefined, // Retain existing image path
    }));

    formData.append("terms", JSON.stringify(termsDataForBackend));

    if (type === "image") {
      validTerms.forEach((t, index) => {
        if (t.imageFile) formData.append(`termImage_${index}`, t.imageFile);
      });
    }

    try {
      // ADDED: Check if editing to use PUT route, else POST
      if (editId) {
        await axios.put(
          `http://localhost:5000/api/attributes/${editId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Attribute updated successfully!");
      } else {
        await axios.post(
          "http://localhost:5000/api/attributes/create",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Attribute created successfully!");
      }

      setEditId(null);
      setName("");
      setType("button");
      setDisplayAsDropdown(false); // Reset dropdown state
      setTerms([
        {
          name: "",
          value: "",
          colorCode: "#000000",
          imageFile: null,
          imagePreview: "",
          label: "",
          image: "",
        },
      ]);
      fetchAttributes();
    } catch (err) {
      const errMessage = err.response?.data?.error || "";
      if (
        errMessage.includes("duplicate key") ||
        errMessage.includes("E11000")
      ) {
        toast.error(`An attribute named "${name}" already exists!`);
      } else {
        toast.error(`Error ${editId ? "updating" : "creating"} attribute`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this attribute globally?"
      )
    )
      return;
    try {
      await axios.delete(`http://localhost:5000/api/attributes/${id}`);
      toast.success("Attribute deleted");
      fetchAttributes();
    } catch (err) {
      toast.error("Error deleting attribute");
    }
  };

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
    inputGrid: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
      gap: "20px",
      marginBottom: "25px",
    },
    inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
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
      marginTop: "20px",
    },
    btnAdd: {
      background: "white",
      color: "#0f172a",
      padding: "10px 15px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      cursor: "pointer",
      fontWeight: "700",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "13px",
      marginTop: "10px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    },
    termRow: {
      display: "grid",
      gridTemplateColumns: type === "button" ? "1fr 40px" : "1fr 1fr 40px",
      gap: "15px",
      marginBottom: "15px",
      alignItems: "center",
    },
    badge: {
      fontSize: "11px",
      background: "#e2e8f0",
      padding: "4px 8px",
      borderRadius: "12px",
      color: "#475569",
      textTransform: "uppercase",
      fontWeight: "700",
      marginLeft: "10px",
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
            .responsive-input-grid {
              grid-template-columns: 1fr !important;
              gap: 15px !important;
            }
            .responsive-term-header {
              display: none !important; /* Hides horizontal labels on mobile */
            }
            
            /* Enhanced Mobile Grid Layout for Term Rows */
            .responsive-term-row {
              display: grid !important;
              grid-template-columns: 1fr 42px !important;
              gap: 12px !important;
              background: white !important;
              padding: 15px !important;
              border: 1px solid #e2e8f0 !important;
              border-radius: 8px !important;
              align-items: center !important;
            }
            
            /* The Name Input sits perfectly on the left */
            .responsive-term-row > input:first-child {
              grid-column: 1 !important;
              grid-row: 1 !important;
              width: 100% !important;
            }
            
            /* The Trash Button is pinned cleanly to the top-right */
            .responsive-term-btn {
              grid-column: 2 !important;
              grid-row: 1 !important;
              width: 42px !important;
              height: 42px !important;
              background: #fee2e2 !important;
              color: #ef4444 !important;
              border-radius: 8px !important;
              padding: 0 !important;
              display: flex !important;
              justify-content: center !important;
              align-items: center !important;
              margin: 0 !important;
            }
            
            /* If there's a second input (color/image/radio), it spans full width below */
            .responsive-term-row > input:nth-child(2):not(.responsive-term-btn),
            .responsive-term-row > div:nth-child(2):not(.responsive-term-btn) {
              grid-column: 1 / -1 !important;
              grid-row: 2 !important;
              width: 100% !important;
              margin-top: 0 !important;
            }

            /* Proportional buttons on mobile */
            .responsive-add-btn {
              width: 100% !important;
              justify-content: center !important;
              padding: 14px !important;
              margin-top: 5px !important;
              font-size: 14px !important;
            }
            .responsive-submit-btn {
              padding: 14px !important;
              font-size: 15px !important;
              margin-top: 15px !important;
            }

            .responsive-existing-header {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 10px !important;
            }
            .responsive-existing-header button {
              align-self: stretch !important;
              background: #fee2e2 !important;
              color: #ef4444 !important;
              padding: 10px !important;
              border-radius: 6px !important;
              width: 100% !important;
              text-align: center !important;
            }
          }
        `}
      </style>

      <div style={s.wrapper} className="responsive-wrapper">
        <ToastContainer position="top-right" />

        <div style={s.header}>
          <h2 style={s.title}>
            <FaLayerGroup color="var(--mern-admin-primary)" /> Manage Attributes
          </h2>
        </div>

        <div style={s.section} className="responsive-section">
          <div style={s.sectionHeader}>
            <FaTag color="var(--mern-admin-primary)" />{" "}
            {editId ? "1. Edit Attribute" : "1. Define Attribute"}
          </div>
          <form onSubmit={handleCreate}>
            <div style={s.inputGrid} className="responsive-input-grid">
              <div style={s.inputGroup}>
                <label style={s.label}>Attribute Name</label>
                <input
                  style={s.input}
                  placeholder="e.g., Size, Color, Pattern"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Type</label>
                <select
                  style={s.input}
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setTerms([
                      {
                        name: "",
                        value: "",
                        colorCode: "#000000",
                        imageFile: null,
                        imagePreview: "",
                        label: "",
                        image: "",
                      },
                    ]);
                  }}
                >
                  <option value="button">Button</option>
                  <option value="color">Color</option>
                  <option value="image">Image</option>
                  <option value="radio">Radio</option>
                </select>

                {/* ADDED: Display as Dropdown checkbox only for button type */}
                {type === "button" && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      marginTop: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                      color: "#475569",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={displayAsDropdown}
                      onChange={(e) => setDisplayAsDropdown(e.target.checked)}
                      style={{
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                      }}
                    />
                    Display as Dropdown
                  </label>
                )}
              </div>
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
              className="responsive-section"
            >
              <div
                style={{
                  ...s.sectionHeader,
                  fontSize: "16px",
                  marginBottom: "15px",
                }}
              >
                2. Configure Terms
              </div>

              <div
                style={{ ...s.termRow, marginBottom: "10px" }}
                className="responsive-term-header"
              >
                <label style={s.label}>TERM NAME</label>
                {type === "color" && <label style={s.label}>COLOR CODE</label>}
                {type === "image" && (
                  <label style={s.label}>IMAGE UPLOAD</label>
                )}
                {type === "radio" && <label style={s.label}>LABEL</label>}
                <span></span>
              </div>

              {terms.map((term, i) => (
                <div key={i} style={s.termRow} className="responsive-term-row">
                  <input
                    style={s.input}
                    placeholder="e.g., UK 7 or Red"
                    value={term.name}
                    onChange={(e) =>
                      handleTermChange(i, "name", e.target.value)
                    }
                    required
                  />

                  {type === "color" && (
                    <input
                      style={{
                        ...s.input,
                        padding: "0 5px",
                        height: "42px",
                        cursor: "pointer",
                      }}
                      type="color"
                      value={term.colorCode}
                      onChange={(e) =>
                        handleTermChange(i, "colorCode", e.target.value)
                      }
                    />
                  )}

                  {type === "image" && (
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      {term.imagePreview && (
                        <img
                          src={term.imagePreview}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "6px",
                            objectFit: "cover",
                          }}
                          alt="preview"
                        />
                      )}
                      <label
                        style={{
                          background: "white",
                          border: "1px solid #cbd5e1",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "13px",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          flex: 1,
                          justifyContent: "center",
                          color: "#64748b",
                          fontWeight: "600",
                        }}
                      >
                        <FaImage />{" "}
                        {term.imageFile || term.imagePreview
                          ? "Change Image"
                          : "Upload Image"}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) =>
                            e.target.files[0] &&
                            handleImageUpload(i, e.target.files[0])
                          }
                        />
                      </label>
                    </div>
                  )}

                  {type === "radio" && (
                    <input
                      style={s.input}
                      placeholder="e.g., Select UK 7"
                      value={term.label}
                      onChange={(e) =>
                        handleTermChange(i, "label", e.target.value)
                      }
                      required
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => removeTerm(i)}
                    className="responsive-term-btn"
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--mern-admin-primary)",
                      cursor: "pointer",
                      fontSize: "16px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addTerm}
                style={s.btnAdd}
                className="responsive-add-btn"
              >
                <FaPlus /> Add New Row
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                style={{ ...s.submitBtn, flex: 1 }}
                disabled={loading}
                className="responsive-submit-btn"
              >
                {loading
                  ? "Saving to Database..."
                  : editId
                  ? "Update Complete Attribute"
                  : "Save Complete Attribute"}
              </button>

              {/* ADDED: Cancel button only shows when editing */}
              {editId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{ ...s.submitBtn, flex: 1, background: "#94a3b8" }}
                  className="responsive-submit-btn"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* EXISTING ATTRIBUTES */}
        {attributes.length > 0 && (
          <div
            style={{
              ...s.section,
              background: "transparent",
              border: "none",
              padding: 0,
            }}
          >
            <div style={s.sectionHeader}>
              <FaList color="var(--mern-admin-primary)" /> 3. Existing
              Attributes
            </div>

            {attributes.map((attr) => (
              <div
                key={attr._id}
                style={{
                  padding: "20px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  background: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                  className="responsive-existing-header"
                >
                  <strong
                    style={{
                      fontSize: "16px",
                      color: "#0f172a",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {attr.name} <span style={s.badge}>{attr.type}</span>
                  </strong>

                  {/* ADDED: Edit Button Group */}
                  <div style={{ display: "flex", gap: "15px" }}>
                    <button
                      onClick={() => handleEditSetup(attr)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#3b82f6",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(attr._id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--mern-admin-primary)",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {attr.terms.map((t) => (
                    <div
                      key={t._id}
                      style={{
                        padding: "6px 12px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: "600",
                        color: "#334155",
                      }}
                    >
                      {attr.type === "color" && (
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: t.colorCode || "#000",
                            border: "1px solid #cbd5e1",
                          }}
                        ></div>
                      )}

                      {attr.type === "image" && t.image && (
                        <img
                          src={`http://localhost:5000${t.image}`}
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "4px",
                            objectFit: "cover",
                          }}
                          alt="term"
                        />
                      )}

                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>{t.name}</span>
                        {attr.type === "radio" && (
                          <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                            Label: {t.label}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CreateAttribute;
