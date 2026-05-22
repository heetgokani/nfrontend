import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiArrowRight,
  FiShield,
  FiTruck,
  FiRefreshCw,
} from "react-icons/fi";

const Footer = () => {
  const mainNavLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About Us", path: "/aboutus" },
    { name: "FAQ", path: "/faq" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <footer
      style={{
        backgroundColor: "#fff",
        color: "#333",
        marginTop: "60px",
        borderTop: "1px solid #eee",
        paddingTop: "40px",
      }}
    >
      <div className="container py-5">
        <div className="row g-4">
          {/* 1. Brand Info */}
          <div className="col-lg-5 col-md-12 pe-lg-5">
            <NavLink to="/">
              <img
                src="/assets/img/swlogo.webp"
                alt="SneakersWala"
                style={{
                  maxWidth: "180px",
                  marginBottom: "20px",
                  // Removed the filter so your original colored logo shows on white bg
                }}
              />
            </NavLink>
            <p
              style={{
                lineHeight: "1.6",
                fontSize: "14px",
                color: "#666",
                marginBottom: "25px",
              }}
            >
              SneakersWala is India's premier destination for authentic sneaker
              culture. We don't just sell shoes; we provide a lifestyle. Every
              pair is verified for quality so you can step out with absolute
              confidence.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="social-link-red">
                <FiFacebook size={18} />
              </a>
              <a href="#" className="social-link-red">
                <FiInstagram size={18} />
              </a>
              <a href="#" className="social-link-red">
                <FiTwitter size={18} />
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="col-lg-3 col-md-4">
            <h6
              className="fw-bold mb-4 text-uppercase"
              style={{ letterSpacing: "1px", color: "#de433f" }}
            >
              Quick Links
            </h6>
            <ul className="list-unstyled m-0 p-0">
              {mainNavLinks.map((link, idx) => (
                <li key={idx} className="mb-3">
                  <NavLink
                    to={link.path}
                    className="footer-nav-link d-flex align-items-center gap-2"
                  >
                    <FiArrowRight size={14} color="#de433f" /> {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Store Info */}
          <div className="col-lg-4 col-md-8">
            <h6
              className="fw-bold mb-4 text-uppercase"
              style={{ letterSpacing: "1px", color: "#de433f" }}
            >
              Store Info
            </h6>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-start gap-3">
                <div className="contact-icon-box">
                  <FiMapPin color="#de433f" />
                </div>
                <span className="small" style={{ color: "#666" }}>
                  123 Sneaker Street, Fashion District,
                  <br />
                  Mumbai, MH 400001
                </span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="contact-icon-box">
                  <FiPhone color="#de433f" />
                </div>
                <span className="small" style={{ color: "#666" }}>
                  +91 98765 43210
                </span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="contact-icon-box">
                  <FiMail color="#de433f" />
                </div>
                <span className="small" style={{ color: "#666" }}>
                  support@sneakerswala.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Trust Badge Strip --- */}
      <div
        className="py-4"
        style={{
          backgroundColor: "#fcfcfc",
          borderTop: "1px solid #eee",
          borderBottom: "1px solid #eee",
        }}
      >
        <div className="container">
          <div className="row g-3 text-center">
            <div className="col-md-4 d-flex align-items-center justify-content-center gap-2 border-end-gray">
              <FiTruck size={20} color="#de433f" />{" "}
              <span className="small fw-bold">FREE SHIPPING ON PREPAID</span>
            </div>
            <div className="col-md-4 d-flex align-items-center justify-content-center gap-2 border-end-gray">
              <FiShield size={20} color="#de433f" />{" "}
              <span className="small fw-bold">100% AUTHENTIC PRODUCTS</span>
            </div>
            <div className="col-md-4 d-flex align-items-center justify-content-center gap-2">
              <FiRefreshCw size={20} color="#de433f" />{" "}
              <span className="small fw-bold">7 DAY EASY RETURNS</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Copyright Bar --- */}
      <div
        className="py-3 text-center"
        style={{ backgroundColor: "#de433f", color: "#fff" }}
      >
        <div className="container d-flex flex-wrap justify-content-between align-items-center">
          <p className="mb-0 small" style={{ opacity: "0.9" }}>
            © {new Date().getFullYear()} SNEAKERSWALA. ALL RIGHTS RESERVED.
          </p>
          <p className="mb-0 small fw-bold mt-2 mt-md-0">
            Its only an demo website
          </p>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .footer-nav-link { color: #666; text-decoration: none; transition: 0.3s; font-size: 14px; font-weight: 500; }
        .footer-nav-link:hover { color: #de433f; transform: translateX(5px); }
        
        .social-link-red { 
          width: 36px; height: 36px; border: 1px solid #eee; border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; 
          color: #de433f; transition: 0.3s; background: #f9f9f9;
        }
        .social-link-red:hover { background: #de433f; color: #fff; border-color: #de433f; }
        
        .contact-icon-box { min-width: 20px; font-size: 18px; display: flex; align-items: center; justify-content: center; }
        
        @media (min-width: 768px) {
          .border-end-gray { border-right: 1px solid #eee; }
        }
        @media (max-width: 767px) {
          .border-end-gray { border-bottom: 1px solid #eee; padding-bottom: 15px; }
        }
      `,
        }}
      />
    </footer>
  );
};

export default Footer;
