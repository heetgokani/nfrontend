import React from "react";
import { NavLink } from "react-router-dom";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";
import { LuLeaf } from "react-icons/lu";

const FeatureIntro = () => {
  return (
    <section className="feature-intro-section py-5 my-4 position-relative">
      {/* --- LIVE ANIMATION LAYER --- */}
      <div className="animation-layer">
        {/* Flying Birds */}
        <div className="bird bird-1">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12C2 12 5 8 12 12C19 8 22 12 22 12" />
          </svg>
        </div>
        <div className="bird bird-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12C2 12 5 8 12 12C19 8 22 12 22 12" />
          </svg>
        </div>
        <div className="bird bird-3">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12C2 12 5 8 12 12C19 8 22 12 22 12" />
          </svg>
        </div>

        {/* Floating Background Crop/Leaf Shapes */}
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
      </div>

      <div className="container position-relative z-1">
        <div className="row align-items-center">
          {/* LEFT: Image Column */}
          <div className="col-lg-6 mb-5 mb-lg-0">
            <div className="intro-image-wrapper">
              {/* --- NEW SPINNING BADGE --- */}
              <div className="spinning-badge-wrapper">
                <svg viewBox="0 0 100 100" className="spinning-text">
                  <defs>
                    <path
                      id="circlePath"
                      d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                    />
                  </defs>
                  <text
                    fontSize="10.5"
                    fontWeight="700"
                    letterSpacing="1.5"
                    fill="#3c7d24"
                  >
                    <textPath href="#circlePath">
                      100% ORGANIC • FARM FRESH • NIKAM •
                    </textPath>
                  </text>
                </svg>
                <div className="badge-icon">
                  <LuLeaf size={24} color="#3c7d24" />
                </div>
              </div>

              <img
                src="/assets/img/nikamecom/veg.jpg"
                alt="Nikam Organic Vegetables"
                className="intro-main-image shadow-lg"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop";
                }}
              />
            </div>
          </div>

          {/* RIGHT: Content Column */}
          <div className="col-lg-6 ps-lg-5">
            <div className="intro-content">
              <span className="subtitle d-inline-block mb-2">
                <span className="subtitle-line"></span> Farm to Kitchen
                Freshness
              </span>

              <h2 className="main-title mb-4">
                Farm-Fresh Produce,{" "}
                <span className="text-highlight">Delivered to Your Door</span>
              </h2>

              <p className="description mb-4">
                Experience the convenience of healthy living with{" "}
                <strong>Nikam Organic</strong>. We carefully source the best
                seasonal fruits and vegetables, ensuring they are free from
                harmful chemicals and delivered with care, so you can enjoy
                nature’s best right at your kitchen table.
              </p>

              <div className="feature-list mb-5">
                <div className="feature-item">
                  <div className="icon-box">
                    <FiCheckCircle size={20} />
                  </div>
                  <span>100% Naturally Grown Produce</span>
                </div>
                <div className="feature-item">
                  <div className="icon-box">
                    <FiCheckCircle size={20} />
                  </div>
                  <span>Handpicked & Safely Delivered</span>
                </div>
                <div className="feature-item">
                  <div className="icon-box">
                    <FiCheckCircle size={20} />
                  </div>
                  <span>Wide Range of Seasonal Selections</span>
                </div>
              </div>

              <NavLink to="/aboutus" className="theme-btn-filled">
                Shop Our Fresh Items <FiArrowRight className="ms-2" />
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* SECTION STYLING */
        .feature-intro-section { background-color: #fcfdfc; overflow: hidden; }

        /* --- LIVE ANIMATIONS --- */
        .animation-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
        .bird { position: absolute; color: #3c7d24; opacity: 0.15; animation: fly linear infinite; }
        @keyframes fly { 
          0% { transform: translate(-10vw, 20vh) scale(0.8) rotate(5deg); opacity: 0; }
          10% { opacity: 0.2; } 90% { opacity: 0.2; }
          100% { transform: translate(110vw, -10vh) scale(1.2) rotate(-5deg); opacity: 0; } 
        }
        .bird-1 { top: 10%; left: -10%; animation-duration: 25s; animation-delay: 0s; }
        .bird-2 { top: 30%; left: -10%; animation-duration: 35s; animation-delay: 12s; }
        .bird-3 { top: 15%; left: -10%; animation-duration: 28s; animation-delay: 5s; }

        .bg-shape { position: absolute; background: linear-gradient(135deg, #eaf2ea 0%, #f4f8f4 100%); border-radius: 50% 40% 60% 40% / 40% 50% 40% 60%; animation: sway 12s ease-in-out infinite alternate; z-index: 0; }
        .shape-1 { width: 400px; height: 400px; top: -100px; right: -100px; opacity: 0.6; }
        .shape-2 { width: 300px; height: 300px; bottom: -50px; left: -50px; animation-duration: 15s; animation-direction: alternate-reverse; opacity: 0.4; }
        @keyframes sway { 0% { transform: rotate(0deg) scale(1); } 100% { transform: rotate(15deg) scale(1.05); } }

        /* --- SPINNING BADGE --- */
        .spinning-badge-wrapper { position: absolute; top: -40px; left: -40px; width: 130px; height: 130px; background: #ffffff; border-radius: 50%; box-shadow: 0 10px 30px rgba(60, 125, 36, 0.15); display: flex; align-items: center; justify-content: center; z-index: 3; }
        .spinning-text { position: absolute; width: 100%; height: 100%; animation: spinText 15s linear infinite; }
        @keyframes spinText { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .badge-icon { position: relative; z-index: 2; display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; background: #e8f3e8; border-radius: 50%; }

        /* --- IMAGE STYLING --- */
        .intro-image-wrapper { position: relative; padding-right: 20px; padding-bottom: 20px; z-index: 2; }
        .intro-image-wrapper::before { content: ""; position: absolute; bottom: 0; right: 0; width: 90%; height: 90%; background-color: #3c7d24; opacity: 0.1; border-radius: 40px; z-index: -1; animation: pulseShadow 6s infinite alternate; }
        @keyframes pulseShadow { 0% { transform: translate(0, 0); } 100% { transform: translate(-10px, -10px); } }
        .intro-main-image { width: 100%; height: auto; min-height: 480px; object-fit: cover; border-radius: 30px; position: relative; z-index: 1; animation: breathe 10s ease-in-out infinite alternate; }
        @keyframes breathe { 0% { transform: scale(1); } 100% { transform: scale(1.03); } }

        /* --- TEXT & LIST --- */
        .subtitle { color: #3c7d24; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; display: flex; align-items: center; gap: 10px; }
        .subtitle-line { width: 40px; height: 2px; background-color: #3c7d24; display: inline-block; }
        .main-title { font-size: 44px; font-weight: 800; color: #1a201a; line-height: 1.2; letter-spacing: -0.5px; }
        .text-highlight { color: #3c7d24; }
        .feature-item { display: flex; align-items: center; gap: 15px; font-weight: 600; font-size: 16px; margin-bottom: 18px; }
        .icon-box { display: flex; align-items: center; justify-content: center; width: 35px; height: 35px; background-color: #f0f6f0; color: #3c7d24; border-radius: 50%; flex-shrink: 0; }
        
        .theme-btn-filled { display: inline-flex; align-items: center; background-color: #3c7d24; color: #fff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 8px 20px rgba(60, 125, 36, 0.25); }
        .theme-btn-filled:hover { background-color: #2e621b; color: #fff; transform: translateY(-3px); }

        @media (max-width: 991px) { .main-title { font-size: 34px; } }
        @media (max-width: 576px) { .main-title { font-size: 28px; } .intro-main-image { min-height: 300px; } .spinning-badge-wrapper { width: 100px; height: 100px; top: -20px; left: -10px; } }
      `,
        }}
      />
    </section>
  );
};

export default FeatureIntro;
