import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiX } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageHeader } from "./Crashed";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/role";
const permissionCategories = [
  "role",
  "category",
  "contact",
  "banner",
  "products",
  "stock",
  "gst",
  "tags",
  "reviews",
  "coupon",
  "order",
  "ship",
  "ticket",
  "invoice",
];
const permissionActions = ["add", "view", "edit", "delete"];

const ViewRole = () => {
  const { auth } = useAuth();
  const [roles, setRoles] = useState([]);
  const [editRole, setEditRole] = useState(null);
  const [editRolename, setEditRolename] = useState("");
  const [editPermissions, setEditPermissions] = useState({});

  const canEdit = auth?.user?.role?.permissions?.role?.edit;
  const canDelete = auth?.user?.role?.permissions?.role?.delete;

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API_URL}/getallroles`);
      setRoles(res.data);
    } catch {
      toast.error("Failed to fetch roles");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      try {
        await axios.delete(`${API_URL}/deleterole/${id}`);
        toast.success("Role Deleted");
        fetchRoles();
      } catch {
        toast.error("Delete failed");
      }
    }
  };

  const openEdit = (role) => {
    setEditRole(role);
    setEditRolename(role.rolename);
    setEditPermissions(role.permissions || {});
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/editrole/${editRole._id}`, {
        rolename: editRolename,
        permissions: editPermissions,
      });
      toast.success("Role Updated");
      setEditRole(null);
      fetchRoles();
    } catch {
      toast.error("Update failed");
    }
  };

  const togglePermission = (cat, action) => {
    setEditPermissions((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], [action]: !prev[cat]?.[action] },
    }));
  };

  const styles = {
    grid: {
      display: "grid",
      // Responsive grid: 1 column on mobile, multiple on desktop
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "20px",
      padding: "10px 0",
    },
    card: {
      background: "white",
      border: "1px solid var(--mern-admin-border)",
      borderRadius: "12px",
      padding: "20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    },
    roleName: {
      fontSize: "16px",
      fontWeight: "700",
      color: "var(--mern-admin-text-main)",
      textTransform: "capitalize",
    },
    iconBtn: (color) => ({
      padding: "10px",
      borderRadius: "8px",
      background: "#f8fafc",
      color: color,
      cursor: "pointer",
      border: "1px solid var(--mern-admin-border)",
      display: "flex",
      alignItems: "center",
      transition: "0.2s",
    }),
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(15, 23, 42, 0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1100,
      backdropFilter: "blur(4px)",
      padding: "15px", // Prevents modal touching screen edges
    },
    modal: {
      background: "white",
      width: "100%",
      maxWidth: "600px",
      borderRadius: "16px",
      padding: "25px",
      maxHeight: "90vh",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    },
    permissionGrid: {
      display: "grid",
      // Stacks to 1 column on very small screens, 2 columns otherwise
      gridTemplateColumns: window.innerWidth < 480 ? "1fr" : "1fr 1fr",
      gap: "15px",
      overflowY: "auto",
      paddingRight: "5px",
    },
  };

  return (
    <div style={{ paddingBottom: "30px" }}>
      <ToastContainer />
      <PageHeader
        title="Manage Roles"
        subtitle="View and edit system access permissions."
      />

      <div style={styles.grid}>
        {roles.map((role) => (
          <div key={role._id} style={styles.card}>
            <div style={styles.roleName}>{role.rolename}</div>
            <div style={{ display: "flex", gap: "10px" }}>
              {canEdit && (
                <button
                  style={styles.iconBtn("var(--mern-admin-primary)")}
                  onClick={() => openEdit(role)}
                  aria-label="Edit Role"
                >
                  <FiEdit size={16} />
                </button>
              )}
              {canDelete && (
                <button
                  style={styles.iconBtn("var(--mern-admin-danger)")}
                  onClick={() => handleDelete(role._id)}
                  aria-label="Delete Role"
                >
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editRole && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
                Edit Permissions
              </h3>
              <FiX
                size={24}
                style={{ cursor: "pointer", color: "#64748b" }}
                onClick={() => setEditRole(null)}
              />
            </div>

            <form
              onSubmit={handleUpdate}
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
              }}
            >
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  marginBottom: "5px",
                  color: "#64748b",
                }}
              >
                ROLE NAME
              </label>
              <input
                value={editRolename}
                onChange={(e) => setEditRolename(e.target.value)}
                placeholder="Role Name"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--mern-admin-border)",
                  marginBottom: "20px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />

              <div style={styles.permissionGrid}>
                {permissionCategories.map((cat) => (
                  <div
                    key={cat}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--mern-admin-border)",
                      background: "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "800",
                        textTransform: "uppercase",
                        color: "var(--mern-admin-primary)",
                        marginBottom: "8px",
                      }}
                    >
                      {cat}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "6px",
                      }}
                    >
                      {permissionActions.map((action) => (
                        <label
                          key={action}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            cursor: "pointer",
                            color: "#475569",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={editPermissions[cat]?.[action] || false}
                            onChange={() => togglePermission(cat, action)}
                            style={{ accentColor: "var(--mern-admin-primary)" }}
                          />
                          {action}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "25px",
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditRole(null)}
                  style={{
                    flex: window.innerWidth < 480 ? 1 : "initial",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "1px solid var(--mern-admin-border)",
                    background: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: window.innerWidth < 480 ? 1 : "initial",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "var(--mern-admin-primary)",
                    color: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewRole;
