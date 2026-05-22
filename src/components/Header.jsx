import React, { useState, useEffect, useRef, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiX,
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiLogOut,
  FiLogIn,
  FiPackage,
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const API_URL = "http://localhost:5000";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  // --- RESPONSIVE STATE ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarRef = useRef(null);
  const searchRef = useRef(null);
  const userSidebarRef = useRef(null);
  const wishlistRef = useRef(null);
  const cartRef = useRef(null);
  const navigate = useNavigate();

  const { user, logout } = useContext(AuthContext);

  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [previewResults, setPreviewResults] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const fetchUserData = async () => {
    if (user) {
      try {
        const config = { withCredentials: true };
        const [cartRes, wishlistRes] = await Promise.all([
          axios.get(`${API_URL}/api/cart`, config),
          axios.get(`${API_URL}/api/wishlist`, config),
        ]);
        setCartItems(cartRes.data.items || []);
        setWishlistItems(wishlistRes.data.items || []);
      } catch (error) {
        console.error("Failed to fetch cart/wishlist data", error);
      }
    } else {
      setCartItems([]);
      setWishlistItems([]);
    }
  };

  useEffect(() => {
    fetchUserData();

    window.addEventListener("cartUpdated", fetchUserData);
    window.addEventListener("wishlistUpdated", fetchUserData);

    return () => {
      window.removeEventListener("cartUpdated", fetchUserData);
      window.removeEventListener("wishlistUpdated", fetchUserData);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    setIsSidebarOpen(false);
    setIsUserSidebarOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const searchProducts = async () => {
      if (!localSearchQuery || localSearchQuery.trim().length < 1) {
        setPreviewResults([]);
        return;
      }
      setIsFetching(true);
      try {
        const res = await axios.get(`${API_URL}/api/products`);
        const filtered = res.data.filter(
          (p) =>
            p.title?.toLowerCase().includes(localSearchQuery.toLowerCase()) &&
            p.status !== "Inactive",
        );
        setPreviewResults(filtered.slice(0, 5));
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setIsFetching(false);
      }
    };
    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [localSearchQuery]);

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      navigate("/shop", { state: { query: localSearchQuery } });
      setIsSearchOpen(false);
    }
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <strong key={index} style={{ color: "#de433f", fontWeight: "800" }}>
              {part}
            </strong>
          ) : (
            part
          ),
        )}
      </span>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target))
        setIsSidebarOpen(false);
      if (
        isSearchOpen &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        if (!event.target.closest(".header-search-trigger"))
          setIsSearchOpen(false);
      }
      if (
        userSidebarRef.current &&
        !userSidebarRef.current.contains(event.target)
      ) {
        if (!event.target.closest(".header-user-trigger"))
          setIsUserSidebarOpen(false);
      }
      if (wishlistRef.current && !wishlistRef.current.contains(event.target))
        setIsWishlistOpen(false);
      if (cartRef.current && !cartRef.current.contains(event.target))
        setIsCartOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen]);

  const renderDropdownItem = (item) => {
    const title = item.product?.title || "Unknown Product";
    const img = item.variant?.images?.[0] || item.product?.thumbnail || "";
    const displayImg = img.startsWith("http") ? img : `${API_URL}${img}`;
    const price = item.variant?.price || item.product?.price || 0;

    return (
      <div
        key={item._id}
        className="d-flex align-items-center mb-3 border-bottom pb-2"
      >
        <img
          src={displayImg}
          alt={title}
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
            borderRadius: "5px",
          }}
        />
        <div className="ms-2 flex-grow-1">
          <p
            className="m-0 text-truncate"
            style={{ fontSize: "13px", maxWidth: "150px", fontWeight: "600" }}
          >
            {title}
          </p>
          <p className="m-0 text-muted" style={{ fontSize: "12px" }}>
            {item.quantity ? `${item.quantity} x ` : ""} ₹{price}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      {/* --- ANNOUNCEMENT BAR --- */}
      <div
        style={{
          backgroundColor: "#de433f",
          padding: "10px 0",
          position: "relative",
          zIndex: 1201,
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#fff",
            }}
          >
            <div className="d-lg-block d-none" style={{ flex: 1 }}>
              <a
                href="tel:+1-078-2376"
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
              >
                Call: +1 078 2376
              </a>
            </div>
            <div
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              These is demo website
            </div>
            <div
              className="d-lg-block d-none"
              style={{ flex: 1, textAlign: "right" }}
            >
              {user ? (
                <span style={{ fontSize: "14px" }}>
                  Hi, {user.name} |{" "}
                  <button
                    onClick={handleLogout}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#fff",
                      fontWeight: "700",
                      padding: 0,
                      cursor: "pointer",
                      display: "inline-block",
                    }}
                  >
                    Logout
                  </button>
                </span>
              ) : (
                <NavLink
                  to="/login"
                  style={{
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Login
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN HEADER --- */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1200,
          background: "#fff",
          borderBottom: "1px solid #eee",
        }}
      >
        <div className="header-bottom py-3">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-3 col-4">
                <NavLink to="/" className="header-logo">
                  {/* RESPONSIVE LOGO SIZE */}
                  <img
                    src="/assets/img/swlogo.webp"
                    alt="logo"
                    style={{ maxWidth: isMobile ? "120px" : "180px" }}
                  />
                </NavLink>
              </div>
              <div className="col-lg-6 d-lg-block d-none">
                <nav className="text-center">
                  <ul className="main-menu list-unstyled d-inline-flex gap-4 m-0">
                    <li>
                      <NavLink className="nav-link clickable-link" to="/">
                        Home
                      </NavLink>
                    </li>
                    <li>
                      <NavLink className="nav-link clickable-link" to="/shop">
                        Shop
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        className="nav-link clickable-link"
                        to="/aboutus"
                      >
                        About Us
                      </NavLink>
                    </li>
                    <li>
                      <NavLink className="nav-link clickable-link" to="/faq">
                        FAQ
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        className="nav-link clickable-link"
                        to="/contact"
                      >
                        Contact
                      </NavLink>
                    </li>
                  </ul>
                </nav>
              </div>

              <div className="col-lg-3 col-8">
                {/* FLEX FIX TO ENSURE ALL ICONS FIT ON ONE LINE */}
                <div
                  className="header-action d-flex align-items-center justify-content-end gap-2 gap-md-3"
                  style={{ position: "relative" }}
                >
                  <button
                    className="header-search-trigger btn-reset"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSearchOpen(!isSearchOpen);
                    }}
                    style={{ cursor: "pointer", padding: "5px", color: "#333" }}
                  >
                    <FiSearch size={isMobile ? 20 : 22} />
                  </button>

                  {/* WISHLIST ICON - NOW VISIBLE ON MOBILE TOO */}
                  <div className="position-relative" ref={wishlistRef}>
                    <button
                      className="header-icon btn-reset"
                      onClick={() => setIsWishlistOpen(!isWishlistOpen)}
                      style={{ padding: "5px", position: "relative" }}
                    >
                      <FiHeart size={isMobile ? 20 : 22} />
                      {wishlistItems.length > 0 && (
                        <span className="icon-badge">
                          {wishlistItems.length}
                        </span>
                      )}
                    </button>
                    {isWishlistOpen && (
                      <div className="dropdown-box shadow-lg border">
                        <h6 className="mb-3 border-bottom pb-2">My Wishlist</h6>
                        {wishlistItems.length === 0 ? (
                          <p
                            className="text-muted text-center py-2"
                            style={{ fontSize: "13px" }}
                          >
                            Wishlist is empty
                          </p>
                        ) : (
                          <>
                            {wishlistItems.slice(0, 3).map(renderDropdownItem)}
                            {wishlistItems.length > 3 && (
                              <p
                                className="text-muted text-center m-0"
                                style={{ fontSize: "11px" }}
                              >
                                +{wishlistItems.length - 3} more items
                              </p>
                            )}
                            <button
                              onClick={() => {
                                setIsWishlistOpen(false);
                                navigate("/wishlist");
                              }}
                              className="btn w-100 mt-2 py-2 text-white"
                              style={{
                                fontSize: "12px",
                                borderRadius: "50px",
                                backgroundColor: "#de433f",
                              }}
                            >
                              View Full Wishlist
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CART ICON WITH BADGE & DROPDOWN */}
                  <div className="position-relative" ref={cartRef}>
                    <button
                      className="header-icon btn-reset"
                      onClick={() => setIsCartOpen(!isCartOpen)}
                      style={{ padding: "5px", position: "relative" }}
                    >
                      <FiShoppingCart size={isMobile ? 20 : 22} />
                      {cartItems.length > 0 && (
                        <span className="icon-badge">{cartItems.length}</span>
                      )}
                    </button>
                    {isCartOpen && (
                      <div className="dropdown-box shadow-lg border">
                        <h6 className="mb-3 border-bottom pb-2">My Cart</h6>
                        {cartItems.length === 0 ? (
                          <p
                            className="text-muted text-center py-2"
                            style={{ fontSize: "13px" }}
                          >
                            Cart is empty
                          </p>
                        ) : (
                          <>
                            {cartItems.slice(0, 3).map(renderDropdownItem)}
                            {cartItems.length > 3 && (
                              <p
                                className="text-muted text-center m-0"
                                style={{ fontSize: "11px" }}
                              >
                                +{cartItems.length - 3} more items
                              </p>
                            )}
                            <button
                              onClick={() => {
                                setIsCartOpen(false);
                                navigate("/cart");
                              }}
                              className="btn btn-dark w-100 mt-2 py-2"
                              style={{
                                fontSize: "12px",
                                borderRadius: "50px",
                                backgroundColor: "#de433f",
                                border: "none",
                              }}
                            >
                              View Full Cart
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* USER ICON */}
                  <button
                    className="header-user-trigger btn-reset header-icon"
                    onClick={() =>
                      user ? setIsUserSidebarOpen(true) : navigate("/login")
                    }
                    style={{ padding: "5px" }}
                  >
                    <FiUser size={isMobile ? 20 : 24} />
                  </button>

                  <button
                    className="btn-reset d-lg-none"
                    onClick={() => setIsSidebarOpen(true)}
                  >
                    <svg
                      width={isMobile ? "20" : "24"}
                      height={isMobile ? "20" : "24"}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                    >
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH OVERLAY (Unchanged) */}
          <div
            ref={searchRef}
            style={{
              display: isSearchOpen ? "block" : "none",
              position: "absolute",
              top: "100%",
              left: 0,
              width: "100%",
              background: "#fff",
              zIndex: 1300,
              padding: "20px 0",
              borderTop: "1px solid #eee",
              boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
            }}
          >
            <div className="container" style={{ position: "relative" }}>
              <div
                className="search-bar-inner d-flex align-items-center p-2 px-4"
                style={{ background: "#f8f9fa", borderRadius: "50px" }}
              >
                <FiSearch size={20} className="text-muted" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-grow-1 mx-3"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                  autoFocus
                  style={{
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: "16px",
                  }}
                />
                <button
                  className="btn-reset"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <FiX size={24} />
                </button>
              </div>
              {localSearchQuery && (
                <div
                  className="bg-white mt-2 p-3 shadow-lg rounded border"
                  style={{
                    position: "absolute",
                    width: "100%",
                    left: 0,
                    top: "100%",
                    zIndex: 1301,
                  }}
                >
                  {isFetching ? (
                    <div className="text-center p-3">Searching...</div>
                  ) : previewResults.length > 0 ? (
                    previewResults.map((item) => {
                      const defaultVariant =
                        item.variants?.find((v) => v.isDefault) ||
                        item.variants?.[0];
                      const displayImage =
                        defaultVariant?.images?.[0] || item.thumbnail
                          ? `${API_URL}${defaultVariant?.images?.[0] || item.thumbnail}`
                          : "/assets/img/placeholder.jpg";
                      const displayPrice =
                        defaultVariant?.discountPrice > 0
                          ? defaultVariant.discountPrice
                          : defaultVariant?.price;
                      return (
                        <div
                          key={item._id}
                          className="d-flex align-items-center mb-3"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            navigate(`/product/${item._id}`);
                            setIsSearchOpen(false);
                            setLocalSearchQuery("");
                          }}
                        >
                          <img
                            src={displayImage}
                            alt="product"
                            style={{
                              width: "55px",
                              height: "55px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                          <div className="ms-3">
                            <h6
                              className="m-0"
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#333",
                              }}
                            >
                              {highlightMatch(item.title, localSearchQuery)}
                            </h6>
                            <p
                              className="m-0 text-danger"
                              style={{ fontWeight: "700", fontSize: "12px" }}
                            >
                              {displayPrice
                                ? `₹${displayPrice}`
                                : "View Details"}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center p-3 text-muted">
                      No products found
                    </div>
                  )}
                  <div
                    className="text-center pt-2 border-top"
                    style={{
                      cursor: "pointer",
                      color: "#de433f",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                    onClick={() => {
                      navigate("/shop");
                      setIsSearchOpen(false);
                    }}
                  >
                    VIEW ALL RESULTS
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- MOBILE NAVIGATION SIDEBAR (Unchanged) --- */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          zIndex: 2400,
          display: isSidebarOpen ? "block" : "none",
        }}
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      <div
        ref={sidebarRef}
        style={{
          position: "fixed",
          top: 0,
          left: isSidebarOpen ? 0 : "-320px",
          width: "300px",
          height: "100%",
          zIndex: 2500,
          transition: "0.4s",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
          <img
            src="/assets/img/swlogo.webp"
            alt="logo"
            style={{ maxWidth: "120px" }}
          />
          <button className="btn-reset" onClick={() => setIsSidebarOpen(false)}>
            <FiX size={24} />
          </button>
        </div>
        <div className="p-4 flex-grow-1 overflow-auto">
          <ul className="list-unstyled m-0">
            {["Home", "Shop", "About Us", "Wishlist", "FAQ", "Contact"].map(
              (link) => (
                <li className="mb-4" key={link}>
                  <NavLink
                    to={`/${link.toLowerCase().replace(" ", "") === "home" ? "" : link.toLowerCase().replace(" ", "")}`}
                    className="sidebar-link"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    {link}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </div>
        <div className="p-4 border-top">
          {user ? (
            <div
              onClick={handleLogout}
              style={{
                color: "#de433f",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
              }}
            >
              <FiLogOut size={20} /> Logout ({user.name})
            </div>
          ) : (
            <NavLink
              to="/login"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <FiLogIn size={20} /> Login / Register
            </NavLink>
          )}
        </div>
      </div>

      {/* --- USER ACCOUNT RIGHT SIDEBAR (Unchanged) --- */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          zIndex: 2600,
          display: isUserSidebarOpen ? "block" : "none",
        }}
        onClick={() => setIsUserSidebarOpen(false)}
      ></div>
      <div
        ref={userSidebarRef}
        style={{
          position: "fixed",
          top: 0,
          right: isUserSidebarOpen ? 0 : "-320px",
          width: "300px",
          height: "100%",
          zIndex: 2700,
          transition: "0.4s",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-5px 0 15px rgba(0,0,0,0.1)",
        }}
      >
        <div
          className="p-4 border-bottom d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="bg-light rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "40px",
                height: "40px",
                border: "1px solid #ddd",
              }}
            >
              <FiUser size={20} color="#555" />
            </div>
            <div>
              <span
                className="d-block"
                style={{
                  fontSize: "12px",
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Hello,
              </span>
              <strong style={{ fontSize: "16px", color: "#111" }}>
                {user?.name || "Guest"}
              </strong>
            </div>
          </div>
          <button
            className="btn-reset"
            onClick={() => setIsUserSidebarOpen(false)}
            style={{ color: "#888" }}
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="p-4 flex-grow-1">
          <ul className="list-unstyled m-0 user-sidebar-list">
            <li className="mb-4">
              <NavLink
                to="/profile"
                className="user-sidebar-link"
                onClick={() => setIsUserSidebarOpen(false)}
              >
                <FiUser size={18} className="me-3" /> My Profile
              </NavLink>
            </li>
            <li className="mb-4">
              <NavLink
                to="/wishlist"
                className="user-sidebar-link"
                onClick={() => setIsUserSidebarOpen(false)}
              >
                <FiHeart size={18} className="me-3" /> Wishlist
              </NavLink>
            </li>
            <li className="mb-4">
              <NavLink
                to="/cart"
                className="user-sidebar-link"
                onClick={() => setIsUserSidebarOpen(false)}
              >
                <FiShoppingCart size={18} className="me-3" /> Cart
              </NavLink>
            </li>
            <li className="mb-4">
              <NavLink
                to="/orders"
                className="user-sidebar-link"
                onClick={() => setIsUserSidebarOpen(false)}
              >
                <FiPackage size={18} className="me-3" /> My Orders
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="p-4 border-top">
          <button
            onClick={handleLogout}
            className="btn-reset w-100 d-flex align-items-center"
            style={{
              color: "#de433f",
              fontSize: "16px",
              fontWeight: "600",
              padding: "10px 0",
            }}
          >
            <FiLogOut size={18} className="me-3" /> Logout
          </button>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .btn-reset { background: none; border: none; padding: 0; outline: none; cursor: pointer; display: flex; align-items: center; }
        .clickable-link { display: inline-block; padding: 5px 15px; color: #000; transition: 0.3s; text-decoration: none !important; }
        .clickable-link:hover, .clickable-link.active { color: #de433f !important; }
        .header-icon { color: #333 !important; text-decoration: none !important; transition: 0.3s; }
        .header-icon:hover { color: #de433f !important; }
        .sidebar-link { font-size: 18px; color: #000; text-decoration: none; font-weight: 600; display: block; }
        .sidebar-link.active { color: #de433f !important; }
        .user-sidebar-link { font-size: 16px; color: #333; text-decoration: none; font-weight: 500; display: flex; align-items: center; transition: 0.3s; }
        .user-sidebar-link:hover { color: #de433f; padding-left: 5px; }
        
        /* DROPDOWN & BADGE STYLES */
        .icon-badge { position: absolute; top: -2px; right: -6px; background-color: #de433f; color: white; border-radius: 50%; padding: 2px 5px; font-size: 9px; font-weight: bold; line-height: 1; }
        .dropdown-box { position: absolute; top: calc(100% + 15px); right: -50px; width: 280px; background: #fff; border-radius: 12px; padding: 15px; z-index: 2000; }
        
        /* MOBILE TWEAKS */
        @media (max-width: 768px) {
          .dropdown-box { right: -80px; width: 260px; }
        }
        `,
        }}
      />
    </>
  );
};

export default Header;
