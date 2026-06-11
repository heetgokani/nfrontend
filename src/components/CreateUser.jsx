import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { PageHeader } from "./Crashed";

// NOTE: If you are running this live on your VPS, you need to change
// 'http://localhost:5000' to 'https://www.avsarcards.com' so it doesn't fail.
const API_URL_ROLES = "http://localhost:5000/api/role";
const API_URL_USER = "http://localhost:5000/api/user";

const CreateUser = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmpassword: "",
    role: "",
  });

  // Fetch roles for dropdown
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // 🛡️ SECURITY: Added withCredentials to authenticate the admin
        const res = await axios.get(`${API_URL_ROLES}/getallroles`, {
          withCredentials: true,
        });
        setRoles(res.data);
      } catch (error) {
        toast.error("Failed to load roles");
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmpassword) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);

    try {
      // 🛡️ SECURITY: Added withCredentials so the backend knows you are Superadmin
      await axios.post(`${API_URL_USER}/register`, formData, {
        withCredentials: true,
      });

      toast.success("User Created Successfully!");

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmpassword: "",
        role: "",
      });
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to create user";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---- STYLES ----
  const styles = {
    container: {
      maxWidth: "900px",
      margin: "0 auto",
      padding: "0 15px",
    },
    card: {
      background: "white",
      border: "1px solid var(--mern-admin-border)",
      borderRadius: "12px",
      padding: "clamp(15px, 5vw, 30px)",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    },
    row: {
      display: "flex",
      flexWrap: "wrap",
      gap: "20px",
      marginBottom: "20px",
    },
    col: {
      flex: "1 1 280px",
    },
    formGroup: {
      marginBottom: "0",
    },
    label: {
      display: "block",
      fontSize: "12px",
      fontWeight: "700",
      color: "var(--mern-admin-text-main)",
      marginBottom: "8px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    inputWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid var(--mern-admin-border)",
      fontSize: "14px",
      outline: "none",
      color: "var(--mern-admin-text-main)",
      background: "#f8fafc",
      transition: "border-color 0.2s",
      boxSizing: "border-box",
    },
    select: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid var(--mern-admin-border)",
      fontSize: "14px",
      outline: "none",
      color: "var(--mern-admin-text-main)",
      background: "#f8fafc",
      cursor: "pointer",
      height: "45px",
      boxSizing: "border-box",
    },
    eyeIcon: {
      position: "absolute",
      right: "15px",
      cursor: "pointer",
      color: "#888",
      display: "flex",
      alignItems: "center",
      zIndex: 2,
    },
    button: {
      width: "100%",
      padding: "14px",
      borderRadius: "8px",
      border: "none",
      background: "var(--mern-admin-primary)",
      color: "white",
      fontSize: "14px",
      fontWeight: "700",
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.7 : 1,
      transition: "0.2s",
      marginTop: "10px",
    },
    roleSpacer: {
      flex: "1 1 280px",
      display: window.innerWidth < 600 ? "none" : "block",
    },
  };

  return (
    <div>
      <ToastContainer />
      <PageHeader
        title="Create User"
        subtitle="Add a new user and assign a specific role."
      />

      <div style={styles.container}>
        <div style={styles.card}>
          <form onSubmit={handleSubmit}>
            {/* Row 1: Name & Email */}
            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.col}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {/* Row 2: Password & Confirm Password */}
            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                    style={styles.input}
                  />
                  <span
                    style={styles.eyeIcon}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible size={20} />
                    ) : (
                      <AiOutlineEye size={20} />
                    )}
                  </span>
                </div>
              </div>

              <div style={styles.col}>
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.inputWrapper}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmpassword"
                    value={formData.confirmpassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    required
                    style={styles.input}
                  />
                  <span
                    style={styles.eyeIcon}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <AiOutlineEyeInvisible size={20} />
                    ) : (
                      <AiOutlineEye size={20} />
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Row 3: Role Dropdown */}
            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Assign Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  style={styles.select}
                >
                  <option value="" disabled>
                    Select a role...
                  </option>
                  {roles.map((r) => (
                    <option key={r._id} value={r.rolename}>
                      {r.rolename}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.roleSpacer}></div>
            </div>

            <button type="submit" style={styles.button}>
              {loading ? "Creating User..." : "Create User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
