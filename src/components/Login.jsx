import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const brandRed = "#de433f";
  const pureBlack = "#000000";
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "https://demo-backend-k0yn.onrender.com/api/user/login",
        formData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        // 1. Destructure correctly based on backend response
        const user = response.data.data.user;
        const token = response.data.token;

        // 2. Update Context & LocalStorage
        login(user, token);
        toast.success("Login Successful!!");

        // 3. Logic: Redirect based on Role
        // Safe check using optional chaining (?.)
        const userRole = user?.role?.rolename?.toLowerCase().trim();

        setTimeout(() => {
          if (userRole === "user") {
            // Normal customers go to Home
            navigate("/");
          } else {
            // Admin, Superadmin, Manager go to Dashboard
            navigate("/dashboard");
          }
        }, 1500);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid credentials";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <ToastContainer position="top-right" autoClose={3000} />
      {/* ... (Rest of your UI code remains exactly the same) ... */}

      {/* Keeping your exact UI structure below for completeness */}
      <div
        className="breadcrumb d-none d-md-block"
        style={{ padding: "15px 0", background: "#f9f9f9", border: "none" }}
      >
        <div className="container">
          <ul
            className="list-unstyled d-flex align-items-center m-0"
            style={{ fontSize: "14px" }}
          >
            <li>
              <NavLink to="/" style={{ color: "#000", textDecoration: "none" }}>
                Home
              </NavLink>
            </li>
            <li className="d-flex align-items-center">
              <span style={{ margin: "0 10px", opacity: 0.5 }}>/</span>
            </li>
            <li style={{ color: "#777" }}>Login</li>
          </ul>
        </div>
      </div>

      <main className="login-container">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7 col-12 p-0 p-md-3">
              <div className="login-card">
                <div className="text-center mb-4">
                  <h2 className="login-title">LOGIN</h2>
                  <div className="red-divider"></div>
                  <p className="login-subtitle">
                    Enter your credentials to access your stash.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="input-label">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      name="email"
                      className="custom-input"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between">
                      <label className="input-label">PASSWORD</label>
                      <NavLink
                        to="/forgot-password"
                        style={{
                          color: brandRed,
                          fontSize: "12px",
                          textDecoration: "none",
                        }}
                      >
                        Forgot?
                      </NavLink>
                    </div>
                    <input
                      type="password"
                      name="password"
                      className="custom-input"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="login-btn-main"
                    disabled={loading}
                  >
                    {loading ? "AUTHENTICATING..." : "SIGN IN"}
                  </button>
                </form>

                <div className="separator">
                  <span>OR CONTINUE WITH</span>
                </div>
                <button className="google-btn">
                  <FcGoogle size={22} />
                  <span>Google Account</span>
                </button>

                <div className="text-center mt-5">
                  <p className="no-account">
                    NEW TO SNEAKERSWALA?{" "}
                    <NavLink
                      to="/register"
                      style={{
                        color: brandRed,
                        fontWeight: "800",
                        textDecoration: "none",
                      }}
                    >
                      JOIN NOW
                    </NavLink>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Re-injecting your CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .login-container { padding: 80px 0; }
        .login-card { background: #fff; padding: 50px 40px; border-radius: 20px; box-shadow: 0 20px 60px rgba(222, 67, 63, 0.15); border-top: 5px solid ${brandRed}; }
        .login-title { font-weight: 900; letter-spacing: 2px; color: ${pureBlack}; font-size: 32px; margin-bottom: 5px; }
        .red-divider { width: 50px; height: 4px; background: ${brandRed}; margin: 10px auto 20px; }
        .login-subtitle { color: #888; font-size: 14px; }
        .input-label { display: block; font-weight: 800; font-size: 11px; letter-spacing: 1px; margin-bottom: 8px; color: ${pureBlack}; }
        .custom-input { width: 100%; padding: 14px 20px; background: #f8f8f8; border: 2px solid #f8f8f8; border-radius: 10px; font-size: 14px; transition: 0.3s; outline: none; }
        .custom-input:focus { border-color: ${brandRed}; background: #fff; }
        .login-btn-main { width: 100%; padding: 16px; background: ${brandRed}; color: #fff; border: none; border-radius: 10px; font-weight: 900; letter-spacing: 1px; transition: 0.3s; box-shadow: 0 10px 20px rgba(222, 67, 63, 0.3); }
        .login-btn-main:hover { background: ${pureBlack}; transform: translateY(-3px); }
        .login-btn-main:disabled { background: #ccc; cursor: not-allowed; }
        .separator { text-align: center; margin: 30px 0; position: relative; }
        .separator span { background: #fff; padding: 0 15px; color: #bbb; font-size: 10px; font-weight: 700; position: relative; z-index: 2; }
        .separator::after { content: ""; position: absolute; top: 50%; left: 0; width: 100%; height: 1px; background: #eee; z-index: 1; }
        .google-btn { width: 100%; padding: 14px; background: #fff; border: 2px solid #eee; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 700; font-size: 14px; transition: 0.3s; }
        .google-btn:hover { background: #fafafa; border-color: #ddd; }
        .no-account { font-size: 12px; font-weight: 700; color: #777; letter-spacing: 0.5px; }
        @media (max-width: 767px) {
          .login-container { padding: 0; }
          .login-card { padding: 40px 25px; border-radius: 0; min-height: 100vh; border-top: none; }
        }
      `,
        }}
      />
    </div>
  );
};

export default Login;
