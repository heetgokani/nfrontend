import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HomeBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Using high-quality free Unsplash images for the shoes
  const slides = [
    {
      id: 1,
      imgUrl:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
      heading: "ZEN VIVID 16",
      subheading: "Experience ultimate comfort and style.",
    },
    {
      id: 2,
      imgUrl:
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2000&auto=format&fit=crop",
      heading: "PREMIUM HEELS",
      subheading: "Elevate your look with our new collection.",
    },
    {
      id: 3,
      imgUrl:
        "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=2070&auto=format&fit=crop",
      heading: "MEN'S CLASSICS",
      subheading: "Look for your everyday inspiration here.",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, [currentSlide]);

  return (
    <div className="slideshow-section position-relative overflow-hidden">
      <style>
        {`
          .slideshow-section {
            background: #f8f9fa;
            width: 100%;
          }

          .slide-item {
            display: none;
            width: 100%;
            height: 600px;
            position: relative;
          }
          
          .slide-item.active {
            display: block;
            animation: fadeIn 0.6s ease-in-out;
          }

          /* Desktop Layout: Absolute image with gradient overlay */
          .slide-bg-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
          }

          .slide-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: 70% center; /* Keeps the shoe centered on the right */
          }

          /* Fades from solid white on the left (for text) to transparent on the right (for shoe) */
          .slide-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to right, rgba(248, 249, 250, 1) 0%, rgba(248, 249, 250, 0.8) 40%, rgba(248, 249, 250, 0) 100%);
            z-index: 2;
          }

          .content-slide {
            position: relative;
            z-index: 3;
            height: 100%;
            display: flex;
            align-items: center;
          }

          .slide-content {
            max-width: 600px;
            padding: 0 60px;
          }

          .slide-heading {
            font-size: 64px;
            font-weight: 900;
            color: #111;
            line-height: 1.1;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: -1px;
          }

          .slide-subheading {
            font-size: 18px;
            color: #555;
            margin-bottom: 30px;
            font-weight: 500;
          }

          .slide-btn {
            display: inline-block;
            padding: 14px 36px;
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            background: #de433f;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            transition: background 0.3s, transform 0.2s;
            box-shadow: 0 4px 15px rgba(222, 67, 63, 0.3);
          }

          .slide-btn:hover {
            background: #b8322f;
            color: #fff;
            transform: translateY(-2px);
          }

          /* Arrow Buttons */
          .banner-arrow-btn {
            background: rgba(255, 255, 255, 0.9);
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
            cursor: pointer;
            color: #111;
            transition: all 0.3s;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }

          .banner-arrow-btn:hover {
            background: #de433f;
            color: #fff;
            box-shadow: 0 6px 15px rgba(222, 67, 63, 0.3);
          }

          .arrow-prev { left: 30px; }
          .arrow-next { right: 30px; }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          /* ==============================================================
             STRICT MOBILE RESPONSIVENESS - Image Only View
             ============================================================== */
          @media (max-width: 768px) {
            .slide-item {
              height: 400px; /* Adjust height for mobile banner */
            }
            
            .slide-bg-container {
              position: relative;
              height: 100%;
              width: 100%;
            }

            .slide-overlay {
              display: none; /* Remove gradient overlay for clean image view */
            }

            .slide-img {
              object-position: center; /* Center the shoe perfectly */
            }

            /* REMOVE TEXT CONTENT COMPLETELY FROM MOBILE */
            .content-slide {
              display: none !important;
            }

            .banner-arrow-btn {
              width: 40px;
              height: 40px;
              top: 50%; /* Center arrows over the image */
            }

            .arrow-prev { left: 15px; }
            .arrow-next { right: 15px; }

            .banner-arrow-btn svg {
              width: 20px;
              height: 20px;
            }
          }
        `}
      </style>

      <div className="slideshow-active">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide-item ${index === currentSlide ? "active" : ""}`}
          >
            {/* Image Section */}
            <div className="slide-bg-container">
              <div className="slide-overlay"></div>
              <img
                className="slide-img"
                src={slide.imgUrl}
                alt={`slide-${slide.id}`}
              />
            </div>

            {/* Text Content Section (Hidden on mobile via CSS) */}
            <div className="content-slide">
              <div className="container">
                <div className="slide-content">
                  <h2 className="slide-heading">{slide.heading}</h2>
                  <p className="slide-subheading">{slide.subheading}</p>
                  <button
                    className="slide-btn"
                    onClick={() => navigate("/shop")}
                  >
                    SHOP NOW
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ARROWS */}
      <div className="activate-arrows">
        <button
          type="button"
          className="banner-arrow-btn arrow-prev"
          onClick={prevSlide}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button
          type="button"
          className="banner-arrow-btn arrow-next"
          onClick={nextSlide}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HomeBanner;
