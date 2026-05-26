import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaCreditCard } from "react-icons/fa";
import { PageHeader } from "./Crashed";

const PaymentSettings = () => {
  const [formData, setFormData] = useState({
    keyId: "",
    keySecret: "",
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(
          "https://nikam-ecom-backend.onrender.com/api/settings/payment",
          {
            withCredentials: true,
          }
        );
        if (res.data.status === "success") {
          setFormData({
            keyId: res.data.data.keyId,
            keySecret: "",
          });
          setIsConfigured(res.data.data.isConfigured);
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Error fetching payment settings", err);
        }
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.keyId || !formData.keySecret) {
      return toast.error("All fields are required to setup Razorpay");
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "https://nikam-ecom-backend.onrender.com/api/settings/payment",
        formData,
        { withCredentials: true }
      );
      if (res.data.status === "success") {
        toast.success("Razorpay Settings saved securely!");
        setIsConfigured(true);
        setFormData({ ...formData, keySecret: "" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    wrapper: {
      maxWidth: "600px",
      background: "#fff",
      padding: "30px",
      borderRadius: "12px",
      border: "1px solid var(--mern-admin-border)",
    },
    statusBadge: {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "700",
      marginBottom: "20px",
      backgroundColor: isConfigured ? "#d1fae5" : "#fee2e2",
      color: isConfigured ? "#065f46" : "var(--mern-admin-danger)",
    },
    formGroup: { marginBottom: "20px" },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "600",
      fontSize: "14px",
      color: "var(--mern-admin-text-main)",
    },
    input: {
      width: "100%",
      padding: "12px 15px",
      borderRadius: "8px",
      border: "1px solid var(--mern-admin-border)",
      fontSize: "14px",
      outline: "none",
      transition: "0.3s",
    },
    passwordWrapper: { position: "relative" },
    eyeIcon: {
      position: "absolute",
      right: "15px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      color: "#64748b",
    },
    button: {
      width: "100%",
      padding: "14px",
      background: "var(--mern-admin-primary)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontWeight: "700",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      transition: "0.3s",
    },
    helpText: { fontSize: "12px", color: "#64748b", marginTop: "5px" },
  };

  return (
    <div>
      <PageHeader
        title="Payment Settings"
        subtitle="Configure Razorpay Keys securely for online transactions."
      />
      <div style={styles.wrapper}>
        <div style={styles.statusBadge}>
          {isConfigured
            ? "✅ Razorpay Configured & Active"
            : "❌ Razorpay Not Configured"}
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Razorpay Key ID</label>
            <input
              type="text"
              name="keyId"
              style={styles.input}
              placeholder="rzp_live_..."
              value={formData.keyId}
              onChange={handleChange}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Razorpay Key Secret</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                name="keySecret"
                style={styles.input}
                placeholder="Enter Key Secret"
                value={formData.keySecret}
                onChange={handleChange}
              />
              <span
                style={styles.eyeIcon}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <p style={styles.helpText}>
              This is strictly encrypted in the database and invisible to
              hackers.
            </p>
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            <FaCreditCard /> {loading ? "SAVING..." : "SAVE PAYMENT SETTINGS"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentSettings;
