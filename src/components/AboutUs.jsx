import React from "react";
import { NavLink } from "react-router-dom";
import { FiChevronRight, FiShield, FiZap, FiUsers } from "react-icons/fi";

const AboutUs = () => {
  const brandRed = "#de433f";

  const stats = [
    { label: "Exclusive Drops", value: "500+" },
    { label: "Happy Sneakerheads", value: "10k+" },
    { label: "Authenticity Checks", value: "100%" },
    { label: "Cities Reached", value: "150+" },
  ];

  return (
    <div style={{ backgroundColor: "#ffffff", overflowX: "hidden" }}>
      {/* BREADCRUMB - Matched to Wishlist perfectly */}
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
            <li style={{ color: "#777" }}>About Us</li>
          </ul>
        </div>
      </div>

      <main className="content-for-layout">
        {/* HERO SECTION - Big Bold Text for Mobile */}
        <section className="container py-5 text-center">
          <div
            style={{
              display: "inline-block",
              background: "rgba(222, 67, 63, 0.1)",
              color: brandRed,
              padding: "5px 15px",
              borderRadius: "50px",
              fontSize: "12px",
              fontWeight: "700",
              marginBottom: "20px",
            }}
          >
            SINCE 2024
          </div>
          {/* clamp makes it big on mobile and balanced on desktop */}
          <h1
            style={{
              fontSize: "clamp(36px, 10vw, 60px)",
              fontWeight: "900",
              lineHeight: "1.1",
              marginBottom: "20px",
              color: "#000000",
            }}
          >
            We Are <span style={{ color: brandRed }}>SneakersWala</span>
          </h1>
          <p
            className="text-muted mx-auto"
            style={{ maxWidth: "700px", fontSize: "18px" }}
          >
            More than just a store. We are a community driven by the culture,
            the hype, and the love for the perfect pair.
          </p>
        </section>

        {/* MISSION SECTION */}
        <section style={{ backgroundColor: "#fcfcfc", padding: "60px 0" }}>
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-4 col-md-6">
                <div className="about-card">
                  <FiShield size={40} color={brandRed} className="mb-4" />
                  <h3 style={{ fontWeight: "800", color: "#050607" }}>
                    100% Authentic
                  </h3>
                  <p className="text-muted mb-0">
                    Every pair is inspected by our expert verification team.
                  </p>
                </div>
              </div>
              <div className="col-lg-4 col-md-6">
                <div className="about-card">
                  <FiZap size={40} color={brandRed} className="mb-4" />
                  <h3 style={{ fontWeight: "800", color: "#000000" }}>
                    Fastest Drops
                  </h3>
                  <p className="text-muted mb-0">
                    Access to limited releases and collaborations in real-time.
                  </p>
                </div>
              </div>
              <div className="col-lg-4 col-md-12">
                <div className="about-card">
                  <FiUsers size={40} color={brandRed} className="mb-4" />
                  <h3 style={{ fontWeight: "800", color: "rgb(0, 0, 0)" }}>
                    Built for You
                  </h3>
                  <p className="text-muted mb-0">
                    Designed by sneakerheads, for the true sneaker community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* THE STORY SECTION */}
        <section className="container py-5 mt-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <img
                src="assets/img/about.webp"
                alt="SneakersWala Story"
                className="img-fluid rounded-4 shadow-lg"
                style={{ width: "100%", height: "auto", objectFit: "cover" }}
              />
            </div>
            <div className="col-lg-6 text-center text-lg-start">
              <h2
                style={{
                  fontWeight: "800",
                  fontSize: "clamp(28px, 6vw, 42px)",
                  marginBottom: "25px",
                  color: "#000000",
                }}
              >
                The Story Behind The Sole
              </h2>
              <p
                className="text-muted"
                style={{ lineHeight: "1.8", fontSize: "16px" }}
              >
                SneakersWala started with a simple problem: finding authentic,
                limited-edition sneakers without the stress of scams or
                ridiculous markups. We decided to bridge that gap.
              </p>
              <p
                className="text-muted mb-4"
                style={{ lineHeight: "1.8", fontSize: "16px" }}
              >
                Today, we stand as one of the fastest-growing destinations for
                sneaker culture. Whether you're looking for your first pair or
                your 100th, we've got your back.
              </p>
              <NavLink to="/shop" className="btn-shop-now">
                Explore Collection
              </NavLink>
            </div>
          </div>
        </section>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .about-card {
          background: #fff;
          padding: 40px;
          border-radius: 15px;
          height: 100%;
          transition: 0.3s ease;
          border: 1px solid #eee;
          text-align: center;
        }
        .about-card:hover {
          border-color: ${brandRed};
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          transform: translateY(-5px);
        }
        .btn-shop-now {
          display: inline-block;
          background: #000000;
          color: #fff !important;
          padding: 15px 45px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          transition: 0.3s;
        }
        .btn-shop-now:hover {
          background: ${brandRed};
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(222, 67, 63, 0.2);
        }
        @media (max-width: 768px) {
          .about-card { padding: 30px 20px; }
        }
      `,
        }}
      />
    </div>
  );
};

export default AboutUs;
