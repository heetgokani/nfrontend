import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiPlus, FiMinus, FiHelpCircle } from "react-icons/fi";
import axios from "axios";

const FaqSection = () => {
  const brandRed = "#de433f";
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH DYNAMIC DATA
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/faq/all");
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
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      {/* FIXED BREADCRUMB */}
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
            <li style={{ color: "#777", fontWeight: "600" }}>FAQ</li>
          </ul>
        </div>
      </div>

      <main className="container pb-5">
        <div className="text-center mb-5 mt-4">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "rgba(222, 67, 63, 0.1)",
              color: brandRed,
              padding: "8px 20px",
              borderRadius: "50px",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "1px",
              marginBottom: "15px",
            }}
          >
            <FiHelpCircle className="me-2" /> HAVE QUESTIONS?
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: "800",
              color: "#000",
            }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            {loading ? (
              <div className="text-center p-5">Loading Questions...</div>
            ) : (
              <div className="accordion" id="sneakerFaqAccordion">
                {faqs.map((item, index) => (
                  <div className="col-md-12 mb-3" key={item._id}>
                    <div className="faq-card-custom">
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
                        data-bs-parent="#sneakerFaqAccordion"
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
          <NavLink to="/contact" className="btn-contact-now">
            Contact Support
          </NavLink>
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .faq-card-custom { background: #fff; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden; transition: 0.3s ease; }
        .faq-card-custom:hover { border-color: ${brandRed}; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
        .faq-btn-trigger { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 22px 30px; background: none; border: none; text-align: left; cursor: pointer; outline: none; }
        .faq-question { font-size: 17px; font-weight: 700; color: #111; transition: 0.3s; }
        .faq-btn-trigger:not(.collapsed) .faq-question { color: ${brandRed}; }
        .faq-icon-wrapper { position: relative; width: 20px; height: 20px; color: ${brandRed}; }
        .icon-minus { display: none; }
        .faq-btn-trigger:not(.collapsed) .icon-plus { display: none; }
        .faq-btn-trigger:not(.collapsed) .icon-minus { display: block; }
        .faq-answer-content { padding: 0 30px 25px 30px; color: #666; font-size: 15px; line-height: 1.6; }
        .btn-contact-now { background: #111; color: #fff; padding: 14px 40px; border-radius: 50px; text-decoration: none; font-weight: 700; transition: 0.3s; display: inline-block; }
        .btn-contact-now:hover { background: ${brandRed}; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(222, 67, 63, 0.2); }
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
