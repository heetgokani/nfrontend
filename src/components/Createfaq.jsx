import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,
  FaTimes,
  FaQuestionCircle,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";

const Createfaq = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    const res = await axios.get("http://localhost:5000/api/faq/all");
    setFaqs(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/faq/update/${editingId}`,
          formData,
        );
        toast.success("FAQ Updated");
      } else {
        await axios.post("http://localhost:5000/api/faq/add", formData);
        toast.success("FAQ Created");
      }
      setFormData({ question: "", answer: "", order: 0, isActive: true });
      setEditingId(null);
      fetchFaqs();
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faq) => {
    setEditingId(faq._id);
    setFormData(faq);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    await axios.delete(`http://localhost:5000/api/faq/delete/${id}`);
    toast.success("Deleted");
    fetchFaqs();
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <style>{`
        .faq-form-card { background: #fff; border-radius: 15px; padding: 25px; border: 1px solid var(--mern-admin-border); margin-bottom: 30px; }
        .faq-input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 15px; outline: none; }
        .faq-input:focus { border-color: var(--mern-admin-primary); }
        .status-toggle { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; cursor: pointer; font-weight: 600; }
        .pro-btn { padding: 12px 25px; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .pro-btn-primary { background: var(--mern-admin-primary); color: #fff; }
        
        @media (max-width: 768px) {
          .faq-table thead { display: none; }
          .faq-table tr { display: block; border: 1px solid #eee; margin-bottom: 15px; border-radius: 10px; padding: 15px; }
          .faq-table td { display: block; text-align: right; padding: 5px 0; border: none; }
          .faq-table td::before { content: attr(data-label); float: left; font-weight: 700; color: #888; }
        }
      `}</style>

      <div className="faq-form-card">
        <h3
          style={{
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaQuestionCircle color="var(--mern-admin-primary)" />{" "}
          {editingId ? "Edit FAQ" : "Add New FAQ"}
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            className="faq-input"
            placeholder="Enter Question"
            value={formData.question}
            onChange={(e) =>
              setFormData({ ...formData, question: e.target.value })
            }
            required
          />
          <textarea
            className="faq-input"
            rows="3"
            placeholder="Enter Answer"
            value={formData.answer}
            onChange={(e) =>
              setFormData({ ...formData, answer: e.target.value })
            }
            required
          />

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "#666" }}>
                Display Order
              </label>
              <input
                type="number"
                className="faq-input"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: e.target.value })
                }
              />
            </div>
            <div
              className="status-toggle"
              onClick={() =>
                setFormData({ ...formData, isActive: !formData.isActive })
              }
            >
              {formData.isActive ? (
                <FaCheckCircle color="green" />
              ) : (
                <FaTimesCircle color="red" />
              )}
              {formData.isActive ? "Active on Website" : "Hidden from Website"}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              className="pro-btn pro-btn-primary"
              disabled={loading}
            >
              <FaSave /> {loading ? "Saving..." : "Save FAQ"}
            </button>
            {editingId && (
              <button
                type="button"
                className="pro-btn"
                style={{ background: "#eee" }}
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    question: "",
                    answer: "",
                    order: 0,
                    isActive: true,
                  });
                }}
              >
                <FaTimes /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="faq-form-card">
        <table
          className="faq-table"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ textAlign: "left", background: "#f8f9fa" }}>
              <th style={{ padding: "12px" }}>Order</th>
              <th>Question</th>
              <th>Status</th>
              <th style={{ textAlign: "right", paddingRight: "12px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px" }} data-label="Order">
                  #{faq.order}
                </td>
                <td data-label="Question" style={{ fontWeight: 600 }}>
                  {faq.question}
                </td>
                <td data-label="Status">
                  <span
                    style={{
                      color: faq.isActive ? "green" : "red",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {faq.isActive ? "ACTIVE" : "HIDDEN"}
                  </span>
                </td>
                <td
                  style={{ textAlign: "right", padding: "12px" }}
                  data-label="Actions"
                >
                  <button
                    onClick={() => handleEdit(faq)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "blue",
                      cursor: "pointer",
                      marginRight: "10px",
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(faq._id)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "red",
                      cursor: "pointer",
                    }}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Createfaq;
