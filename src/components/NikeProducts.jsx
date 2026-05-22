import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

const NikeProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNikeProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products/");

        const nikeProducts = res.data.filter((p) => {
          // 1. Ignore inactive products
          if (p.status === "Inactive") return false;

          // 2. Extract brand safely (handles both String and populated Object)
          const brandName =
            typeof p.brand === "string"
              ? p.brand
              : p.brand?.name || p.brand?.title || "";

          // 3. Check if brand is Nike
          return brandName.toLowerCase() === "nike";
        });

        // Limit to 8 products for a clean grid
        setProducts(nikeProducts.slice(0, 8));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching Nike products:", err);
        setLoading(false);
      }
    };

    fetchNikeProducts();
  }, []);

  return (
    <div
      className="featured-collection"
      style={{
        marginTop: "50px",
        paddingBottom: "50px",
        backgroundColor: "#f8f9fa",
        paddingTop: "50px",
      }}
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
              Nike Collection
            </h2>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-dark mb-3"
                role="status"
              ></div>
              <p className="text-muted fw-bold">Loading Nike products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-muted">No Nike products found.</h5>
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
                background: "#db4a4a" /* Sleek black for Nike section */,
                color: "#fff",
                textDecoration: "none",
                fontWeight: "700",
                borderRadius: "6px",
                textTransform: "uppercase",
                transition: "0.3s",
              }}
            >
              VIEW ALL NIKE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NikeProducts;
