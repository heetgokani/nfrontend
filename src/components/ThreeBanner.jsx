import React from "react";
import { FiTruck, FiShield, FiRefreshCw } from "react-icons/fi";

const ThreeBanner = () => {
  return (
    <div className="trusted-section mt-100 overflow-hidden">
      <div className="trusted-section-inner">
        <div className="container">
          <div className="row justify-content-center trusted-row">
            {/* Banner 1: Free Shipping */}
            <div className="col-lg-4 col-md-6 col-12">
              <div className="trusted-badge rounded" style={badgeStyle}>
                <div className="trusted-icon" style={iconBoxStyle}>
                  <FiTruck size={30} color="#de433f" />
                </div>
                <div className="trusted-content">
                  <h2
                    className="heading_18 trusted-heading"
                    style={{ fontWeight: "700" }}
                  >
                    Free Shipping
                  </h2>
                  <p className="text_16 trusted-subheading trusted-subheading-2">
                    On all prepaid orders
                  </p>
                </div>
              </div>
            </div>

            {/* Banner 2: Authentic Products */}
            <div className="col-lg-4 col-md-6 col-12">
              <div className="trusted-badge rounded" style={badgeStyle}>
                <div className="trusted-icon" style={iconBoxStyle}>
                  <FiShield size={30} color="#de433f" />
                </div>
                <div className="trusted-content">
                  <h2
                    className="heading_18 trusted-heading"
                    style={{ fontWeight: "700" }}
                  >
                    100% Authentic
                  </h2>
                  <p className="text_16 trusted-subheading trusted-subheading-2">
                    Directly from top brands
                  </p>
                </div>
              </div>
            </div>

            {/* Banner 3: Secure Payment */}
            <div className="col-lg-4 col-md-6 col-12">
              <div className="trusted-badge rounded" style={badgeStyle}>
                <div className="trusted-icon" style={iconBoxStyle}>
                  <FiRefreshCw size={30} color="#de433f" />
                </div>
                <div className="trusted-content">
                  <h2
                    className="heading_18 trusted-heading"
                    style={{ fontWeight: "700" }}
                  >
                    7 Day Returns
                  </h2>
                  <p className="text_16 trusted-subheading trusted-subheading-2">
                    Hassle-free exchanges
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .trusted-badge {

            border: 1px solid #eee;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            padding: 20px;
            background: #fdfdfd;
        }
        .trusted-badge:hover {
            border-color: #de433f;
            background: #fff;
          
        }
      `,
        }}
      />
    </div>
  );
};

// Internal styles to keep it clean
const badgeStyle = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
};

const iconBoxStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "55px",
  height: "55px",
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};

export default ThreeBanner;
