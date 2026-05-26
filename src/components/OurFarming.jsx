import React from "react";
import { motion } from "framer-motion";
import {
  FaSeedling,
  FaTractor,
  FaBasketShopping,
  FaTruckFast,
} from "react-icons/fa6";

const OurFarming = () => {
  // Farming Process Data
  const steps = [
    {
      id: "01",
      title: "Natural Soil Preparation",
      description:
        "We enrich soil naturally using eco-friendly compost and organic nutrients to create the perfect foundation for healthy crops.",
      icon: <FaSeedling />,
      image: "/assets/img/nikamecom/farming1.png", // Direct path
    },
    {
      id: "02",
      title: "Chemical-Free Cultivation",
      description:
        "Our farms strictly avoid synthetic pesticides and harmful fertilizers during crop growth, relying on nature's harmony.",
      icon: <FaTractor />,
      image: "/assets/img/nikamecom/farming2.png", // Direct path
    },
    {
      id: "03",
      title: "Fresh Harvesting",
      description:
        "Every fruit and vegetable is harvested carefully by hand at peak ripeness to maintain maximum freshness, taste, and quality.",
      icon: <FaBasketShopping />,
      image: "/assets/img/nikamecom/farming3.png", // Direct path
    },
    {
      id: "04",
      title: "Direct Farm Delivery",
      description:
        "Fresh produce is packed and delivered directly from our farms to your doorstep with the highest standards of care and hygiene.",
      icon: <FaTruckFast />,
      image: "/assets/img/nikamecom/farming4.png", // Direct path
    },
  ];

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const textVariants = (isEven) => ({
    hidden: { opacity: 0, x: isEven ? 50 : -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut", delay: 0.2 },
    },
  });

  const imageVariants = (isEven) => ({
    hidden: { opacity: 0, x: isEven ? -50 : 50, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  });

  return (
    <section className="farming-section">
      <style>{`
        :root {
          --color-white: #ffffff;
          --color-dark-green: #0a2612; 
          --color-brand-green: #407e18; 
          --color-light-green: #f2f7f2;
          --color-text-gray: #4a5c4a;
          --font-main: 'Outfit', sans-serif;
          --font-accent: 'Playfair Display', serif;
        }

        .farming-section {
          width: 100%;
          padding: 120px 24px;
          background-color: var(--color-white);
          font-family: var(--font-main);
          overflow: hidden;
        }

        .farming-container {
          max-width: 1300px;
          margin: 0 auto;
        }

        /* --- SECTION HEADER --- */
        .section-header {
          text-align: center;
          margin-bottom: 100px;
        }

        .section-subtitle {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-brand-green);
          letter-spacing: 2.5px;
          text-transform: uppercase;
          margin-bottom: 16px;
          display: block;
        }

        .section-title {
          font-size: 3.8rem;
          font-weight: 800;
          color: var(--color-dark-green);
          line-height: 1.1;
        }

        .section-title span {
          font-family: var(--font-accent);
          font-style: italic;
          font-weight: 600;
          color: var(--color-brand-green);
        }

        /* --- TIMELINE LAYOUT --- */
        .timeline-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 140px;
        }

        /* The center connecting line */
        .timeline-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 2px;
          background: linear-gradient(to bottom, rgba(64,126,24,0) 0%, rgba(64,126,24,0.25) 10%, rgba(64,126,24,0.25) 90%, rgba(64,126,24,0) 100%);
          transform: translateX(-50%);
          z-index: 1;
        }

        .step-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 2;
          transition: transform 0.4s ease;
        }

        .step-row:nth-child(even) {
          flex-direction: row-reverse;
        }

        /* --- TEXT CONTENT --- */
        .step-content {
          width: 45%;
          position: relative;
          padding: 40px;
        }

        /* UPGRADED: Massive Premium Background Number */
        .step-bg-number {
          position: absolute;
          top: -40px;
          left: 0px;
          font-size: 12rem;
          font-weight: 900;
          line-height: 1;
          z-index: -1;
          user-select: none;
          /* Increased visibility by ~20% and added premium outline */
          color: transparent;
          -webkit-text-stroke: 2px rgba(64, 126, 24, 0.15);
          background: linear-gradient(180deg, rgba(64, 126, 24, 0.1) 0%, transparent 80%);
          -webkit-background-clip: text;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .step-row:nth-child(even) .step-bg-number {
          left: auto;
          right: 0px;
        }

        /* Hover Effect for the Number */
        .step-row:hover .step-bg-number {
          transform: translateY(-15px) scale(1.05);
          -webkit-text-stroke: 2px rgba(64, 126, 24, 0.3);
          background: linear-gradient(180deg, rgba(64, 126, 24, 0.15) 0%, transparent 80%);
          -webkit-background-clip: text;
        }

        .step-icon-box {
          width: 64px;
          height: 64px;
          background-color: var(--color-brand-green);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-white);
          font-size: 1.8rem;
          margin-bottom: 28px;
          box-shadow: 0 12px 24px rgba(64, 126, 24, 0.25);
          transition: transform 0.4s ease;
        }

        .step-row:hover .step-icon-box {
          transform: translateY(-5px) scale(1.05);
        }

        .step-title {
          font-size: 2.4rem;
          font-weight: 700;
          color: var(--color-dark-green);
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .step-desc {
          font-size: 1.15rem;
          color: var(--color-text-gray);
          line-height: 1.75;
        }

        /* --- IMAGE CONTENT --- */
        .step-image-wrapper {
          width: 45%;
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 24px 48px rgba(10, 38, 18, 0.12);
          aspect-ratio: 4/3;
          transform: translateZ(0); /* Fixes Safari overflow bugs */
        }

        .step-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .step-row:hover .step-image {
          transform: scale(1.08);
        }

        /* Center dot on the timeline */
        .timeline-dot {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 24px;
          height: 24px;
          background-color: var(--color-white);
          border: 5px solid var(--color-brand-green);
          border-radius: 50%;
          box-shadow: 0 0 0 8px rgba(64, 126, 24, 0.15);
          transition: all 0.4s ease;
        }

        .step-row:hover .timeline-dot {
          transform: translate(-50%, -50%) scale(1.2);
          box-shadow: 0 0 0 12px rgba(64, 126, 24, 0.2);
        }

        /* --- RESPONSIVE FIXES --- */
        @media (max-width: 1024px) {
          .section-title { font-size: 3.2rem; }
          .step-title { font-size: 2rem; }
          .step-bg-number { font-size: 9rem; top: -20px; }
        }

        @media (max-width: 768px) {
          .farming-section { padding: 80px 20px; }
          .timeline-line, .timeline-dot { display: none; }
          
          .timeline-wrapper { gap: 80px; }
          
          .step-row, .step-row:nth-child(even) {
            flex-direction: column;
            gap: 40px;
          }

          .step-image-wrapper {
            width: 100%;
            aspect-ratio: 16/10;
            order: 1; /* Puts image on top on mobile */
          }

          .step-content {
            width: 100%;
            padding: 0 10px;
            text-align: center;
            order: 2;
          }

          .step-bg-number, .step-row:nth-child(even) .step-bg-number {
            left: 50% !important;
            transform: translateX(-50%);
            top: -40px;
          }

          .step-row:hover .step-bg-number {
            transform: translateX(-50%) translateY(-10px) scale(1.05);
          }

          .step-icon-box {
            margin: 0 auto 20px auto;
          }
        }
      `}</style>

      <div className="farming-container">
        {/* Section Header */}
        <motion.div
          className="section-header"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <span className="section-subtitle">Farm To Table</span>
          <h2 className="section-title">
            Our Organic <span>Farming Process</span>
          </h2>
        </motion.div>

        {/* Timeline Content */}
        <div className="timeline-wrapper">
          <div className="timeline-line"></div>

          {steps.map((step, index) => {
            const isEven = index % 2 !== 0;

            return (
              <div className="step-row" key={step.id}>
                <div className="timeline-dot"></div>

                {/* Text Content */}
                <motion.div
                  className="step-content"
                  variants={textVariants(isEven)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <div className="step-bg-number">{step.id}</div>
                  <div className="step-icon-box">{step.icon}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.description}</p>
                </motion.div>

                {/* Image Content */}
                <motion.div
                  className="step-image-wrapper"
                  variants={imageVariants(isEven)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <img
                    src={step.image}
                    alt={step.title}
                    className="step-image"
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OurFarming;
