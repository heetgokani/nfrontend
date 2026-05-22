import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Import Eye Icons
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const brandRed = "#de433f";
  const pureBlack = "#000000";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmpassword: "", // Added for backend sync
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle for password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle for confirm password

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic frontend validation
    if (formData.password !== formData.confirmpassword) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://demo-backend-k0yn.onrender.com/api/user/register",
        formData // Sends name, email, password, and confirmpassword
      );

      if (response.status === 201 || response.data.status === "success") {
        toast.success("Account created successfully!!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <ToastContainer position="top-right" autoClose={3000} />

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
              <svg
                width="10"
                height="10"
                viewBox="0 0 64 64"
                fill="none"
                style={{ margin: "0 10px", opacity: 0.5 }}
              >
                <path
                  d="M25.9375 8.5625L23.0625 11.4375L43.625 32L23.0625 52.5625L25.9375 55.4375L47.9375 33.4375L49.3125 32L47.9375 30.5625L25.9375 8.5625Z"
                  fill="#000"
                />
              </svg>
            </li>
            <li style={{ color: "#777" }}>Register</li>
          </ul>
        </div>
      </div>

      <main className="login-container">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7 col-12 p-0 p-md-3">
              <div className="login-card">
                <div className="text-center mb-4">
                  <h2 className="login-title">Register</h2>
                  <div className="red-divider"></div>
                  <p className="login-subtitle">
                    Create an account to track your orders.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="input-label">FULL NAME</label>
                    <input
                      type="text"
                      name="name"
                      className="custom-input"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

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

                  {/* PASSWORD FIELD */}
                  <div className="mb-3">
                    <label className="input-label">PASSWORD</label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="custom-input"
                        placeholder="Create password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <span
                        className="eye-icon"
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

                  {/* CONFIRM PASSWORD FIELD */}
                  <div className="mb-4">
                    <label className="input-label">CONFIRM PASSWORD</label>
                    <div className="password-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmpassword"
                        className="custom-input"
                        placeholder="Confirm password"
                        value={formData.confirmpassword}
                        onChange={handleChange}
                        required
                      />
                      <span
                        className="eye-icon"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <AiOutlineEyeInvisible size={20} />
                        ) : (
                          <AiOutlineEye size={20} />
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="login-btn-main"
                    disabled={loading}
                  >
                    {loading ? "CREATING..." : "CREATE ACCOUNT"}
                  </button>
                </form>

                <div className="separator">
                  <span>OR SIGN UP WITH</span>
                </div>

                <button className="google-btn">
                  <FcGoogle size={22} />
                  <span>Google Account</span>
                </button>

                <div className="text-center mt-5">
                  <p className="no-account">
                    ALREADY A MEMBER?{" "}
                    <NavLink
                      to="/login"
                      style={{
                        color: brandRed,
                        fontWeight: "800",
                        textDecoration: "none",
                      }}
                    >
                      LOGIN HERE
                    </NavLink>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .login-container { padding: 80px 0; }
        .login-card { background: #fff; padding: 50px 40px; border-radius: 20px; box-shadow: 0 20px 60px rgba(222, 67, 63, 0.15); border-top: 5px solid ${brandRed}; }
        .login-title { font-weight: 900; letter-spacing: 2px; color: ${pureBlack}; font-size: 32px; margin-bottom: 5px; }
        .red-divider { width: 50px; height: 4px; background: ${brandRed}; margin: 10px auto 20px; }
        .login-subtitle { color: #888; font-size: 14px; }
        .input-label { display: block; font-weight: 800; font-size: 11px; letter-spacing: 1px; margin-bottom: 8px; color: ${pureBlack}; }
        
        /* Eye Icon Styles */
        .password-wrapper { position: relative; }
        .eye-icon { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #888; display: flex; align-items: center; }
        .eye-icon:hover { color: ${brandRed}; }

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

export default Register;
