import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FaTruck,
  FaFileExcel,
  FaFileImport,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSearch,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://localhost:5000";

const ManageShipping = () => {
  const [shippingRules, setShippingRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    city: "",
    shippingPrice: "",
    deliveryDuration: "3-5 Days",
    isAvailable: true,
  });

  const loadShippingRules = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/shipping/all`);
      setShippingRules(res.data.methods || []);
    } catch (err) {
      toast.error("Failed to load shipping rules");
    }
  };

  useEffect(() => {
    loadShippingRules();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!formData.city || formData.shippingPrice === "") {
      return toast.warn("Please fill required fields");
    }

    try {
      await axios.post(`${API_BASE}/api/shipping/upsert`, formData, {
        withCredentials: true,
      });
      toast.success("Shipping rule saved!");
      setFormData({
        city: "",
        shippingPrice: "",
        deliveryDuration: "3-5 Days",
        isAvailable: true,
      });
      loadShippingRules();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save rule");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this shipping rule?")) return;
    try {
      await axios.delete(`${API_BASE}/api/shipping/${id}`, {
        withCredentials: true,
      });
      toast.success("Deleted successfully");
      loadShippingRules();
    } catch (err) {
      toast.error("Failed to delete rule");
    }
  };

  const handleEdit = (rule) => {
    setFormData({
      city: rule.city,
      shippingPrice: rule.shippingPrice,
      deliveryDuration: rule.deliveryDuration,
      isAvailable: rule.isAvailable,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("file", file);

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/shipping/import`,
        uploadData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      toast.success(res.data.message);
      loadShippingRules();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error importing file");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/shipping/export`, {
        withCredentials: true,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Shipping_Rules.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export successful!");
    } catch (err) {
      toast.error("Failed to export data");
    }
  };

  const filteredRules = shippingRules.filter((rule) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      rule.city.toLowerCase().includes(searchLower) ||
      rule.shippingPrice.toString().includes(searchLower)
    );
  });

  return (
    <div style={{ paddingBottom: "30px", fontFamily: "'Inter', sans-serif" }}>
      <ToastContainer position="top-right" autoClose={2000} />

      <style>
        {`
          .ship-card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            border: 1px solid var(--mern-admin-border);
          }
          
          /* Form Inputs */
          .ship-input {
            width: 100%;
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid var(--mern-admin-border);
            outline: none;
            font-size: 13px;
            color: var(--mern-admin-text-main);
            transition: all 0.2s;
            box-sizing: border-box;
          }
          .ship-input:focus {
            border-color: var(--mern-admin-primary);
            box-shadow: 0 0 0 2px rgba(181, 23, 224, 0.1);
          }
          .ship-label {
            display: block;
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 6px;
          }

          /* Buttons */
          .ship-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 8px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
          }
          .ship-btn:hover { opacity: 0.9; transform: translateY(-1px); }
          .ship-btn-primary { background: var(--mern-admin-primary); color: #fff; }
          .ship-btn-outline { background: #fff; border: 1px solid var(--mern-admin-border); color: #475569; }
          .ship-btn-outline:hover { background: #f8fafc; }
          .ship-btn-success { background: #10b981; color: #fff; }

          /* Layout Grid */
          .ship-layout {
            display: grid;
            grid-template-columns: 300px minmax(0, 1fr);
            gap: 20px;
          }
          
          .table-wrapper {
            overflow-x: auto;
            width: 100%;
          }

          .ship-table th {
            padding: 12px 16px;
            color: #64748b;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid var(--mern-admin-border);
            background: #f8fafc;
            font-weight: 700;
            white-space: nowrap;
          }
          .ship-table td {
            padding: 12px 16px;
            font-size: 13px;
            border-bottom: 1px solid #f1f5f9;
            color: var(--mern-admin-text-main);
            vertical-align: middle;
          }

          /* Mobile Responsiveness */
          @media (max-width: 1024px) {
            .ship-layout { grid-template-columns: 1fr; }
          }
          @media (max-width: 768px) {
            .header-top { flex-direction: column; align-items: stretch !important; gap: 15px; }
            .header-actions { flex-direction: column; width: 100%; }
            .header-actions button, .search-box { width: 100%; justify-content: center; }
            
            .ship-table thead { display: none; }
            .ship-table, .ship-table tbody, .ship-table tr, .ship-table td { display: block; width: 100%; }
            .ship-table tr { margin-bottom: 15px; border: 1px solid var(--mern-admin-border); border-radius: 8px; padding: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
            .ship-table td { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; text-align: right; }
            .ship-table td:last-child { border-bottom: none; }
            .ship-table td::before { content: attr(data-label); font-weight: 600; color: #64748b; text-transform: uppercase; font-size: 11px; }
          }
        `}
      </style>

      {/* HEADER PAGE */}
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{
            color: "var(--mern-admin-text-main)",
            fontSize: "20px",
            fontWeight: "700",
            margin: "0 0 5px 0",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaTruck color="var(--mern-admin-primary)" /> Manage Shipping
        </h2>
        <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
          Configure regional delivery rules and pricing.
        </p>
      </div>

      {/* TOOLBAR */}
      <div
        className="ship-card header-top"
        style={{
          padding: "15px 20px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div
          className="search-box"
          style={{
            display: "flex",
            alignItems: "center",
            background: "#f8fafc",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid var(--mern-admin-border)",
            width: "100%",
            maxWidth: "300px",
          }}
        >
          <FaSearch color="#94a3b8" size={13} style={{ marginRight: "8px" }} />
          <input
            type="text"
            placeholder="Search City..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "13px",
              width: "100%",
              color: "var(--mern-admin-text-main)",
            }}
          />
        </div>

        {/* Actions */}
        <div
          className="header-actions"
          style={{ display: "flex", gap: "10px" }}
        >
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <button
            className="ship-btn ship-btn-outline"
            onClick={() => fileInputRef.current.click()}
            disabled={loading}
          >
            <FaFileImport /> {loading ? "Importing..." : "Import CSV/Excel"}
          </button>
          <button className="ship-btn ship-btn-success" onClick={handleExport}>
            <FaFileExcel /> Export
          </button>
        </div>
      </div>

      <div className="ship-layout">
        {/* FORM WIDGET */}
        <div
          className="ship-card"
          style={{ padding: "20px", height: "fit-content" }}
        >
          <h3
            style={{
              margin: "0 0 15px 0",
              fontSize: "14px",
              fontWeight: "700",
              color: "var(--mern-admin-text-main)",
            }}
          >
            {formData.city ? "Edit Rule" : "Add New Rule"}
          </h3>

          <form
            onSubmit={handleManualSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div>
              <label className="ship-label">City Name</label>
              <input
                type="text"
                name="city"
                className="ship-input"
                value={formData.city}
                onChange={handleInputChange}
                required
                placeholder="e.g. Ahmedabad"
              />
            </div>

            <div>
              <label className="ship-label">Shipping Price (₹)</label>
              <input
                type="number"
                name="shippingPrice"
                className="ship-input"
                value={formData.shippingPrice}
                onChange={handleInputChange}
                required
                placeholder="0"
              />
            </div>

            <div>
              <label className="ship-label">Delivery Duration</label>
              <input
                type="text"
                name="deliveryDuration"
                className="ship-input"
                value={formData.deliveryDuration}
                onChange={handleInputChange}
                placeholder="3-5 Days"
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                marginTop: "5px",
              }}
            >
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleInputChange}
                style={{
                  width: "14px",
                  height: "14px",
                  accentColor: "var(--mern-admin-primary)",
                }}
              />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#334155",
                }}
              >
                Active Region
              </span>
            </label>

            <button
              type="submit"
              className="ship-btn ship-btn-primary"
              style={{ marginTop: "5px", width: "100%" }}
            >
              <FaPlus size={12} /> Save Rule
            </button>
          </form>
        </div>

        {/* TABLE DATA */}
        <div className="ship-card table-wrapper">
          <table
            className="ship-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr>
                <th>City</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule) => (
                <tr
                  key={rule._id}
                  style={{ transition: "0.1s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td data-label="City" style={{ fontWeight: "600" }}>
                    {rule.city}
                  </td>
                  <td
                    data-label="Price"
                    style={{
                      fontWeight: "600",
                      color: "var(--mern-admin-primary)",
                    }}
                  >
                    ₹{rule.shippingPrice}
                  </td>
                  <td
                    data-label="Duration"
                    style={{ color: "#64748b", fontSize: "12px" }}
                  >
                    {rule.deliveryDuration}
                  </td>
                  <td data-label="Status">
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        background: rule.isAvailable ? "#dcfce7" : "#fee2e2",
                        color: rule.isAvailable
                          ? "#16a34a"
                          : "var(--mern-admin-danger)",
                      }}
                    >
                      {rule.isAvailable ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td
                    data-label="Actions"
                    style={{ textAlign: "right", whiteSpace: "nowrap" }}
                  >
                    <button
                      onClick={() => handleEdit(rule)}
                      style={{
                        background: "#f1f5f9",
                        color: "#0284c7",
                        border: "none",
                        padding: "6px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginRight: "6px",
                      }}
                      title="Edit"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(rule._id)}
                      style={{
                        background: "#f1f5f9",
                        color: "var(--mern-admin-danger)",
                        border: "none",
                        padding: "6px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      title="Delete"
                    >
                      <FaTrash size={12} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRules.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#94a3b8",
                    }}
                  >
                    <div style={{ fontSize: "13px" }}>
                      {searchTerm
                        ? "No records match your search."
                        : "No shipping rules found. Please import your Excel file."}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageShipping;
