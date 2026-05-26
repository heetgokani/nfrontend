import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import ForgotPassword from "./components/ForgotPassword";
import PrivacyPage from "./pages/PrivacyPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import MyProfilePage from "./pages/MyProfilePage";
import Loader from "./components/Loader";
import TermsPage from "./pages/TermsPage";
import ReturnPage from "./pages/ReturnPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 1. REVERSE PROTECTION
const PublicRoute = ({ children }) => {
  const { auth, loading } = useAuth();
  if (loading) return null;
  if (auth?.user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// 2. ROLE PROTECTION
const ProtectDashboard = ({ children }) => {
  const { auth, loading } = useAuth();
  if (loading) return null;
  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }
  const userRole = auth.user?.role?.rolename?.toLowerCase().trim();
  if (userRole === "user") {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <>
      {/* ✅ THE FIX IS HERE: 
        This says "If the URL path is exactly '/', render the Loader. 
        Otherwise, don't even put it on the screen." 
      */}
      {location.pathname === "/" && <Loader />}

      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy-policy" element={<PrivacyPage />} />
        <Route path="/terms-conditions" element={<TermsPage />} />
        <Route path="/return-policy" element={<ReturnPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectDashboard>
              <Crashed />
            </ProtectDashboard>
          }
        />
      </Routes>
    </>
  );
}

export default App;
