import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiMail, FiMapPin, FiPhone, FiSend } from "react-icons/fi";
import axios from "axios";
// Import Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ContactSection = () => {
  const brandRed = "#de433f";

  // State for form fields
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/contact/submit",
        formData,
      );

      // Success Toast
      toast.success(response.data.message || "Message sent successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        style: { backgroundColor: brandRed },
      });

      setFormData({
        fullName: "",
        email: "",
        subject: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      // Error Toast
      toast.error("Failed to send message. Please try again later.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const contactData = [
    {
      icon: <FiMail size={28} />,
      title: "Mail Address",
      info1: "info@example.com",
      info2: "info2@example.com",
    },
    {
      icon: <FiMapPin size={28} />,
      title: "Office Location",
      info1: "2715 Ash Dr. San Jose,",
      info2: "South Dakota 83475",
    },
    {
      icon: <FiPhone size={28} />,
      title: "Phone Number",
      info1: "(201) 555-0124",
      info2: "(307) 555-0133",
    },
  ];

  return (
    <div style={{ backgroundColor: "#ffffff" }}>
      {/* Toast Notification Container */}
      <ToastContainer />

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
            <li style={{ color: "#777" }}>Contact US</li>
          </ul>
        </div>
      </div>

      <main className="container mt-4 mb-5 pt-2">
        <div className="row g-4 mb-5">
          {contactData.map((item, idx) => (
            <div className="col-lg-4" key={idx}>
              <div className="contact-card-custom">
                <div className="icon-box" style={{ color: brandRed }}>
                  {item.icon}
                </div>
                <h4
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    marginBottom: "15px",
                  }}
                >
                  {item.title}
                </h4>
                <p className="m-0 text-muted">{item.info1}</p>
                <p className="m-0 text-muted">{item.info2}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="form-wrapper-custom">
              <div className="text-center mb-5">
                <span
                  style={{
                    color: brandRed,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    fontSize: "12px",
                  }}
                >
                  Get In Touch
                </span>
                <h2
                  style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    marginTop: "10px",
                  }}
                >
                  Connect With The Crew
                </h2>
                <div
                  style={{
                    width: "60px",
                    height: "3px",
                    background: brandRed,
                    margin: "15px auto",
                  }}
                ></div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="input-custom"
                      placeholder="Full Name"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-custom"
                      placeholder="Email Address"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="input-custom"
                      placeholder="Subject"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-custom"
                      placeholder="Phone Number"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="input-custom"
                      rows="5"
                      placeholder="Your Message"
                      required
                    ></textarea>
                  </div>
                  <div className="col-12 text-center">
                    <button
                      type="submit"
                      className="btn-submit-custom"
                      disabled={loading}
                    >
                      <FiSend className="me-2" />{" "}
                      {loading ? "SENDING..." : "SEND MESSAGE"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .contact-card-custom { background: #fff; padding: 40px 20px; border-radius: 15px; text-align: center; transition: all 0.3s ease; border: 1px solid #eee; }
        .contact-card-custom:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(222, 67, 63, 0.05); border-color: ${brandRed}; }
        .icon-box { width: 70px; height: 70px; background: rgba(222, 67, 63, 0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; transition: 0.3s; }
        .contact-card-custom:hover .icon-box { background: ${brandRed}; color: #fff !important; }
        .form-wrapper-custom { background: #fff; padding: 60px; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; }
        .input-custom { width: 100%; padding: 15px 20px; border: 1px solid #e1e1e1; border-radius: 8px; background: #fcfcfc; transition: 0.3s; outline: none; }
        .input-custom:focus { border-color: ${brandRed}; background: #fff; box-shadow: 0 5px 15px rgba(222, 67, 63, 0.05); }
        .btn-submit-custom { background: ${brandRed}; color: white; padding: 16px 45px; border: none; border-radius: 50px; font-weight: 700; letter-spacing: 1px; transition: 0.3s; margin-top: 20px; cursor: pointer; }
        .btn-submit-custom:hover { background: #c53a36; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .btn-submit-custom:disabled { background: #ccc; cursor: not-allowed; }
        @media (max-width: 768px) { .form-wrapper-custom { padding: 30px 20px; } }
      `,
        }}
      />
    </div>
  );
};

export default ContactSection;
