import React, { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiSend } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const ContactSection = () => {
  const organicGreen = "#407e18";
  const deepForest = "#0b2b16";
  const lightBg = "#f2f8f2";
  const borderGreen = "#dceddc";
  const textMuted = "#4a5c4a";

  const [formData, setFormData] = useState({
    fullName: "", // Changed to match schema
    email: "",
    subject: "",
    phone: "", // Added phone
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Sending data that matches backend schema
      await axios.post("http://localhost:5000/api/contact/submit", formData);
      toast.success("Message sent! We'll be in touch.");
      setFormData({
        fullName: "",
        email: "",
        subject: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      toast.error("Failed to send. Ensure all fields are filled.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section style={{ backgroundColor: lightBg, padding: "80px 0" }}>
      <ToastContainer />
      <div className="container">
        <div className="text-center mb-5">
          <h2
            style={{ color: deepForest, fontWeight: "800", fontSize: "40px" }}
          >
            Get In Touch
          </h2>
          <p style={{ color: textMuted, marginTop: "10px" }}>
            We'd love to hear from you. Reach out via email, phone, or visit us.
          </p>
        </div>

        <div className="row g-4 justify-content-center">
          <div className="col-lg-4">
            <div className="contact-info-organic">
              <h3>Contact Details</h3>
              <div className="info-block">
                <div className="icon-circle">
                  <FiMail />
                </div>
                <div>
                  <h4>Email</h4>
                  <p>nikamorganic712@gmail.com</p>
                </div>
              </div>
              <div className="info-block">
                <div className="icon-circle">
                  <FiPhone />
                </div>
                <div>
                  <h4>Phone</h4>
                  <p> +91 8855932532</p>
                </div>
              </div>
              <div className="info-block">
                <div className="icon-circle">
                  <FiMapPin />
                </div>
                <div>
                  <h4>Address</h4>
                  <p>Dhule - 424002, Maharashtra</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="form-card-organic">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="organic-label">Full Name</label>
                    <input
                      className="organic-input"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="organic-label">Phone</label>
                    <input
                      className="organic-input"
                      type="tel"
                      placeholder="+91 00000 00000"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="organic-label">Email</label>
                    <input
                      className="organic-input"
                      type="email"
                      placeholder="john@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="organic-label">Subject</label>
                    <input
                      className="organic-input"
                      type="text"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="organic-label">Message</label>
                    <textarea
                      className="organic-input"
                      rows="4"
                      placeholder="Your message..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      required
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn-submit-organic"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}{" "}
                      <FiSend style={{ marginLeft: "8px" }} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .contact-info-organic { background: #fff; border: 1px solid ${borderGreen}; border-radius: 20px; padding: 30px; }
        .info-block { display: flex; align-items: center; gap: 15px; padding: 15px 0; border-bottom: 1px solid #f0f4f0; }
        .icon-circle { width: 45px; height: 45px; border-radius: 12px; background: rgba(64,126,24,0.08); color: ${organicGreen}; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .organic-label { font-size: 12px; font-weight: 800; color: ${deepForest}; margin-bottom: 5px; text-transform: uppercase; }
        .organic-input { width: 100%; padding: 12px 15px; border: 1px solid ${borderGreen}; border-radius: 10px; background: ${lightBg}; outline: none; }
        .btn-submit-organic { background: ${organicGreen}; color: #fff; border: none; padding: 14px 30px; border-radius: 50px; font-weight: 600; width: 100%; cursor: pointer; }
      `,
        }}
      />
    </section>
  );
};

export default ContactSection;
