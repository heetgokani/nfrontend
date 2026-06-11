import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import ProductCard from "./ProductCard";

const RandomFeaturedProducts = () => {
  const [randomProducts, setRandomProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        const response = await axios.get(
          "https://nbackend-31lg.onrender.com/api/products/"
        );

        // 1. Filter out inactive products
        const activeProducts = response.data.filter(
          (p) => p.status !== "Inactive"
        );

        // 2. Shuffle the array randomly
        const shuffled = activeProducts.sort(() => 0.5 - Math.random());

        // 3. Grab exactly 8 products for a perfect 4-column grid (2 rows)
        setRandomProducts(shuffled.slice(0, 8));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching random products:", err);
        setLoading(false);
      }
    };

    fetchRandomProducts();
  }, []);

  return (
    <section className="featured-random-section py-5">
      <div className="container">
        {/* Section Header */}
        <div className="d-flex flex-column align-items-center text-center mb-5">
          <span className="badge-green mb-2">Farm Fresh</span>
          <h2 className="fw-bold m-0 gradient-text">
            Discover Organic Goodness
          </h2>
          <p className="text-muted mt-2 max-w-600">
            Hand-picked selections from our farm to your table. Explore some of
            our freshest arrivals today.
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: "#407e18" }}></div>
            <h6 className="mt-3 text-muted fw-bold">Harvesting products...</h6>
          </div>
        ) : randomProducts.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="text-muted">No products available right now.</h4>
          </div>
        ) : (
          <div className="row g-4 mb-5 justify-content-center">
            {randomProducts.map((product) => (
              <div key={product._id} className="col-6 col-md-4 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Explore More Button */}
        <div className="text-center">
          <Link to="/shop" className="btn-explore-more">
            Explore All Products <FiArrowRight className="ms-2" />
          </Link>
        </div>
      </div>

      {/* Scoped Styles for this section */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .featured-random-section {
            background-color: #fcfdfc;
            border-top: 1px solid #f0f5f0;
            border-bottom: 1px solid #f0f5f0;
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #2A5C38 0%, #407E18 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 2.2rem;
          }
          
          .badge-green {
            background-color: rgba(64, 126, 24, 0.1);
            color: #407e18;
            padding: 6px 16px;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .max-w-600 {
            max-width: 600px;
            margin: 0 auto;
          }
          
          .btn-explore-more {
            display: inline-flex;
            align-items: center;
            background: #407e18;
            color: #ffffff;
            padding: 14px 32px;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(64, 126, 24, 0.2);
            border: 2px solid #407e18;
          }
          
          .btn-explore-more:hover {
            background: #ffffff;
            color: #407e18;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(64, 126, 24, 0.3);
          }
        `,
        }}
      />
    </section>
  );
};

export default RandomFeaturedProducts;
