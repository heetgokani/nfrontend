import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

const FeaturedCollection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          "https://nbackend-31lg.onrender.com/api/products/"
        );

        // 1. Just filter out inactive products (NO tag filtering)
        const activeProducts = res.data.filter((p) => p.status !== "Inactive");

        // 2. Limit to 8 products for a clean homepage grid
        setProducts(activeProducts.slice(0, 8));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div
      className="featured-collection"
      style={{ marginTop: "50px", paddingBottom: "50px" }}
    >
      <div className="collection-tab-inner">
        <div className="container">
          {/* Header */}
          <div
            className="section-header text-center"
            style={{ marginBottom: "40px" }}
          >
            <h2
              className="section-heading"
              style={{ fontSize: "32px", fontWeight: "700", color: "#333" }}
            >
              Featured Products
            </h2>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-danger mb-3"
                role="status"
              ></div>
              <p className="text-muted fw-bold">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-muted">No products found.</h5>
            </div>
          ) : (
            <div className="row">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="col-lg-3 col-md-6 col-6"
                  style={{ marginBottom: "30px" }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="view-all text-center" style={{ marginTop: "20px" }}>
            <Link
              to="/shop"
              className="btn-primary"
              style={{
                display: "inline-block",
                padding: "12px 30px",
                background: "#de433f",
                color: "#fff",
                textDecoration: "none",
                fontWeight: "700",
                borderRadius: "6px",
                textTransform: "uppercase",
                transition: "0.3s",
              }}
            >
              VIEW ALL
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCollection;
