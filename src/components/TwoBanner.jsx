import React from "react";

const TwoBanner = () => {
  return (
    <>
      <style>
        {`
          /* Force text to left and adjust font for mobile */
          @media (max-width: 768px) {
            .banner-content {
              text-align: left !important;
              padding: 15px !important;
            }
            .heading_18 {
              font-size: 14px !important;
              margin-bottom: 5px !important;
            }
            .heading_34 {
              font-size: 22px !important;
              line-height: 1.2 !important;
            }
            .banner-section.mt-100 {
              margin-top: 50px !important;
            }
            .col-12 {
              margin-bottom: 20px;
            }
          }
        `}
      </style>

      <div className="banner-section mt-100 overflow-hidden">
        <div className="banner-section-inner">
          <div className="container">
            <div className="row justify-content-center">
              {/* Banner 1 */}
              <div className="col-lg-6 col-md-6 col-12">
                <a
                  className="banner-item position-relative rounded d-block"
                  href="collection-left-sidebar.html"
                >
                  <img
                    className="banner-img w-100"
                    src="assets/img/shoe-1.jpg"
                    alt="banner-1"
                  />
                  <div className="content-absolute content-slide">
                    <div className="container height-inherit d-flex align-items-center">
                      <div className="content-box banner-content p-4">
                        <p className="heading_18 mb-3 text-white">
                          Sports Shoes
                        </p>
                        <h2 className="heading_34 text-white">
                          25% off for <br />
                          sports men
                        </h2>
                      </div>
                    </div>
                  </div>
                </a>
              </div>

              {/* Banner 2 */}
              <div className="col-lg-6 col-md-6 col-12">
                <a
                  className="banner-item position-relative rounded d-block"
                  href="collection-left-sidebar.html"
                >
                  <img
                    className="banner-img w-100"
                    src="assets/img/shoe-2.jpg"
                    alt="banner-2"
                  />
                  <div className="content-absolute content-slide">
                    <div className="container height-inherit d-flex align-items-center">
                      <div className="content-box banner-content p-4">
                        <p className="heading_18 mb-3 text-white">
                          Sports Shoes
                        </p>
                        <h2 className="heading_34 text-white">
                          25% off for <br />
                          sports women
                        </h2>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TwoBanner;
