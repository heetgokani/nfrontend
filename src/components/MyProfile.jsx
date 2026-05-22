import React, { useState, useEffect } from "react";
import { FiUser, FiMail, FiShield, FiLock } from "react-icons/fi";

const MyProfile = () => {
  // Mocking user data. You can replace this with your actual useAuth() context or API call.
  const [user, setUser] = useState({
    firstName: "Het",
    lastName: "Gokani",
    email: "het@gmail.com",
    role: "Customer",
    joined: "March 2026",
  });

  return (
    <>
      <style>
        {`
          /* Profile Page Base */
          .profile-page-wrapper {
            background-color: #f8f9fa;
            min-height: 80vh;
            padding-bottom: 60px;
          }

          /* Breadcrumb styling matching your theme */
          .breadcrumb-sec {
            padding: 15px 0;
            background: #f9f9f9;
            border-bottom: 1px solid #eaeaea;
          }
          .breadcrumb-list {
            list-style: none;
            display: flex;
            align-items: center;
            margin: 0;
            padding: 0;
            font-size: 14px;
          }
          .breadcrumb-list a {
            color: #000;
            text-decoration: none;
            transition: color 0.2s;
          }
          .breadcrumb-list a:hover {
            color: #de433f;
          }

          /* Profile Card Design */
          .profile-card {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
            overflow: hidden;
            border: 1px solid #f0f0f0;
            margin-top: 40px;
          }
          
          /* Top Banner/Header of Card */
          .profile-card-header {
            background: linear-gradient(135deg, #de433f 0%, #c53b38 100%);
            height: 120px;
            position: relative;
          }

          /* Avatar / Logo Styling */
          .profile-avatar-wrapper {
            width: 130px;
            height: 130px;
            background: #ffffff;
            border-radius: 50%;
            position: absolute;
            bottom: -65px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            border: 4px solid #ffffff;
          }
          .profile-avatar-inner {
            width: 100%;
            height: 100%;
            background: #fdf2f2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #de433f;
          }

          /* Body of Card */
          .profile-card-body {
            padding: 80px 30px 40px 30px;
            text-align: center;
          }
          .profile-name {
            font-size: 26px;
            font-weight: 700;
            color: #222;
            margin-bottom: 8px;
            text-transform: capitalize;
          }
          .profile-role-badge {
            background-color: #f1f5f9;
            color: #555;
            padding: 4px 12px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 24px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          /* Info Rows */
          .profile-info-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-width: 400px;
            margin: 0 auto 30px auto;
          }
          .info-row {
            display: flex;
            align-items: center;
            background: #fcfcfc;
            padding: 14px 20px;
            border-radius: 10px;
            border: 1px solid #eee;
            text-align: left;
            transition: transform 0.2s;
          }
          .info-row:hover {
            transform: translateY(-2px);
            border-color: #de433f;
          }
          .info-icon {
            color: #de433f;
            font-size: 20px;
            margin-right: 16px;
            background: #fdf2f2;
            padding: 10px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .info-content p {
            margin: 0;
            font-size: 12px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
          }
          .info-content h6 {
            margin: 2px 0 0 0;
            font-size: 15px;
            color: #333;
            font-weight: 600;
          }

          /* Disabled Action Button */
          .action-buttons {
            display: flex;
            justify-content: center;
            margin-top: 10px;
          }
          .btn-disabled-fancy {
            display: flex;
            align-items: center;
            gap: 8px;
            background-color: #e9ecef;
            color: #999;
            border: 1px solid #dde1e5;
            padding: 14px 32px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 700;
            cursor: not-allowed;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.3s;
          }
          
          /* Tooltip for disabled button */
          .btn-disabled-fancy:hover {
            background-color: #e2e6ea;
            color: #888;
          }

          @media (max-width: 576px) {
            .profile-card {
              margin-top: 20px;
              border-radius: 12px;
            }
            .profile-card-header {
              height: 100px;
            }
            .profile-avatar-wrapper {
              width: 110px;
              height: 110px;
              bottom: -55px;
            }
            .profile-card-body {
              padding: 70px 20px 30px 20px;
            }
            .profile-name {
              font-size: 22px;
            }
            .info-row {
              padding: 12px 16px;
            }
            .btn-disabled-fancy {
              width: 100%;
              justify-content: center;
            }
          }
        `}
      </style>

      {/* Breadcrumbs matching OrderHistory */}
      <div className="breadcrumb-sec">
        <div className="container">
          <ul className="breadcrumb-list">
            <li>
              <a href="/">Home</a>
            </li>
            <li className="d-flex align-items-center">
              <svg
                width="10"
                height="10"
                viewBox="0 0 64 64"
                style={{ margin: "0 10px", opacity: 0.5 }}
              >
                <path
                  d="M25.9375 8.5625L23.0625 11.4375L43.625 32L23.0625 52.5625L25.9375 55.4375L47.9375 33.4375L49.3125 32L47.9375 30.5625L25.9375 8.5625Z"
                  fill="#000"
                />
              </svg>
            </li>
            <li style={{ color: "#de433f", fontWeight: "600" }}>My Profile</li>
          </ul>
        </div>
      </div>

      <main className="profile-page-wrapper">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-12">
              <div className="profile-card">
                {/* Header with floating Avatar */}
                <div className="profile-card-header">
                  <div className="profile-avatar-wrapper">
                    <div className="profile-avatar-inner">
                      <FiUser size={55} />
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="profile-card-body">
                  <h1 className="profile-name">
                    {user.firstName} {user.lastName}
                  </h1>
                  <span className="profile-role-badge">{user.role}</span>

                  <div className="profile-info-grid">
                    {/* Name Row */}
                    <div className="info-row">
                      <div className="info-icon">
                        <FiUser />
                      </div>
                      <div className="info-content">
                        <p>Full Name</p>
                        <h6>
                          {user.firstName} {user.lastName}
                        </h6>
                      </div>
                    </div>

                    {/* Email Row */}
                    <div className="info-row">
                      <div className="info-icon">
                        <FiMail />
                      </div>
                      <div className="info-content">
                        <p>Email Address</p>
                        <h6>{user.email}</h6>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="action-buttons">
                    <button
                      className="btn-disabled-fancy"
                      disabled
                      title="Password change is currently unavailable"
                    >
                      <FiLock size={18} />
                      Change Password
                    </button>
                  </div>
                  <div className="mt-3 text-muted" style={{ fontSize: "12px" }}>
                    <FiShield style={{ marginRight: "4px" }} />
                    Secure Account
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default MyProfile;
