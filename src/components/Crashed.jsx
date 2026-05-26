import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  FaChartPie,
  FaUserShield,
  FaBars,
  FaChevronDown,
  FaChevronRight,
  FaPlus,
  FaRegEye,
  FaArrowRightFromBracket,
  FaBoxOpen,
  FaBoxesStacked,
  FaPercent,
  FaFileExcel,
  FaTicketSimple,
  FaTags,
  FaBolt,
  FaStar,
  FaTruck,
  FaFileInvoice,
} from "react-icons/fa6";
import { BiSolidCategory } from "react-icons/bi";
import {
  FaEnvelope,
  FaQuestionCircle,
  FaClipboardList,
  FaCog,
  FaCreditCard,
} from "react-icons/fa"; // Added FaCreditCard
import { toast, ToastContainer } from "react-toastify";

import CreateRole from "./CreateRole";
import ViewRole from "./ViewRole";
import CreateUser from "./CreateUser";
import ViewProducts from "./ViewProducts";
import CreateProduct from "./CreateProduct";
import CreateCategory from "./CreateCategory";
import CreateAttribute from "./CreateAttribute";
import CreateBrand from "./CreateBrand";
import { FaComments } from "react-icons/fa";

import CreateStock from "./CreateStock";
import CreateGst from "./CreateGst";

import Createfaq from "./Createfaq";
import CreateContact from "./CreateContact";
import ManageReviews from "./ManageReviews";
import CreateCoupon from "./CreateCoupon";
import CreateOrder from "./CreateOrder";
import CreateInvoice from "./CreateInvoice";
import ManageShipping from "./ManageShipping";
import "./Crashed.css";
import EmailSettings from "./EmailSettings";
import PaymentSettings from "./PaymentSettings"; // <--- IMPORTED PAYMENT SETTINGS

// Access Denied Fallback UI
const AccessDenied = () => (
  <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
    <h2>Access Denied</h2>
    <p>You do not have permission to view this module.</p>
  </div>
);

export const PageHeader = ({ title, subtitle }) => (
  <div style={{ marginBottom: "25px" }}>
    <h2
      style={{
        color: "var(--mern-admin-text-main)",
        fontSize: "24px",
        fontWeight: "700",
        margin: 0,
      }}
    >
      {title}
    </h2>
    <p style={{ color: "#64748b", fontSize: "14px", marginTop: "5px" }}>
      {subtitle}
    </p>
    <div
      style={{
        width: "60px",
        height: "4px",
        background: "var(--mern-admin-primary)",
        marginTop: "15px",
        borderRadius: "2px",
      }}
    />
  </div>
);

