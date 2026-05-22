import React from "react";
import { NavLink } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

const NotFound = () => {
  const brandRed = "#de433f";

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      {/* breadcrumb start - MATCHING OTHER SECTIONS EXACTLY */}
      <div
        className="breadcrumb"
        style={{ padding: "15px 0", background: "#f9f9f9" }}
      >
        <div className="container">
          <ul
            className="list-unstyled d-flex align-items-center m-0"
            style={{ fontSize: "14px" }}
          >
            <li>
              <NavLink
                to="/"
                style={{
                  color: "#000",
                  textDecoration: "none",
                  fontWeight: "400",
                }}
              >
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
            <li style={{ color: "#777" }}>404 Page</li>
          </ul>
        </div>
      </div>
      {/* breadcrumb end */}

      <main
        className="container d-flex align-items-center justify-content-center"
        style={{ padding: "60px 20px" }}
      >
        <div className="row align-items-center w-100">
          {/* LEFT SIDE: TEXT CONTENT */}
          <div className="col-lg-6 text-center text-lg-start order-2 order-lg-1">
            <h1
              style={{
                fontSize: "clamp(60px, 10vw, 120px)",
                fontWeight: "900",
                color: brandRed,
                lineHeight: "1",
                margin: "0",
              }}
            >
              404
            </h1>
            <h2
              style={{
                fontSize: "clamp(24px, 5vw, 42px)",
                fontWeight: "800",
                marginTop: "10px",
                color: "#000",
              }}
            >
              Page Not Found
            </h2>
            <div className="mt-4">
              <NavLink to="/" className="btn-404-custom">
                <FiArrowLeft className="me-2" /> Go to Home
              </NavLink>
            </div>
          </div>

          {/* RIGHT SIDE: IMAGE */}
          <div className="col-lg-6 text-center order-1 order-lg-2 mb-5 mb-lg-0">
            <div className="sneaker-image-wrapper">
              <img
                src="assets/img/notfound.webp"
                alt="404 Sneaker"
                className="img-fluid floating-sneaker"
                style={{ maxWidth: "90%", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .floating-sneaker {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .btn-404-custom {
          display: inline-flex;
          align-items: center;
          background: ${brandRed};
          color: white !important;
          padding: 12px 35px;
          border-radius: 50px;
          font-weight: 700;
          text-decoration: none;
          transition: 0.3s;
          border: 2px solid ${brandRed};
        }

        .btn-404-custom:hover {
          background: #fff;
          color: ${brandRed} !important;
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(222, 67, 63, 0.2);
        }

        @media (max-width: 991px) {
          .container { padding-top: 20px; }
        }
      `,
        }}
      />
    </div>
  );
};

export default NotFound;
