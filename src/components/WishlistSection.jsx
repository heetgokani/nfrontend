import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import ProductCard from "../components/ProductCard"; // Adjust path as needed

const API_URL = "http://localhost:5000";

const WishlistSection = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/wishlist`, {
        withCredentials: true,
      });
      setWishlistItems(data.items || []);
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (itemId) => {
    try {
      await axios.delete(`${API_URL}/api/wishlist/remove/${itemId}`, {
        withCredentials: true,
      });
      toast.success("Removed from wishlist");
      fetchWishlist(); // Refresh the list
      window.dispatchEvent(new Event("wishlistUpdated")); // TELLS HEADER TO REFETCH
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  return (
    <>
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
              <a href="/" style={{ color: "#000", textDecoration: "none" }}>
                Home
              </a>
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
            <li style={{ color: "#777" }}>Wishlist</li>
          </ul>
        </div>
      </div>

      <main id="MainContent" className="content-for-layout">
        <div className="wishlist-page mt-100 mb-100">
          <div className="container">
            <div className="section-header mb-5 text-center">
              <h2
                className="section-heading"
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#00234D",
                }}
              >
                My Wishlist
              </h2>
              <div
                style={{
                  width: "60px",
                  height: "3px",
                  backgroundColor: "#3c7d24",
                  margin: "15px auto",
                }}
              />
            </div>

            {loading ? (
              <div className="text-center py-5">Loading your wishlist...</div>
            ) : (
              <div className="wishlist-grid-wrapper">
                {wishlistItems.length > 0 ? (
                  <div className="row">
                    {wishlistItems.map((item) => {
                      const mappedProduct = {
                        ...item.product,
                        variants: item.variant
                          ? [item.variant]
                          : item.product?.variants,
                      };

                      return (
                        <div
                          key={item._id}
                          className="col-xl-3 col-lg-4 col-md-6 col-6 mb-4 position-relative"
                        >
                          <button
                            onClick={() => handleRemove(item._id)}
                            style={{
                              position: "absolute",
                              top: "10px",
                              right: "20px",
                              zIndex: 10,
                              background: "rgba(255,255,255,0.9)",
                              border: "none",
                              borderRadius: "50%",
                              width: "35px",
                              height: "35px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                              color: "#3c7d24",
                            }}
                            title="Remove from Wishlist"
                          >
                            <FiTrash2 size={16} />
                          </button>

                          <ProductCard product={mappedProduct} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <h3 className="mb-4" style={{ color: "#3c7d24" }}>
                      Your wishlist is empty
                    </h3>
                    <p className="mb-4 text-muted">
                      You haven't saved any items yet. Start exploring our shop!
                    </p>
                    {/* --- FIXED RETURN BUTTON --- */}
                    <NavLink
                      to="/shop"
                      style={{
                        backgroundColor: "#3c7d24",
                        color: "#fff",
                        padding: "12px 35px",
                        borderRadius: "5px",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "14px",
                        display: "inline-block",
                        textTransform: "uppercase",
                        transition: "0.3s",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.backgroundColor = "#3c7d24")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.backgroundColor = "#3c7d24")
                      }
                    >
                      Return To Shop
                    </NavLink>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default WishlistSection;
