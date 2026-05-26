import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiPlus, FiMinus, FiFeather } from "react-icons/fi";
import axios from "axios";

const FaqSection = () => {
  // Organic Theme Palette
  const organicGreen = "#407e18";
  const deepForest = "#0b2b16";
  const lightBg = "#f2f8f2";
  const borderGreen = "#dceddc";
  const textMuted = "#4a5c4a";

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH DYNAMIC DATA
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await axios.get(
          "https://nikam-ecom-backend.onrender.com/api/faq/all"
        );
        // Filter to only show active FAQs and sort by order
        const activeFaqs = res.data
          .filter((item) => item.isActive)
          .sort((a, b) => a.order - b.order);
        setFaqs(activeFaqs);
      } catch (err) {
        console.error("Error fetching FAQs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  return (
    <div
      style={{
        backgroundColor: lightBg,
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* DECORATIVE BACKGROUND LEAVES */}
      <svg
        width="250"
        height="250"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          position: "absolute",
          top: "-50px",
          left: "-50px",
          opacity: "0.03",
          transform: "rotate(45deg)",
          color: deepForest,
        }}
      >
        <path
          d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path d="M12 22V2" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg
        width="350"
        height="350"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          position: "absolute",
          bottom: "-100px",
          right: "-100px",
          opacity: "0.03",
          transform: "rotate(-30deg)",
          color: organicGreen,
        }}
      >
        <path
          d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path d="M12 22V2" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* FIXED BREADCRUMB */}
      <div
        className="breadcrumb"
        style={{
          padding: "15px 0",
          background: "transparent",
          borderBottom: `1px solid ${borderGreen}`,
          position: "relative",
          zIndex: 10,
        }}
      >
        <div className="container">
          <ul
            className="list-unstyled d-flex align-items-center m-0"
            style={{ fontSize: "14px" }}
          >
            <li>
              <NavLink
                to="/"
                style={{ color: textMuted, textDecoration: "none" }}
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
                style={{ margin: "0 10px", opacity: 0.4 }}
              >
                <path
                  d="M25.9375 8.5625L23.0625 11.4375L43.625 32L23.0625 52.5625L25.9375 55.4375L47.9375 33.4375L49.3125 32L47.9375 30.5625L25.9375 8.5625Z"
                  fill={deepForest}
                />
              </svg>
            </li>
            <li style={{ color: deepForest, fontWeight: "600" }}>FAQ</li>
          </ul>
        </div>
      </div>

      <main
        className="container pb-5"
        style={{ position: "relative", zIndex: 10 }}
      >
        <div className="text-center mb-5 mt-5">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "rgba(64, 126, 24, 0.1)",
              color: organicGreen,
              padding: "8px 20px",
              borderRadius: "50px",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "1px",
              marginBottom: "15px",
            }}
          >
            <FiFeather className="me-2" /> NATURALLY CURIOUS?
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: "800",
              color: deepForest,
              fontFamily: "'Poppins', sans-serif", // Changed to Poppins!
            }}
          >
            Frequently Asked Questions
          </h2>
          <p
            style={{ color: textMuted, maxWidth: "500px", margin: "10px auto" }}
          >
            Everything you need to know about our products and processes.
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-9">
            {loading ? (
              <div className="text-center p-5" style={{ color: organicGreen }}>
                Cultivating Answers...
              </div>
            ) : (
              <div className="accordion" id="organicFaqAccordion">
                {faqs.map((item, index) => (
                  <div className="col-md-12 mb-4" key={item._id}>
                    <div className="faq-card-organic">
                      <button
                        className="faq-btn-trigger collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target={`#faq-${item._id}`}
                        aria-expanded="false"
                        aria-controls={`faq-${item._id}`}
                      >
                        <span className="faq-question">{item.question}</span>
                        <span className="faq-icon-wrapper">
                          <FiPlus className="icon-plus" />
                          <FiMinus className="icon-minus" />
                        </span>
                      </button>
                      <div
                        id={`faq-${item._id}`}
                        className="collapse accordion-collapse"
                        data-bs-parent="#organicFaqAccordion"
                      >
                        <div className="faq-answer-content">{item.answer}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-5">
          <NavLink to="/contact" className="btn-contact-organic">
            Contact Support
          </NavLink>
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .faq-card-organic { 
          background: #ffffff; 
          border: 1px solid ${borderGreen}; 
          border-radius: 16px; 
          overflow: hidden; 
          transition: all 0.4s ease; 
        }
        .faq-card-organic:hover { 
          border-color: ${organicGreen}; 
          box-shadow: 0 12px 35px rgba(64, 126, 24, 0.08); 
          transform: translateY(-2px);
        }
        .faq-btn-trigger { 
          width: 100%; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          padding: 24px 30px; 
          background: transparent; 
          border: none; 
          text-align: left; 
          cursor: pointer; 
          outline: none; 
          font-family: 'Poppins', sans-serif;
        }
        .faq-question { 
          font-size: 17px; 
          font-weight: 600; 
          color: ${deepForest}; 
          transition: 0.3s; 
          padding-right: 20px;
        }
        /* When Accordion is Open */
        .faq-btn-trigger:not(.collapsed) {
          background: rgba(64, 126, 24, 0.03);
        }
        .faq-btn-trigger:not(.collapsed) .faq-question { 
          color: ${organicGreen}; 
        }
        .faq-icon-wrapper { 
          position: relative; 
          width: 20px; 
          height: 20px; 
          color: ${textMuted}; 
          transition: 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .faq-btn-trigger:not(.collapsed) .faq-icon-wrapper {
          color: ${organicGreen};
        }
        .icon-minus { display: none; font-size: 20px; }
        .icon-plus { font-size: 20px; }
        .faq-btn-trigger:not(.collapsed) .icon-plus { display: none; }
        .faq-btn-trigger:not(.collapsed) .icon-minus { display: block; }
        
        .faq-answer-content { 
          padding: 0 30px 25px 30px; 
          color: ${textMuted}; 
          font-size: 15px; 
          line-height: 1.7; 
          background: rgba(64, 126, 24, 0.03);
          font-family: 'Poppins', sans-serif;
        }
        
        .btn-contact-organic { 
          background: ${organicGreen}; 
          color: #fff; 
          padding: 16px 45px; 
          border-radius: 50px; 
          text-decoration: none; 
          font-weight: 500; 
          letter-spacing: 0.5px;
          transition: all 0.3s ease; 
          display: inline-block; 
          font-family: 'Poppins', sans-serif;
        }
        .btn-contact-organic:hover { 
          background: ${deepForest}; 
          transform: translateY(-3px); 
          box-shadow: 0 10px 20px rgba(11, 43, 22, 0.15); 
          color: #fff;
        }

        @media (max-width: 768px) {
          .faq-btn-trigger { padding: 18px 20px; }
          .faq-answer-content { padding: 0 20px 20px 20px; }
          .faq-question { font-size: 15px; }
        }
      `,
        }}
      />
    </div>
  );
};

export default FaqSection;
