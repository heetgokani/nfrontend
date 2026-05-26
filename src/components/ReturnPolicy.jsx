import React from "react";
import { motion } from "framer-motion";
import {
  XCircle,
  Mail,
  Leaf,
  CheckCircle,
  Headphones,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  Ban,
} from "lucide-react";
import "../App.css";

const ReturnPolicy = () => {
  const sections = [
    {
      icon: <XCircle size={22} />,
      title: "Strict No-Return Policy",
      subtitle: "Perishable Safety",
      desc: "Due to the natural, organic, and consumable nature of our products, all sales are strictly final. To maintain pure, uncompromised hygiene and preservation layers for all clients, we do not accept product returns under any circumstances once goods leave our distribution center.",
    },
    {
      icon: <Ban size={22} />,
      title: "No Order Cancellations",
      subtitle: "Immediate Processing",
      desc: "Once an order is placed on our platform, it is immediately routed to our automated fulfillment sequence and cannot be canceled, amended, or recalled. Please double-check your cart contents carefully before finalizing payment.",
    },
    {
      icon: <RefreshCw size={22} />,
      title: "No Product Exchanges",
      subtitle: "Inventory Protocols",
      desc: "We do not accommodate exchange requests for different variants, weights, sizes, or alternate organic products after an order has been successfully confirmed and processed into our logistics pipeline.",
    },
  ];

  return (
    <div className="returns-wrapper">
      {/* Decorative organic vector glows */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>

      <div className="universal-container returns-main-layout">
        {/* Left Column: Left Sticky Branding Summary + Integrated Support Card */}
        <div className="brand-hero-panel">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="sticky-hero-content"
          >
            <div className="brand-tag">
              <Leaf size={14} className="leaf-icon" />
              <span>TRUSTED ORGANIC PLATFORM</span>
            </div>
            <h1 className="returns-main-title">
              Fulfillment <br />
              <span>& Refund Policy</span>
            </h1>
            <p className="returns-lead-text">
              At <strong>Nikam Organic</strong>, we enforce fully transparent
              handling policies to safeguard the organic purity and quality
              standards of our products for all consumers.
            </p>

            <div className="trust-factor-badges">
              <div className="badge-item">
                <HelpCircle size={16} />
                <span>Fixed Sales Terms</span>
              </div>
              <div className="badge-item">
                <CheckCircle size={16} />
                <span>100% Transparent</span>
              </div>
            </div>

            {/* Sticky Support Card Section directly below brand profile */}
            <div className="premium-support-card">
              <div className="support-icon-box">
                <Headphones size={26} />
              </div>
              <h3 className="support-card-title">Need Urgent Help?</h3>
              <p className="support-card-desc">
                If your payment failed, you received a broken seal box, or have
                questions about a recent delivery drop, get in touch with our
                helpdesk right away.
              </p>
              <a
                href="mailto:nikamorganic712@gmail.com"
                className="support-action-btn"
              >
                <Mail size={16} />
                <span>Contact Support</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Interactive Card Matrix */}
        <div className="returns-interactive-flow">
          <div className="matrix-stack">
            {sections.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="premium-returns-card"
              >
                <div className="card-header-line">
                  <div className="icon-wrapper-box">{item.icon}</div>
                  <div className="title-group-header">
                    <span className="card-subtitle">{item.subtitle}</span>
                    <h3 className="card-title-text">{item.title}</h3>
                  </div>
                </div>
                <p className="card-description-paragraph">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .returns-wrapper {
          background-color: var(--bg-off-white);
          font-family: var(--font-sans);
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          color: var(--text-main);
          padding: 80px 0;
        }

        /* Ambient subtle gradients behind content to elevate UI aesthetics */
        .ambient-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.4;
          z-index: 1;
          pointer-events: none;
        }
        .glow-1 {
          background: var(--green-light);
          top: -10%;
          left: -10%;
        }
        .glow-2 {
          background: rgba(64, 126, 24, 0.08);
          bottom: 10%;
          right: -5%;
        }

        .returns-main-layout {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 80px;
          align-items: start;
        }

        /* Sticky Left Brand Panel Style */
        .brand-hero-panel {
          position: sticky;
          top: 40px;
        }
        .brand-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--green-light);
          color: var(--green-dark);
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 25px;
        }
        .brand-tag .leaf-icon {
          color: var(--green-medium);
        }
        .returns-main-title {
          font-family: var(--font-serif);
          font-size: 52px;
          line-height: 1.15;
          color: var(--green-darkest);
          margin: 0 0 20px 0;
          font-weight: 700;
        }
        .returns-main-title span {
          color: var(--green-medium);
        }
        .returns-lead-text {
          font-size: 16px;
          line-height: 1.7;
          color: var(--text-muted);
          margin: 0 0 35px 0;
        }
        .trust-factor-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 40px;
        }
        .badge-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-white);
          border: 1px solid rgba(64, 126, 24, 0.15);
          padding: 10px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-gray);
        }
        .badge-item svg {
          color: var(--green-medium);
        }

        /* Left Side Contact Card Integration Styling */
        .premium-support-card {
          background: var(--bg-white);
          border: 1px solid rgba(64, 126, 24, 0.12);
          border-radius: 24px;
          padding: 35px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(64, 126, 24, 0.02);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .support-icon-box {
          width: 54px;
          height: 54px;
          background: var(--green-light);
          color: var(--green-dark);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }
        .support-card-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--green-darkest);
          margin: 0 0 10px 0;
        }
        .support-card-desc {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-muted);
          margin: 0 0 25px 0;
        }
        .support-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--green-medium);
          color: white;
          padding: 12px 30px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 6px 20px rgba(64, 126, 24, 0.15);
          width: 100%;
          box-sizing: border-box;
        }
        .support-action-btn:hover {
          background: var(--green-dark);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(64, 126, 24, 0.25);
        }

        /* Right Structural Matrix Stacks */
        .returns-interactive-flow {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        .matrix-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .premium-returns-card {
          background: var(--bg-white);
          border: 1px solid rgba(11, 43, 22, 0.04);
          border-radius: 20px;
          padding: 35px;
          box-shadow: 0 10px 30px rgba(26, 32, 26, 0.015);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .premium-returns-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(11, 43, 22, 0.03);
          border-color: rgba(64, 126, 24, 0.2);
        }
        .card-header-line {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 18px;
        }
        .icon-wrapper-box {
          width: 50px;
          height: 50px;
          background: var(--bg-off-white);
          color: var(--green-dark);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--green-light);
          transition: all 0.3s ease;
        }
        .premium-returns-card:hover .icon-wrapper-box {
          background: var(--green-medium);
          color: var(--bg-white);
          border-color: var(--green-medium);
        }
        .title-group-header {
          display: flex;
          flex-direction: column;
        }
        .card-subtitle {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          font-weight: 600;
          margin-bottom: 2px;
        }
        .card-title-text {
          font-size: 20px;
          font-weight: 600;
          color: var(--green-darkest);
          margin: 0;
        }
        .card-description-paragraph {
          font-size: 15px;
          line-height: 1.65;
          color: var(--text-muted);
          margin: 0;
        }

        /* Fully Fluid Adaptive Responsive Framework Breakpoints */
        @media (max-width: 1100px) {
          .returns-main-layout {
            grid-template-columns: 1fr;
            gap: 50px;
          }
          .brand-hero-panel {
            position: static;
          }
          .returns-main-title {
            font-size: 42px;
          }
          .trust-factor-badges {
            margin-bottom: 30px;
          }
        }

        @media (max-width: 650px) {
          .returns-wrapper {
            padding: 40px 0;
          }
          .premium-returns-card, .premium-support-card {
            padding: 25px;
          }
          .card-header-line {
            gap: 15px;
          }
          .returns-main-title {
            font-size: 36px;
          }
        }
      `}</style>
    </div>
  );
};

export default ReturnPolicy;
