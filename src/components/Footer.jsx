import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <style>{`
        .footer-organic {
          background-color: #0b2b16;
          color: #e8f3e8;
          padding: 60px 0 30px;
          border-top: 5px solid #407e18;
          font-family: 'Poppins', sans-serif;
        }
        .footer-logo-box img {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          border: 3px solid #407e18;
          margin-bottom: 20px;
          background: white;
          padding: 5px;
        }
        .footer-organic h4 {
          color: #ffffff;
          font-size: 18px;
          margin-bottom: 25px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .footer-links { list-style: none; padding: 0; }
        .footer-links li { margin-bottom: 12px; }
        .footer-links a {
          color: #e8f3e8;
          text-decoration: none;
          font-size: 14px;
          transition: 0.3s;
          display: flex;
          align-items: center;
        }
        .footer-links a:hover { color: #88c057; padding-left: 5px; }
        
        .contact-list { list-style: none; padding: 0; }
        .contact-list li {
          margin-bottom: 18px;
          display: flex;
          align-items: flex-start;
          font-size: 14px;
          color: #e8f3e8;
          line-height: 1.5;
        }
        .icon-svg {
          width: 22px;
          height: 22px;
          margin-right: 12px;
          flex-shrink: 0;
          fill: none;
          stroke: #407e18;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .footer-bottom {
          margin-top: 40px;
          padding-top: 25px;
          border-top: 1px solid rgba(255,255,255,0.1);
          text-align: center;
          font-size: 13px;
        }
        .dev-highlight {
          margin-top: 15px;
          padding: 12px 25px;
          background: rgba(64, 126, 24, 0.15);
          border: 1px solid #407e18;
          border-radius: 50px;
          display: inline-block;
          color: #fff;
        }
        .dev-highlight strong { color: #88c057; }
        .dev-highlight a { color: #fff; text-decoration: none; margin-left: 5px; }
        
        /* MOBILE CENTERED ALIGNMENT */
        @media (max-width: 768px) {
          .footer-organic { text-align: center; }
          .footer-links, .contact-list {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0;
          }
          .contact-list li {
            justify-content: center;
          }
        }
      `}</style>

      <footer className="footer-organic">
        <div className="container">
          <div className="row">
            {/* Logo Section */}
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="footer-logo-box">
                <img src="/assets/img/logo.png" alt="Nikam Organic" />
              </div>
              <h5 style={{ color: "#fff" }}>Nikam Organic</h5>
              <p style={{ fontSize: "13px", color: "#ccc", marginTop: "10px" }}>
                Pure, natural, and sustainable. We bring the harvest of nature
                directly to your kitchen.
              </p>
            </div>

            {/* Quick Links */}
            <div className="col-lg-3 col-md-6 mb-4">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/shop">Shop Now</Link>
                </li>
                <li>
                  <Link to="/aboutus">About Us</Link>
                </li>
                <li>
                  <Link to="/faq">FAQ</Link>
                </li>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
              </ul>
            </div>

            {/* Policies */}
            <div className="col-lg-3 col-md-6 mb-4">
              <h4>Support</h4>
              <ul className="footer-links">
                <li>
                  <Link to="/privacy-policy">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms-conditions">Terms & Conditions</Link>
                </li>
                <li>
                  <Link to="/return-policy">Return Policy</Link>
                </li>
                <li>
                  <Link to="/orders">Order History</Link>
                </li>
              </ul>
            </div>

            {/* Contact Details */}
            <div className="col-lg-3 col-md-6 mb-4">
              <h4>Contact Us</h4>
              <ul className="contact-list">
                <li>
                  <svg className="icon-svg" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                  </svg>
                  Nikam Organic, 02-B Unnati Nagar Pole, No.17 Deopur Dhule,
                  Dhule Deopur, Dhule - 424002, Maharashtra
                </li>
                <li>
                  <svg className="icon-svg" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  nikamorganic712@gmail.com
                </li>
                <li>
                  <svg className="icon-svg" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  +91 8855932532
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              &copy; {new Date().getFullYear()} Nikam Organic. All Rights
              Reserved.
            </p>
            <div className="dev-highlight">
              Developed by <strong>BlackNova Tech</strong> |
              <a href="mailto:contact.blacknovatech@gmail.com">
                {" "}
                contact.blacknovatech@gmail.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
