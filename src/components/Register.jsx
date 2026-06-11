import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const clientId =
    "213220421864-hpm7q03avelqecjcnvpu79falqh7u9dv.apps.googleusercontent.com";
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://nbackend-31lg.onrender.com/api/user/google-login",
        { googleToken: credentialResponse.credential },
        { withCredentials: true }
      );

      if (response.status === 200 || response.data.status === "success") {
        toast.success("Account verified successfully!!");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Google Authentication failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
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
                      Sign up securely with your Google account to track your
                      organic orders.
                    </p>
                  </div>

                  <div className="d-flex justify-content-center mt-4">
                    {loading ? (
                      <p
                        style={{
                          fontWeight: 500,
                          color: "var(--local-green-dark)",
                        }}
                      >
                        Setting up account...
                      </p>
                    ) : (
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                          toast.error("Google Signup Failed");
                        }}
                        theme="filled_black"
                        size="large"
                        shape="pill"
                        text="signup_with"
                      />
                    )}
                  </div>

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
            .shape-1 { width: 300px; height: 300px; }
            .shape-2 { width: 350px; height: 350px; }
          }
          `}
        </style>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;
