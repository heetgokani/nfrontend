import React from "react";
import { motion } from "framer-motion";
import {
  FaLeaf,
  FaAppleWhole,
  FaEarthAmericas,
  FaHeartPulse,
  FaDropletSlash,
  FaQuoteLeft,
  FaHandsHoldingCircle,
  FaBinoculars,
} from "react-icons/fa6";

const AboutUsFull = () => {
  // Simplified, robust animation that guarantees visibility
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // --- DATA ARRAYS ---
  const whyChooseData = [
    {
      id: 1,
      title: "Chemical-Free Farming",
      desc: "Our organic farming methods avoid harmful pesticides, synthetic chemicals, and fertilizers, keeping food pure.",
      icon: <FaDropletSlash />,
    },
    {
      id: 2,
      title: "Rich In Nutrition",
      desc: "Organic fruits and vegetables contain better nutrients, natural antioxidants, and essential vitamins for health.",
      icon: <FaHeartPulse />,
    },
    {
      id: 3,
      title: "Better Taste & Freshness",
      desc: "Naturally grown produce develops authentic flavor, freshness, and texture that processed methods cannot match.",
      icon: <FaAppleWhole />,
    },
    {
      id: 4,
      title: "Eco-Friendly Agriculture",
      desc: "Organic farming protects soil quality, saves water, reduces pollution, and supports a healthier environment.",
      icon: <FaEarthAmericas />,
    },
  ];

  const testimonials = [
    {
      id: 1,
      text: "The freshness and quality are amazing. You can truly taste the difference in organic products.",
      author: "Priya S.",
    },
    {
      id: 2,
      text: "Finally found a trusted organic brand for my family. Everything feels naturally fresh and healthy.",
      author: "Rahul M.",
    },
    {
      id: 3,
      text: "Excellent service and premium quality vegetables. Highly recommended for healthy living.",
      author: "Sneha K.",
    },
  ];

  return (
    <div className="about-page-wrapper">
      <style>{`
        /* Premium Font Imports */
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&display=swap');

        :root {
          /* Clean White Theme Colors */
          --color-white: #ffffff;
          --color-dark-green: #0a2612; 
          --color-brand-green: #407e18; 
          --color-light-green: #f8faf8; 
          --color-icon-bg: #eef5ee;
          --color-text-gray: #5a6b5a;
          --color-border: rgba(64, 126, 24, 0.08);
          
          --font-main: 'Outfit', sans-serif;
          --font-accent: 'Playfair Display', serif;
        }

        .about-page-wrapper {
          width: 100%;
          font-family: var(--font-main);
          background-color: var(--color-white);
          overflow-x: hidden; 
        }

        /* --- TYPOGRAPHY & UTILS --- */
        .section-padding { padding: 100px 24px; }
        .bg-light { background-color: var(--color-light-green); }
        .container { max-width: 1300px; margin: 0 auto; }
        
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
          font-size: clamp(2.5rem, 4vw, 3.5rem);
          font-weight: 800;
          color: var(--color-dark-green);
          line-height: 1.15;
          margin-bottom: 24px;
        }

        .section-title span {
          font-family: var(--font-accent);
          font-style: italic;
          font-weight: 600;
          color: var(--color-brand-green);
        }

        .section-desc {
          font-size: 1.15rem;
          color: var(--color-text-gray);
          line-height: 1.8;
          margin-bottom: 24px;
        }

        /* --- ABOUT US INTRO SECTION --- */
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .about-img-wrapper {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 48px rgba(10,38,18,0.12);
        }
        .about-img-wrapper img {
          width: 100%; height: auto; display: block; object-fit: cover;
          aspect-ratio: 4/5;
        }
        .about-badge {
          position: absolute; bottom: 30px; left: -30px;
          background: var(--color-white); padding: 24px 32px;
          border-radius: 16px; box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          display: flex; align-items: center; gap: 16px;
        }
        .about-badge h4 { color: var(--color-brand-green); font-size: 2.2rem; font-weight: 800; margin: 0; line-height: 1;}
        .about-badge p { color: var(--color-dark-green); font-size: 0.95rem; font-weight: 700; margin: 0; line-height: 1.3; text-transform: uppercase; letter-spacing: 1px;}

        /* --- VISION & MISSION CARDS (GRADIENT BACKGROUND) --- */
        .vm-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .vm-card {
          background: linear-gradient(145deg, #2a5a35 0%, #0a2612 100%);
          border-radius: 24px;
          padding: 60px 48px;
          color: var(--color-white);
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(10, 38, 18, 0.2);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .vm-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px rgba(10, 38, 18, 0.3);
        }
        .vm-icon {
          width: 72px; height: 72px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; color: var(--color-white);
          margin-bottom: 32px;
        }
        .vm-card h2 {
          font-size: 2.8rem;
          font-family: var(--font-accent);
          font-style: italic;
          margin-bottom: 24px;
          color: var(--color-white);
        }
        .vm-card p {
          font-size: 1.15rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 300;
        }

        /* --- WHY CHOOSE ORGANIC CARDS (PROFESSIONAL SQUARE LAYOUT) --- */
        .why-grid {
          display: grid;
          /* Uses auto-fit to naturally create balanced square cards */
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
          margin-top: 50px;
        }
        .why-card {
          background: var(--color-white);
          padding: 40px 32px;
          border-radius: 16px; /* Professional square-ish look */
          border: 1px solid var(--color-border);
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .why-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(10,38,18,0.08);
          border-color: rgba(64, 126, 24, 0.15);
        }
        .why-icon {
          width: 56px; height: 56px; 
          border-radius: 12px;
          background: var(--color-icon-bg); 
          color: var(--color-brand-green);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; margin-bottom: 24px;
          transition: transform 0.4s ease, background 0.4s ease;
        }
        .why-card:hover .why-icon { 
          transform: scale(1.1) rotate(-5deg); 
          background: var(--color-brand-green);
          color: var(--color-white);
        }
        .why-card h3 { 
          font-size: 1.4rem; 
          color: var(--color-dark-green); 
          margin-bottom: 16px; 
          font-weight: 700; 
          line-height: 1.3;
        }
        .why-card p { 
          color: var(--color-text-gray); 
          line-height: 1.6; 
          font-size: 1.05rem; 
          margin: 0;
        }

        /* --- HEALTH & AWARENESS CARDS --- */
        .health-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .health-card {
          background: var(--color-white);
          border: 1px solid var(--color-border);
          border-radius: 24px;
          padding: 60px 48px;
          box-shadow: 0 10px 30px rgba(10, 38, 18, 0.03);
        }
        .health-card.highlight {
          background: var(--color-light-green);
          border: none;
        }

        /* --- TESTIMONIAL CARDS --- */
        .testi-grid { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 30px; 
          margin-top: 50px; 
        }
        .testi-card {
          background: var(--color-white); 
          padding: 40px; 
          border-radius: 16px;
          border: 1px solid var(--color-border); 
          position: relative;
          box-shadow: 0 10px 30px rgba(10,38,18,0.03);
          transition: transform 0.3s ease;
        }
        .testi-card:hover { 
          transform: translateY(-8px); 
          box-shadow: 0 20px 40px rgba(10,38,18,0.08); 
        }
        .quote-icon { 
          color: var(--color-icon-bg); 
          font-size: 3rem; 
          position: absolute; 
          top: 24px; 
          right: 24px; 
          z-index: 1; 
        }
        .testi-text { 
          font-size: 1.1rem; 
          color: var(--color-text-gray); 
          line-height: 1.7; 
          font-style: italic; 
          margin-bottom: 24px; 
          position: relative; 
          z-index: 2; 
        }
        .testi-author { 
          font-weight: 700; 
          color: var(--color-dark-green); 
          font-size: 1.1rem; 
          display: flex; 
          align-items: center; 
          gap: 12px;
        }
        .testi-author::before { 
          content: ''; 
          width: 30px; 
          height: 2px; 
          background: var(--color-brand-green); 
          display: block; 
        }

        /* --- RESPONSIVE DESIGN --- */
        @media (max-width: 1024px) {
          .about-grid, .vm-grid, .health-grid { grid-template-columns: 1fr; gap: 50px; }
          .about-badge { left: 20px; bottom: -20px; }
          .testi-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .section-padding { padding: 70px 20px; }
          .section-title { font-size: 2.4rem; }
          .vm-card { padding: 40px 24px; }
          .vm-card h2 { font-size: 2.4rem; }
          .health-card { padding: 40px 24px; }
          .why-card { padding: 32px 24px; }
          .testi-card { padding: 32px 24px; }
        }
      `}</style>

      {/* ================= ABOUT US INTRO ================= */}
      <section className="section-padding">
        <div className="container">
          <div className="about-grid">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px" }}
              variants={fadeUp}
            >
              <span className="section-subtitle">About Nikamorganic</span>
              <h2 className="section-title">
                Dedicated to <span>Purity, Trust & Freshness</span>
              </h2>
              <p className="section-desc">
                <strong>NIKAMORGANIC (OPC) PRIVATE LIMITED</strong> is dedicated
                to bringing naturally grown organic fruits and vegetables to
                every household. Based in Maharashtra, our mission is to promote
                healthier lifestyles through clean, chemical-free farming
                practices.
              </p>
              <p className="section-desc">
                We work closely with nature to grow premium-quality produce that
                is fresh, nutritious, and safe for families. Our commitment to
                sustainable agriculture ensures that every harvest supports both
                human health and environmental well-being.
              </p>
              <p className="section-desc">
                From farm to table, we focus on purity, freshness, and trust —
                because your family deserves food that is naturally healthy.
              </p>
            </motion.div>

            <motion.div
              className="about-img-wrapper"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img
                src="/assets/img/nikamecom/veg.jpg"
                alt="Fresh Organic Vegetables"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= VISION & MISSION CARDS ================= */}
      <section className="section-padding" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="vm-grid">
            {/* Vision Card */}
            <motion.div
              className="vm-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px" }}
              variants={fadeUp}
            >
              <div className="vm-icon">
                <FaBinoculars />
              </div>
              <h2>Our Vision</h2>
              <p>
                We envision a healthier future where every family has access to
                safe, natural, and nutritious food. Our vision goes beyond just
                farming; it is a movement to encourage sustainable organic
                practices while creating widespread awareness about the profound
                impact of healthier, chemical-free eating habits on long-term
                human wellness.
              </p>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              className="vm-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px" }}
              variants={fadeUp}
              transition={{ delay: 0.1 }}
            >
              <div className="vm-icon">
                <FaHandsHoldingCircle />
              </div>
              <h2>Our Mission</h2>
              <p>
                To provide premium-quality organic fruits and vegetables through
                honest, transparent farming practices. We are on a mission to
                fiercely protect human health, empower and support local
                farmers, and preserve the delicate balance of mother nature for
                future generations to come.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE ORGANIC CARDS (SQUARE/PROFESSIONAL) ================= */}
      <section className="section-padding bg-light">
        <div className="container">
          <div
            style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}
          >
            <span className="section-subtitle">Our Promise</span>
            <h2 className="section-title">
              Why Organic Food <span>Is Better</span>
            </h2>
          </div>

          <div className="why-grid">
            {whyChooseData.map((item, index) => (
              <motion.div
                key={item.id}
                className="why-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "0px" }}
                variants={fadeUp}
                transition={{ delay: index * 0.1 }}
              >
                <div className="why-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HEALTH & AWARENESS CARDS ================= */}
      <section className="section-padding">
        <div className="container">
          <div className="health-grid">
            {/* Health Benefits Card */}
            <motion.div
              className="health-card highlight"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px" }}
              variants={fadeUp}
            >
              <span className="section-subtitle">Health Benefits</span>
              <h2 className="section-title" style={{ fontSize: "2.6rem" }}>
                Healthy Food For A <span>Healthier Life</span>
              </h2>
              <p className="section-desc">
                Modern farming chemicals and pesticide residues can negatively
                impact long-term health. Organic food helps reduce exposure to
                harmful substances often linked to serious health concerns.
              </p>
              <p className="section-desc" style={{ marginBottom: 0 }}>
                Choosing organic fruits and vegetables supports stronger
                immunity, better digestion, improved energy levels, and overall
                wellness. Clean eating is one of the most important steps toward
                a healthier future for you and your family.
              </p>
            </motion.div>

            {/* Awareness Card */}
            <motion.div
              className="health-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px" }}
              variants={fadeUp}
              transition={{ delay: 0.1 }}
            >
              <span className="section-subtitle">Awareness</span>
              <h2 className="section-title" style={{ fontSize: "2.6rem" }}>
                Protect Your Family From <span>Chemicals</span>
              </h2>
              <p className="section-desc">
                Many commercial farming practices use synthetic pesticides and
                chemical treatments that may leave harmful residues on food.
                Long-term exposure to these substances can affect human health
                and the environment.
              </p>
              <p className="section-desc" style={{ marginBottom: 0 }}>
                At NIKAMORGANIC, we focus on natural farming practices that
                prioritize safety, purity, and sustainability. Our goal is to
                provide food that families can trust every single day.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIAL CARDS ================= */}
      <section
        className="section-padding bg-light"
        style={{ paddingBottom: "120px" }}
      >
        <div className="container">
          <div style={{ textAlign: "center" }}>
            <span className="section-subtitle">Reviews</span>
            <h2 className="section-title">
              What Our <span>Customers Say</span>
            </h2>
          </div>

          <div className="testi-grid">
            {testimonials.map((testi, index) => (
              <motion.div
                key={testi.id}
                className="testi-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "0px" }}
                variants={fadeUp}
                transition={{ delay: index * 0.1 }}
              >
                <FaQuoteLeft className="quote-icon" />
                <p className="testi-text">"{testi.text}"</p>
                <div className="testi-author">{testi.author}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsFull;
