import React from "react";

const AboutUs = () => {
  return (
    <div className="about-us-page">
      {/* Scoped CSS for the About Us Page leveraging your app.css variables */}
      <style>{`
        .about-us-page {
          font-family: var(--font-sans);
          color: var(--text-main);
          background-color: var(--bg-white);
          padding-bottom: 60px;
        }
        
        .about-hero {
          background-color: var(--green-light);
          padding: 80px 20px;
          text-align: center;
          margin-bottom: 60px;
          position: relative;
        }

        .about-hero h1 {
          font-family: var(--font-serif);
          color: var(--green-darkest);
          font-size: 3.5rem;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .about-hero p {
          color: var(--text-muted);
          font-size: 1.2rem;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .about-story-section {
          display: flex;
          align-items: center;
          gap: 50px;
          margin-bottom: 80px;
        }

        .about-story-content {
          flex: 1;
        }

        .about-story-content h2 {
          font-family: var(--font-serif);
          color: var(--green-darkest);
          font-size: 2.5rem;
          margin-bottom: 20px;
        }

        .about-story-content p {
          color: var(--text-gray);
          font-size: 1.1rem;
          line-height: 1.8;
          margin-bottom: 20px;
        }

        .about-story-image {
          flex: 1;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .about-story-image img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }

        .values-section {
          background-color: var(--bg-off-white);
          padding: 80px 0;
          text-align: center;
          margin-bottom: 80px;
        }

        .values-section h2 {
          font-family: var(--font-serif);
          color: var(--green-darkest);
          font-size: 2.5rem;
          margin-bottom: 50px;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .value-card {
          background: var(--bg-white);
          padding: 40px 30px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          transition: transform 0.3s ease;
        }

        .value-card:hover {
          transform: translateY(-10px);
        }

        .value-icon {
          width: 60px;
          height: 60px;
          background-color: var(--green-light);
          color: var(--green-dark);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto 20px;
        }

        .value-card h3 {
          color: var(--green-darkest);
          font-size: 1.3rem;
          margin-bottom: 15px;
        }

        .value-card p {
          color: var(--text-gray);
          font-size: 1rem;
          line-height: 1.6;
        }

        .cta-section {
          text-align: center;
          padding: 60px 20px;
          background: var(--green-darkest);
          color: var(--bg-white);
          border-radius: 16px;
          margin-top: 40px;
        }

        .cta-section h2 {
          font-family: var(--font-serif);
          font-size: 2.5rem;
          margin-bottom: 20px;
          color: var(--bg-white);
        }

        .cta-btn {
          background-color: var(--green-medium);
          color: var(--bg-white);
          padding: 15px 40px;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          border-radius: 30px;
          cursor: pointer;
          box-shadow: var(--btn-shadow);
          transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .cta-btn:hover {
          background-color: var(--green-dark);
          transform: scale(1.05);
        }

        @media (max-width: 1024px) {
          .about-story-section {
            flex-direction: column;
            text-align: center;
          }
          .values-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .about-hero h1 {
            font-size: 2.5rem;
          }
          .values-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Hero Section */}
      <div className="about-hero">
        <div className="universal-container">
          <h1>Welcome to Nikam Organic</h1>
          <p>
            Rooted in nature, nurtured with care. We bring the purest,
            pesticide-free produce directly from our family farms to your
            everyday table.
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="universal-container">
        <div className="about-story-section">
          <div className="about-story-image">
            {/* Replace src with an actual farm/organic image from your assets */}
            <img
              src="https://images.unsplash.com/photo-1595858645484-817812bd15d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Nikam Organic Farm"
            />
          </div>
          <div className="about-story-content">
            <h2>Our Story</h2>
            <p>
              Nikam Organic started with a simple belief: food should be grown
              the way nature intended. Decades ago, we noticed the growing
              disconnect between people and the food they eat. We decided to
              bridge that gap.
            </p>
            <p>
              By cutting out the middlemen, we ensure that every vegetable,
              fruit, and grain you purchase from us is fresh, sustainable, and
              100% organic. We don't just sell products; we cultivate health and
              well-being for your family.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="values-section">
        <div className="universal-container">
          <h2>Why Choose Nikam Organic?</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🌱</div>
              <h3>100% Certified Organic</h3>
              <p>
                Zero synthetic pesticides or fertilizers. We rely on
                traditional, eco-friendly farming methods to keep the soil rich
                and your food safe.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🚜</div>
              <h3>Direct From the Farm</h3>
              <p>
                No warehouses or long transit times. Our products are harvested
                at peak ripeness and shipped directly to your doorstep.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Sustainable & Ethical</h3>
              <p>
                We believe in giving back to the earth. Our farming practices
                conserve water, reduce carbon footprint, and support local
                farming communities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="universal-container">
        <div className="cta-section">
          <h2>Taste the Organic Difference</h2>
          <p
            style={{
              color: "var(--green-light)",
              marginBottom: "30px",
              fontSize: "1.2rem",
            }}
          >
            Join thousands of families who have switched to a healthier
            lifestyle.
          </p>
          <button className="cta-btn">Shop Fresh Harvest</button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
