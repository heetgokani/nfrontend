import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewProducts = ({ onEdit, onDuplicate, onAdd }) => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const { auth } = useAuth();

  const canAdd = auth?.user?.role?.permissions?.products?.add;
  const canEdit = auth?.user?.role?.permissions?.products?.edit;
  const canDelete = auth?.user?.role?.permissions?.products?.delete;

  const load = async () => {
    try {
      const res = await axios.get(
        "https://demo-backend-k0yn.onrender.com/api/products/"
      );
      const baseProducts = res.data;

      const productsWithVariants = await Promise.all(
        baseProducts.map(async (p) => {
          try {
            const detailRes = await axios.get(
              `https://demo-backend-k0yn.onrender.com/api/products/${p._id}`
            );
            return { ...p, variants: detailRes.data.variants || [] };
          } catch (e) {
            return { ...p, variants: [] };
          }
        })
      );
      setProducts(productsWithVariants);
      setFiltered(productsWithVariants);
    } catch (err) {
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (search) {
      const lowerQ = search.toLowerCase();
      setFiltered(
        products.filter((p) => {
          const titleMatch = p.title?.toLowerCase().includes(lowerQ);
          const brandMatch = (p.brand?.name || "")
            .toLowerCase()
            .includes(lowerQ);
          const variantMatch = p.variants?.[0]?.title
            ?.toLowerCase()
            .includes(lowerQ);
          return titleMatch || brandMatch || variantMatch;
        })
      );
    } else {
      setFiltered(products);
    }
  }, [search, products]);

  const handleDelete = async (id) => {
    if (!canDelete) return toast.error("Permission Denied");
    if (
      window.confirm(
        "Are you sure you want to delete this product and all its variants?"
      )
    ) {
      try {
        await axios.delete(
          `https://demo-backend-k0yn.onrender.com/api/products/delete/${id}`
        );
        toast.success("Product deleted successfully");
        load();
      } catch (err) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleAction = (product, action) => {
    const sanitizedProduct = {
      ...product,
      brand: product.brand?._id || product.brand || "",
      category: product.category?._id || product.category || "",
      subcategory: product.subcategory?._id || product.subcategory || "",
      productAttributes: (product.productAttributes || []).map((attr) => ({
        ...attr,
        attribute: attr.attribute?._id || attr.attribute || "",
      })),
    };

    if (action === "edit" && canEdit) onEdit(sanitizedProduct);

    if (action === "clone" && canAdd) {
      // DEEP CLEAN: Strip all database IDs so Mongoose treats this as a brand new product
      const cloneData = JSON.parse(JSON.stringify(sanitizedProduct));
      delete cloneData._id;
      delete cloneData.createdAt;
      delete cloneData.updatedAt;
      delete cloneData.__v;

      if (cloneData.productAttributes) {
        cloneData.productAttributes.forEach((pa) => delete pa._id);
      }

      if (cloneData.variants) {
        cloneData.variants.forEach((v) => {
          delete v._id;
          delete v.productId;
          delete v.createdAt;
          delete v.updatedAt;
          delete v.__v;
          v.sku = `${v.sku}-COPY`;
        });
      }
      onDuplicate(cloneData);
    }
  };

  const toggleStatus = async (product) => {
    if (!canEdit) return toast.error("Permission Denied");
    const newStatus = product.status === "Active" ? "Inactive" : "Active";
    try {
      // FIX: Send a clean JSON payload for status updates so it doesn't trigger formatting errors
      await axios.put(
        `https://demo-backend-k0yn.onrender.com/api/products/update/${product._id}`,
        {
          status: newStatus,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success(`Marked as ${newStatus}`);
      load();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const s = {
    wrapper: {
      maxWidth: "1400px",
      margin: "0 auto",
      fontFamily: "'Inter', sans-serif",
      color: "var(--mern-admin-text-main)",
      background: "var(--mern-admin-bg)",
      padding: "20px",
      borderRadius: "8px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    title: { fontSize: "24px", fontWeight: "700", margin: 0 },
    search: {
      padding: "8px 15px",
      borderRadius: "6px",
      border: "1px solid var(--mern-admin-border)",
      width: "250px",
      outline: "none",
    },
    addBtn: {
      background: "var(--mern-admin-primary)",
      color: "var(--mern-admin-text-white)",
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      display: "flex",
      gap: "8px",
      alignItems: "center",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "#fff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      borderRadius: "8px",
      overflow: "hidden",
    },
    th: {
      textAlign: "left",
      padding: "15px",
      borderBottom: "2px solid var(--mern-admin-border)",
      color: "#64748b",
      fontWeight: "600",
      fontSize: "14px",
    },
    td: {
      padding: "15px",
      borderBottom: "1px solid var(--mern-admin-border)",
      verticalAlign: "top",
      fontSize: "14px",
    },
    imgBox: {
      width: "50px",
      height: "50px",
      borderRadius: "6px",
      objectFit: "cover",
      border: "1px solid var(--mern-admin-border)",
    },
    productTitle: {
      fontWeight: "700",
      color: "var(--mern-admin-primary)",
      margin: "0 0 5px 0",
      fontSize: "15px",
    },
    actionRow: {
      display: "flex",
      gap: "10px",
      fontSize: "12px",
      marginTop: "5px",
    },
    actionLink: (color) => ({
      color: color,
      cursor: "pointer",
      textDecoration: "none",
      fontWeight: "600",
    }),
    badge: (status) => ({
      padding: "4px 8px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "pointer",
      background: status === "Active" ? "#d1fae5" : "#fee2e2",
      color: status === "Active" ? "#065f46" : "var(--mern-admin-danger)",
    }),
    variantBadge: {
      background: "#f1f5f9",
      color: "#3b82f6",
      padding: "4px 10px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "700",
      display: "inline-block",
      border: "1px solid #cbd5e1",
    },
  };

  return (
    <>
      {/* CSS injected for mobile/tablet responsiveness ONLY */}
      <style>
        {`
            @media (max-width: 768px) {
              .responsive-wrapper { padding: 10px !important; }
              
              /* Stack header elements */
              .responsive-header {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 15px !important;
              }
              .responsive-search-container {
                width: 100% !important;
                flex-direction: column !important;
                gap: 10px !important;
              }
              .responsive-search-input { width: 100% !important; }
              .responsive-add-btn { 
                width: 100% !important; 
                justify-content: center !important; 
                padding: 12px !important;
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
                padding: 15px !important;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
              }
              .responsive-table td {
                border: none !important;
                padding: 8px 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                text-align: right !important;
              }
              
              /* Insert column labels via CSS before the data */
              .responsive-table td::before {
                content: attr(data-label);
                font-weight: 700 !important;
                color: #64748b !important;
                text-transform: uppercase !important;
                font-size: 11px !important;
                margin-right: 15px !important;
              }

              /* Force action row to always be visible on mobile (no hover on touch) */
              .responsive-action-row {
                opacity: 1 !important;
                justify-content: flex-end !important;
                margin-top: 8px !important;
                flex-wrap: wrap !important;
              }
              
              /* Align the product name block neatly on mobile */
              .td-name-content {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                text-align: right;
              }
            }
          `}
      </style>

      <div style={s.wrapper} className="responsive-wrapper">
        <ToastContainer position="top-right" autoClose={2000} />

        <div style={s.header} className="responsive-header">
          <h2 style={s.title}>Products</h2>
          <div
            style={{ display: "flex", gap: "15px" }}
            className="responsive-search-container"
          >
            <input
              style={s.search}
              className="responsive-search-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {canAdd && (
              <button
                style={s.addBtn}
                className="responsive-add-btn"
                onClick={onAdd}
              >
                <FaPlus /> Add New
              </button>
            )}
          </div>
        </div>

        <table style={s.table} className="responsive-table">
          <thead>
            <tr>
              <th style={s.th}>Image</th>
              <th style={s.th}>Name</th>
              <th style={s.th}>Brand</th>
              <th style={s.th}>Variants</th>
              <th style={s.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const firstVariant = p.variants?.[0] || {};
              const displayImg = firstVariant.images?.[0]
                ? `https://demo-backend-k0yn.onrender.com${firstVariant.images[0]}`
                : p.thumbnail
                ? `https://demo-backend-k0yn.onrender.com${p.thumbnail}`
                : "https://via.placeholder.com/50";
              const isHovered = hoveredRow === p._id;
              const variantCount = p.variants?.length || 0;

              return (
                <tr
                  key={p._id}
                  onMouseEnter={() => setHoveredRow(p._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    background: isHovered ? "#f8fafc" : "#fff",
                    transition: "0.2s",
                  }}
                >
                  <td style={s.td} data-label="Image">
                    <img src={displayImg} style={s.imgBox} alt="thumbnail" />
                  </td>
                  <td style={s.td} data-label="Name">
                    <div className="td-name-content">
                      <p style={s.productTitle}>{p.title}</p>
                      <div
                        style={{ ...s.actionRow, opacity: isHovered ? 1 : 0 }}
                        className="responsive-action-row"
                      >
                        {canEdit && (
                          <span
                            style={s.actionLink("var(--mern-admin-primary)")}
                            onClick={() => handleAction(p, "edit")}
                          >
                            Edit
                          </span>
                        )}
                        {canEdit && canAdd && (
                          <span style={{ color: "#cbd5e1" }}>|</span>
                        )}
                        {canAdd && (
                          <span
                            style={s.actionLink("var(--mern-admin-text-main)")}
                            onClick={() => handleAction(p, "clone")}
                          >
                            Clone
                          </span>
                        )}
                        {(canEdit || canAdd) && canDelete && (
                          <span style={{ color: "#cbd5e1" }}>|</span>
                        )}
                        {canDelete && (
                          <span
                            style={s.actionLink("var(--mern-admin-danger)")}
                            onClick={() => handleDelete(p._id)}
                          >
                            Trash
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={s.td} data-label="Brand">
                    {p.brand?.name || "—"}
                  </td>
                  <td style={s.td} data-label="Variants">
                    {variantCount > 0 ? (
                      <span style={s.variantBadge}>
                        {variantCount} Variant{variantCount > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "#94a3b8",
                          fontSize: "13px",
                          fontWeight: "500",
                        }}
                      >
                        None
                      </span>
                    )}
                  </td>
                  <td style={s.td} data-label="Status">
                    <span
                      style={s.badge(p.status || "Active")}
                      onClick={() => toggleStatus(p)}
                    >
                      {p.status || "Active"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ViewProducts;
