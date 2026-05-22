import React from "react";

const Newsletter = () => {
  return (
    <section
      style={{
        marginBottom: "-100px",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div style={{ marginTop: "100px" }}>
        <div style={{ position: "relative", height: "450px" }}>
          {/* Background Image */}
          <img
            src="assets/img/newsletter/newsletter1.webp"
            alt="newsletter-bg"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Light Gradient Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(255,240,240,0.5) 0%, rgba(255,255,255,0.2) 100%)",
            }}
          />

          {/* Centered Content */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <div style={{ maxWidth: "700px", width: "100%" }}>
              <p
                style={{
                  color: "#ff5a5f",
                  fontSize: "clamp(14px, 4vw, 16px)",
                  fontWeight: "700",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                Newsletter
              </p>

              <h2
                style={{
                  fontSize: "clamp(26px, 7vw, 42px)", // Slightly smaller min-size to prevent wrapping issues
                  fontWeight: "800",
                  color: "#1a1a1a",
                  lineHeight: "1.1",
                  marginBottom: "30px",
                }}
              >
                Subscribe To Our <br /> Newsletter
              </h2>

              {/* Form Container - Optimized for Mobile */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <form
                  style={{
                    background: "#fff",
                    padding: "4px", // Reduced padding to save space
                    borderRadius: "100px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    maxWidth: "500px", // Keeps desktop look
                    height: "60px", // Slightly shorter for mobile elegance
                    overflow: "hidden",
                    border: "1px solid #f0f0f0", // Adds definition
                  }}
                >
                  <input
                    type="email"
                    placeholder="Enter email" // Shortened placeholder text for mobile
                    autoComplete="off"
                    style={{
                      flex: 1,
                      padding: "0 0 0 20px", // Left padding only
                      border: "none",
                      outline: "none",
                      fontSize: "15px", // Slightly smaller font
                      color: "#333",
                      height: "100%",
                      background: "transparent",
                      minWidth: "50px", // Allows input to shrink without breaking
                    }}
                  />

                  <button
                    type="submit"
                    style={{
                      backgroundColor: "#ff5a5f",
                      border: "none",
                      borderRadius: "100px",
                      height: "100%",
                      padding: "0 20px", // Reduced padding from 35px -> 20px for mobile fit
                      color: "#fff",
                      fontWeight: "700",
                      fontSize: "13px", // Slightly smaller text
                      letterSpacing: "1px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      whiteSpace: "nowrap",
                      minWidth: "100px", // Ensures button stays clickable but compact
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e0484d")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#ff5a5f")
                    }
                  >
                    SIGN UP
                  </button>
                </form>
              </div>

              <p
                style={{
                  fontSize: "13px",
                  color: "#888",
                  marginTop: "20px",
                  fontWeight: "500",
                  padding: "0 10px",
                  lineHeight: "1.5", // Better readability on mobile
                }}
              >
                Be the first to grab our latest offers and exclusive deals!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