const Crashed = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("dashboard");
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openProductMenu, setOpenProductMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(
    window.innerWidth > 768
  );

  const [editingProduct, setEditingProduct] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(0);

  const permissions = auth?.user?.role?.permissions;

  // EXACT PERMISSIONS BASED ON YOUR ROLE SCHEMA
  const canShowAccessControl =
    permissions?.role?.add || permissions?.role?.view;
  const canShowProductControl =
    permissions?.products?.add || permissions?.products?.view;
  const canShowCategoryControl =
    permissions?.category?.add || permissions?.category?.view;
  const canShowShipControl = permissions?.ship?.view || permissions?.ship?.add;
  const canShowStockControl =
    permissions?.stock?.view || permissions?.stock?.add;
  const canShowGstControl = permissions?.gst?.view || permissions?.gst?.add;

  const canShowContactControl = permissions?.contact?.view;
  const canShowFaqControl = permissions?.faq?.view;

  const canShowCouponControl =
    permissions?.coupon?.view || permissions?.coupon?.add;
  const canShowReviewsControl =
    permissions?.reviews?.view || permissions?.reviews?.add;

  const canShowOrderControl =
    permissions?.order?.view || permissions?.order?.edit;
  const canShowInvoiceControl =
    permissions?.invoice?.view || permissions?.invoice?.add;

  useEffect(() => {
    if (!auth?.user) navigate("/login");
  }, [auth, navigate]);

  useEffect(() => {
    if (auth?.user && canShowStockControl) {
      axios
        .get("https://nikam-ecom-backend.onrender.com/api/stock/all")
        .then((res) => {
          const lowStock = res.data.filter(
            (item) => Number(item.stock) < 3
          ).length;
          setLowStockCount(lowStock);
        })
        .catch((err) => console.error("Error fetching stock:", err));
    }
  }, [auth, canShowStockControl]);

  const handleGoToCreate = () => {
    setEditingProduct(null);
    setActivePage("create-products");
  };

  const handleGoToEdit = (product) => {
    setEditingProduct({ ...product, mode: "edit" });
    setActivePage("create-products");
  };

  const handleGoToDuplicate = (product) => {
    setEditingProduct({ ...product, mode: "duplicate" });
    setActivePage("create-products");
  };

  const handleBackToView = () => {
    setEditingProduct(null);
    setActivePage("view-products");
  };

  const handleEditFromStock = async (productId) => {
    if (!productId) return toast.error("Product ID missing");
    try {
      const res = await axios.get(
        `https://nikam-ecom-backend.onrender.com/api/products/${productId}`
      );
      const p = res.data.product;

      const formattedProduct = {
        ...p,
        brand: p.brand?._id || p.brand,
        category: p.category?._id || p.category,
        subcategory: p.subcategory?._id || p.subcategory,
        variants: res.data.variants,
        mode: "edit",
      };

      setEditingProduct(formattedProduct);
      setActivePage("create-products");
    } catch (err) {
      toast.error("Failed to fetch product details for editing.");
    }
  };
  // Inside Crashed component
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [newContactCount, setNewContactCount] = useState(0);

  useEffect(() => {
    // Fetch New Orders (Assuming an endpoint that returns pending/new orders)
    if (auth?.user && canShowOrderControl) {
      axios
        .get("https://nikam-ecom-backend.onrender.com/api/orders/new-count") // Adjust endpoint to your API
        .then((res) => setNewOrderCount(res.data.count))
        .catch((err) => console.error("Error fetching orders:", err));
    }

    // Fetch New Contact Messages
    if (auth?.user && canShowContactControl) {
      axios
        .get("https://nikam-ecom-backend.onrender.com/api/contact/new-count") // Adjust endpoint to your API
        .then((res) => setNewContactCount(res.data.count))
        .catch((err) => console.error("Error fetching contacts:", err));
    }
  }, [auth, canShowOrderControl, canShowContactControl]);
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <PageHeader
            title={`Welcome, ${auth.user.name}`}
            subtitle="System Dashboard"
          />
        );
      case "create-role":
        return permissions?.role?.add ? <CreateRole /> : <AccessDenied />;
      case "view-role":
        return permissions?.role?.view ? <ViewRole /> : <AccessDenied />;
      case "create-user":
        return permissions?.role?.add ? <CreateUser /> : <AccessDenied />;
      case "create-category":
        return permissions?.category?.add ? (
          <CreateCategory />
        ) : (
          <AccessDenied />
        );
      case "create-products":
        return permissions?.products?.add ? (
          <CreateProduct
            editData={editingProduct}
            onSuccess={handleBackToView}
            onCancel={handleBackToView}
          />
        ) : (
          <AccessDenied />
        );
      case "view-products":
        return permissions?.products?.view ? (
          <ViewProducts
            onEdit={handleGoToEdit}
            onDuplicate={handleGoToDuplicate}
            onAdd={handleGoToCreate}
          />
        ) : (
          <AccessDenied />
        );
      case "create-attribute":
        return permissions?.products?.add ? (
          <CreateAttribute />
        ) : (
          <AccessDenied />
        );
      case "create-brand":
        return permissions?.products?.add ? <CreateBrand /> : <AccessDenied />;

      case "manage-stock":
        return canShowStockControl ? (
          <CreateStock onEditProduct={handleEditFromStock} />
        ) : (
          <AccessDenied />
        );
      case "manage-gst":
        return canShowGstControl ? <CreateGst /> : <AccessDenied />;

      case "contact-messages":
        return canShowContactControl ? <CreateContact /> : <AccessDenied />;
      case "manage-faq":
        return canShowFaqControl ? <Createfaq /> : <AccessDenied />;
      case "manage-coupons":
        return canShowCouponControl ? <CreateCoupon /> : <AccessDenied />;
      case "manage-reviews":
        return canShowReviewsControl ? <ManageReviews /> : <AccessDenied />;
      case "manage-shipping":
        return canShowShipControl ? <ManageShipping /> : <AccessDenied />;
      case "manage-orders":
        return canShowOrderControl ? <CreateOrder /> : <AccessDenied />;

      case "manage-invoices":
        return canShowInvoiceControl ? <CreateInvoice /> : <AccessDenied />;
      case "email-settings":
        return canShowAccessControl ? <EmailSettings /> : <AccessDenied />;
      // --- ADDED PAYMENT SETTINGS CASE ---
      case "payment-settings":
        return canShowAccessControl ? <PaymentSettings /> : <AccessDenied />;
      // -----------------------------------
      default:
        return <div>Loading Module...</div>;
    }
  };

  if (!auth?.user) return null;

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      background: "var(--mern-admin-bg)",
    },
    sidebar: {
      background: "var(--mern-admin-secondary)",
      color: "white",
      position: "fixed",
      top: 0,
      bottom: 0,
      transition: "0.3s",
      zIndex: 1000,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    logo: {
      padding: "24px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
    },
    logoBox: {
      width: "32px",
      height: "32px",
      background: "var(--mern-admin-primary)",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    navItem: (active) => ({
      padding: "12px 24px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      background: active ? "var(--mern-admin-primary)" : "transparent",
    }),
    subItem: (active) => ({
      padding: "10px 24px 10px 54px",
      cursor: "pointer",
      opacity: active ? 1 : 0.7,
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }),
    main: {
      width: "100%",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      transition: "0.3s",
    },
    header: {
      height: "70px",
      background: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 30px",
      borderBottom: "1px solid #e2e8f0",
    },
    content: { padding: "30px", overflowY: "auto", flex: 1 },
    card: {
      background: "white",
      padding: "30px",
      borderRadius: "16px",
      minHeight: "80vh",
      boxShadow: "0 2px 15px rgba(0,0,0,0.02)",
    },
    userProfile: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      cursor: "pointer",
    },
    menuBtn: {
      border: "none",
      background: "none",
      fontSize: "20px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" />

      <style>
        {`
          .mobile-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); z-index: 999; transition: 0.3s; }
          @media (max-width: 768px) {
            .mobile-overlay.active { display: block; }
            .responsive-main { margin-left: 0 !important; }
            .responsive-header { padding: 0 15px !important; }
            .responsive-content { padding: 15px !important; }
            .responsive-card { padding: 15px !important; }
          }
        `}
      </style>

      <div
        className={`mobile-overlay ${isSidebarVisible ? "active" : ""}`}
        onClick={() => setIsSidebarVisible(false)}
      ></div>

      <aside
        style={{ ...styles.sidebar, width: isSidebarVisible ? "260px" : "0px" }}
      >
        <div style={styles.logo}>
          <div style={styles.logoBox}>A</div> ADMIN
        </div>

        <div style={{ flex: 1, padding: "20px 0", overflowY: "auto" }}>
          <div
            style={styles.navItem(activePage === "dashboard")}
            onClick={() => {
              setActivePage("dashboard");
              if (window.innerWidth <= 768) setIsSidebarVisible(false);
            }}
          >
            <FaChartPie /> Dashboard
          </div>

          {canShowOrderControl && (
            <div
              style={styles.navItem(activePage === "manage-orders")}
              onClick={() => setActivePage("manage-orders")}
            >
              <FaClipboardList />
              <span style={{ flex: 1 }}>Manage Orders</span>
              {newOrderCount > 0 && (
                <span
                  style={{
                    background: "#ef4444",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  {newOrderCount}
                </span>
              )}
            </div>
          )}

          {canShowProductControl && (
            <>
              <div
                style={styles.navItem(openProductMenu)}
                onClick={() => setOpenProductMenu(!openProductMenu)}
              >
                <FaBoxOpen /> <span style={{ flex: 1 }}>Products</span>
                {openProductMenu ? (
                  <FaChevronDown size={10} />
                ) : (
                  <FaChevronRight size={10} />
                )}
              </div>
              {openProductMenu && (
                <div style={{ background: "rgba(0,0,0,0.1)" }}>
                  {permissions?.products?.add && (
                    <div
                      style={styles.subItem(activePage === "create-attribute")}
                      onClick={() => {
                        setActivePage("create-attribute");
                        if (window.innerWidth <= 768)
                          setIsSidebarVisible(false);
                      }}
                    >
                      <FaPlus size={10} /> Attributes
                    </div>
                  )}
                  {permissions?.products?.add && (
                    <div
                      style={styles.subItem(activePage === "create-brand")}
                      onClick={() => {
                        setActivePage("create-brand");
                        if (window.innerWidth <= 768)
                          setIsSidebarVisible(false);
                      }}
                    >
                      <FaPlus size={10} /> Brands
                    </div>
                  )}

                  {permissions?.products?.add && (
                    <div
                      style={styles.subItem(activePage === "create-products")}
                      onClick={() => {
                        handleGoToCreate();
                        if (window.innerWidth <= 768)
                          setIsSidebarVisible(false);
                      }}
                    >
                      <FaPlus size={10} /> Create Product
                    </div>
                  )}
                  {permissions?.products?.view && (
                    <div
                      style={styles.subItem(activePage === "view-products")}
                      onClick={() => {
                        handleBackToView();
                        if (window.innerWidth <= 768)
                          setIsSidebarVisible(false);
                      }}
                    >
                      <FaRegEye size={10} /> View Products
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {canShowCategoryControl && (
            <div
              style={styles.navItem(activePage === "create-category")}
              onClick={() => {
                setActivePage("create-category");
                if (window.innerWidth <= 768) setIsSidebarVisible(false);
              }}
            >
              <BiSolidCategory /> Category
            </div>
          )}

          {canShowStockControl && (
            <div
              style={styles.navItem(activePage === "manage-stock")}
              onClick={() => {
                setActivePage("manage-stock");
                if (window.innerWidth <= 768) setIsSidebarVisible(false);
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <FaBoxesStacked /> Manage Stock
                </div>
                {lowStockCount > 0 && (
                  <span
                    style={{
                      background: "#ef4444",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    {lowStockCount}
                  </span>
                )}
              </div>
            </div>
          )}

          {canShowGstControl && (
            <div
              style={styles.navItem(activePage === "manage-gst")}
              onClick={() => {
                setActivePage("manage-gst");
                if (window.innerWidth <= 768) setIsSidebarVisible(false);
              }}
            >
              <FaPercent /> Manage GST
            </div>
          )}
          {canShowInvoiceControl && (
            <div
              style={styles.navItem(activePage === "manage-invoices")}
              onClick={() => {
                setActivePage("manage-invoices");
                if (window.innerWidth <= 768) setIsSidebarVisible(false);
              }}
            >
              <FaFileInvoice /> Manage Invoices
            </div>
          )}
          {canShowShipControl && (
            <div
              style={styles.navItem(activePage === "manage-shipping")}
              onClick={() => {
                setActivePage("manage-shipping");
                if (window.innerWidth <= 768) setIsSidebarVisible(false);
              }}
            >
              <FaTruck /> Manage Shipping
            </div>
          )}

          {canShowContactControl && (
            <div
              style={styles.navItem(activePage === "contact-messages")}
              onClick={() => setActivePage("contact-messages")}
            >
              <FaEnvelope />
              <span style={{ flex: 1 }}>Contact Messages</span>
              {newContactCount > 0 && (
                <span
                  style={{
                    background: "#ef4444",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  {newContactCount}
                </span>
              )}
            </div>
          )}

          {canShowFaqControl && (
            <div
              style={styles.navItem(activePage === "manage-faq")}
              onClick={() => {
                setActivePage("manage-faq");
                if (window.innerWidth <= 768) setIsSidebarVisible(false);
              }}
            >
              <FaQuestionCircle /> Manage FAQ
            </div>
          )}

          {canShowCouponControl && (
            <div
              style={styles.navItem(activePage === "manage-coupons")}
              onClick={() => {
                setActivePage("manage-coupons");
                if (window.innerWidth <= 768) setIsSidebarVisible(false);
              }}
            >
              <FaTicketSimple /> Manage Coupons
            </div>
          )}

          {canShowReviewsControl && (
            <div
              style={styles.navItem(activePage === "manage-reviews")}
              onClick={() => {
                setActivePage("manage-reviews");
                if (window.innerWidth <= 768) setIsSidebarVisible(false);
              }}
            >
              <FaStar /> Manage Reviews
            </div>
          )}

          {canShowAccessControl && (
            <div
              style={styles.navItem(activePage === "email-settings")}
              onClick={() => {
                setActivePage("email-settings");
                if (window.innerWidth <= 768) setIsSidebarVisible(false);
              }}
            >
              <FaEnvelope /> Email Settings
            </div>
          )}

          {/* --- ADDED PAYMENT SETTINGS SIDEBAR TAB --- */}
          {canShowAccessControl && (
            <div
              style={styles.navItem(activePage === "payment-settings")}
              onClick={() => {
                setActivePage("payment-settings");
                if (window.innerWidth <= 768) setIsSidebarVisible(false);
              }}
            >
              <FaCreditCard /> Payment Settings
            </div>
          )}
          {/* ------------------------------------------ */}
        </div>
      </aside>

      <div
        className="responsive-main"
        style={{ ...styles.main, marginLeft: isSidebarVisible ? "260px" : "0" }}
      >
        <header style={styles.header} className="responsive-header">
          <button
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            style={styles.menuBtn}
          >
            <FaBars />
          </button>
          <div
            style={{ position: "relative" }}
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            <div style={styles.userProfile}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "700", fontSize: "13px" }}>
                  {auth.user.name}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--mern-admin-primary)",
                  }}
                >
                  {auth.user.role?.rolename}
                </div>
              </div>
              <div style={styles.logoBox}>
                {auth.user.name[0].toUpperCase()}
              </div>
            </div>
            {showUserDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "55px",
                  right: 0,
                  background: "white",
                  padding: "10px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  width: "150px",
                  zIndex: 2000,
                }}
                onClick={logout}
              >
                <div
                  style={{
                    color: "red",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  <FaArrowRightFromBracket /> Sign Out
                </div>
              </div>
            )}
          </div>
        </header>
        <main style={styles.content} className="responsive-content">
          <div style={styles.card} className="responsive-card">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Crashed;
