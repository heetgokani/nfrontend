import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";
import {
  FaDownload,
  FaUpload,
  FaSearch,
  FaImage,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateUpdateProduct = ({ onEditProduct }) => {
  const { auth } = useAuth();
  const permissions = auth?.user?.role?.permissions?.products;
  const canEdit = permissions?.edit || permissions?.add;

  const [productData, setProductData] = useState([]);
  const [parentProducts, setParentProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- PRO FILTERS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://demo-backend-k0yn.onrender.com/api/products"
      );
      const baseProducts = res.data;

      const productsWithVariants = await Promise.all(
        baseProducts.map(async (p) => {
          try {
            const detailRes = await axios.get(
              `https://demo-backend-k0yn.onrender.com/api/products/${p._id}`
            );
            return { product: p, variants: detailRes.data.variants || [] };
          } catch (e) {
            return { product: p, variants: [] };
          }
        })
      );

      const allVariants = productsWithVariants.flatMap((item) =>
        item.variants.map((v) => ({
          ...v,
          productId: item.product,
        }))
      );

      setParentProducts(baseProducts);
      setProductData(allVariants);
    } catch (err) {
      toast.error("Data fetch failed. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const uniqueBrands = [
    ...new Set(
      parentProducts
        .map((p) => p?.brand?.name || p?.brand?.title)
        .filter(Boolean)
    ),
  ];
  const uniqueCategories = [
    ...new Set(parentProducts.map((p) => p?.category?.title).filter(Boolean)),
  ];

  const filteredData = productData.filter((item) => {
    const parentProd = parentProducts.find(
      (p) => p._id === (item.productId?._id || item.productId)
    );
    const brandName = parentProd?.brand?.name || parentProd?.brand?.title || "";
    const catName = parentProd?.category?.title || "";

    const searchMatch =
      (parentProd?.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.sku || "").toLowerCase().includes(searchTerm.toLowerCase());

    const brandMatch = !selectedBrand || brandName === selectedBrand;
    const catMatch = !selectedCategory || catName === selectedCategory;

    let stockMatch = true;
    if (stockStatus === "low") stockMatch = item.stock > 0 && item.stock <= 5;
    if (stockStatus === "out") stockMatch = Number(item.stock) === 0;
    if (stockStatus === "in") stockMatch = item.stock > 5;

    return searchMatch && brandMatch && catMatch && stockMatch;
  });

  const handleExport = () => {
    if (filteredData.length === 0) return toast.warn("No data to export");

    const data = filteredData.map((v) => {
      const parentProd = parentProducts.find(
        (p) => p._id === (v.productId?._id || v.productId)
      );

      return {
        Variant_ID: v._id.toString(),
        Product_ID: parentProd ? parentProd._id.toString() : "",
        Brand: parentProd?.brand?.name || parentProd?.brand?.title || "N/A",
        Product_Title: parentProd ? parentProd.title : "N/A",
        SKU: v.sku || "",
        Price: Number(v.price) || 0,
        Discount_Price: Number(v.discountPrice) || 0,
        Stock: Number(v.stock) || 0,
        SGST: Number(v.sgst) || 0,
        CGST: Number(v.cgst) || 0,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bulk Products");
    XLSX.writeFile(wb, "Filtered_Products.xlsx");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await axios.post(
        "https://demo-backend-k0yn.onrender.com/api/products/import-excel",
        formData
      );
      toast.success("Bulk Update Successful!");
      fetchProducts();
    } catch (err) {
      toast.error("Import failed.");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const s = {
    card: {
      background: "#fff",
      borderRadius: "16px",
      padding: "30px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
      border: "1px solid #edf2f7",
    },
    filterBar: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
      gap: "15px",
      background: "#f7fafc",
      padding: "20px",
      borderRadius: "12px",
      marginBottom: "25px",
      alignItems: "end",
    },
    input: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      fontSize: "14px",
    },
    btnPrimary: {
      background: "var(--mern-admin-primary)",
      color: "#fff",
      padding: "12px 20px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontWeight: "600",
    },
    btnSecondary: {
      background: "#fff",
      color: "#4a5568",
      border: "1px solid #e2e8f0",
      padding: "12px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0 10px",
    },
    th: {
      textAlign: "left",
      padding: "15px",
      color: "#718096",
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    tr: { background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" },
    td: { padding: "15px", borderBottom: "1px solid #f7fafc" },
    imageBox: {
      width: "45px",
      height: "45px",
      borderRadius: "8px",
      objectFit: "cover",
      border: "1px solid #e2e8f0",
      background: "#f8fafc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    badge: (qty) => ({
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "700",
      background: qty === 0 ? "#fff5f5" : qty <= 5 ? "#fffaf0" : "#f0fff4",
      color: qty === 0 ? "#c53030" : qty <= 5 ? "#9c4221" : "#2f855a",
    }),
  };

  return (
    <>
      <style>
        {`
          .responsive-wrapper {
            width: 100%;
            overflow-x: hidden;
          }

          @media (max-width: 768px) {
            .responsive-wrapper { padding: 5px !important; }
            .responsive-card { padding: 15px !important; border-radius: 0 !important; }
            
            /* Fix the bleeding header */
            .responsive-header {
              flex-wrap: wrap !important;
              gap: 15px !important;
            }

            .responsive-actions {
              flex-wrap: wrap !important;
              justify-content: flex-start !important;
              width: 100% !important;
            }

            .responsive-btn {
              padding: 10px 15px !important;
              font-size: 13px !important;
            }

            .responsive-filter-bar { 
              grid-template-columns: 1fr !important; 
              padding: 15px !important;
            }
            
            /* Table Transformation */
            .responsive-table, .responsive-table tbody, .responsive-table tr, .responsive-table td {
              display: block !important; width: 100% !important;
            }
            .responsive-table thead { display: none !important; }
            .responsive-table tr {
              margin-bottom: 15px !important;
              border: 1px solid #edf2f7 !important;
              border-radius: 12px !important;
              padding: 10px !important;
            }
            .responsive-table td {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              padding: 8px 5px !important;
              border-bottom: 1px solid #f7fafc !important;
            }
            .responsive-table td::before {
              content: attr(data-label);
              font-weight: 800;
              color: #a0aec0;
              font-size: 10px;
              text-transform: uppercase;
            }
          }
        `}
      </style>

      <div
        className="responsive-wrapper"
        style={{ maxWidth: "1300px", margin: "0 auto" }}
      >
        <ToastContainer position="top-right" />
        <div style={s.card} className="responsive-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "25px",
              alignItems: "center",
            }}
            className="responsive-header"
          >
            <h2
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: "800",
                color: "#1a202c",
              }}
            >
              Bulk Product Manager
            </h2>
            <div
              style={{ display: "flex", gap: "10px" }}
              className="responsive-actions"
            >
              <button
                onClick={handleExport}
                style={s.btnSecondary}
                className="responsive-btn"
              >
                <FaDownload /> Export ({filteredData.length})
              </button>
              {canEdit && (
                <label style={s.btnPrimary} className="responsive-btn">
                  <FaUpload /> {uploading ? "..." : "Import"}
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

          <div style={s.filterBar} className="responsive-filter-bar">
            <div>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "#a0aec0",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                SEARCH
              </label>
              <div style={{ position: "relative" }}>
                <FaSearch
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "15px",
                    color: "#cbd5e0",
                  }}
                />
                <input
                  style={{ ...s.input, paddingLeft: "35px" }}
                  placeholder="Title or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "#a0aec0",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                BRAND
              </label>
              <select
                style={s.input}
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="">All Brands</option>
                {uniqueBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "#a0aec0",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                CATEGORY
              </label>
              <select
                style={s.input}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "#a0aec0",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                STOCK
              </label>
              <select
                style={s.input}
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="low">Low (1-5)</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedBrand("");
                setSelectedCategory("");
                setStockStatus("");
              }}
              style={{ ...s.btnSecondary, padding: "12px" }}
              className="responsive-btn"
            >
              <FaTimes /> Clear
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={s.table} className="responsive-table">
              <thead>
                <tr>
                  <th style={s.th}>Image</th>
                  <th style={s.th}>Brand</th>
                  <th style={s.th}>Product Title</th>
                  <th style={s.th}>SKU</th>
                  <th style={s.th}>MRP (₹)</th>
                  <th style={s.th}>Discount (₹)</th>
                  <th style={s.th}>Stock</th>
                  {canEdit && <th style={s.th}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((v) => {
                  const parent = parentProducts.find(
                    (p) => p._id === (v.productId?._id || v.productId)
                  );
                  const brandName =
                    parent?.brand?.name || parent?.brand?.title || "N/A";
                  const imgUrl = v.images?.[0]
                    ? `https://demo-backend-k0yn.onrender.com${v.images[0]}`
                    : parent?.thumbnail
                    ? `https://demo-backend-k0yn.onrender.com${parent.thumbnail}`
                    : null;

                  return (
                    <tr key={v._id} style={s.tr}>
                      <td style={s.td} data-label="Image">
                        {imgUrl ? (
                          <img src={imgUrl} alt="p" style={s.imageBox} />
                        ) : (
                          <div style={s.imageBox}>
                            <FaImage color="#cbd5e0" />
                          </div>
                        )}
                      </td>
                      <td style={s.td} data-label="Brand">
                        <span
                          style={{
                            background: "#edf2f7",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: "#4a5568",
                          }}
                        >
                          {brandName}
                        </span>
                      </td>
                      <td style={s.td} data-label="Product Title">
                        <div style={{ fontWeight: "700", color: "#2d3748" }}>
                          {parent?.title || "N/A"}
                        </div>
                      </td>
                      <td style={s.td} data-label="SKU">
                        <code
                          style={{
                            background: "#edf2f7",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {v.sku || "N/A"}
                        </code>
                      </td>
                      <td style={s.td} data-label="MRP (₹)">
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#718096",
                            fontWeight: "600",
                          }}
                        >
                          ₹{v.price || 0}
                        </div>
                      </td>
                      <td style={s.td} data-label="Discount (₹)">
                        <div
                          style={{
                            fontSize: "14px",
                            color: "var(--mern-admin-primary)",
                            fontWeight: "800",
                          }}
                        >
                          ₹{v.discountPrice || 0}
                        </div>
                      </td>
                      <td style={s.td} data-label="Stock">
                        <span style={s.badge(Number(v.stock))}>{v.stock}</span>
                      </td>
                      {canEdit && (
                        <td style={s.td} data-label="Action">
                          <button
                            onClick={() => onEditProduct(parent?._id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#3182ce",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
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
        </div>
      </div>
    </>
  );
};

export default CreateUpdateProduct;
