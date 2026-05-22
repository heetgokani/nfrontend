import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  FaDownload,
  FaUpload,
  FaEdit,
  FaSearch,
  FaImage,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateStock = ({ onEditProduct }) => {
  const { auth } = useAuth();
  const permissions = auth?.user?.role?.permissions?.stock;

  const canEdit = permissions?.edit;
  const canAdd = permissions?.add;

  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStock, setShowLowStock] = useState(false); // NEW STATE

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://demo-backend-k0yn.onrender.com/api/stock/all"
      );
      setStockData(res.data);
    } catch (err) {
      toast.error("Error fetching stock data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleExport = async () => {
    try {
      const response = await axios({
        url: "https://demo-backend-k0yn.onrender.com/api/stock/export",
        method: "GET",
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Stock_Report.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      toast.error("Export failed");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await axios.post(
        "https://demo-backend-k0yn.onrender.com/api/stock/import",
        formData
      );
      toast.success("Stock updated from Excel!");
      fetchStock();
    } catch (err) {
      toast.error("Import failed");
    } finally {
      setUploading(false);
      e.target.value = null; // Reset input
    }
  };

  // FILTER LOGIC INCLUDES LOW STOCK
  const filteredStock = stockData.filter((item) => {
    const search = searchTerm.toLowerCase();
    const prodName = (item.productId?.title || "").toLowerCase();
    const sku = (item.sku || "").toLowerCase();
    const matchesSearch = prodName.includes(search) || sku.includes(search);
    const matchesLowStock = showLowStock ? Number(item.stock) < 3 : true;
    return matchesSearch && matchesLowStock;
  });

  const s = {
    wrapper: {
      maxWidth: "1200px",
      margin: "0 auto",
      fontFamily: "'Inter', sans-serif",
      color: "var(--mern-admin-text-main)",
    },
    card: {
      background: "white",
      borderRadius: "12px",
      border: "1px solid var(--mern-admin-border)",
      padding: "25px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
    },
    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "15px",
      marginBottom: "25px",
    },
    title: {
      fontSize: "22px",
      fontWeight: "800",
      color: "var(--mern-admin-text-main)",
      margin: 0,
    },
    actionsContainer: { display: "flex", gap: "12px", alignItems: "center" },
    searchBox: { position: "relative", width: "250px" },
    searchInput: {
      width: "100%",
      padding: "10px 10px 10px 35px",
      borderRadius: "8px",
      border: "1px solid var(--mern-admin-border)",
      outline: "none",
      background: "#f8fafc",
      fontSize: "14px",
      boxSizing: "border-box",
    },
    searchIcon: {
      position: "absolute",
      top: "12px",
      left: "12px",
      color: "#94a3b8",
    },
    exportBtn: {
      background: "white",
      color: "var(--mern-admin-text-main)",
      padding: "10px 16px",
      borderRadius: "8px",
      border: "1px solid var(--mern-admin-border)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontWeight: "600",
      fontSize: "14px",
    },
    importBtn: {
      background: "var(--mern-admin-primary)",
      color: "white",
      padding: "10px 16px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontWeight: "600",
      fontSize: "14px",
    },
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
    th: {
      padding: "15px 10px",
      borderBottom: "1px solid var(--mern-admin-border)",
      color: "#64748b",
      fontWeight: "700",
      fontSize: "13px",
      textTransform: "uppercase",
    },
    td: {
      padding: "15px 10px",
      borderBottom: "1px solid var(--mern-admin-border)",
      verticalAlign: "middle",
      fontSize: "14px",
      color: "var(--mern-admin-text-main)",
    },
    imageBox: {
      width: "45px",
      height: "45px",
      borderRadius: "8px",
      objectFit: "cover",
      border: "1px solid var(--mern-admin-border)",
      background: "#f8fafc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0, // Prevents the image from squishing into an oval
    },
    productName: {
      color: "var(--mern-admin-primary)",
      fontWeight: "700",
      fontSize: "15px",
      wordBreak: "break-word",
    },
    badgeSafe: {
      background: "#dcfce7",
      color: "#166534",
      padding: "5px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "700",
      display: "inline-block",
      whiteSpace: "nowrap",
    },
    badgeDanger: {
      background: "#fee2e2",
      color: "#991b1b",
      padding: "5px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "700",
      display: "inline-block",
      whiteSpace: "nowrap",
    },
    editBtn: {
      color: "#3b82f6",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontWeight: "700",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "5px",
    },
  };

  return (
    <>
      <style>
        {`
          /* Force standard box model to prevent horizontal bleed */
          .responsive-wrapper * {
            box-sizing: border-box !important;
          }

          @media (max-width: 768px) {
            .responsive-wrapper { 
              padding: 10px !important; 
              overflow-x: hidden; 
            }
            .responsive-card { padding: 15px !important; }
            
            /* Stack header elements securely */
            .responsive-header-row {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 15px !important;
            }
            
            /* Make actions and search take full width to prevent squishing */
            .responsive-actions {
              flex-direction: column !important;
              width: 100% !important;
              align-items: stretch !important;
              gap: 12px !important;
            }
            .responsive-search { width: 100% !important; }
            
            /* Ensure buttons don't shrink and wrap their text */
            .responsive-btn { 
              width: 100% !important; 
              justify-content: center !important; 
              white-space: nowrap !important;
              flex-shrink: 0 !important;
            }
            
            /* Convert Table to Cards */
            .responsive-table, .responsive-table tbody, .responsive-table tr, .responsive-table td {
              display: block !important;
              width: 100% !important;
            }
            .responsive-table thead { display: none !important; }
            .responsive-table tr {
              margin-bottom: 15px !important;
              border: 1px solid #e2e8f0 !important;
              border-radius: 8px !important;
              padding: 12px !important;
              background: #fff !important;
            }
            .responsive-table td {
              border: none !important;
              padding: 10px 0 !important;
              display: flex !important;
              align-items: flex-start !important; /* Top align for long multi-line text */
              justify-content: space-between !important;
              text-align: right !important;
              border-bottom: 1px solid #f1f5f9 !important;
              gap: 15px !important; /* Ensure space between label and text */
            }
            .responsive-table td:last-child {
              border-bottom: none !important;
            }

            /* Safely wrap long strings (like Product Names or SKUs) without pushing out */
            .responsive-table td > span, 
            .responsive-table td > div, 
            .responsive-table td > button {
              max-width: 65% !important;
              word-wrap: break-word !important;
              justify-content: flex-end !important;
            }
            
            /* Re-insert column names via CSS */
            .responsive-table td::before {
              content: attr(data-label);
              font-weight: 700 !important;
              color: #64748b !important;
              text-transform: uppercase !important;
              font-size: 11px !important;
              flex-shrink: 0;
              margin-top: 2px; /* Aligns visually with the text on the right */
            }
          }
        `}
      </style>

      <div style={s.wrapper} className="responsive-wrapper">
        <ToastContainer position="top-right" />

        <div style={s.card} className="responsive-card">
          <div style={s.headerRow} className="responsive-header-row">
            <h2 style={s.title}>Inventory Management</h2>
            <div style={s.actionsContainer} className="responsive-actions">
              {/* LOW STOCK CHECKBOX */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--mern-admin-text-main)",
                }}
              >
                <input
                  type="checkbox"
                  checked={showLowStock}
                  onChange={(e) => setShowLowStock(e.target.checked)}
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "var(--mern-admin-primary)",
                    flexShrink: 0,
                  }}
                />
                Low Stock Only
              </label>

              <div style={s.searchBox} className="responsive-search">
                <FaSearch style={s.searchIcon} />
                <input
                  style={s.searchInput}
                  placeholder="Search variations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={handleExport}
                style={s.exportBtn}
                className="responsive-btn"
                title="Download Excel"
              >
                <FaDownload /> Export
              </button>
              {canAdd && (
                <label
                  style={s.importBtn}
                  className="responsive-btn"
                  title="Upload Excel to update stock"
                >
                  <FaUpload /> {uploading ? "Updating..." : "Import"}
                  <input
                    type="file"
                    hidden
                    accept=".xlsx, .xls"
                    onChange={handleImport}
                  />
                </label>
              )}
            </div>
          </div>

          {loading ? (
            <p
              style={{ textAlign: "center", padding: "40px", color: "#64748b" }}
            >
              Loading inventory...
            </p>
          ) : filteredStock.length === 0 ? (
            <p
              style={{ textAlign: "center", padding: "40px", color: "#64748b" }}
            >
              No variations found.
            </p>
          ) : (
            <div style={{ overflowX: "auto", width: "100%" }}>
              <table style={s.table} className="responsive-table">
                <thead>
                  <tr>
                    <th style={s.th}>Image</th>
                    <th style={s.th}>Product</th>
                    <th style={s.th}>SKU</th>
                    <th style={s.th}>Stock Status</th>
                    {canEdit && <th style={s.th}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredStock.map((item) => {
                    const imgUrl =
                      item.images && item.images[0]
                        ? `https://demo-backend-k0yn.onrender.com${item.images[0]}`
                        : item.productId?.thumbnail
                        ? `https://demo-backend-k0yn.onrender.com${item.productId.thumbnail}`
                        : null;

                    return (
                      <tr key={item._id}>
                        <td style={s.td} data-label="Image">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt="product"
                              style={s.imageBox}
                            />
                          ) : (
                            <div style={s.imageBox}>
                              <FaImage color="#cbd5e1" size={20} />
                            </div>
                          )}
                        </td>
                        <td style={s.td} data-label="Product">
                          <span style={s.productName}>
                            {item.productId?.title || "Unknown Product"}
                          </span>
                        </td>
                        <td style={s.td} data-label="SKU">
                          <span>{item.sku || "N/A"}</span>
                        </td>
                        <td style={s.td} data-label="Stock Status">
                          <span
                            style={
                              Number(item.stock) < 3
                                ? s.badgeDanger
                                : s.badgeSafe
                            }
                          >
                            {item.stock} in stock
                          </span>
                        </td>
                        {canEdit && (
                          <td style={s.td} data-label="Action">
                            <button
                              onClick={() => onEditProduct(item.productId?._id)}
                              style={s.editBtn}
                            >
                              <FaEdit /> Edit
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateStock;
