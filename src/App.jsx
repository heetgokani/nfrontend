import { Routes, Route, Navigate, useLocation } from "react-router-dom"; // ✅ IMPORTED useLocation
import { useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import Review from "./pages/Review";
import Shipping from "./pages/Shipping";
import PageNotFoundPage from "./pages/PageNotFoundPage";
import Wishlist from "./pages/Wishlist";
import Faqpage from "./pages/Faqpage";
import SingleProduct from "./pages/SingleProduct";
import AboutUsPage from "./pages/AboutUsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ScrollToTop from "./components/ScrollToTop";
import Crashed from "./components/Crashed";

import ChatBot from "./components/ChatBot";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import MyProfilePage from "./pages/MyProfilePage";

// ✅ 1. REVERSE PROTECTION: Logged-in users can't see Login/Register
const PublicRoute = ({ children }) => {
  const { auth, loading } = useAuth();

  if (loading) return null; // Wait for AuthProvider to check storage

  if (auth?.user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ✅ 2. ROLE PROTECTION: Only Admins/Managers can see Dashboard
const ProtectDashboard = ({ children }) => {
  const { auth, loading } = useAuth();

  if (loading) return null; // Prevents "flashing" or wrong redirects on refresh

  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = auth.user?.role?.rolename?.toLowerCase().trim();

  // If they are just a "user", kick them to Home
  if (userRole === "user") {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  // ✅ Get the current URL path
  const location = useLocation();

  // ✅ Check if we are on the dashboard
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* ✅ Wrapped Login & Register with PublicRoute */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/review" element={<Review />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/product/:id" element={<SingleProduct />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faqpage />} />
        <Route path="/aboutus" element={<AboutUsPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/profile" element={<MyProfilePage />} />

        {/* ✅ Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectDashboard>
              <Crashed />
            </ProtectDashboard>
          }
        />

        <Route path="*" element={<PageNotFoundPage />} />
      </Routes>

      {/* ✅ Conditionally render ChatBot ONLY if we are NOT on the dashboard */}
      {!isDashboard && <ChatBot />}
    </>
  );
}

export default App;
