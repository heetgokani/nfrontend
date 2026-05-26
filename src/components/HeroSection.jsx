import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaLeaf,
  FaCarrot,
  FaAppleWhole,
  FaSeedling,
  FaCircleCheck,
  FaArrowRight,
} from "react-icons/fa6";

const HeroSection = () => {
  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  // Smooth floating animation for the background icons
  const floatAnim = (delay, yOffset, rotation) => ({
    y: [0, yOffset, 0],
    rotate: [0, rotation, -rotation, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay,
    },
  });

  return (
    <section className="premium-white-hero">
      <style>{`
        /* Premium Font Imports */
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&display=swap');

        :root {
          /* Clean White Theme Colors */
          --color-white: #ffffff;
          --color-dark-green: #0a2612; 
          --color-brand-green: #407e18; 
          --color-light-green: #f2f7f2;
          --color-text-gray: #4a5c4a;
          
          --font-main: 'Outfit', sans-serif;
          --font-accent: 'Playfair Display', serif;
        }

        .premium-white-hero {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          background-color: var(--color-white);
          overflow: hidden;
          font-family: var(--font-main);
        }

        /* --- BACKGROUND IMAGE & FADE --- */
        .hero-image-container {
          position: absolute;
          top: 0;
          right: 0;
          width: 65%;
          height: 100%;
          background-image: url('/assets/img/nikamecom/herobg2.png');
          background-size: cover;
          background-position: center right;
          z-index: 1;
        }

        .white-fade-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,0.85) 55%, rgba(255,255,255,0) 100%);
          z-index: 2;
        }

        /* --- FLOATING REACT ICONS IN BACKGROUND --- */
        .floating-icon-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 3;
          pointer-events: none;
        }

        .bg-icon {
          position: absolute;
          color: var(--color-brand-green);
          opacity: 0.12; /* Subtle watermark effect */
        }

        /* --- LEFT ALIGNED CONTENT --- */
        .content-wrapper {
          position: relative;
          z-index: 4;
          width: 100%;
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .text-constrain {
          max-width: 620px;
        }

        /* Pill Badge */
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: var(--color-light-green);
          padding: 8px 18px;
          border-radius: 50px;
          margin-bottom: 24px;
          border: 1px solid rgba(64, 126, 24, 0.15);
        }

        .hero-badge-text {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-brand-green);
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        /* Typography */
        .main-title {
          font-size: 4.2rem;
          font-weight: 800;
          color: var(--color-dark-green);
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
        }

        .main-title .italic-accent {
          font-family: var(--font-accent);
          font-style: italic;
          font-weight: 600;
          color: var(--color-brand-green);
        }

        .hero-paragraph {
          font-size: 1.125rem;
          color: var(--color-text-gray);
          line-height: 1.7;
          margin-bottom: 24px;
        }

        /* --- NEW BENEFIT POINTS --- */
        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 40px;
          list-style: none;
          padding: 0;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.05rem;
          font-weight: 500;
          color: var(--color-dark-green);
        }

        .benefit-icon {
          color: var(--color-brand-green);
          font-size: 1.2rem;
        }

        /* --- SINGLE CALL TO ACTION --- */
        .cta-wrapper {
          display: flex;
          align-items: center;
        }

        .primary-btn {
          background-color: var(--color-dark-green);
          color: var(--color-white);
          padding: 18px 40px;
          border-radius: 50px;
          font-family: var(--font-main);
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(10, 38, 18, 0.15);
        }

        .primary-btn:hover {
          background-color: var(--color-brand-green);
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(64, 126, 24, 0.25);
        }

        .primary-btn svg {
          transition: transform 0.3s ease;
        }

        .primary-btn:hover svg {
          transform: translateX(4px);
        }

        /* --- RESPONSIVE FIXES --- */
        @media (max-width: 1024px) {
          .main-title { font-size: 3.5rem; }
        }

        @media (max-width: 768px) {
          .hero-image-container { width: 100%; }
          .white-fade-overlay {
            background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 55%, rgba(255,255,255,0.3) 100%);
          }
          .content-wrapper { padding-top: 20px; padding-bottom: 80px; }
          .main-title { font-size: 2.8rem; }
          .hero-paragraph { font-size: 1rem; }
          .benefit-item { font-size: 0.95rem; }
          .primary-btn { width: 100%; }
        }

        @media (max-width: 480px) {
          .main-title { font-size: 2.4rem; }
        }
      `}</style>

      {/* 1. Image & Fade Overlay */}
      <motion.div className="hero-image-container" />
      <div className="white-fade-overlay"></div>

      {/* 2. Floating React Icons in Background */}
      <div className="floating-icon-layer">
        {/* Apple - Top Center/Right */}
        <motion.div
          className="bg-icon"
          style={{ top: "22%", left: "42%", fontSize: "50px" }}
          animate={floatAnim(1, -15, 8)}
        >
          <FaAppleWhole />
        </motion.div>

        {/* Leaf - Top Left */}
        <motion.div
          className="bg-icon"
          style={{ top: "18%", left: "8%", fontSize: "65px" }}
          animate={floatAnim(0, -20, -12)}
        >
          <FaLeaf />
        </motion.div>

        {/* Carrot - Bottom Left */}
        <motion.div
          className="bg-icon"
          style={{ bottom: "15%", left: "38%", fontSize: "55px" }}
          animate={floatAnim(1.5, -25, 15)}
        >
          <FaCarrot />
        </motion.div>

        {/* Seedling - Bottom Center */}
        <motion.div
          className="bg-icon"
          style={{
            bottom: "25%",
            left: "15%",
            fontSize: "40px",
            opacity: 0.08,
          }}
          animate={floatAnim(2, -10, 5)}
        >
          <FaSeedling />
        </motion.div>
      </div>

      {/* 3. Text Content (Strictly Left Aligned) */}
      <div className="content-wrapper">
        <motion.div className="text-constrain">
          {/* Badge */}
          <motion.div variants={itemVariants} className="hero-badge">
            <FaCircleCheck style={{ color: "var(--color-brand-green)" }} />
            <span className="hero-badge-text">100% Natural • Farm Fresh</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} className="main-title">
            Fresh Organic Goodness <br />
            Straight From <br />
            <span className="italic-accent">Nature To Your Family.</span>
          </motion.h1>

          {/* Description */}
          <motion.p variants={itemVariants} className="hero-paragraph">
            At <strong>NIKAMORGANIC</strong>, we believe healthy living starts
            with pure food. Our farms grow naturally fresh fruits and vegetables
            without harmful chemicals, pesticides, or artificial treatments.
          </motion.p>

          {/* Benefit Points */}
          <motion.ul variants={itemVariants} className="benefits-list">
            <li className="benefit-item">
              <FaCircleCheck className="benefit-icon" />
              100% Chemical & Pesticide Free Farming
            </li>
            <li className="benefit-item">
              <FaCircleCheck className="benefit-icon" />
              Harvested Daily for Maximum Freshness
            </li>
            <li className="benefit-item">
              <FaCircleCheck className="benefit-icon" />
              Direct Delivery From Our Farms to Your Kitchen
            </li>
          </motion.ul>

          {/* Single Focused Button */}
          <motion.div variants={itemVariants} className="cta-wrapper">
            <Link to="/shop" className="primary-btn">
              Shop Organic Products
              <FaArrowRight />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
