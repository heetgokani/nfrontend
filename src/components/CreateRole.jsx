import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageHeader } from "./Crashed";

const API_URL = "http://localhost:5000/api/role/createrole";

const defaultPermissions = {
  role: { add: false, view: false, edit: false, delete: false },
  category: { add: false, view: false, edit: false, delete: false },
  contact: { add: false, view: false, edit: false, delete: false },
  banner: { add: false, view: false, edit: false, delete: false },
  blog: { add: false, view: false, edit: false, delete: false },
  products: { add: false, view: false, edit: false, delete: false },
  stock: { add: false, view: false, edit: false, delete: false },
  gst: { add: false, view: false, edit: false, delete: false },
  tags: { add: false, view: false, edit: false, delete: false },
  reviews: { add: false, view: false, edit: false, delete: false },
  coupon: { add: false, view: false, edit: false, delete: false },
  order: { add: false, view: false, edit: false, delete: false },
  ship: { add: false, view: false, edit: false, delete: false },
  ticket: { add: false, view: false, edit: false, delete: false },
  invoice: { add: false, view: false, edit: false, delete: false },
};

const CreateRole = () => {
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [loading, setLoading] = useState(false);

  const handleCheckboxChange = (module, action) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: { ...prev[module], [action]: !prev[module][action] },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }
    setLoading(true);
    try {
      await axios.post(API_URL, {
        rolename: roleName.toLowerCase(),
        permissions,
      });
      toast.success("Role created successfully!");
      setRoleName("");
      setPermissions(defaultPermissions);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating role");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    formGroup: { marginBottom: "25px" },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "700",
      fontSize: "14px",
      color: "var(--mern-admin-text-main)", // Using Theme Variable
    },
    input: {
      width: "100%",
      padding: "12px 15px",
      borderRadius: "8px",
      border: "1px solid var(--mern-admin-border)", // Using Theme Variable
      fontSize: "14px",
      outline: "none",
      transition: "all 0.2s",
      background: "#fff",
      color: "var(--mern-admin-text-main)",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "20px",
      marginBottom: "30px",
    },
    card: {
      background: "#fff",
      border: "1px solid var(--mern-admin-border)", // Using Theme Variable
      borderRadius: "12px",
      padding: "25px",
      transition: "box-shadow 0.2s",
      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    },
    moduleTitle: {
      fontSize: "13px",
      fontWeight: "800",
      color: "var(--mern-admin-primary)", // Using Theme Variable
      marginBottom: "15px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    checkboxRow: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "10px",
      alignItems: "center",
      cursor: "pointer",
    },
    checkboxLabel: {
      fontSize: "13px",
      color: "#64748b",
      textTransform: "capitalize",
      fontWeight: "500",
    },
    submitBtn: {
      background: "var(--mern-admin-primary)", // Using Theme Variable
      color: "#fff",
      border: "none",
      padding: "14px 28px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "opacity 0.2s",
      opacity: loading ? 0.7 : 1,
    },
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <PageHeader
        title="Create New Role"
        subtitle="Define a new role and assign specific permissions."
      />

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Role Designation</label>
          <input
            type="text"
            style={styles.input}
            placeholder="e.g. Sales Manager"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            required
            // Inline style for focus state to use the variable
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--mern-admin-primary)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "var(--mern-admin-border)")
            }
          />
        </div>

        <div style={styles.grid}>
          {Object.keys(permissions).map((module) => (
            <div key={module} style={styles.card}>
              <div style={styles.moduleTitle}>{module}</div>
              {Object.keys(permissions[module]).map((action) => (
                <label key={action} style={styles.checkboxRow}>
                  <span style={styles.checkboxLabel}>{action}</span>
                  <input
                    type="checkbox"
                    checked={permissions[module][action]}
                    onChange={() => handleCheckboxChange(module, action)}
                    style={{
                      cursor: "pointer",
                      width: "16px",
                      height: "16px",
                      accentColor: "var(--mern-admin-primary)", // Using Theme Variable
                    }}
                  />
                </label>
              ))}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "right" }}>
          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Processing..." : "Save Role Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRole;
