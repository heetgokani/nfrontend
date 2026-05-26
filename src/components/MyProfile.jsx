import React from "react";
import { FiUser, FiMail, FiShield } from "react-icons/fi";
// TODO: Adjust this path to wherever your AuthContext file is located!
import { useAuth } from "../context/AuthContext";

const MyProfile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center mt-5">Loading profile...</div>;
  }

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
            color: #407e18;
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
            background: linear-gradient(135deg, #407e18 0%, #3c7d24 100%);
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
            background: #e8f3e8;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #407e18;
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
            /* Allow extremely long names to break */
            word-wrap: break-word;
            overflow-wrap: break-word;
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
            width: 100%;
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
            width: 100%;
            box-sizing: border-box;
          }
          .info-row:hover {
            transform: translateY(-2px);
            border-color: #407e18;
          }
          .info-icon {
            color: #407e18;
            font-size: 20px;
            margin-right: 16px;
            background: #e8f3e8;
            padding: 10px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0; /* Prevents icon from getting squished by long text */
          }
          .info-content {
            flex: 1;
            min-width: 0; /* CRITICAL: Allows flex child to shrink below its content size */
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
            /* CRITICAL: Forces long emails to break to the next line */
            word-wrap: break-word;
            overflow-wrap: break-word;
            word-break: break-word;
            line-height: 1.4;
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
              padding: 70px 15px 30px 15px;
            }
            .profile-name {
              font-size: 22px;
            }
            .info-row {
              padding: 12px 15px;
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
            <li style={{ color: "#407e18", fontWeight: "600" }}>My Profile</li>
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
                  <h1 className="profile-name">{user?.name}</h1>

                  <span className="profile-role-badge">
                    {user?.role?.rolename || user?.role || "USER"}
                  </span>

                  <div className="profile-info-grid">
                    {/* Name Row */}
                    <div className="info-row">
                      <div className="info-icon">
                        <FiUser />
                      </div>
                      <div className="info-content">
                        <p>Full Name</p>
                        <h6>{user?.name}</h6>
                      </div>
                    </div>

                    {/* Email Row */}
                    <div className="info-row">
                      <div className="info-icon">
                        <FiMail />
                      </div>
                      <div className="info-content">
                        <p>Email Address</p>
                        <h6>{user?.email}</h6>
                      </div>
                    </div>
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
