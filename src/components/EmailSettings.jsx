import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaEnvelope } from "react-icons/fa";
import { PageHeader } from "./Crashed"; // Reusing your existing header

const EmailSettings = () => {
  const [formData, setFormData] = useState({
    senderName: "",
    email: "",
    appPassword: "",
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch current settings on load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/settings/email",
          {
            withCredentials: true,
          },
        );
        if (res.data.status === "success") {
          setFormData({
            senderName: res.data.data.senderName,
            email: res.data.data.email,
            appPassword: "", // Keep password blank for security, even if configured
          });
          setIsConfigured(res.data.data.isConfigured);
        }
      } catch (err) {
        // If 404, it just means it hasn't been set up yet. Ignore.
        if (err.response?.status !== 404) {
          console.error("Error fetching SMTP settings", err);
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
    if (!formData.senderName || !formData.email || !formData.appPassword) {
      return toast.error("All fields are required to setup SMTP");
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/settings/email",
        formData,
        { withCredentials: true },
      );
      if (res.data.status === "success") {
        toast.success("SMTP Settings saved securely!");
        setIsConfigured(true);
        setFormData({ ...formData, appPassword: "" }); // Clear password field after save
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
    helpText: {
      fontSize: "12px",
      color: "#64748b",
      marginTop: "5px",
    },
  };

  return (
    <div>
      <PageHeader
        title="SMTP & Email Settings"
        subtitle="Configure the email account used to send OTPs and Password Resets."
      />

      <div style={styles.wrapper}>
        <div style={styles.statusBadge}>
          {isConfigured
            ? "✅ SMTP Configured & Active"
            : "❌ SMTP Not Configured"}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Sender Name</label>
            <input
              type="text"
              name="senderName"
              style={styles.input}
              placeholder="e.g. Your Admin"
              value={formData.senderName}
              onChange={handleChange}
            />
            <p style={styles.helpText}>
              The name users will see in their inbox.
            </p>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Sender Email</label>
            <input
              type="email"
              name="email"
              style={styles.input}
              placeholder="yourstore@gmail.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Google App Password</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                name="appPassword"
                style={styles.input}
                placeholder="16-digit App Password"
                value={formData.appPassword}
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
              Do not use your standard Gmail password. Generate a 16-digit "App
              Password" from your Google Account settings. This is encrypted
              securely in the database.
            </p>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            <FaEnvelope /> {loading ? "SAVING..." : "SAVE EMAIL SETTINGS"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailSettings;
