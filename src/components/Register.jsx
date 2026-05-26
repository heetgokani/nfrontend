import React, { useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  // OTP 6-box state and refs
  const [otpValues, setOtpValues] = useState(new Array(6).fill(""));
  const otpRefs = useRef([]);

  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // Controls revealing the next steps
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation checks
  const passwordChecks = {
    length: formData.password.length >= 8,
    lowercase: /[a-z]/.test(formData.password),
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[@$!%*?&]/.test(formData.password),
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle individual OTP box changes
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = element.value;
    setOtpValues(newOtp);

    // Auto-focus next box if value is entered
    if (element.value !== "" && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  // Handle backspace for OTP
  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  // Send OTP Function
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.email) {
      return toast.error("Please enter your name and email first.");
    }
    setSendingOtp(true);
    try {
      await axios.post("http://localhost:5000/api/user/send-otp", {
        email: formData.email,
      });
      toast.success("OTP sent! Please check your email.");
      setOtpSent(true); // Reveal OTP and Password fields
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to send OTP";
      toast.error(errorMsg);
    } finally {
      setSendingOtp(false);
    }
  };

  // Final Registration Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure all 5 password rules are met
    const isPasswordValid = Object.values(passwordChecks).every(Boolean);
    if (!isPasswordValid) {
      return toast.error("Please meet all strong password requirements.");
    }

    if (formData.password !== formData.confirmpassword) {
      return toast.error("Passwords do not match!");
    }

    const finalOtp = otpValues.join("");
    if (finalOtp.length !== 6) {
      return toast.error("Please enter the complete 6-digit OTP.");
    }

    setLoading(true);

    try {
      const payload = { ...formData, otp: finalOtp };
      const response = await axios.post(
        "http://localhost:5000/api/user/register",
        payload,
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
    <div className="premium-organic-wrapper">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Ambient Animated Background Elements */}
      <div className="ambient-shape shape-1"></div>
      <div className="ambient-shape shape-2"></div>
      <div className="ambient-shape shape-3"></div>

      {/* Navigation / Breadcrumb */}
      <div className="breadcrumb-wrapper d-none d-md-block">
        <div className="universal-container">
          <ul className="list-unstyled d-flex align-items-center m-0 breadcrumb-list">
            <li>
              <NavLink to="/" className="breadcrumb-link">
                Home
              </NavLink>
            </li>
            <li className="d-flex align-items-center">
              <span className="breadcrumb-divider">/</span>
            </li>
            <li className="breadcrumb-current">Register</li>
          </ul>
        </div>
      </div>

      <main className="login-container">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-12 p-0 p-md-3">
              <div className="login-card">
                <div className="text-center mb-5">
                  <h2 className="login-title">Create Account</h2>
                  <div className="organic-divider"></div>
                  <p className="login-subtitle">
                    {otpSent
                      ? "Check your email for the OTP to complete registration."
                      : "Create an account to track your organic orders."}
                  </p>
                </div>

                <form onSubmit={otpSent ? handleSubmit : handleSendOtp}>
                  <div className="input-group-animated mb-4">
                    <label className="input-label">FULL NAME</label>
                    <input
                      type="text"
                      name="name"
                      className="custom-input"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      readOnly={otpSent}
                      style={{ opacity: otpSent ? 0.6 : 1 }}
                      required
                    />
                    <span className="focus-border"></span>
                  </div>

                  <div className="input-group-animated mb-4">
                    <label className="input-label">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      name="email"
                      className="custom-input"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      readOnly={otpSent}
                      style={{ opacity: otpSent ? 0.6 : 1 }}
                      required
                    />
                    <span className="focus-border"></span>
                  </div>

                  {/* SHOW THESE FIELDS ONLY AFTER OTP IS SENT */}
                  {otpSent && (
                    <div className="slide-down">
                      {/* OTP 6-BOX SECTION */}
                      <div className="mb-5 mt-4 text-center">
                        <label className="input-label mb-3 text-center">
                          ENTER 6-DIGIT OTP
                        </label>
                        <div className="otp-container">
                          {otpValues.map((data, index) => (
                            <input
                              key={index}
                              type="text"
                              maxLength="1"
                              value={data}
                              ref={(el) => (otpRefs.current[index] = el)}
                              onChange={(e) => handleOtpChange(e.target, index)}
                              onKeyDown={(e) => handleOtpKeyDown(e, index)}
                              className="otp-box"
                            />
                          ))}
                        </div>
                      </div>

                      <div className="input-group-animated mb-4">
                        <label className="input-label">CREATE PASSWORD</label>
                        <div className="password-wrapper">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className="custom-input"
                            placeholder="Create strong password"
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
                          <span className="focus-border"></span>
                        </div>

                        {/* REAL-TIME PASSWORD VALIDATION UI */}
                        <div className="password-rules-container mt-3">
                          <p className="password-rules-title">
                            Password must contain:
                          </p>
                          <ul className="password-rules-list">
                            <li
                              className={
                                passwordChecks.length
                                  ? "rule-pass"
                                  : "rule-fail"
                              }
                            >
                              {passwordChecks.length ? (
                                <FaCheckCircle />
                              ) : (
                                <FaTimesCircle />
                              )}{" "}
                              8+ characters
                            </li>
                            <li
                              className={
                                passwordChecks.uppercase
                                  ? "rule-pass"
                                  : "rule-fail"
                              }
                            >
                              {passwordChecks.uppercase ? (
                                <FaCheckCircle />
                              ) : (
                                <FaTimesCircle />
                              )}{" "}
                              1 uppercase
                            </li>
                            <li
                              className={
                                passwordChecks.lowercase
                                  ? "rule-pass"
                                  : "rule-fail"
                              }
                            >
                              {passwordChecks.lowercase ? (
                                <FaCheckCircle />
                              ) : (
                                <FaTimesCircle />
                              )}{" "}
                              1 lowercase
                            </li>
                            <li
                              className={
                                passwordChecks.number
                                  ? "rule-pass"
                                  : "rule-fail"
                              }
                            >
                              {passwordChecks.number ? (
                                <FaCheckCircle />
                              ) : (
                                <FaTimesCircle />
                              )}{" "}
                              1 number
                            </li>
                            <li
                              className={
                                passwordChecks.special
                                  ? "rule-pass"
                                  : "rule-fail"
                              }
                            >
                              {passwordChecks.special ? (
                                <FaCheckCircle />
                              ) : (
                                <FaTimesCircle />
                              )}{" "}
                              1 special char
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="input-group-animated mb-5 mt-4">
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
                          <span className="focus-border"></span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="login-btn-main"
                    disabled={loading || sendingOtp}
                  >
                    <span className="btn-text">
                      {!otpSent
                        ? sendingOtp
                          ? "SENDING OTP..."
                          : "SEND OTP"
                        : loading
                          ? "CREATING..."
                          : "CREATE ACCOUNT"}
                    </span>
                    {!(loading || sendingOtp) && (
                      <span className="btn-arrow">→</span>
                    )}
                  </button>
                </form>

                <div className="text-center mt-5 pt-4 footer-section">
                  <p className="no-account">
                    ALREADY HAVE AN ACCOUNT ?{" "}
                    <NavLink to="/login" className="create-account-link">
                      LOGIN HERE
                    </NavLink>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>
        {`
        /* Core Brand Variables */
        :root {
          --local-green-dark: var(--green-dark, #1f4212);
          --local-green-medium: var(--green-medium, #407e18);
          --local-green-light: var(--green-light, #e8f3e8);
          --local-bg-off-white: var(--bg-off-white, #f9fbf9);
          --local-text-main: var(--text-main, #1a201a);
          --local-text-muted: var(--text-muted, #5a6b5a);
          --local-font-sans: var(--font-sans, "Poppins", sans-serif);
          --local-font-serif: var(--font-serif, "Playfair Display", serif);
        }

        /* --- WRAPPER & ANIMATED BACKGROUND --- */
        .premium-organic-wrapper {
          position: relative;
          min-height: 100vh;
          background-color: var(--local-bg-off-white);
          overflow: hidden;
          font-family: var(--local-font-sans);
          display: flex;
          flex-direction: column;
        }

        .ambient-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          z-index: 0;
          opacity: 0.45;
          animation: floatShape 15s infinite alternate cubic-bezier(0.45, 0.05, 0.55, 0.95);
        }

        .shape-1 { width: 450px; height: 450px; background: rgba(64, 126, 24, 0.15); top: -10%; left: -5%; }
        .shape-2 { width: 550px; height: 550px; background: rgba(186, 219, 173, 0.25); bottom: -15%; right: -10%; animation-delay: -5s; animation-duration: 20s; }
        .shape-3 { width: 300px; height: 300px; background: rgba(212, 160, 55, 0.08); top: 40%; left: 60%; animation-delay: -2s; animation-duration: 18s; }

        @keyframes floatShape {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(40px, 30px) scale(1.05) rotate(10deg); }
          100% { transform: translate(-20px, 50px) scale(0.95) rotate(-5deg); }
        }

        /* --- BREADCRUMBS --- */
        .breadcrumb-wrapper { padding: 20px 0; position: relative; z-index: 10; }
        .breadcrumb-list { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 500; }
        .breadcrumb-link { color: var(--local-text-main); text-decoration: none; transition: color 0.3s ease; }
        .breadcrumb-link:hover { color: var(--local-green-medium); }
        .breadcrumb-divider { margin: 0 12px; color: var(--local-text-muted); opacity: 0.4; }
        .breadcrumb-current { color: var(--local-text-muted); font-weight: 400; }

        /* --- CARD & GLASSMORPHISM --- */
        .login-container { 
          padding: 20px 0 100px; 
          position: relative;
          z-index: 2;
          flex-grow: 1;
          display: flex;
          align-items: center;
        }
        
        .login-card { 
          background: rgba(255, 255, 255, 0.75); 
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          padding: 60px 50px; 
          border-radius: 24px; 
          box-shadow: 0 24px 48px rgba(31, 66, 18, 0.06); 
          
          opacity: 0;
          transform: translateY(30px);
          animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUpFade {
          to { opacity: 1; transform: translateY(0); }
        }

        /* --- ELEGANT CURVED TYPOGRAPHY --- */
        .login-title { 
          font-family: var(--local-font-serif);
          font-style: italic; 
          font-weight: 500; 
          font-size: 42px; 
          margin-bottom: 12px; 
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, var(--local-green-dark) 0%, var(--local-green-medium) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 6px 15px rgba(64, 126, 24, 0.12);
        }
        
        .organic-divider { 
          width: 0px; 
          height: 2px; 
          background: linear-gradient(90deg, var(--local-green-medium) 0%, transparent 100%);
          margin: 0 auto 20px; 
          animation: growLine 1s ease-out 0.6s forwards;
        }

        @keyframes growLine { to { width: 60px; } }
        
        .login-subtitle { 
          color: var(--local-text-muted); 
          font-size: 14px; 
          font-weight: 300;
          letter-spacing: 0.3px;
          opacity: 0;
          animation: fadeIn 1s ease-out 0.8s forwards;
        }

        @keyframes fadeIn { to { opacity: 1; } }

        /* --- ANIMATED INPUTS --- */
        .input-group-animated { position: relative; }
        .input-label { display: block; font-weight: 600; font-size: 11px; letter-spacing: 1.5px; margin-bottom: 8px; color: var(--local-text-main); }
        
        .custom-input { 
          width: 100%; 
          padding: 12px 35px 12px 0; /* Extra right padding for the eye icon */
          background: transparent; 
          border: none;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          border-radius: 0; 
          font-size: 15px; 
          font-family: var(--local-font-sans);
          color: var(--local-text-main);
          transition: 0.3s ease; 
          outline: none; 
        }
        
        .custom-input::placeholder { color: #aebfab; font-weight: 300; }

        .focus-border {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background-color: var(--local-green-medium);
          transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .custom-input:focus ~ .focus-border { width: 100%; left: 0; }

        /* --- PASSWORD WRAPPER & ICONS --- */
        .password-wrapper { position: relative; }
        .eye-icon { 
          position: absolute; 
          right: 0; 
          top: 50%; 
          transform: translateY(-50%); 
          cursor: pointer; 
          color: #aebfab; 
          transition: 0.3s ease;
          z-index: 5;
        }
        .eye-icon:hover { color: var(--local-green-dark); }

        /* --- OTP LUXURY STYLING --- */
        .otp-container {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .otp-box { 
          width: 48px; 
          height: 55px; 
          text-align: center; 
          font-size: 22px; 
          font-weight: 500; 
          font-family: var(--local-font-serif);
          color: var(--local-text-main);
          border-radius: 8px; 
          border: 1px solid rgba(0,0,0,0.08); 
          background: rgba(255, 255, 255, 0.5); 
          outline: none; 
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); 
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }

        .otp-box:focus { 
          border-color: var(--local-green-medium); 
          background: rgba(255, 255, 255, 0.9); 
          box-shadow: 0 8px 20px rgba(64, 126, 24, 0.12);
          transform: translateY(-3px);
        }

        /* --- PASSWORD VALIDATION RULES --- */
        .password-rules-container {
          background: rgba(255, 255, 255, 0.4);
          padding: 12px 15px;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.03);
        }
        
        .password-rules-title {
          margin: 0 0 8px 0;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: var(--local-text-muted);
        }

        .password-rules-list {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 11px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 4px;
        }

        .rule-pass { color: var(--local-green-medium); font-weight: 500; display: flex; align-items: center; gap: 6px; transition: 0.3s ease; }
        .rule-fail { color: #aebfab; font-weight: 300; display: flex; align-items: center; gap: 6px; transition: 0.3s ease; }

        /* --- SLIDE DOWN ANIMATION --- */
        .slide-down { 
          animation: slideDownFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
          transform-origin: top center;
        }

        @keyframes slideDownFade {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* --- PREMIUM BUTTON --- */
        .login-btn-main { 
          width: 100%; 
          padding: 18px; 
          background: var(--local-green-dark); 
          color: #fff; 
          border: none; 
          border-radius: 8px; 
          font-weight: 500; 
          letter-spacing: 2.5px; 
          font-size: 13px;
          text-transform: uppercase;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 15px rgba(31, 66, 18, 0.15);
        }
        
        .login-btn-main:hover:not(:disabled) { 
          background: var(--local-green-medium); 
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(31, 66, 18, 0.25);
        }

        .btn-arrow { font-size: 16px; transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .login-btn-main:hover .btn-arrow { transform: translateX(6px); }
        
        .login-btn-main:disabled { 
          background: #c3d0c3; 
          color: #798a79;
          cursor: not-allowed; 
          box-shadow: none;
        }
        
        /* --- FOOTER --- */
        .footer-section { border-top: 1px solid rgba(0,0,0,0.06); }
        .no-account { font-size: 12px; font-weight: 400; color: var(--local-text-muted); letter-spacing: 1px; }

        .create-account-link {
          color: var(--local-green-dark);
          font-weight: 700;
          text-decoration: none;
          margin-left: 5px;
          position: relative;
        }

        .create-account-link::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 1.5px;
          bottom: -2px;
          left: 0;
          background-color: var(--local-green-medium);
          transform-origin: bottom right;
          transition: transform 0.4s cubic-bezier(0.86, 0, 0.07, 1);
        }

        .create-account-link:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
        
        /* --- RESPONSIVE ADJUSTMENTS --- */
        @media (max-width: 767px) {
          .login-container { padding: 20px 15px; align-items: flex-start; }
          .login-card { 
            padding: 40px 25px; 
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.85); 
          }
          .login-title { font-size: 34px; }
          .otp-box { width: 40px; height: 48px; font-size: 18px; }
          .password-rules-list { grid-template-columns: 1fr; } /* Stack rules on mobile */
          .shape-1 { width: 300px; height: 300px; }
          .shape-2 { width: 350px; height: 350px; }
        }
        `}
      </style>
    </div>
  );
};

export default Register;
